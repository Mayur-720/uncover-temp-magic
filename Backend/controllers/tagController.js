
const asyncHandler = require("express-async-handler");
const Tag = require("../models/tagModel");
const Post = require("../models/postModel");

// @desc Get trending tags
// @route GET /api/tags/trending
// @access Public
const getTrendingTags = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 20);
  const timeFilter = req.query.timeFilter || 'all'; // today, week, month, all

  try {
    let dateFilter = {};
    const now = new Date();
    
    switch (timeFilter) {
      case 'today':
        dateFilter = { updatedAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        dateFilter = { updatedAt: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        dateFilter = { updatedAt: { $gte: monthAgo } };
        break;
      default:
        // No date filter for 'all'
        break;
    }

    const tags = await Tag.find({
      postCount: { $gt: 0 },
      ...dateFilter
    })
    .sort({ trendingScore: -1, postCount: -1 })
    .limit(limit)
    .lean();

    res.json({
      tags,
      timeFilter,
      count: tags.length
    });
  } catch (error) {
    console.error("Error fetching trending tags:", error);
    res.status(500).json({
      message: "Failed to fetch trending tags",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// @desc Search tags
// @route GET /api/tags/search
// @access Public
const searchTags = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ message: "Search query must be at least 2 characters" });
  }

  try {
    const tags = await Tag.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ],
      postCount: { $gt: 0 }
    })
    .sort({ postCount: -1 })
    .limit(10)
    .lean();

    res.json({ tags });
  } catch (error) {
    console.error("Error searching tags:", error);
    res.status(500).json({
      message: "Failed to search tags",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// @desc Get posts by tag
// @route GET /api/tags/:tagName/posts
// @access Public
const getPostsByTag = asyncHandler(async (req, res) => {
  const { tagName } = req.params;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const after = req.query.after;

  try {
    const query = {
      tags: { $in: [tagName.toLowerCase()] },
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

    const hasMore = posts.length === limit;

    res.json({
      posts,
      hasMore,
      tag: tagName
    });
  } catch (error) {
    console.error("Error fetching posts by tag:", error);
    res.status(500).json({
      message: "Failed to fetch posts",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// @desc Update trending scores (internal function)
const updateTrendingScores = asyncHandler(async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all tags
    const tags = await Tag.find({});

    for (const tag of tags) {
      // Count recent posts with this tag
      const recentPosts = await Post.countDocuments({
        tags: { $in: [tag.name] },
        createdAt: { $gte: oneDayAgo }
      });

      const weeklyPosts = await Post.countDocuments({
        tags: { $in: [tag.name] },
        createdAt: { $gte: oneWeekAgo }
      });

      // Calculate trending score (weighted recent activity)
      const trendingScore = (recentPosts * 3) + weeklyPosts;

      await Tag.findByIdAndUpdate(tag._id, {
        trendingScore,
        lastUpdated: new Date()
      });
    }

    console.log("Trending scores updated successfully");
  } catch (error) {
    console.error("Error updating trending scores:", error);
  }
});

module.exports = {
  getTrendingTags,
  searchTags,
  getPostsByTag,
  updateTrendingScores
};
