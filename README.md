# JavaScript Notes App

A MERN stack application for managing and viewing JavaScript learning notes with highlighting and drawing capabilities.

## Features

- 📝 Create, edit, and view markdown notes
- 🎨 Highlight text with different colors
- ✏️ Draw on notes with fabric.js canvas
- 🏷️ Tag and categorize notes
- 🔍 Search and filter functionality
- 📱 Responsive design with Tailwind CSS
- 🗄️ MongoDB backend for data persistence

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Fabric.js, React Markdown
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Tools**: Vite, Lucide React Icons

## 🚀 Deployment

This app is ready for deployment on Render! See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Local Development

### 1. Install Dependencies

```bash
# Install frontend and backend dependencies
npm install
```

### 2. Environment Setup

Copy the example environment files and update with your values:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

### 3. Start the Application

```bash
# Start frontend dev server
npm run dev

# Start backend dev server (in another terminal)
npm run server:dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Usage

### Creating Notes

1. Click "New Note" in the navigation
2. Fill in the title, content (in Markdown), tags, and episode number
3. Use the preview toggle to see how your markdown renders
4. Save the note

### Viewing Notes

1. Click on any note from the home page
2. Use the highlight tool to mark important text
3. Use the drawing tool to add annotations
4. Save your highlights and drawings

### Features in Note Viewer

- **Highlight Mode**: Select text and choose colors to highlight
- **Drawing Mode**: Draw directly on the note with different colors
- **Save**: Persist your highlights and drawings to the database

## API Endpoints

- `GET /api/notes` - Get all notes (with optional search/filter)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PATCH /api/notes/:id/highlights` - Update highlights
- `PATCH /api/notes/:id/drawings` - Update drawings

## Project Structure

```
├── src/                    # React frontend source
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── ...
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── scripts/          # Utility scripts
├── dist/                 # Built frontend (generated)
├── render.yaml           # Render deployment config
├── DEPLOYMENT.md         # Deployment guide
└── package.json          # Frontend dependencies & scripts
```

## Contributing

Feel free to add new features like:

- Export notes to PDF
- Collaborative editing
- Note sharing
- Advanced search with filters
- Dark mode
- Mobile app version
