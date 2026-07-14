import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Trash2,
  Edit2,
  Plus,
  Bookmark as BookmarkIcon,
  Search,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Tv,
  Settings,
  MessageSquare,
  ChevronRight,
  Star,
  Flame,
  Code
} from "lucide-react";
import API from "../services/api";
import { useScreenshotProtection } from "../hooks/useScreenshotProtection";
import Watermark from "../components/Watermark";
import Skeleton from "../components/Skeleton";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";
import styles from "./VideoPlayer.module.css";

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const bookmarkRefs = useRef({});
  const lastUpdateRef = useRef(0);
  const { addToast } = useToast();

  // Primary Data
  const [video, setVideo] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Playback Control States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoNext, setAutoNext] = useState(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState("");

  // Subtitle mock data
  const mockSubtitles = [
    { start: 1, end: 5, text: "Welcome to GVCC Academy engineering lectures series." },
    { start: 6, end: 12, text: "Today, we cover advanced software architecture and data schemas." },
    { start: 13, end: 20, text: "Please use the annotations panel to highlight important concepts." },
    { start: 21, end: 32, text: "Let's begin by checking the component lifecycle hooks." }
  ];

  // Bookmarks Panel Controls
  const [bookmarkName, setBookmarkName] = useState("");
  const [bookmarkNotes, setBookmarkNotes] = useState("");
  const [bookmarkColor, setBookmarkColor] = useState("#2563EB"); // default blue
  const [bookmarkIcon, setBookmarkIcon] = useState("bookmark"); // default bookmark
  const [bookmarkSearch, setBookmarkSearch] = useState("");
  const [bookmarkSort, setBookmarkSort] = useState("timestamp"); // timestamp | newest | oldest
  
  // Custom Modals Overlay States
  const [editingBookmarkId, setEditingBookmarkId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editColor, setEditColor] = useState("#2563EB");
  const [editIcon, setEditIcon] = useState("bookmark");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Resume Watched State
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const [activeBookmarkId, setActiveBookmarkId] = useState(null);

  // Screenshot hook
  const { isBlurred } = useScreenshotProtection(true);

  // Fetch initial video contents
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setEditingBookmarkId(null);
        setConfirmDeleteId(null);
        setIsPlaying(false);
        setPlaybackSpeed(1);
        setActiveSubtitle("");

        // Fetch Current Video
        const videoRes = await API.get(`/videos/${id}`);
        setVideo(videoRes.data);

        // Fetch Recommendations
        const allRes = await API.get("/videos");
        setAllVideos(allRes.data.filter((v) => v._id !== id));

        // Fetch Bookmarks
        const bookmarksRes = await API.get(`/bookmarks/${id}`);
        setBookmarks(bookmarksRes.data);

        // Fetch Watch Progress from DB
        const progressRes = await API.get(`/progress/${id}`);
        if (progressRes.data && progressRes.data.currentTime > 3) {
          const progress = progressRes.data;
          // Only show prompt if student hasn't completed the lecture (less than 90%)
          if (progress.progressPercentage < 90) {
            setSavedTime(progress.currentTime);
            setShowResumePrompt(true);
          }
        }
      } catch (err) {
        addToast("Error fetching course content", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, addToast]);

  // Track active bookmark scrolling
  useEffect(() => {
    if (bookmarks.length === 0) return;

    const active = bookmarks.find(
      (b) => currentTime >= b.timestamp - 1.5 && currentTime <= b.timestamp + 2.5
    );

    if (active) {
      if (activeBookmarkId !== active._id) {
        setActiveBookmarkId(active._id);
        const element = bookmarkRefs.current[active._id];
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    } else {
      setActiveBookmarkId(null);
    }
  }, [currentTime, bookmarks, activeBookmarkId]);

  // Subtitle triggers
  useEffect(() => {
    if (!subtitlesEnabled) {
      setActiveSubtitle("");
      return;
    }
    const matched = mockSubtitles.find((s) => currentTime >= s.start && currentTime <= s.end);
    setActiveSubtitle(matched ? matched.text : "");
  }, [currentTime, subtitlesEnabled]);

  // Keyboard controls overrides
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.tagName === "SELECT"
      ) {
        return;
      }

      if (!videoRef.current) return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "arrowleft":
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          addToast("Rewind 10s", "info");
          break;
        case "arrowright":
          e.preventDefault();
          videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
          addToast("Forward 10s", "info");
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          handleVolumeToggle();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isMuted, addToast]);

  // Volume Memory restoration
  useEffect(() => {
    if (videoRef.current) {
      const savedVolume = localStorage.getItem("playerVolume");
      if (savedVolume !== null) {
        videoRef.current.volume = Number(savedVolume);
      }
    }
  }, [loading]);

  const handleTimeUpdate = async () => {
    if (!videoRef.current || !video) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    const now = Date.now();
    // Throttling DB updates: Save once every 4 seconds to limit network load
    if (now - lastUpdateRef.current > 4000) {
      lastUpdateRef.current = now;
      const durationValue = videoRef.current.duration || video.duration;
      const progressPercentage = (time / durationValue) * 100;

      try {
        await API.post(`/progress/${id}`, {
          currentTime: time,
          progressPercentage,
        });
      } catch (err) {
        console.error("Failed to sync watch progress with server", err);
      }
    }
  };

  const handleVolumeChange = () => {
    if (videoRef.current) {
      localStorage.setItem("playerVolume", videoRef.current.volume);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsMuted(videoRef.current.muted);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleVolumeToggle = () => {
    if (!videoRef.current) return;
    const muted = !isMuted;
    videoRef.current.muted = muted;
    setIsMuted(muted);
    addToast(muted ? "Volume muted" : "Volume unmuted", "info");
  };

  const toggleFullscreen = () => {
    const wrapper = videoRef.current?.parentElement;
    if (!wrapper) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      wrapper.requestFullscreen().catch(() => {});
    }
  };

  const togglePictureInPicture = async () => {
    try {
      if (!videoRef.current) return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        addToast("Exited PiP Mode", "info");
      } else {
        await videoRef.current.requestPictureInPicture();
        addToast("Entered PiP Mode", "info");
      }
    } catch (err) {
      console.error(err);
      addToast("PiP Mode not supported", "error");
    }
  };

  const handleSpeedChange = (e) => {
    const speed = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      addToast(`Speed: ${speed}x`, "info");
    }
  };

  // Video Ended callback - handles auto next
  const handleVideoEnded = async () => {
    setIsPlaying(false);
    // Explicitly sync final completed status to database (100%)
    try {
      await API.post(`/progress/${id}`, {
        currentTime: duration,
        progressPercentage: 100,
      });
    } catch (err) {
      console.error(err);
    }

    if (autoNext && allVideos.length > 0) {
      addToast("Autoplay: Transitioning to next lecture...", "success");
      setTimeout(() => {
        navigate(`/video/${allVideos[0]._id}`);
      }, 1500);
    }
  };

  // Resume Watched Prompt
  const resumeWatching = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = savedTime;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    setShowResumePrompt(false);
    addToast(`Resumed watch progress`, "success");
  };

  // Bookmarks Operations
  const handleSaveBookmark = async (e) => {
    e.preventDefault();
    if (!video) return;

    try {
      const payload = {
        videoId: video._id,
        bookmarkName: bookmarkName.trim() || `Bookmark @ ${formatTimestamp(currentTime)}`,
        timestamp: currentTime,
        bookmarkNotes: bookmarkNotes.trim(),
        color: bookmarkColor,
        icon: bookmarkIcon,
      };

      const res = await API.post("/bookmarks", payload);
      setBookmarks((prev) => [...prev, res.data]);
      setBookmarkName("");
      setBookmarkNotes("");
      addToast("Study note added", "success");
    } catch (err) {
      addToast("Failed to create note", "error");
      console.error(err);
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await API.delete(`/bookmarks/${bookmarkId}`);
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
      setConfirmDeleteId(null);
      addToast("Note deleted", "success");
    } catch (err) {
      addToast("Failed to delete note", "error");
      console.error(err);
    }
  };

  const handleUpdateBookmark = async () => {
    if (!editName.trim()) return;
    try {
      const res = await API.put(`/bookmarks/${editingBookmarkId}`, {
        bookmarkName: editName.trim(),
        bookmarkNotes: editNotes.trim(),
        color: editColor,
        icon: editIcon,
      });
      setBookmarks((prev) =>
        prev.map((b) => (b._id === editingBookmarkId ? res.data : b))
      );
      setEditingBookmarkId(null);
      setEditName("");
      setEditNotes("");
      addToast("Note updated successfully", "success");
    } catch (err) {
      addToast("Failed to update note", "error");
      console.error(err);
    }
  };

  const handleSeek = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      addToast(`Jumped to ${formatTimestamp(timestamp)}`, "info");
    }
  };

  const startEditing = (b) => {
    setEditingBookmarkId(b._id);
    setEditName(b.bookmarkName);
    setEditNotes(b.bookmarkNotes || "");
    setEditColor(b.color || "#2563EB");
    setEditIcon(b.icon || "bookmark");
  };

  // Helper formatting seconds
  const formatTimestamp = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const renderBookmarkIcon = (iconName, color = "currentColor") => {
    switch (iconName) {
      case "star":
        return <Star size={14} style={{ color }} />;
      case "flame":
        return <Flame size={14} style={{ color }} />;
      case "code":
        return <Code size={14} style={{ color }} />;
      default:
        return <BookmarkIcon size={14} style={{ color }} />;
    }
  };

  // Filter & Sort Bookmarks
  const getProcessedBookmarks = () => {
    let list = [...bookmarks];

    if (bookmarkSearch.trim()) {
      list = list.filter(
        (b) =>
          b.bookmarkName.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
          b.bookmarkNotes.toLowerCase().includes(bookmarkSearch.toLowerCase())
      );
    }

    if (bookmarkSort === "timestamp") {
      list.sort((a, b) => a.timestamp - b.timestamp);
    } else if (bookmarkSort === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (bookmarkSort === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return list;
  };

  const processedBookmarks = getProcessedBookmarks();

  if (loading) {
    return (
      <div className={styles.playerContainer}>
        <div className={styles.leftCol}>
          <Skeleton type="player" />
        </div>
        <div className={styles.rightCol}>
          <div className={styles.sidebarSkeleton}>
            <Skeleton type="text" count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className={styles.playerContainer}
    >
      {/* Playback player grid left */}
      <div className={styles.leftCol}>
        <div className={`${styles.videoWrapper} ${isBlurred ? styles.blurred : ""}`}>
          <video
            ref={videoRef}
            src={video.videoUrl}
            className={styles.videoPlayer}
            onTimeUpdate={handleTimeUpdate}
            onVolumeChange={handleVolumeChange}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onClick={handlePlayPause}
          />
          <Watermark />

          {/* Subtitles Overlay */}
          {subtitlesEnabled && activeSubtitle && (
            <div className={styles.subtitleOverlay}>
              <span className={styles.subtitleText}>{activeSubtitle}</span>
            </div>
          )}

          {/* Security Overlay blur */}
          {isBlurred && (
            <div className={styles.securityOverlay}>
              <div className={styles.securityBox}>
                <span className={styles.lockIcon}>🛡️</span>
                <h3>Secure Shield Active</h3>
                <p>Playback is paused and blurred due to focus loss. Re-focus window to resume.</p>
              </div>
            </div>
          )}

          {/* Resume Prompt box */}
          {showResumePrompt && (
            <div className={styles.resumeOverlay}>
              <div className={styles.resumeBox}>
                <span className={styles.resumeText}>
                  Resume from last watch progress at <strong>{formatTimestamp(savedTime)}</strong>?
                </span>
                <div className={styles.resumeActions}>
                  <button onClick={resumeWatching} className={styles.resumeYesBtn}>
                    Resume
                  </button>
                  <button onClick={() => setShowResumePrompt(false)} className={styles.resumeNoBtn}>
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Playback HUD bar */}
          <div className={styles.controlsHud}>
            <button onClick={handlePlayPause} className={styles.hudBtn}>
              {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
            </button>
            
            <div className={styles.timelineWrapper}>
              <span className={styles.hudTime}>{formatTimestamp(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  if (videoRef.current) videoRef.current.currentTime = Number(e.target.value);
                }}
                className={styles.seekBar}
              />
              <span className={styles.hudTime}>{formatTimestamp(duration || video.duration)}</span>
            </div>

            {/* Playback Speed selector */}
            <div className={styles.speedSelectorWrapper}>
              <Settings size={14} className={styles.settingsIcon} />
              <select
                value={playbackSpeed}
                onChange={handleSpeedChange}
                className={styles.speedSelect}
                title="Playback Speed"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2.0x</option>
              </select>
            </div>

            <button onClick={handleVolumeToggle} className={styles.hudBtn}>
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Subtitles toggle */}
            <button
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={`${styles.hudBtn} ${subtitlesEnabled ? styles.hudBtnActive : ""}`}
              title="Toggle Captions"
            >
              <MessageSquare size={16} />
            </button>

            <button onClick={togglePictureInPicture} className={styles.hudBtn} title="Picture-in-Picture">
              <Tv size={16} />
            </button>
            <button onClick={toggleFullscreen} className={styles.hudBtn} title="Fullscreen">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Video Course details */}
        <div className={styles.videoDetails}>
          <div className={styles.metaRow}>
            <span className={styles.categoryBadge}>{video.category}</span>
            <span className={styles.difficultyTag}>
              Difficulty: {video.difficulty}
            </span>
            <span className={styles.durationTag}>
              <Clock size={12} style={{ marginRight: "4px" }} /> {formatTimestamp(duration || video.duration)} mins
            </span>
            <div className={styles.autoNextRow}>
              <label>Autoplay Next</label>
              <input
                type="checkbox"
                checked={autoNext}
                onChange={(e) => setAutoNext(e.target.checked)}
                className={styles.toggleCheckbox}
              />
            </div>
          </div>
          <h1 className={styles.videoTitle}>{video.title}</h1>
          <span className={styles.instructorName}>Syllabus designed by Instructor <strong>{video.instructor || "Sarah Jenkins"}</strong></span>
          
          <div className={styles.divider} />
          
          <div className={styles.infoSection}>
            <div className={styles.infoTitle}>Lecture Syllabus Overview</div>
            <p className={styles.videoDescription}>{video.description}</p>
          </div>
        </div>

        {/* Recommended Videos List */}
        {allVideos.length > 0 && (
          <div className={styles.recommendedSection}>
            <h3 className={styles.recommendTitle}>
              <Sparkles size={16} className={styles.recommendIcon} /> Recommended Lectures
            </h3>
            <div className={styles.recommendGrid}>
              {allVideos.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/video/${item._id}`)}
                  className={styles.recommendCard}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className={styles.recommendThumb}
                  />
                  <div className={styles.recommendMeta}>
                    <h4 className={styles.recommendCardTitle}>{item.title}</h4>
                    <span className={styles.recommendDuration}>
                      ⏳ {Math.round(item.duration / 60)} mins
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bookmarks annotations right sidebar */}
      <div className={styles.rightCol}>
        <div className={styles.bookmarkCard}>
          <h3 className={styles.sidebarTitle}>
            <BookmarkIcon size={18} fill="currentColor" /> Study Annotations
          </h3>

          <form onSubmit={handleSaveBookmark} className={styles.bookmarkForm}>
            <div className={styles.formRow}>
              <span className={styles.currentFrameLabel}>Time Reference</span>
              <span className={styles.timestampBadge}>{formatTimestamp(currentTime)}</span>
            </div>
            
            <div className={styles.inputGroupCol}>
              <label>Topic Title</label>
              <input
                type="text"
                placeholder="Reference title..."
                value={bookmarkName}
                onChange={(e) => setBookmarkName(e.target.value)}
                className={styles.bookmarkInput}
              />
            </div>

            <div className={styles.inputGroupCol}>
              <label>Detailed Note Details</label>
              <textarea
                placeholder="Write detailed notes, code code snippets..."
                value={bookmarkNotes}
                onChange={(e) => setBookmarkNotes(e.target.value)}
                className={styles.bookmarkTextarea}
                rows={2}
              />
            </div>

            {/* Custom note colors and icons selectors */}
            <div className={styles.customizersRow}>
              <div className={styles.customControlGroup}>
                <label>Label Color</label>
                <div className={styles.colorOptions}>
                  {["#2563EB", "#10B981", "#F59E0B", "#EF4444"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBookmarkColor(c)}
                      className={`${styles.colorBtn} ${bookmarkColor === c ? styles.colorBtnActive : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.customControlGroup}>
                <label>Icon Type</label>
                <div className={styles.iconOptions}>
                  {["bookmark", "star", "flame", "code"].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBookmarkIcon(i)}
                      className={`${styles.iconOptionBtn} ${bookmarkIcon === i ? styles.iconOptionBtnActive : ""}`}
                    >
                      {renderBookmarkIcon(i, "#64748B")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ height: "38px" }}>
              <Plus size={16} /> Save Study Note
            </button>
          </form>

          <div className={styles.divider} />

          {/* Search/Sort Bookmarks */}
          <div className={styles.filterBar}>
            <div className={styles.searchBarWrapper}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search notes..."
                value={bookmarkSearch}
                onChange={(e) => setBookmarkSearch(e.target.value)}
                className={styles.sidebarSearch}
              />
            </div>
            <div className={styles.sortDropdownWrapper}>
              <SlidersHorizontal size={14} />
              <select
                value={bookmarkSort}
                onChange={(e) => setBookmarkSort(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="timestamp">Time Order</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Bookmarks scrolling card list */}
          <div className={styles.bookmarksScrollContainer}>
            <AnimatePresence initial={false}>
              {processedBookmarks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={styles.emptyBookmarks}
                >
                  <span>📝 No Study Notes Found</span>
                  <p>Add annotations details to track syllabus sections.</p>
                </motion.div>
              ) : (
                <div className={styles.bookmarksList}>
                  {processedBookmarks.map((b) => {
                    const isActive = activeBookmarkId === b._id;

                    return (
                      <motion.div
                        key={b._id}
                        ref={(el) => (bookmarkRefs.current[b._id] = el)}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          backgroundColor: isActive ? "rgba(37, 99, 235, 0.08)" : "rgba(120, 120, 120, 0.01)",
                          borderLeft: `4px solid ${b.color || "#2563EB"}`,
                        }}
                        exit={{ opacity: 0 }}
                        className={styles.bookmarkItem}
                      >
                        <div className={styles.bookmarkContentNode}>
                          <div
                            onClick={() => handleSeek(b.timestamp)}
                            className={styles.bookmarkHeaderNode}
                          >
                            <span className={styles.itemTimestamp}>
                              {renderBookmarkIcon(b.icon, b.color)} {formatTimestamp(b.timestamp)}
                            </span>
                            <span className={styles.itemName}>{b.bookmarkName}</span>
                          </div>

                          {b.bookmarkNotes && (
                            <p className={styles.itemNotes}>{b.bookmarkNotes}</p>
                          )}
                        </div>

                        <div className={styles.itemActions}>
                          <button
                            onClick={() => startEditing(b)}
                            className={styles.iconBtn}
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(b._id)}
                            className={styles.iconBtnDanger}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Popups Confirm dialogs for deletion */}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDeleteBookmark(confirmDeleteId)}
        title="Delete Annotation Note"
        message="Are you sure you want to remove this study note? This cannot be undone."
        confirmText="Delete note"
        confirmStyle="danger"
      />

      {/* Edit modal overlay */}
      <ConfirmModal
        isOpen={editingBookmarkId !== null}
        onClose={() => {
          setEditingBookmarkId(null);
          setEditName("");
          setEditNotes("");
        }}
        onConfirm={handleUpdateBookmark}
        title="Edit Annotation Note"
        confirmText="Save Changes"
      >
        <div className={styles.editModalForm}>
          <div className={styles.inputGroupCol}>
            <label>Topic Title</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={styles.bookmarkInput}
              autoFocus
            />
          </div>

          <div className={styles.inputGroupCol}>
            <label>Detailed Note Details</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className={styles.bookmarkTextarea}
              rows={3}
            />
          </div>

          <div className={styles.customizersRow}>
            <div className={styles.customControlGroup}>
              <label>Label Color</label>
              <div className={styles.colorOptions}>
                {["#2563EB", "#10B981", "#F59E0B", "#EF4444"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className={`${styles.colorBtn} ${editColor === c ? styles.colorBtnActive : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className={styles.customControlGroup}>
              <label>Icon Type</label>
              <div className={styles.iconOptions}>
                {["bookmark", "star", "flame", "code"].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEditIcon(i)}
                    className={`${styles.iconOptionBtn} ${editIcon === i ? styles.iconOptionBtnActive : ""}`}
                  >
                    {renderBookmarkIcon(i, "#64748B")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ConfirmModal>
    </motion.div>
  );
};

export default VideoPlayer;
