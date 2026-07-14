const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    bookmarkName: {
      type: String,
      trim: true,
      default: "Untitled Bookmark",
    },
    timestamp: {
      type: Number, // Seek timestamp in seconds
      required: true,
    },
    bookmarkNotes: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#2563EB", // Default is primary theme color
    },
    icon: {
      type: String,
      default: "bookmark", // Default icon slug
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

module.exports = Bookmark;
