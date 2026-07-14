require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Video = require("../models/videoModel");
const Bookmark = require("../models/bookmarkModel");
const Progress = require("../models/progressModel");

const sampleVideos = [
  {
    title: "Mastering React Components & Hooks",
    description: "Dive deep into React state, props, and functional components. Learn how to write reusable, efficient hooks, manage side effects, and build scalable frontends with Vite.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: 596,
    instructor: "Sarah Jenkins",
    category: "React",
    difficulty: "Intermediate",
    tags: ["React", "Hooks", "Frontend", "Vite"],
    views: 120,
    watchCount: 45,
  },
  {
    title: "Advanced Node.js & Express Architecture",
    description: "Understand the core architecture of Node.js event-driven loops. Build modular REST APIs using Express routes, custom middleware, database schemas, and structured error boundaries.",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: 653,
    instructor: "David Miller",
    category: "Node.js",
    difficulty: "Advanced",
    tags: ["Node.js", "Express", "Backend", "REST API"],
    views: 85,
    watchCount: 22,
  },
  {
    title: "Introduction to MongoDB and Mongoose",
    description: "A comprehensive guide to document-oriented databases. Learn how Mongoose simplifies schema definition, model relations, data validation, and complex aggregation queries.",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    duration: 150,
    instructor: "Emma Watson",
    category: "MongoDB",
    difficulty: "Beginner",
    tags: ["MongoDB", "Mongoose", "Database", "NoSQL"],
    views: 200,
    watchCount: 98,
  },
  {
    title: "Modern CSS Architecture & CSS Modules",
    description: "Learn to design responsive, layout-agnostic interfaces using CSS Grid, Flexbox, and CSS Modules. Master absolute control over styling isolation and modern variables.",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    duration: 734,
    instructor: "Alex Rivera",
    category: "Express",
    difficulty: "Intermediate",
    tags: ["Express", "CSS", "Styling", "CSS Modules"],
    views: 50,
    watchCount: 15,
  },
  {
    title: "Data Structures & Algorithms in JS",
    description: "Master big-O notation, stack/queue representations, binary search trees, sorting algorithms, and standard interview coding questions using ES6 JavaScript.",
    thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: 15,
    instructor: "Professor Kyle",
    category: "Algorithms",
    difficulty: "Advanced",
    tags: ["Algorithms", "Data Structures", "JS"],
    views: 310,
    watchCount: 190,
  },
];

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding Phase 2...");

    // Clear existing collections
    await Video.deleteMany({});
    await Bookmark.deleteMany({});
    await User.deleteMany({});
    await Progress.deleteMany({});
    console.log("Cleared existing Video, Bookmark, User, and Progress logs.");

    // Seed Admin & Student
    const adminUser = await User.create({
      name: "Admin Instructor",
      email: "admin@gvcc.edu",
      password: "password123",
      role: "admin",
    });

    const studentUser = await User.create({
      name: "John Student",
      email: "student@gvcc.edu",
      password: "password123",
      role: "student",
      streak: 3,
      lastActiveDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Active yesterday to demo streak continuity!
    });
    console.log("Seeded default users (admin@gvcc.edu and student@gvcc.edu).");

    // Seed Videos
    const createdVideos = await Video.insertMany(sampleVideos);
    console.log(`Successfully seeded ${createdVideos.length} Videos.`);

    // Seed Bookmarks referencing studentUser and video
    if (createdVideos.length > 0) {
      await Bookmark.create({
        videoId: createdVideos[0]._id,
        bookmarkName: "Understanding State Hooks",
        timestamp: 45,
        bookmarkNotes: "Hooks must only be called at the top level of React functions.",
        color: "#2563EB",
        icon: "bookmark",
      });
      await Bookmark.create({
        videoId: createdVideos[0]._id,
        bookmarkName: "Side Effects Explained",
        timestamp: 120,
        bookmarkNotes: "Use empty dependency arrays to simulate componentDidMount.",
        color: "#10B981",
        icon: "star",
      });

      // Seed watch progress records for studentUser
      await Progress.create({
        userId: studentUser._id,
        videoId: createdVideos[0]._id,
        currentTime: 240,
        progressPercentage: 40,
        isCompleted: false,
        lastOpened: new Date(),
      });

      await Progress.create({
        userId: studentUser._id,
        videoId: createdVideos[2]._id,
        currentTime: 150,
        progressPercentage: 100,
        isCompleted: true,
        lastOpened: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastCompleted: new Date(),
      });

      console.log("Seeded default bookmark annotations and student progress logs.");
    }

    mongoose.connection.close();
    console.log("Database connection closed. Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
