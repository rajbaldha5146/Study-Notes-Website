import express from 'express';
import Note from '../models/Note.js';

const router = express.Router();

// Get all notes
router.get('/', async (req, res) => {
  try {
    const { category, tag, search } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const notes = await Note.find(query).sort({ episode: 1, createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new note
router.post('/', async (req, res) => {
  try {
    const note = new Note(req.body);
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update highlights
router.patch('/:id/highlights', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { highlights: req.body.highlights },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update drawings
router.patch('/:id/drawings', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { drawings: req.body.drawings },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;