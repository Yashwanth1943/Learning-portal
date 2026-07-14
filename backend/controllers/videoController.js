const Video = require("../models/videoModel");

// @desc    Get all videos (with optional search)
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      };
    }
    
    const videos = await Video.find(query);
    res.json(videos);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single video by ID
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!video) {
      res.status(404);
      throw new Error("Video not found");
    }
    res.json(video);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVideos,
  getVideoById,
};
