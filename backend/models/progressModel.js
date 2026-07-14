const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      required: true,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    lastOpened: {
      type: Date,
      default: Date.now,
    },
    lastCompleted: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound unique index to prevent duplicate records
progressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;
