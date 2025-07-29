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
		ghostCircle: { $exists: false },
	};

	if (after) {
		query._id = { $lt: after };
	}

	const posts = await Post.find(query)
		.sort({ _id: -1 })
		.limit(limit)
		.lean();

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
		ghostCircle: { $exists: false },
	};

	if (after) {
		query._id = { $lt: after };
	}

	const posts = await Post.find(query)
		.sort({ _id: -1 })
		.limit(limit)
		.lean();

	const hasMore = posts.length === limit;

	res.status(200).json({ posts, hasMore });
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
		ghostCircle: { $exists: false },
	};

	if (after) {
		query._id = { $lt: after };
	}

	const posts = await Post.find(query)
		.sort({ _id: -1 })
		.limit(limit)
		.lean();

	const hasMore = posts.length === limit;

	res.status(200).json({ posts, hasMore });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = asyncHandler(async (req, res) => {
	const post = await Post.findById(req.params.id)
		.populate("user", "username")
		.populate({
			path: "comments",
			populate: {
				path: "user",
				select: "username",
			},
		});

	if (!post) {
		res.status(404);
		throw new Error("Post not found");
	}

	res.status(200).json(post);
});

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
	const {
		content,
		images,
		videos,
		feedType,
		college,
		area,
		tags,
		ghostCircleId,
	} = req.body;

	if (!content && (!images || images.length === 0) && (!videos || videos.length === 0)) {
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
		user: req.user.id,
		anonymousAlias: user.anonymousAlias,
		avatarEmoji: user.avatarEmoji,
		content,
		images,
		videos,
		expiresAt,
	};

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
		expiresAt = ghostCircle.expiresAt;
		postData.expiresAt = expiresAt;
	}

	// Handle tags
	let tagNames = [];
	if (tags && Array.isArray(tags) && tags.length > 0) {
		tagNames = tags.map(tag => tag.toLowerCase().trim());
		postData.tags = tagNames;
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

		const comment = post.comments.id(commentId);
		if (!comment) {
			res.status(404);
			throw new Error("Comment not found");
		}

		const newReply = {
			_id: new mongoose.Types.ObjectId(),
			user: req.user._id,
			anonymousAlias: anonymousAlias || req.user.anonymousAlias,
			avatarEmoji: req.user.avatarEmoji,
			content,
			createdAt: new Date(),
			replies: []
		};

		comment.replies.push(newReply);
		await post.save();

		res.status(201).json({
			message: "Reply added successfully",
			reply: newReply
		});
	} catch (error) {
		console.error("Reply to comment error:", error);
		res.status(500);
		throw new Error("Failed to add reply");
	}
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

	reply.content = content;
	await post.save();

	res.status(200).json({ message: "Reply updated", reply });
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
