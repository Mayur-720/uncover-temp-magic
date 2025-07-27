const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");

// @desc    Get posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const after = req.query.after;

  const query = {
    expiresAt: { $gt: new Date() },
    ghostCircle: { $exists: false }
  };

  if (after) {
    query._id = { $lt: after };
  }

  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .lean();

  res.status(200).json(posts);
});

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content, images, videos, tags = [], college, area } = req.body;

  if (!content && (!images || images.length === 0) && (!videos || videos.length === 0)) {
    res.status(400);
    throw new Error("Please add some content, image or video");
  }

  const user = req.user;

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  const anonymousAlias = user.anonymousAlias;
  const avatarEmoji = user.avatarEmoji;

  if (!anonymousAlias || !avatarEmoji) {
    res.status(400);
    throw new Error("User alias or avatar not found");
  }

  // Process tags
  const processedTags = tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
  
  // Extract hashtags from content
  const hashtagRegex = /#(\w+)/g;
  const contentHashtags = content.match(hashtagRegex) || [];
  const extractedHashtags = contentHashtags.map(tag => tag.slice(1).toLowerCase());
  
  // Combine manual tags and extracted hashtags
  const allTags = [...new Set([...processedTags, ...extractedHashtags])];
  
  const post = new Post({
    user: user.id,
    content,
    imageUrl: images && images.length > 0 ? images[0] : '',
    images,
    videos,
    anonymousAlias,
    avatarEmoji,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    college,
    area,
    tags: allTags,
    hashtags: extractedHashtags,
  });

  await post.save();

  // Update tag counts and trending scores
  for (const tagName of allTags) {
    await updateTagStats(tagName);
  }

  res.status(201).json({ message: "Post created successfully", post });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(400);
    throw new Error("Post not found");
  }

  const user = req.user;

  // Check for user
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the post user
  if (post.user.toString() !== user.id) {
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
    res.status(400);
    throw new Error("Post not found");
  }

  const user = req.user;

  // Check for user
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the post user
  if (post.user.toString() !== user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  await post.remove();

  res.status(200).json({ id: req.params.id });
});

// @desc    Like post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(400);
    throw new Error("Post not found");
  }

  const user = req.user;

  // Check for user
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const anonymousAlias = user.anonymousAlias;

  if (!anonymousAlias) {
    res.status(400);
    throw new Error("User alias not found");
  }

  // Check if the user has already liked the post
  if (post.likes.some((like) => like.user.toString() === user.id)) {
    // Unlike the post
    post.likes = post.likes.filter((like) => like.user.toString() !== user.id);

    await post.save();

    res.status(200).json({ message: "Post unliked" });
  } else {
    // Like the post
    post.likes.push({
      user: user.id,
      anonymousAlias,
    });

    await post.save();

    res.status(200).json({ message: "Post liked" });
  }
});

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(400);
    throw new Error("Post not found");
  }

  const user = req.user;

  // Check for user
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const anonymousAlias = user.anonymousAlias;
  const avatarEmoji = user.avatarEmoji;

  if (!anonymousAlias || !avatarEmoji) {
    res.status(400);
    throw new Error("User alias or avatar not found");
  }

  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error("Please add some content");
  }

  const comment = {
    user: user.id,
    anonymousAlias,
    avatarEmoji,
    content,
  };

  post.comments.push(comment);

  await post.save();

  res.status(201).json({ message: "Comment added successfully", comment });
});

// @desc    Reply to comment
// @route   POST /api/posts/:postId/comments/:commentId/replies
// @access  Private
const replyToComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const post = await Post.findById(postId);

  if (!post) {
    res.status(400);
    throw new Error("Post not found");
  }

  const user = req.user;

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const anonymousAlias = user.anonymousAlias;
  const avatarEmoji = user.avatarEmoji;

  if (!anonymousAlias || !avatarEmoji) {
    res.status(400);
    throw new Error("User alias or avatar not found");
  }

  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error("Please add some content");
  }

  const reply = {
    _id: require('mongoose').Types.ObjectId(),
    user: user.id,
    anonymousAlias,
    avatarEmoji,
    content,
    createdAt: new Date(),
    replies: [],
  };

  // Function to recursively find and update the comment
  const updateComment = (comments) => {
    for (let i = 0; i < comments.length; i++) {
      if (comments[i]._id.toString() === commentId) {
        comments[i].replies.push(reply);
        return true;
      }
      if (comments[i].replies && comments[i].replies.length > 0) {
        if (updateComment(comments[i].replies)) {
          return true;
        }
      }
    }
    return false;
  };

  // Call the recursive function to update the comment
  updateComment(post.comments);

  await post.save();

  res.status(201).json({ message: "Reply added successfully", reply });
});

// Helper function to update tag statistics
const updateTagStats = async (tagName) => {
  const Tag = require("../models/tagModel");
  const Post = require("../models/postModel");
  
  // Count posts with this tag
  const postCount = await Post.countDocuments({
    tags: { $in: [tagName] },
    expiresAt: { $gt: new Date() }
  });
  
  // Calculate trending score (recent posts weighted more)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const recentPosts = await Post.countDocuments({
    tags: { $in: [tagName] },
    createdAt: { $gte: oneDayAgo },
    expiresAt: { $gt: new Date() }
  });
  
  const weeklyPosts = await Post.countDocuments({
    tags: { $in: [tagName] },
    createdAt: { $gte: oneWeekAgo },
    expiresAt: { $gt: new Date() }
  });
  
  const trendingScore = (recentPosts * 3) + weeklyPosts;
  
  // Determine category based on tag name
  const getTagCategory = (tag) => {
    const categoryKeywords = {
      confession: ['confess', 'secret', 'admit', 'truth', 'guilt'],
      crush: ['crush', 'love', 'heart', 'romantic', 'dating'],
      controversy: ['controversy', 'debate', 'argue', 'fight', 'drama'],
      government: ['government', 'politics', 'policy', 'law', 'authority'],
      danger: ['danger', 'risk', 'warning', 'unsafe', 'threat'],
      lifestyle: ['lifestyle', 'health', 'fitness', 'food', 'hobby'],
      work: ['work', 'job', 'career', 'office', 'boss', 'colleague'],
      relationship: ['relationship', 'friend', 'family', 'partner', 'marriage']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => tag.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return 'other';
  };
  
  // Update or create tag
  await Tag.findOneAndUpdate(
    { name: tagName },
    {
      name: tagName,
      displayName: tagName.charAt(0).toUpperCase() + tagName.slice(1),
      postCount,
      trendingScore,
      category: getTagCategory(tagName),
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  replyToComment,
  updateTagStats
};
