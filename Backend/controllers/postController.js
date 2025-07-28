const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Tag = require("../models/tagModel");
const { updateTagCounts } = require("./tagController");

// @desc Get all posts
// @route GET /api/posts
// @access Private
const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    expiresAt: { $gt: new Date() },
    ghostCircle: { $exists: false }
  }).sort({ createdAt: -1 });
  res.status(200).json(posts);
});

// @desc Create a new post
// @route POST /api/posts
// @access Private
const createPost = asyncHandler(async (req, res) => {
  const { content, images, videos, feedType, tags, ghostCircleId, college, area } = req.body;

  if (!content && (!images || images.length === 0) && (!videos || videos.length === 0)) {
    res.status(400);
    throw new Error("Content, image, or video is required to create a post");
  }

  if (feedType === "college" && !college) {
    res.status(400);
    throw new Error("College is required for college feed posts");
  }

  if (feedType === "area" && !area) {
    res.status(400);
    throw new Error("Area is required for area feed posts");
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const newPost = new Post({
      user: req.user.id,
      content,
      images: images || [],
      videos: videos || [],
      anonymousAlias: req.user.anonymousAlias,
      avatarEmoji: req.user.avatarEmoji,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      tags: tags || [],
      ...(ghostCircleId && { ghostCircle: ghostCircleId }),
      ...(feedType === "college" && college && { college }),
      ...(feedType === "area" && area && { area })
    });

    const savedPost = await newPost.save();

    // Update tag counts after post creation
    if (tags && tags.length > 0) {
      await updateTagCounts(tags);
    }

    const populatedPost = await Post.findById(savedPost._id).populate({
      path: 'user',
      select: '-password',
    });

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Get a specific post by ID
// @route GET /api/posts/:id
// @access Public
const getPostById = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: 'user',
      select: '-password',
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Update a specific post by ID
// @route PUT /api/posts/:id
// @access Private
const updatePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    // Check if the user is the author of the post
    if (post.user.toString() !== req.user.id) {
      res.status(403);
      throw new Error("Unauthorized: You are not the author of this post");
    }

    const { content, images, videos } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        content: content || post.content,
        images: images || post.images,
        videos: videos || post.videos,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: 'user',
      select: '-password',
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Delete a specific post by ID
// @route DELETE /api/posts/:id
// @access Private
const deletePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    // Check if the user is the author of the post
    if (post.user.toString() !== req.user.id) {
      res.status(403);
      throw new Error("Unauthorized: You are not the author of this post");
    }

    await Post.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Like a post
// @route POST /api/posts/:id/like
// @access Private
const likePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const alreadyLiked = post.likes.find(
      (like) => like.user.toString() === req.user.id
    );

    if (alreadyLiked) {
      // If already liked, remove the like
      post.likes = post.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
      await post.save();
      res.status(200).json({ message: "Post unliked" });
    } else {
      // If not liked, add the like
      post.likes.push({
        user: req.user.id,
        anonymousAlias: req.user.anonymousAlias,
      });
      await post.save();
      res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Add a comment to a post
// @route POST /api/posts/:id/comments
// @access Private
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      user: req.user.id,
      anonymousAlias: req.user.anonymousAlias,
      avatarEmoji: req.user.avatarEmoji,
      content: content.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
};
