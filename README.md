# AniTrack – Anime Watchlist Manager

A modern, full-stack application to track and manage your anime watchlist with different status categories.

---

## 📦 Backend

- **models/anime.js**
  Defines the anime watchlist schema using Mongoose with fields for MAL ID, title, image URL, and status.

- **routes/animeRoutes.js**
  Handles all API requests for anime (add, get, update status, delete).

- **index.js**
  Main server file. Connects to MongoDB, sets up Express with CORS, loads routes, and starts the server.

- **.env**
  Stores your database connection string and port configuration.

**How it works:**

- The **model** defines the anime data structure.
- The **routes** define how to interact with the watchlist via HTTP requests (REST API).
- The **main server** connects everything and runs the app.
- The **frontend** communicates with the backend using JavaScript (fetch).

---

## 💻 Frontend

- **index.html**
  Structure of the app (header, search, anime grid, tabs, etc.).

- **styles.css**
  Visual style, layout, dark/light mode toggle, and responsive design.

- **app.js**
  All interactive logic: search anime, add to watchlist, update status, view details, and theme toggle.

**How it works**

- The frontend is what users see and interact with.
- It gets anime data from Jikan API for searches.
- It communicates with our backend for watchlist operations.
- The backend handles all data storage and retrieval with MongoDB.
- All watchlist data flows through the backend.

---

## 🚀 Quick Start

1. **Clone the repository**
2. **Install dependencies**  
   In `/backend`:  
   `npm install`
3. **Set up your `.env` file**  
   Example:
   ```
   PORT=8000
   MONGO_URL="mongodb://localhost:27017/anime-watchlist"
   ```
4. **Start the backend server**  
   `npm start`
5. **Open `frontend/index.html` in your browser**

---

## 📝 Features

- Search and add anime using Jikan API
- Organize anime by status (Watching, Planned, Completed)
- View detailed anime information
- Update anime status easily
- Remove anime from your watchlist
- Toggle between dark and light mode
- Fully responsive design

---

## 📚 Project Structure

```
backend/
  models/
    anime.js
  routes/
    animeRoutes.js
  index.js
  .env

frontend/
  index.html
  css/
    styles.css
  js/
    app.js
```

---

**Enjoy tracking your anime journey!**
