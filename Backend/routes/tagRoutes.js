
const express = require("express");
const router = express.Router();
const {
  getTrendingTags,
  searchTags,
  getPostsByTag
} = require("../controllers/tagController");

// @desc Get trending tags
router.get("/trending", getTrendingTags);

// @desc Search tags
router.get("/search", searchTags);

// @desc Get posts by tag
router.get("/:tagName/posts", getPostsByTag);

module.exports = router;
