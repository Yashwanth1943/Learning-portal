const Bookmark = require("../models/bookmarkModel");
const mongoose = require("mongoose");

// @desc    Get bookmarks for a specific video
// @route   GET /api/bookmarks/:videoId
// @access  Public
const getBookmarksByVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      res.status(400);
      throw new Error("Invalid Video ID format");
    }
    const bookmarks = await Bookmark.find({ videoId }).sort({ timestamp: 1 });
    res.json(bookmarks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new bookmark
// @route   POST /api/bookmarks
// @access  Public
const createBookmark = async (req, res, next) => {
  try {
    const { videoId, bookmarkName, timestamp, bookmarkNotes, color, icon } = req.body;

    if (!videoId || timestamp === undefined) {
      res.status(400);
      throw new Error("Video ID and timestamp are required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      res.status(400);
      throw new Error("Invalid Video ID format");
    }

    const bookmark = await Bookmark.create({
      videoId,
      bookmarkName: bookmarkName || `Bookmark @ ${Math.floor(timestamp)}s`,
      timestamp: Number(timestamp),
      bookmarkNotes: bookmarkNotes || "",
      color: color || "#2563EB",
      icon: icon || "bookmark",
    });

    res.status(201).json(bookmark);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a bookmark name, notes, color, icon, or timestamp
// @route   PUT /api/bookmarks/:id
// @access  Public
const updateBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookmarkName, timestamp, bookmarkNotes, color, icon } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid Bookmark ID format");
    }

    const bookmark = await Bookmark.findById(id);

    if (!bookmark) {
      res.status(404);
      throw new Error("Bookmark not found");
    }

    if (bookmarkName !== undefined) bookmark.bookmarkName = bookmarkName;
    if (timestamp !== undefined) bookmark.timestamp = Number(timestamp);
    if (bookmarkNotes !== undefined) bookmark.bookmarkNotes = bookmarkNotes;
    if (color !== undefined) bookmark.color = color;
    if (icon !== undefined) bookmark.icon = icon;

    const updatedBookmark = await bookmark.save();
    res.json(updatedBookmark);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Public
const deleteBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid Bookmark ID format");
    }

    const bookmark = await Bookmark.findById(id);

    if (!bookmark) {
      res.status(404);
      throw new Error("Bookmark not found");
    }

    await bookmark.deleteOne();
    res.json({ message: "Bookmark removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookmarksByVideo,
  createBookmark,
  updateBookmark,
  deleteBookmark,
};
