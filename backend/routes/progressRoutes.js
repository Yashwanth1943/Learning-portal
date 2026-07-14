const express = require("express");
const {
  getUserProgress,
  updateUserProgress,
  getUserAllProgress,
} = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply protect to all progress endpoints
router.use(protect);

router.get("/", getUserAllProgress);

router
  .route("/:videoId")
  .get(getUserProgress)
  .post(updateUserProgress);

module.exports = router;
