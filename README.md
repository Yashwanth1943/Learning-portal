# GVCC Academy - Engineering Learning Portal

A premium, responsive, and student-friendly Learning Management System (LMS) portal designed to deliver high-quality programming tutorials. It features an interactive custom video player with seeking bookmarks, local watch progress tracking, active-tab blur protection, copy/drag blockers, and an animated bouncing student watermark.

---

## 🚀 Key Features

- **Responsive Course Portal**: A high-performance web dashboard optimized for Desktop, Tablet, and Mobile views.
- **Search with Debounce**: Fast, server-side debounced title and description filters.
- **Interactive Bookmarks**: Allow multiple bookmarks per video. Students can save timestamps with custom names, edit inline, remove bookmarks, and click on them to seek the player directly to that time.
- **Continue Watching & Progress Tracker**: Persists playback state in `localStorage`. Offers a resume prompt card when reloading a partially watched course, and highlights progress percentages.
- **Browser-Based Screenshot Protection**:
  - Blurs the video player and page interface instantly when the tab becomes inactive (visibility change) or the window loses focus.
  - Disables right-click, text selection, image/video dragging, and standard clipboard copy actions.
  - Blocks standard screenshot hotkeys, clipboard hooks, and F12 DevTools triggers.
  - Generates an active, bouncing floating watermark showing the student's unique ID and session IP.
- **Loading Skeletons & Toast System**: Features modern custom shimmer skeletons for content fetching states and an in-house glassmorphic Toast notification system.

---

## 🛠️ Technology Stack

### Frontend
- **React (Vite)** (v19)
- **React Router DOM** (v7)
- **Axios** (v1.7)
- **CSS Modules** (for CSS scoping and layout aesthetics)
- **Context API** (State management for notifications)

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose**
- **dotenv** (Configuration loading)
- **cors** (Cross-Origin Resource sharing)
- **nodemon** (Development monitoring tool)

---

## 📂 Project Structure

```
learning-portal/
├── backend/
│   ├── config/              # DB connection config
│   │   └── db.js
│   ├── controllers/         # Request handling controllers
│   │   ├── bookmarkController.js
│   │   └── videoController.js
│   ├── middleware/          # Express route middleware
│   │   └── errorMiddleware.js
│   ├── models/              # Mongoose DB models
│   │   ├── bookmarkModel.js
│   │   └── videoModel.js
│   ├── routes/              # Express routing rules
│   │   ├── bookmarkRoutes.js
│   │   └── videoRoutes.js
│   ├── scripts/             # DB migration & seeds
│   │   └── seed.js
│   ├── .env                 # Environment configurations
│   ├── package.json
│   └── server.js            # Express server entry point
│
└── frontend/
    ├── public/
    └── src/
        ├── assets/          # Static icons & logos
        ├── components/      # UI components (Skeletons, Watermarks)
        │   ├── Skeleton.jsx
        │   └── Watermark.jsx
        ├── context/         # Notification Context
        │   └── ToastContext.jsx
        ├── hooks/           # Screenshot protections & window lifecycle
        │   └── useScreenshotProtection.js
        ├── layout/          # Grid Wrapper, Headers, Footers
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   └── Layout.jsx
        ├── pages/           # Route views
        │   ├── Home.jsx
        │   ├── VideoPlayer.jsx
        │   └── NotFound.jsx
        ├── services/        # HTTP client setups
        │   └── api.js
        ├── index.css        # Global CSS variables & resets
        ├── main.jsx
        └── App.jsx          # Router mappings
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside the `backend` folder with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/learning-portal
CORS_ORIGIN=http://localhost:5173
```

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Local MongoDB running instance (or MongoDB Atlas URI)

### Backend Installation & Setup
1. Open a terminal in the `backend` directory.
2. Install packages:
   ```bash
   npm install
   ```
3. Seed the database with sample courses:
   ```bash
   npm run seed
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```

### Frontend Installation & Setup
1. Open a terminal in the `frontend` directory.
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Vite hot-reloading server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser at `http://localhost:5173`.

---

## 📑 API Documentation

### Videos Resource (`/api/videos`)
- **GET `/api/videos`**: Returns all courses. Supports query parameters for searching (`?search=react`).
- **GET `/api/videos/:id`**: Returns a single course details matching the DB ObjectId.

### Bookmarks Resource (`/api/bookmarks`)
- **GET `/api/bookmarks/:videoId`**: Fetches all bookmarks matching the provided `videoId` sorted chronologically.
- **POST `/api/bookmarks`**: Creates a new reference bookmark.
  - *Payload*: `{ videoId: String, bookmarkName: String (optional), timestamp: Number }`
- **PUT `/api/bookmarks/:id`**: Updates an existing bookmark's title or timestamp.
  - *Payload*: `{ bookmarkName: String, timestamp: Number }`
- **DELETE `/api/bookmarks/:id`**: Removes a bookmark by ID.

---

## 🔒 Screenshot Protection Capabilities & Limitations

### Browser Protections
1. **Window Blur / Visibility Toggle**: Instantly applies a heavy CSS Gaussian blur filter to the player element when switching tabs, focusing DevTools, or clicking away, blocking automated background snips.
2. **Standard Shortcut Disabling**: Blocks inputs for PrintScreen, standard copying (Ctrl+C), and inspect options (F12, Ctrl+Shift+I).
3. **Floating Watermark**: Renders a bouncing CSS box showing the student ID and IP addresses, preventing screen-recording captures without tracing leaks.

### Documented Browser Limitations
- **External Captures**: Browser-based scripting cannot block users from taking physical pictures or recordings using mobile phones, external cameras, or hardware capture cards.
- **OS-Level Snip Capture Tools**: Standard tools like Windows Snipping Tool (Win+Shift+S) intercept screen content at the OS driver level before the browser's JavaScript execution thread receives the keyboard events.
- **Extension Overrides**: Users running aggressive custom browser extensions or disabling JavaScript can bypass some client-side event handlers.

---

## 🖼️ UI Screenshots Placeholder

*(Insert screenshots showing the minimalist dashboard, customized video player panel, and security overlays here)*
