import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Key, Award, Flame, Play, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import API from "../services/api";
import Skeleton from "../components/Skeleton";
import styles from "./Profile.module.css";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        setLoading(true);
        const res = await API.get("/progress");
        // Filter out any progress items where videoId might have been deleted
        const validHistory = res.data.filter((item) => item.videoId !== null);
        setHistory(validHistory);
      } catch (err) {
        console.error("Error loading watch records", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchHistory();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Name is required", "error");
      return;
    }

    if (password && password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { name };
      if (password) {
        payload.password = password;
      }
      await updateProfile(payload);
      addToast("Profile successfully updated", "success");
      setPassword("");
      confirmPassword("");
    } catch (err) {
      addToast(err.response?.data?.message || "Error saving details", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format seconds to minutes
  const formatMins = (secs) => {
    if (!secs) return 0;
    return Math.round(secs / 60);
  };

  // Calculate user metrics
  const totalCompleted = history.filter((item) => item.isCompleted).length;
  const startedCourses = history.length;
  const totalWatchTime = history.reduce((acc, curr) => acc + curr.currentTime, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={styles.profileContainer}
    >
      <h1 className={styles.pageTitle}>Student Account Center</h1>

      <div className={styles.layoutGrid}>
        {/* Profile Settings Left */}
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <User size={18} className={styles.headerIcon} />
              <h2>Update Account Info</h2>
            </div>

            <form onSubmit={handleUpdate} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Registered Email</label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className={styles.disabledInput}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.divider} />

              <div className={styles.inputGroup}>
                <label>New Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: "100%", height: "44px" }}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        {/* Learning Stats Right */}
        <div className={styles.rightCol}>
          {/* Quick Metrics */}
          <div className={styles.statsCardGrid}>
            <div className={styles.miniCard}>
              <Flame size={22} className={styles.iconStreak} />
              <div className={styles.miniDetails}>
                <span className={styles.miniVal}>{user?.streak || 1} Days</span>
                <span className={styles.miniLbl}>Learning Streak</span>
              </div>
            </div>

            <div className={styles.miniCard}>
              <Clock size={22} className={styles.iconTime} />
              <div className={styles.miniDetails}>
                <span className={styles.miniVal}>{formatMins(totalWatchTime)}m</span>
                <span className={styles.miniLbl}>Time Spent Studying</span>
              </div>
            </div>

            <div className={styles.miniCard}>
              <CheckCircle size={22} className={styles.iconCheck} />
              <div className={styles.miniDetails}>
                <span className={styles.miniVal}>{totalCompleted}</span>
                <span className={styles.miniLbl}>Completed Courses</span>
              </div>
            </div>
          </div>

          {/* Watch Log History */}
          <div className={styles.card} style={{ flexGrow: 1 }}>
            <div className={styles.cardHeader}>
              <Award size={18} className={styles.headerIcon} />
              <h2>Learning Activities History</h2>
            </div>

            {loading ? (
              <Skeleton type="text" count={4} />
            ) : history.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🎬</span>
                <h3>No watch progress logs</h3>
                <p>Start watching programming video lectures to record completion logs.</p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {history.map((item) => (
                  <div key={item._id} className={styles.historyItem}>
                    <img
                      src={item.videoId?.thumbnail}
                      alt={item.videoId?.title}
                      className={styles.historyThumb}
                    />
                    <div className={styles.historyInfo}>
                      <span className={styles.historyCategory}>
                        {item.videoId?.category || "Development"}
                      </span>
                      <h3 className={styles.historyTitle}>{item.videoId?.title}</h3>
                      <div className={styles.progressRow}>
                        <div className={styles.progressBarWrapper}>
                          <div
                            className={styles.progressBar}
                            style={{ width: `${item.progressPercentage}%` }}
                          />
                        </div>
                        <span className={styles.pctText}>
                          {Math.round(item.progressPercentage)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
