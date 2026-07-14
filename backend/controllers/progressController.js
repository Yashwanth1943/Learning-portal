const Progress = require("../models/progressModel");
const Video = require("../models/videoModel");
const mongoose = require("mongoose");

// @desc    Get progress details for a specific video
// @route   GET /api/progress/:videoId
// @access  Private
const getUserProgress = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      res.status(400);
      throw new Error("Invalid Video ID format");
    }

    const progress = await Progress.findOne({
      userId: req.user._id,
      videoId,
    });

    if (!progress) {
      return res.json({
        currentTime: 0,
        progressPercentage: 0,
        isCompleted: false,
      });
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
};

// @desc    Update or create progress for a video
// @route   POST /api/progress/:videoId
// @access  Private
const updateUserProgress = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { currentTime, progressPercentage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      res.status(400);
      throw new Error("Invalid Video ID format");
    }

    if (currentTime === undefined || progressPercentage === undefined) {
      res.status(400);
      throw new Error("currentTime and progressPercentage are required");
    }

    const pct = Number(progressPercentage);
    const isCompletedNow = pct >= 90;

    const existingProgress = await Progress.findOne({
      userId: req.user._id,
      videoId,
    });

    let lastCompleted;
    if (isCompletedNow && (!existingProgress || !existingProgress.isCompleted)) {
      lastCompleted = new Date();
      await Video.findByIdAndUpdate(videoId, { $inc: { watchCount: 1 } });
    }

    const updateFields = {
      currentTime: Number(currentTime),
      progressPercentage: pct,
      isCompleted: isCompletedNow,
      lastOpened: new Date(),
    };

    if (lastCompleted) {
      updateFields.lastCompleted = lastCompleted;
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, videoId },
      { $set: updateFields },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all watch progress records for the active student
// @route   GET /api/progress
// @access  Private
const getUserAllProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ userId: req.user._id })
      .populate("videoId")
      .sort({ updatedAt: -1 });
    res.json(progress);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProgress,
  updateUserProgress,
  getUserAllProgress,
};
