# 📝 NoteMaster

A beautiful, modern note-taking application built with React and Node.js. Create, organize, and manage your notes with a clean, dark slate theme and powerful markdown support.

![NoteMaster Preview](https://via.placeholder.com/800x400/0f172a/3b82f6?text=NoteMaster+Preview)

## ✨ Features

- 🎨 **Beautiful Dark Theme** - Clean slate design with blue accents
- 📝 **Markdown Support** - Full markdown editing with live preview
- � S**Folder Organization** - Organize notes in folders and subfolders
- � **sSearch & Filter** - Find notes quickly with powerful search
- �  **Responsive Design** - Works perfectly on all devices
- 🚀 **Fast & Modern** - Built with React 18 and Vite
- 🔐 **Secure Authentication** - JWT-based user authentication
- 📤 **File Upload** - Upload existing markdown files
- 🎯 **AI Integration** - AI-powered topic generation

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Markdown** - Markdown rendering
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/notemaster.git
   cd notemaster
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

4. **Environment Setup**
   
   Create `.env` in root directory:
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

5. **Start the application**
   
   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
notemaster/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   └── ai/            # AI-related components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── styles/            # CSS files
│   └── utils/             # Utility functions
├── server/                # Backend source
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   └── utils/             # Server utilities
└── public/                # Static assets
```

## 🎨 Theme & Design

NoteMaster features a carefully crafted dark theme:

- **Primary Colors**: Slate (950, 900, 800, 700)
- **Accent Color**: Blue (500, 600, 400)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Rounded corners, subtle shadows, smooth transitions
- **Responsive**: Mobile-first design approach

## 📝 Usage

### Creating Notes
1. Click "New Note" button
2. Choose a folder or create a new one
3. Write in markdown or upload .md files
4. Save and organize

### Organizing with Folders
1. Use the sidebar to create folders
2. Drag and drop notes between folders
3. Create nested folder structures
4. Add icons and descriptions

### Markdown Features
- Headers, lists, links, images
- Code blocks with syntax highlighting
- Tables with enhanced styling
- Blockquotes and emphasis
- Task lists and more

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Railway/Render)
```bash
cd server
npm start
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The web framework used
- [Tailwind CSS](https://tailwindcss.com/) - For the beautiful styling
- [Lucide](https://lucide.dev/) - For the amazing icons
- [MongoDB](https://www.mongodb.com/) - For the database

## 📞 Support

If you have any questions or need help, please open an issue or contact:

- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

Made with ❤️ by [Your Name](https://github.com/yourusername)