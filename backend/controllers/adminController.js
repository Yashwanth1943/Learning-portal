const User = require("../models/userModel");
const Video = require("../models/videoModel");
const Bookmark = require("../models/bookmarkModel");
const Progress = require("../models/progressModel");
const mongoose = require("mongoose");

// @desc    Get Admin Panel Dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalVideos = await Video.countDocuments();
    const totalBookmarks = await Bookmark.countDocuments();

    // Fetch lists
    const recentVideos = await Video.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentStudents = await User.find({ role: "student" })
      .sort({ createdAt: -1 })
      .select("-password")
      .limit(5);

    // Aggregate average study completion rate across the portal
    const progressList = await Progress.find();
    const totalProgressCount = progressList.length;
    const avgCompletion = totalProgressCount
      ? Math.round(progressList.reduce((acc, curr) => acc + curr.progressPercentage, 0) / totalProgressCount)
      : 0;

    res.json({
      totalStudents,
      totalVideos,
      totalBookmarks,
      recentVideos,
      recentStudents,
      avgCompletion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all students
// @route   GET /api/admin/students
// @access  Private/Admin
const listStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: "student" })
      .sort({ createdAt: -1 })
      .select("-password");
    res.json(students);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle student active status
// @route   PUT /api/admin/students/:id/toggle
// @access  Private/Admin
const toggleStudentActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid student ID format");
    }

    const student = await User.findById(id);

    if (!student) {
      res.status(404);
      throw new Error("Student account not found");
    }

    if (student.role === "admin") {
      res.status(400);
      throw new Error("Cannot deactivate an administrator account");
    }

    student.isActive = !student.isActive;
    await student.save();

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      isActive: student.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new video
// @route   POST /api/admin/videos
// @access  Private/Admin
const createVideo = async (req, res, next) => {
  try {
    const {
      title,
      description,
      thumbnail,
      videoUrl,
      duration,
      instructor,
      category,
      difficulty,
      tags,
    } = req.body;

    if (!title || !description || !thumbnail || !videoUrl || !duration) {
      res.status(400);
      throw new Error("Title, description, thumbnail, video URL, and duration are required");
    }

    const video = await Video.create({
      title,
      description,
      thumbnail,
      videoUrl,
      duration: Number(duration),
      instructor: instructor || "Senior Instructor",
      category: category || "General",
      difficulty: difficulty || "Beginner",
      tags: tags || [],
    });

    res.status(201).json(video);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a video
// @route   PUT /api/admin/videos/:id
// @access  Private/Admin
const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      thumbnail,
      videoUrl,
      duration,
      instructor,
      category,
      difficulty,
      tags,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid video ID format");
    }

    const video = await Video.findById(id);

    if (!video) {
      res.status(404);
      throw new Error("Video not found");
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail || video.thumbnail;
    video.videoUrl = videoUrl || video.videoUrl;
    video.duration = duration !== undefined ? Number(duration) : video.duration;
    video.instructor = instructor || video.instructor;
    video.category = category || video.category;
    video.difficulty = difficulty || video.difficulty;
    video.tags = tags || video.tags;

    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a video
// @route   DELETE /api/admin/videos/:id
// @access  Private/Admin
const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid video ID format");
    }

    const video = await Video.findById(id);

    if (!video) {
      res.status(404);
      throw new Error("Video not found");
    }

    // Remove referencing bookmarks
    await Bookmark.deleteMany({ videoId: id });
    // Remove referencing watch progress logs
    await Progress.deleteMany({ videoId: id });

    await video.deleteOne();

    res.json({ message: "Video and associated student bookmarks removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  listStudents,
  toggleStudentActive,
  createVideo,
  updateVideo,
  deleteVideo,
};
