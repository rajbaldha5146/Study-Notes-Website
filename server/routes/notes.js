import express from 'express';
import Note from '../models/Note.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateNote, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all notes for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    let query = { user: req.user._id };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
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

// Delete note for the authenticated user
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, message: 'Note deleted successfully' });
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