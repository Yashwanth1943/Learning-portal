const express = require("express");
const {
  getDashboardStats,
  listStudents,
  toggleStudentActive,
  createVideo,
  updateVideo,
  deleteVideo,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply protect and admin check to all admin endpoints
router.use(protect, admin);

router.get("/stats", getDashboardStats);
router.get("/students", listStudents);
router.put("/students/:id/toggle", toggleStudentActive);

router.post("/videos", createVideo);
router.route("/videos/:id")
  .put(updateVideo)
  .delete(deleteVideo);

module.exports = router;
