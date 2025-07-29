const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const GhostCircle = require("../models/ghostCircleModel");
const Tag = require("../models/tagModel");
const { updateTagCounts } = require("./tagController");
const mongoose = require('mongoose');

// @desc    Get posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
	const posts = await Post.find({ expiresAt: { $gt: new Date() } })
		.populate("user", "username")
		.sort("-createdAt");

	res.status(200).json(posts);
});

// @desc    Get paginated posts for global feed
// @route   GET /api/posts/global
// @access  Public
const getPaginatedPosts = asyncHandler(async (req, res) => {
	const limit = Math.min(Number(req.query.limit) || 20, 50);
	const after = req.query.after;

	const query = {
		expiresAt: { $gt: new Date() },
		college: { $exists: false },
		area: { $exists: false }
	};

	if (after) {
		query._id = { $lt: after };
	}

	// Try to get from cache when no pagination
	if (!after && limit === 20 && redis.isAvailable()) {
		try {
			const cachedPosts = await redis.get(CACHE_KEYS.GLOBAL_FEED);
			if (cachedPosts) {
				try {
					const parsedPosts =
						typeof cachedPosts === "string"
							? JSON.parse(cachedPosts)
							: cachedPosts;
					if (Array.isArray(parsedPosts) && parsedPosts.length >= 20) {
						return res.status(200).json({
							posts: parsedPosts,
							hasMore: parsedPosts.length === limit,
						});
					} else {
						console.warn("Cached posts insufficient, fetching fresh data");
						await redis.del(CACHE_KEYS.GLOBAL_FEED);
					}
				} catch (error) {
					console.error("Cache retrieval error:", error, "value:", cachedPosts);
					await redis.del(CACHE_KEYS.GLOBAL_FEED);
				}
			}
		} catch (error) {
			console.error("Cache retrieval error:", error);
		}
	}

	try {
		// First get regular posts (non-seed posts)
		const regularPosts = await Post.find({
			...query,
			isSeedPost: { $ne: true }
		}).sort({ _id: -1 }).limit(limit).lean();

		console.log(`Found ${regularPosts.length} regular global posts`);

		let posts = regularPosts;
		
		// If we don't have enough regular posts, add seed posts
		if (regularPosts.length < limit) {
			const seedPostsNeeded = limit - regularPosts.length;
			const seedPosts = await Post.find({
				...query,
				isSeedPost: true
			}).sort({ _id: -1 }).limit(seedPostsNeeded).lean();
			
			console.log(`Adding ${seedPosts.length} seed posts to global feed`);
			posts = [...regularPosts, ...seedPosts];
		}

		// Only cache first/default page
		if (!after && limit === 20 && redis.isAvailable()) {
			try {
				await redis.del(CACHE_KEYS.GLOBAL_FEED);
				await redis.setex(
					CACHE_KEYS.GLOBAL_FEED,
					CACHE_TTL.GLOBAL_FEED,
					JSON.stringify(posts)
				);
			} catch (error) {
				console.error("Cache storage error:", error);
			}
		}

	const hasMore = posts.length === limit;

	res.status(200).json({ posts, hasMore });
});

// @desc    Get paginated posts for college feed
// @route   GET /api/posts/college
// @access  Public
const getCollegeFeed = asyncHandler(async (req, res) => {
	const limit = Math.min(Number(req.query.limit) || 20, 50);
	const after = req.query.after;
	const college = req.query.college;

	if (!college) {
		res.status(400);
		throw new Error("College parameter is required for college feed");
	}

	const query = {
		college: college,
		expiresAt: { $gt: new Date() },
		college: college
	};

	if (after) {
		query._id = { $lt: after };
	}

	try {
		const posts = await Post.find(query).sort({ _id: -1 }).limit(limit).lean();
		const hasMore = posts.length === limit;
		
		console.log("College feed response:", {
			college,
			postsCount: posts.length,
			hasMore,
		});
		
		res.status(200).json({ posts, hasMore });
	} catch (error) {
		console.error("College feed error:", error);
		res.status(500).json({
			message: "Failed to fetch college posts",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
});

// @desc    Get paginated posts for area feed
// @route   GET /api/posts/area
// @access  Public
const getAreaFeed = asyncHandler(async (req, res) => {
	const limit = Math.min(Number(req.query.limit) || 20, 50);
	const after = req.query.after;
	const area = req.query.area;

	if (!area) {
		res.status(400);
		throw new Error("Area parameter is required for area feed");
	}

	const query = {
		area: area,
		expiresAt: { $gt: new Date() },
		area: area
	};

	if (after) {
		query._id = { $lt: after };
	}

	try {
		const posts = await Post.find(query).sort({ _id: -1 }).limit(limit).lean();
		const hasMore = posts.length === limit;
		
		console.log("Area feed response:", {
			area,
			postsCount: posts.length,
			hasMore,
		});
		
		res.status(200).json({ posts, hasMore });
	} catch (error) {
		console.error("Area feed error:", error);
		res.status(500).json({
			message: "Failed to fetch area posts",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
});

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
	const { content, ghostCircleId, imageUrl, images, videos, expiresIn, feedType, college, area } = req.body;

	// Check if content, image, or video is provided
	if (
		!content &&
		!imageUrl &&
		(!images || images.length === 0) &&
		(!videos || videos.length === 0)
	) {
		res.status(400);
		throw new Error("Please add some content, image, or video");
	}

	let expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 1);

	const user = await User.findById(req.user.id);

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	const postData = {
		user: req.user._id,
		content: content || "",
		imageUrl: imageUrl || "",
		images: images || [],
		videos: videos || [],
		anonymousAlias: req.user.anonymousAlias,
		avatarEmoji: req.user.avatarEmoji,
		expiresAt: expiryTime,
	};

	// Add college/area based on feedType and values from request
	console.log(`Creating post for feedType: ${feedType}, college from request: ${college}, area from request: ${area}`);
	
	if (feedType === "college" && college) {
		postData.college = college;
	} else if (feedType === "area" && area) {
		postData.area = area;
	}

	if (ghostCircleId) {
		const ghostCircle = await GhostCircle.findById(ghostCircleId);
		if (!ghostCircle) {
			res.status(404);
			throw new Error("Ghost Circle not found");
		}
		postData.ghostCircle = ghostCircleId;
	}

	// Use session for atomic operations
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		// Create the post
		const [post] = await Post.create([postData], { session });

		console.log(`Post created successfully:`, {
			id: post._id,
			feedType,
			college: post.college,
			area: post.area
		});

		// Add post ID to the user's posts array
		await User.findByIdAndUpdate(
			req.user._id,
			{ $push: { posts: post._id } },
			{ session }
		);

		// If posting to a ghost circle, add post to the circle's posts
		if (ghostCircleId) {
			await GhostCircle.findByIdAndUpdate(
				ghostCircleId,
				{ $push: { posts: post._id } },
				{ session }
			);
		}

		await session.commitTransaction();

		// Invalidate related caches
		await invalidatePostCaches(post._id, ghostCircleId);

		res.status(201).json(post);
	} catch (error) {
		await session.abortTransaction();
		throw error;
	} finally {
		session.endSession();
	}

	// Handle hashtags
	const hashtagRegex = /#(\w+)/g;
	let match;
	let hashtags = [];
	while ((match = hashtagRegex.exec(content)) !== null) {
		hashtags.push(match[1].toLowerCase());
	}
	postData.hashtags = hashtags;

	const post = await Post.create(postData);

	if (tagNames.length > 0) {
		updateTagCounts(tagNames);
	}

	res.status(201).json(post);
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	// Check if user matches
	if (post.user.toString() !== req.user.id) {
		res.status(401);
		throw new Error("User not authorized");
	}

	const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});

	res.status(200).json(updatedPost);
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	// Check if user matches
	if (post.user.toString() !== req.user.id) {
		res.status(401);
		throw new Error("User not authorized");
	}

	await post.remove();

	res.status(200).json({ id: req.params.id });
});

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	const user = await User.findById(req.user.id);

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	// Check if already liked
	const alreadyLiked = post.likes.find(
		(like) => like.user.toString() === req.user.id
	);

	if (alreadyLiked) {
		// Unlike
		post.likes = post.likes.filter(
			(like) => like.user.toString() !== req.user.id
		);
	} else {
		// Like
		post.likes.push({
			user: req.user.id,
			anonymousAlias: user.anonymousAlias,
			createdAt: new Date(),
		});
	}

	await post.save();

	res.status(200).json(post);
});

// @desc    Share a post
// @route   POST /api/posts/:id/share
// @access  Private
const sharePost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	post.shareCount = (post.shareCount || 0) + 1;
	await post.save();

	res.status(200).json({ shareCount: post.shareCount });
});

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	const user = await User.findById(req.user.id);

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	const newComment = {
		user: req.user.id,
		anonymousAlias: user.anonymousAlias,
		avatarEmoji: user.avatarEmoji,
		content: req.body.content,
		createdAt: new Date(),
		replies: [],
	};

	post.comments.push(newComment);
	await post.save();

	res.status(201).json(newComment);
});

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Private
const getComments = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id);

	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	res.status(200).json(post.comments);
});

// @desc    Delete comment
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
	const { postId, commentId } = req.params;

	const post = await Post.findById(postId);
	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	const comment = post.comments.id(commentId);
	if (!comment) {
		res.status(404);
		throw new Error("Comment not found");
	}

	// Check if user matches
	if (comment.user.toString() !== req.user.id) {
		res.status(401);
		throw new Error("User not authorized");
	}

	comment.remove();
	await post.save();

	res.status(200).json({ id: commentId });
});

// @desc    Edit comment
// @route   PUT /api/posts/:postId/comments/:commentId
// @access  Private
const editComment = asyncHandler(async (req, res) => {
	const { postId, commentId } = req.params;
	const { content } = req.body;

	const post = await Post.findById(postId);
	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	const comment = post.comments.id(commentId);
	if (!comment) {
		res.status(404);
		throw new Error("Comment not found");
	}

	// Check if user matches
	if (comment.user.toString() !== req.user.id) {
		res.status(401);
		throw new Error("User not authorized");
	}

	comment.content = content;
	await post.save();

	res.status(200).json({ message: "Comment updated", comment });
});

// @desc Reply to comment
// @route POST /api/posts/:postId/comments/:commentId/reply
// @access Private
const replyToComment = asyncHandler(async (req, res) => {
	const { postId, commentId } = req.params;
	const { content, anonymousAlias } = req.body;

	try {
		const post = await Post.findById(postId);
		if (!post) {
			res.status(404);
			throw new Error("Post not found");
		}

	// Cache the result
	if (redis.isAvailable()) {
		try {
			await redis.setex(cacheKey, CACHE_TTL.POST_DETAIL, JSON.stringify(post));
		} catch (error) {
			console.error("Cache storage error:", error);
		}
	}

	res.json(post);
});

// @desc    Share post
// @route   POST /api/posts/:id/share
// @access  Private
const sharePost = asyncHandler(async (req, res) => {
	const postId = req.params.id;

	const post = await Post.findById(postId);

	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	// Increment share count
	const updatedPost = await Post.findByIdAndUpdate(
		postId,
		{ $inc: { shareCount: 1 } },
		{ new: true }
	);

	// Invalidate related caches
	await invalidatePostCaches(postId, post.ghostCircle);

	res.status(200).json({ 
		message: "Post shared successfully",
		shareCount: updatedPost.shareCount 
	});
});

// @desc    Delete reply
// @route   DELETE /api/posts/:postId/comments/:commentId/replies/:replyId
// @access  Private
const deleteReply = asyncHandler(async (req, res) => {
	const { postId, commentId, replyId } = req.params;

	const post = await Post.findById(postId);
	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	const comment = post.comments.id(commentId);
	if (!comment) {
		res.status(404);
		throw new Error("Comment not found");
	}

	const reply = comment.replies.id(replyId);
	if (!reply) {
		res.status(404);
		throw new Error("Reply not found");
	}

	// Check if user matches
	if (reply.user.toString() !== req.user.id) {
		res.status(401);
		throw new Error("User not authorized");
	}

	reply.remove();
	await post.save();

	res.status(200).json({ id: replyId });
});

// @desc    Update reply
// @route   PUT /api/posts/:postId/comments/:commentId/replies/:replyId
// @access  Private
const updateReply = asyncHandler(async (req, res) => {
	const { postId, commentId, replyId } = req.params;
	const { content } = req.body;

	const post = await Post.findById(postId);
	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	try {
		const post = await Post.findOneAndUpdate(
			{
				_id: postId,
				"comments._id": commentId,
				"comments.replies._id": replyId,
				"comments.replies.user": req.user._id
			},
			{
				$set: { "comments.$[comment].replies.$[reply].content": content }
			},
			{
				arrayFilters: [
					{ "comment._id": commentId },
					{ "reply._id": replyId }
				],
				new: true
			}
		);

		if (!post) {
			res.status(404);
			throw new Error("Post, comment, reply not found, or not authorized");
		}

		// Find the updated reply
		const comment = post.comments.id(commentId);
		const updatedReply = comment.replies.id(replyId);

		// Invalidate related caches
		await invalidatePostCaches(postId, post.ghostCircle);

		res.json({
			message: "Reply updated successfully",
			reply: updatedReply,
		});
	} catch (error) {
		console.error("Update reply error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = {
	getPosts,
	getPost,
	createPost,
	updatePost,
	deletePost,
	likePost,
	sharePost,
	addComment,
	getComments,
	deleteComment,
	editComment,
	replyToComment,
	deleteReply,
	updateReply,
	getPaginatedPosts,
	getCollegeFeed,
	getAreaFeed,
};
