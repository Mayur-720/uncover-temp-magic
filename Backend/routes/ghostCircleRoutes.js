const express = require("express");
const router = express.Router();
const {
	createGhostCircle,
	getMyGhostCircles,
	inviteToGhostCircle,
	getGhostCircleById,
	searchUsers,
} = require("../controllers/ghostCircleController");
const { getGhostCirclePosts } = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

// Protected routes
router
	.route("/")
	.post(protect, createGhostCircle)
	.get(protect, getMyGhostCircles);

router.route("/:id").get(protect, getGhostCircleById);

router.route("/:id/invite").post(protect, inviteToGhostCircle);
router.route("/circle/:id").get(protect, getGhostCirclePosts);

// User search for ghost circle invitations
router.route("/users/search").get(protect, searchUsers);

module.exports = router;
