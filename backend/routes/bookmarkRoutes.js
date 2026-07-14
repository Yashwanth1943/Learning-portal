const express = require("express");
const {
  getBookmarksByVideo,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} = require("../controllers/bookmarkController");

const router = express.Router();

// Matches POST /api/bookmarks
router.post("/", createBookmark);

// Matches GET /api/bookmarks/:videoId
router.get("/:videoId", getBookmarksByVideo);

// Matches PUT /api/bookmarks/:id
router.put("/:id", updateBookmark);

// Matches DELETE /api/bookmarks/:id
router.delete("/:id", deleteBookmark);

module.exports = router;
