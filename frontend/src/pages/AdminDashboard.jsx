import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video as VideoIcon,
  Users,
  Bookmark,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Eye,
  SlidersHorizontal,
  Search,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import Skeleton from "../components/Skeleton";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const { addToast } = useToast();

  // Primary States
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState("videos"); // videos | students

  // Pagination & Filtering
  const [videoSearch, setVideoSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Video Form Modal
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null); // null means adding new
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    videoUrl: "",
    duration: "",
    instructor: "",
    category: "React",
    difficulty: "Beginner",
    tags: "",
  });

  // Deletion Modal
  const [deleteVideoId, setDeleteVideoId] = useState(null);

  // Student Profile Detail Overlay
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      addToast("Failed to fetch dashboard stats", "error");
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Videos
  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      const res = await API.get("/videos");
      setVideos(res.data);
    } catch (err) {
      addToast("Failed to fetch video courses", "error");
      console.error(err);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await API.get("/admin/students");
      setStudents(res.data);
    } catch (err) {
      addToast("Failed to list students", "error");
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchVideos();
    fetchStudents();
  }, []);

  // Form Submissions
  const handleOpenAddForm = () => {
    setEditingVideo(null);
    setFormData({
      title: "",
      description: "",
      thumbnail: "",
      videoUrl: "",
      duration: "",
      instructor: "",
      category: "React",
      difficulty: "Beginner",
      tags: "",
    });
    setShowVideoModal(true);
  };

  const handleOpenEditForm = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      videoUrl: video.videoUrl,
      duration: video.duration,
      instructor: video.instructor || "Senior Instructor",
      category: video.category || "React",
      difficulty: video.difficulty || "Beginner",
      tags: video.tags ? video.tags.join(", ") : "",
    });
    setShowVideoModal(true);
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.thumbnail || !formData.videoUrl || !formData.duration) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter((t) => t) : [],
        duration: Number(formData.duration),
      };

      if (editingVideo) {
        // Edit video
        const res = await API.put(`/admin/videos/${editingVideo._id}`, payload);
        setVideos((prev) => prev.map((v) => (v._id === editingVideo._id ? res.data : v)));
        addToast("Course lecture updated successfully", "success");
      } else {
        // Create video
        const res = await API.post("/admin/videos", payload);
        setVideos((prev) => [res.data, ...prev]);
        addToast("Course lecture created successfully", "success");
      }
      setShowVideoModal(false);
      fetchStats(); // Update counters
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save video details", "error");
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await API.delete(`/admin/videos/${deleteVideoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== deleteVideoId));
      setDeleteVideoId(null);
      addToast("Course removed successfully", "success");
      fetchStats(); // Update counters
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to remove video", "error");
      console.error(err);
    }
  };

  // Toggle student active status
  const handleToggleStudent = async (studentId) => {
    try {
      const res = await API.put(`/admin/students/${studentId}/toggle`);
      setStudents((prev) =>
        prev.map((s) => (s._id === studentId ? { ...s, isActive: res.data.isActive } : s))
      );
      addToast(`Student account ${res.data.isActive ? "activated" : "deactivated"}`, "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update user access", "error");
      console.error(err);
    }
  };

  // Search & Pagination Logic
  const getFilteredVideos = () => {
    if (!videoSearch.trim()) return videos;
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
        v.category.toLowerCase().includes(videoSearch.toLowerCase())
    );
  };

  const filteredVideos = getFilteredVideos();
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.container}
    >
      <h1 className={styles.pageTitle}>Administrative Panel</h1>

      {/* Stats row */}
      {loadingStats ? (
        <div className={styles.statsSkeleton}>
          <Skeleton type="text" count={3} />
        </div>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <Users size={20} className={styles.iconBlue} />
            <div className={styles.statsDetails}>
              <span className={styles.statsVal}>{stats.totalStudents}</span>
              <span className={styles.statsLbl}>Total Students</span>
            </div>
          </div>
          <div className={styles.statsCard}>
            <VideoIcon size={20} className={styles.iconGreen} />
            <div className={styles.statsDetails}>
              <span className={styles.statsVal}>{stats.totalVideos}</span>
              <span className={styles.statsLbl}>Total Lectures</span>
            </div>
          </div>
          <div className={styles.statsCard}>
            <Bookmark size={20} className={styles.iconPurple} />
            <div className={styles.statsDetails}>
              <span className={styles.statsVal}>{stats.totalBookmarks}</span>
              <span className={styles.statsLbl}>Study Annotations</span>
            </div>
          </div>
          <div className={styles.statsCard}>
            <TrendingUp size={20} className={styles.iconOrange} />
            <div className={styles.statsDetails}>
              <span className={styles.statsVal}>{stats.avgCompletion}%</span>
              <span className={styles.statsLbl}>Avg Completion Rate</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className={styles.tabHeaderRow}>
        <div className={styles.tabButtons}>
          <button
            onClick={() => setActiveTab("videos")}
            className={`${styles.tabBtn} ${activeTab === "videos" ? styles.tabBtnActive : ""}`}
          >
            <VideoIcon size={16} /> Video Management
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`${styles.tabBtn} ${activeTab === "students" ? styles.tabBtnActive : ""}`}
          >
            <Users size={16} /> Student Database
          </button>
        </div>

        {activeTab === "videos" && (
          <button onClick={handleOpenAddForm} className="btn-primary">
            <Plus size={16} /> Create Course
          </button>
        )}
      </div>

      {/* Tab Contents: Videos CRUD */}
      {activeTab === "videos" && (
        <div className={styles.card}>
          <div className={styles.tableToolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by title or category..."
                value={videoSearch}
                onChange={(e) => {
                  setVideoSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.searchInput}
              />
            </div>
          </div>

          {loadingVideos ? (
            <Skeleton type="text" count={6} />
          ) : paginatedVideos.length === 0 ? (
            <div className={styles.emptyState}>
              <span>📂 No video lectures matching query</span>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Thumbnail & Course Title</th>
                    <th>Instructor</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVideos.map((video) => (
                    <tr key={video._id}>
                      <td>
                        <div className={styles.titleColumn}>
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className={styles.tableThumb}
                          />
                          <div className={styles.titleInfo}>
                            <span className={styles.tableTitle}>{video.title}</span>
                            <span className={styles.tableDuration}>
                              {Math.round(video.duration / 60)} mins
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{video.instructor}</td>
                      <td>
                        <span className={styles.categoryBadge}>{video.category}</span>
                      </td>
                      <td>
                        <span className={`${styles.diffBadge} ${styles[video.difficulty.toLowerCase()]}`}>
                          {video.difficulty}
                        </span>
                      </td>
                      <td>{video.views}</td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button
                            onClick={() => handleOpenEditForm(video)}
                            className={styles.editBtn}
                            title="Edit Video"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteVideoId(video._id)}
                            className={styles.deleteBtn}
                            title="Delete Video"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    className={styles.pageArrow}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className={styles.pageLabel}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                    className={styles.pageArrow}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Student database */}
      {activeTab === "students" && (
        <div className={styles.card}>
          {loadingStudents ? (
            <Skeleton type="text" count={6} />
          ) : students.length === 0 ? (
            <div className={styles.emptyState}>
              <span>📂 No students registered</span>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Streak</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>🔥 {student.streak} days</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            student.isActive ? styles.statusActive : styles.statusDisabled
                          }`}
                        >
                          {student.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className={styles.viewBtn}
                            title="View Profile Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleStudent(student._id)}
                            className={student.isActive ? styles.lockBtn : styles.unlockBtn}
                            title={student.isActive ? "Deactivate Account" : "Activate Account"}
                          >
                            {student.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Deletes popup */}
      <ConfirmModal
        isOpen={deleteVideoId !== null}
        onClose={() => setDeleteVideoId(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Course Lecture"
        message="Are you sure you want to delete this course video? All students bookmark references and watch logs will be removed. This cannot be undone."
        confirmText="Remove Lecture"
        confirmStyle="danger"
      />

      {/* Form Dialog Modal overlay for Create/Edit Video */}
      <AnimatePresence>
        {showVideoModal && (
          <div className={styles.modalBackdrop}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideoModal(false)}
              className={styles.modalOverlay}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalBox}
            >
              <div className={styles.modalHeader}>
                <h2>{editingVideo ? "Edit Course details" : "Create New Video Course"}</h2>
                <button onClick={() => setShowVideoModal(false)} className={styles.modalCloseBtn}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className={styles.modalForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Course Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Mastering Components"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Instructor Name</label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="React">React</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="Node.js">Node.js</option>
                      <option value="MongoDB">MongoDB</option>
                      <option value="Express">Express</option>
                      <option value="Algorithms">Algorithms</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Difficulty Tier</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Duration (Seconds) *</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 596"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tags (Comma separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="React, Hooks, Frontend"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Thumbnail Image URL *</label>
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Video Stream Source URL *</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://commondatastorage.googleapis.com/..."
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description Details *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Write a summary details description of the syllabus..."
                    rows={3}
                    required
                  />
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Course
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Profile Detail Modal Overlay */}
      <AnimatePresence>
        {selectedStudent && (
          <div className={styles.modalBackdrop}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className={styles.modalOverlay}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={styles.modalBox}
              style={{ maxWidth: "420px" }}
            >
              <div className={styles.modalHeader}>
                <h2>Student Profile Details</h2>
                <button onClick={() => setSelectedStudent(null)} className={styles.modalCloseBtn}>
                  ×
                </button>
              </div>

              <div className={styles.profileDetailBody}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLbl}>Full Name</span>
                  <span className={styles.detailVal}>{selectedStudent.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLbl}>Email Address</span>
                  <span className={styles.detailVal}>{selectedStudent.email}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLbl}>Streak Record</span>
                  <span className={styles.detailVal}>🔥 {selectedStudent.streak} days</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLbl}>Account Role</span>
                  <span className={styles.detailVal} style={{ textTransform: "uppercase", fontSize: "0.8rem", fontWeight: "700" }}>
                    {selectedStudent.role}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLbl}>Joined Date</span>
                  <span className={styles.detailVal}>
                    {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLbl}>System Status</span>
                  <span
                    className={`${styles.statusBadge} ${
                      selectedStudent.isActive ? styles.statusActive : styles.statusDisabled
                    }`}
                  >
                    {selectedStudent.isActive ? "Active User" : "Suspended"}
                  </span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button onClick={() => setSelectedStudent(null)} className="btn-primary" style={{ width: "100%" }}>
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
