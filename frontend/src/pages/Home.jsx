import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Play,
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  Bookmark,
  Flame,
  Filter,
  ArrowUpDown,
  BookOpenCheck
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import styles from "./Home.module.css";

const Home = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Video Lists
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkCounts, setBookmarkCounts] = useState({});

  // Watch Progress from Database
  const [dbProgress, setDbProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [sortOption, setSortOption] = useState("newest"); // newest | popular | alphabetical

  // Autocomplete Suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const trendingSearches = ["Hooks", "Express Routing", "Mongoose", "Algorithms"];

  const categories = ["All", "React", "JavaScript", "Node.js", "MongoDB", "Express", "Algorithms"];

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load Recent Searches
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      setRecentSearches(saved);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await API.get("/videos", {
          params: { search: debouncedQuery },
        });
        setVideos(res.data);
      } catch (err) {
        addToast("Error fetching videos from server", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [debouncedQuery, addToast]);

  // Fetch database progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoadingProgress(true);
        const res = await API.get("/progress");
        setDbProgress(res.data.filter((p) => p.videoId !== null));
      } catch (err) {
        console.error("Error loading database progress logs", err);
      } finally {
        setLoadingProgress(false);
      }
    };
    fetchProgress();
  }, []);

  // Fetch bookmark counts
  useEffect(() => {
    if (videos.length === 0) return;

    const fetchCounts = async () => {
      const countsMap = {};
      try {
        await Promise.all(
          videos.map(async (v) => {
            try {
              const res = await API.get(`/bookmarks/${v._id}`);
              countsMap[v._id] = res.data.length;
            } catch {
              countsMap[v._id] = 0;
            }
          })
        );
        setBookmarkCounts(countsMap);
      } catch (err) {
        console.error("Error fetching bookmarks counts", err);
      }
    };
    fetchCounts();
  }, [videos]);

  // Save a search query to recents
  const saveSearchQuery = (query) => {
    if (!query.trim()) return;
    const clean = query.trim();
    let updated = [clean, ...recentSearches.filter((q) => q !== clean)];
    if (updated.length > 5) updated = updated.slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    saveSearchQuery(searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (query) => {
    setSearchQuery(query);
    saveSearchQuery(query);
    setShowSuggestions(false);
  };

  // Determine personalized time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Filter and Sort Video Grid
  const getProcessedVideos = () => {
    let list = [...videos];

    // Filter by Category
    if (activeCategory !== "All") {
      list = list.filter((v) => v.category === activeCategory);
    }

    // Filter by Difficulty
    if (difficultyFilter !== "All") {
      list = list.filter((v) => v.difficulty === difficultyFilter);
    }

    // Sort Videos
    if (sortOption === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "popular") {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortOption === "alphabetical") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  };

  const processedVideos = getProcessedVideos();

  // Learning stats calculations
  const totalCompleted = dbProgress.filter((p) => p.isCompleted).length;
  const startedCourses = dbProgress.length;
  const totalWatchTime = dbProgress.reduce((acc, curr) => acc + curr.currentTime, 0);

  // Format watch remaining minutes
  const formatRemainingTime = (duration, current) => {
    const rem = duration - current;
    if (rem <= 0) return "Completed";
    const mins = Math.ceil(rem / 60);
    return `${mins}m left`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const featuredVideo = videos[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={styles.homeContainer}
    >
      {/* Time greeting banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeLeft}>
          <span className={styles.dateLabel}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          <h1 className={styles.greeting}>
            {getGreeting()}, <span className={styles.studentName}>{user?.name || "Student"}</span>
          </h1>
          <p className={styles.welcomeSub}>Let's continue mapping your software engineering credentials roadmap today.</p>
        </div>

        {/* Streak Counter Node */}
        <div className={styles.streakNode}>
          <Flame size={24} className={styles.streakFlame} />
          <div className={styles.streakInfo}>
            <span className={styles.streakVal}>{user?.streak || 1} Days</span>
            <span className={styles.streakLbl}>Learning Streak</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Interactive Syllabus Map</span>
          <h2 className={styles.heroTitle}>
            Expand Your <span className={styles.gradientText}>Developer</span> Career
          </h2>
          <p className={styles.heroSubtitle}>
            Browse our curated software engineering lectures, take timestamped bookmarks, and monitor your watch metrics.
          </p>

          {/* Advanced Search box */}
          <div className={styles.searchWrapper}>
            <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search lectures, topics, categories..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={styles.clearButton}
                >
                  ×
                </button>
              )}
            </form>

            {/* Suggestions & history list popup */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className={styles.suggestionsBox}
                >
                  {recentSearches.length > 0 && (
                    <div className={styles.suggestionsSection}>
                      <span className={styles.suggestionsTitle}>Recent Searches</span>
                      <div className={styles.chipRow}>
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSuggestionClick(term)}
                            className={styles.suggestionTag}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.suggestionsSection}>
                    <span className={styles.suggestionsTitle}>Trending Searches</span>
                    <div className={styles.chipRow}>
                      {trendingSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSuggestionClick(term)}
                          className={styles.suggestionTag}
                        >
                          🔥 {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Learning Stats dashboard */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Learning Statistics</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <BookOpen size={20} className={styles.statsIconBlue} />
            <div className={styles.statsContent}>
              <span className={styles.statsValue}>{startedCourses}</span>
              <span className={styles.statsLabel}>Lectures In Progress</span>
            </div>
          </div>
          <div className={styles.statsCard}>
            <CheckCircle size={20} className={styles.statsIconGreen} />
            <div className={styles.statsContent}>
              <span className={styles.statsValue}>{totalCompleted}</span>
              <span className={styles.statsLabel}>Lectures Completed</span>
            </div>
          </div>
          <div className={styles.statsCard}>
            <Clock size={20} className={styles.statsIconPurple} />
            <div className={styles.statsContent}>
              <span className={styles.statsValue}>{Math.round(totalWatchTime / 60)} mins</span>
              <span className={styles.statsLabel}>Total Watch Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Watching Row (Database driven) */}
      {!loadingProgress && dbProgress.filter((p) => !p.isCompleted).length > 0 && !searchQuery && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Continue Watching</h3>
          <div className={styles.recentsGrid}>
            {dbProgress
              .filter((p) => !p.isCompleted)
              .slice(0, 3)
              .map((item) => (
                <Link
                  key={item._id}
                  to={`/video/${item.videoId._id}`}
                  className={styles.recentCard}
                >
                  <div className={styles.recentThumbnailWrapper}>
                    <img
                      src={item.videoId.thumbnail}
                      alt={item.videoId.title}
                      className={styles.recentThumbnail}
                    />
                    <span className={styles.durationBadge}>
                      {formatDuration(item.videoId.duration)}
                    </span>
                    <div className={styles.recentPlayOverlay}>
                      <Play size={16} fill="white" />
                    </div>
                  </div>
                  <div className={styles.recentDetails}>
                    <span className={styles.recentMetaCategory}>
                      {item.videoId.category}
                    </span>
                    <h4 className={styles.recentTitle}>{item.videoId.title}</h4>
                    <div className={styles.progressBarContainer}>
                      <div className={styles.progressBarWrapper}>
                        <div
                          className={styles.progressBar}
                          style={{ width: `${item.progressPercentage}%` }}
                        />
                      </div>
                      <span className={styles.progressPct}>
                        {formatRemainingTime(item.videoId.duration, item.currentTime)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Explore Grid, Filters and Sort tools */}
      <section className={styles.section}>
        <div className={styles.listHeaderRow}>
          <h3 className={styles.sectionTitle}>Explore Lectures</h3>
          
          <div className={styles.filtersWrapper}>
            {/* Sorting */}
            <div className={styles.filterControl}>
              <ArrowUpDown size={14} className={styles.filterIcon} />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular (Views)</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className={styles.filterControl}>
              <Filter size={14} className={styles.filterIcon} />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category selector chips */}
        <div className={styles.categoryChips}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.grid}>
            <Skeleton type="card" count={4} />
          </div>
        ) : processedVideos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📂</div>
            <h3>No Course Lectures Found</h3>
            <p>Try clearing filters or search queries to check other categories.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {processedVideos.map((video) => {
              const watchHistory = dbProgress.find((p) => p.videoId?._id === video._id);
              const progressPct = watchHistory ? Math.round(watchHistory.progressPercentage) : null;
              const isCompleted = watchHistory ? watchHistory.isCompleted : false;

              return (
                <motion.div
                  key={video._id}
                  layout
                  whileHover={{ y: -6 }}
                  className={styles.videoCard}
                >
                  <Link to={`/video/${video._id}`} className={styles.thumbnailLink}>
                    <div className={styles.thumbnailWrapper}>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className={styles.cardImage}
                        loading="lazy"
                      />
                      <span className={styles.cardDuration}>
                        {formatDuration(video.duration)}
                      </span>
                      {isCompleted && (
                        <span className={styles.completedBadge}>
                          <BookOpenCheck size={12} style={{ marginRight: "4px" }} /> Completed
                        </span>
                      )}
                      <div className={styles.cardPlayOverlay}>
                        <div className={styles.iconCircle}>
                          <Play size={16} fill="white" />
                        </div>
                      </div>
                    </div>
                    {progressPct !== null && (
                      <div className={styles.cardProgressLineWrapper}>
                        <div
                          className={styles.cardProgressLine}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </Link>

                  <div className={styles.cardBody}>
                    <div className={styles.cardInfoRow}>
                      <span className={styles.cardCategoryText}>{video.category}</span>
                      {bookmarkCounts[video._id] !== undefined && (
                        <span className={styles.cardBookmarkCount}>
                          📌 {bookmarkCounts[video._id]} notes
                        </span>
                      )}
                    </div>
                    <Link to={`/video/${video._id}`} className={styles.titleLink}>
                      <h4 className={styles.cardTitle}>{video.title}</h4>
                    </Link>
                    <span className={styles.cardInstructor}>Syllabus by {video.instructor}</span>
                    
                    <p className={styles.cardDescription}>{video.description}</p>
                    
                    <div className={styles.cardBottomRow}>
                      <span className={`${styles.diffLabel} ${styles[video.difficulty.toLowerCase()]}`}>
                        {video.difficulty}
                      </span>
                      <span className={styles.viewsLabel}>📈 {video.views || 0} views</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default Home;
