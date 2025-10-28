import express from 'express';
import Folder from '../models/Folder.js';
import Note from '../models/Note.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateFolder, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all folders for the authenticated user
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).populate('parentFolder').sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get folder tree structure for the authenticated user
router.get('/tree', async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).populate('parentFolder');
    
    // Build tree structure
    const folderMap = {};
    const rootFolders = [];
    
    folders.forEach(folder => {
      folderMap[folder._id] = { ...folder.toObject(), children: [] };
    });
    
    folders.forEach(folder => {
      if (folder.parentFolder) {
        if (folderMap[folder.parentFolder._id]) {
          folderMap[folder.parentFolder._id].children.push(folderMap[folder._id]);
        }
      } else {
        rootFolders.push(folderMap[folder._id]);
      }
    });
    
    res.json(rootFolders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single folder with notes for the authenticated user
router.get('/:id', async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    const notes = await Note.find({ folder: req.params.id, user: req.user._id }).sort({ episode: 1, createdAt: -1 });
    const subfolders = await Folder.find({ parentFolder: req.params.id, user: req.user._id });
    
    res.json({
      folder,
      notes,
      subfolders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new folder for the authenticated user
router.post('/', validateFolder, async (req, res, next) => {
  try {
    const folder = new Folder({
      ...req.body,
      user: req.user._id
    });
    const savedFolder = await folder.save();
    res.status(201).json(savedFolder);
  } catch (error) {
    next(error);
  }
});

// Update folder for the authenticated user
router.put('/:id', async (req, res) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    res.json(folder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete folder for the authenticated user (with cascade)
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const folderId = req.params.id;
    const userId = req.user._id;
    
    // Verify folder exists and belongs to user
    const folder = await Folder.findOne({ _id: folderId, user: userId });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }
    
    // Recursive function to delete folder and all its contents
    const deleteFolderRecursive = async (id) => {
      // Find all subfolders
      const subfolders = await Folder.find({ parentFolder: id, user: userId });
      
      // Recursively delete subfolders
      for (const subfolder of subfolders) {
        await deleteFolderRecursive(subfolder._id);
      }
      
      // Delete all notes in this folder
      await Note.deleteMany({ folder: id, user: userId });
      
      // Delete the folder itself
      await Folder.findOneAndDelete({ _id: id, user: userId });
    };
    
    // Start cascade delete
    await deleteFolderRecursive(folderId);
    
    res.json({ success: true, message: 'Folder and all contents deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;