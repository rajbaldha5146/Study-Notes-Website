# 📝 NoteMaster — Modern Distraction-Free Study & Knowledge Base Platform

NoteMaster is a powerful, full-stack, distraction-free note-taking and study knowledge base built with React 19, Node.js, Express, and MongoDB. Designed for extended night reading and seamless organization, NoteMaster provides rich Markdown support, folder hierarchies, accurate code syntax highlighting, soft-delete trash recovery, and a dedicated ⭐ Favorites Vault.

---

## ✨ Features & Highlights

### 🎨 1. Obsidian Midnight Design System (Night Reading Friendly)
- **Eye-Soothing Night Palette**: Soft `#0d1117` base, `#161b22` surface cards, `#e6edf3` soft text, and `#79c0ff` sapphire accents. Zero harsh pure white glare for long study sessions.
- **Modern Typography**: Inter & JetBrains Mono fonts for code blocks.
- **Custom Modals**: Fully integrated custom non-browser popups (`<ConfirmModal />`) for folder/note deletions.

### 📝 2. High-Performance Note & Code Reading
- **Accurate Code Syntax Highlighting**: Powered by `rehype-highlight` & `highlight.js` (GitHub Dark Dimmed style) supporting **C# (`c#`/`csharp`/`cs`)**, JavaScript, TypeScript, Python, C++, HTML, CSS, SQL, Shell, JSON, and more.
- **Code Block Copying**: One-click copy button with instant checkmark feedback.
- **Reading Progress & Stats**: Fixed top reading progress bar, estimated reading time, and live word count.
- **Table of Contents (TOC)**: Auto-extracted heading outline with ScrollSpy section highlighting (hidden by default to keep reading centered).
- **Clean Note Card Previews**: Home and Folder views render clean plaintext previews (stripped of raw `#`, `**`, `[link]` markdown tags).

### 🗑️ 3. Soft-Delete Trash Bin System
- **Safe Deletion**: Deleting notes moves them to the Trash instead of permanent deletion.
- **Bulk Multi-Select Restore**: Select multiple files or folders from the Trash to restore them simultaneously.
- **Folder Preservation**: Restoring notes restores them back into their original parent folder without breaking breadcrumbs or displaying `Uncategorized`.
- **Permanent Purge**: Options to permanently purge single or selected notes from Trash.

### ⭐ 4. Favorites Vault
- **Favorites Folder**: Dedicated Favorites card on the Home dashboard for quick access to starred study notes.
- **Favorite API**: Instant toggle (`PATCH /api/notes/:id/favorite`) with real-time UI synchronization.

### 📁 5. Folder Hierarchy & Organization
- **Nested Structure**: Organize notes across custom folders with customizable icons and colors.
- **Context Menus & Actions**: Quick access to rename, recolor, export, or delete folders.
- **ZIP Export**: Download entire folders as `.zip` archives.
- **Bulk Upload**: Upload multiple `.md` files at once.
- **Shareable Links**: Share notes or folders with public view links.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI components & hooks
- **Vite 7** - Ultra-fast development server & bundler
- **Tailwind CSS 3** - Utility-first styling with custom CSS variables
- **React Router 6** - Client-side SPA routing
- **React Markdown** - GFM, Rehype Highlight & Rehype Raw rendering
- **Lucide React** - Modern vector iconography
- **React Hot Toast** - Toast notification feedback

### Backend
- **Node.js** - Async JavaScript runtime
- **Express.js** - RESTful API routes & middleware
- **MongoDB & Mongoose 8** - Document database & ODM schema modeling
- **JWT & bcryptjs** - Authentication & password hashing
- **JSZip & File-Saver** - Dynamic zip exports

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB instance (local or MongoDB Atlas)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajbaldha5146/Study-Notes-Website.git
   cd Study-Notes-Website
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure Environment Variables**

   Create `.env` in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   Create `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/notemaster
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

5. **Start Development Servers**

   Backend Server:
   ```bash
   cd server
   npm run dev
   ```

   Frontend Client:
   ```bash
   npm run dev
   ```

6. **Access App**: Open `http://localhost:5173` in your browser.

---

## 📂 Project Structure

```
NoteMaster/
├── src/                        # React Frontend Source
│   ├── components/             # Reusable UI Components & Modals
│   ├── contexts/               # Global Context Providers
│   ├── pages/                  # Home, NoteViewer, TrashView, FolderView, Editors
│   ├── services/               # Axios API Service Handlers
│   ├── styles/                 # Theme & Markdown CSS (Obsidian Midnight)
│   └── utils/                  # Markdown Cleaners, Reading Time & Search Helpers
├── server/                     # Express Backend Source
│   ├── models/                 # Mongoose Note & Folder Schemas
│   ├── routes/                 # REST Endpoints (Notes, Folders, Auth, Search, Trash)
│   ├── middleware/             # Auth & Error Handling
│   └── server.js               # Express Application Entry
└── README.md
```

---

## ⚡ Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notes` | Get all active notes |
| `GET` | `/api/notes/:id` | Get note by ID |
| `POST` | `/api/notes` | Create a new note |
| `PATCH` | `/api/notes/:id/favorite` | Toggle note favorite state |
| `GET` | `/api/notes/favorites` | Get all favorite notes |
| `GET` | `/api/notes/trash` | Get all soft-deleted notes in trash |
| `POST` | `/api/notes/trash/restore-many` | Bulk restore notes from trash |
| `POST` | `/api/notes/trash/delete-many` | Permanently purge notes from trash |
| `GET` | `/api/folders` | Get folder structure |
| `DELETE` | `/api/folders/:id` | Soft-delete folder & contained notes |

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).