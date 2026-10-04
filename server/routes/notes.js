import express from 'express';
import Note from '../models/Note.js';
import Folder from '../models/Folder.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateNote, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Helper function to ensure restored note has a valid active folder
const ensureValidFolderForNote = async (note, userId) => {
  if (note.folder) {
    const existingFolder = await Folder.findOne({ _id: note.folder, user: userId });
    if (existingFolder) {
      if (existingFolder.isTrash) {
        // Automatically restore the folder if it was trashed
        existingFolder.isTrash = false;
        await existingFolder.save();
      }
      return existingFolder._id;
    }
  }

  // If folder doesn't exist, find or create default active folder
  let defaultFolder = await Folder.findOne({ user: userId, isTrash: { $ne: true } });
  if (!defaultFolder) {
    defaultFolder = await Folder.create({
      name: 'My Notes',
      description: 'Default folder',
      color: '#3b82f6',
      icon: '📁',
      user: userId,
    });
  }
  return defaultFolder._id;
};

// Get all notes for the authenticated user (excludes trashed notes)
router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let query = { user: req.user._id, isTrash: { $ne: true } };
    
    if (search) {
      query.$and = [
        { isTrash: { $ne: true } },
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Note.countDocuments(query);
    
    res.json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all favorite notes for the authenticated user
router.get('/favorites', async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id, isFavorite: true, isTrash: { $ne: true } })
      .populate('folder', 'name icon color')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ notes });
  } catch (error) {
    next(error);
  }
});

// Get all trashed notes for the authenticated user
router.get('/trash', async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id, isTrash: true })
      .populate('folder', 'name icon color')
      .sort({ deletedAt: -1, updatedAt: -1 })
      .lean();
    res.json({ notes });
  } catch (error) {
    next(error);
  }
});

// Empty trash (permanently delete all trashed notes)
router.delete('/trash/empty', async (req, res, next) => {
  try {
    await Note.deleteMany({ user: req.user._id, isTrash: true });
    res.json({ success: true, message: 'Trash emptied successfully' });
  } catch (error) {
    next(error);
  }
});

// Bulk restore notes from trash
router.post('/trash/restore-bulk', async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }

    const trashedNotes = await Note.find({ _id: { $in: ids }, user: req.user._id });
    for (const note of trashedNotes) {
      const validFolderId = await ensureValidFolderForNote(note, req.user._id);
      note.isTrash = false;
      note.deletedAt = null;
      note.folder = validFolderId;
      await note.save();
    }

    res.json({ success: true, message: `Restored ${ids.length} notes` });
  } catch (error) {
    next(error);
  }
});

// Bulk permanently delete notes from trash
router.post('/trash/delete-bulk', async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }
    await Note.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ success: true, message: `Permanently deleted ${ids.length} notes` });
  } catch (error) {
    next(error);
  }
});

// Toggle favorite status for a note
router.patch('/:id/favorite', validateObjectId('id'), async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    note.isFavorite = !note.isFavorite;
    await note.save();
    
    res.json({ success: true, isFavorite: note.isFavorite, note });
  } catch (error) {
    next(error);
  }
});

// Global search notes by heading
router.get('/search/global', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ results: [] });
    }
    
    const searchTerm = q.trim();
    
    const notes = await Note.find({
      user: req.user._id,
      isTrash: { $ne: true },
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: `^#{1,6}\\s+.*${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$`, $options: 'im' } }
      ]
    })
    .populate('folder', 'name icon color')
    .sort({ updatedAt: -1 })
    .limit(20)
    .lean();
    
    const results = notes.map(note => {
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      const headings = [];
      let match;
      while ((match = headingRegex.exec(note.content)) !== null) {
        if (match[2].toLowerCase().includes(searchTerm.toLowerCase())) {
          headings.push({
            level: match[1].length,
            text: match[2].trim()
          });
        }
      }
      
      return {
        _id: note._id,
        title: note.title,
        folder: note.folder,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        matchedHeadings: headings,
        titleMatch: note.title.toLowerCase().includes(searchTerm.toLowerCase())
      };
    });
    
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

// Restore single note from trash
router.patch('/:id/restore', validateObjectId('id'), async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const validFolderId = await ensureValidFolderForNote(note, req.user._id);
    note.isTrash = false;
    note.deletedAt = null;
    note.folder = validFolderId;
    await note.save();

    res.json({ success: true, message: 'Note restored successfully', note });
  } catch (error) {
    next(error);
  }
});

// Permanent delete single note
router.delete('/:id/permanent', validateObjectId('id'), async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, message: 'Note permanently deleted' });
  } catch (error) {
    next(error);
  }
});

// Get single note for the authenticated user
router.get('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id })
      .populate('folder', 'name icon color')
      .lean();
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
});

// Create new note for the authenticated user
router.post('/', validateNote, async (req, res, next) => {
  try {
    const note = new Note({
      ...req.body,
      user: req.user._id
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
});

// Update note for the authenticated user
router.put('/:id', validateObjectId('id'), validateNote, async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
});

// Soft Delete note for the authenticated user (moves to trash)
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isTrash: true, deletedAt: new Date() },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, message: 'Note moved to trash' });
  } catch (error) {
    next(error);
  }
});

// Update drawings for the authenticated user
router.patch('/:id/drawings', validateObjectId('id'), async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { drawings: req.body.drawings },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
});

export default router;