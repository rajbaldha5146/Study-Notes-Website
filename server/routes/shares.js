import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';
import Note from '../models/Note.js';
import Folder from '../models/Folder.js';
import {
  createShare,
  getShareByShareId,
  getShareByResource,
  getSharedNoteContent,
  getSharedFolderContent,
  saveNoteToAccount,
  saveFolderToAccount,
  revokeShare
} from '../services/shareService.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * POST /api/shares
 * Create a share link for a note or folder
 * Requirements: 1.1, 1.2, 1.3, 2.1, 2.4, 2.5
 */
router.post('/', async (req, res, next) => {
  try {
    const { type, resourceId } = req.body;
    const userId = req.user._id;

    // Validate type
    if (!type || !['note', 'folder'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "note" or "folder"'
      });
    }

    // Validate resourceId format
    if (!resourceId || !/^[0-9a-fA-F]{24}$/.test(resourceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resourceId format'
      });
    }

    // Verify user owns the resource
    let resource;
    if (type === 'note') {
      resource = await Note.findOne({ _id: resourceId, user: userId });
    } else {
      resource = await Folder.findOne({ _id: resourceId, user: userId });
    }

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found or you don't have permission to share it`
      });
    }

    // Create share (returns existing if already shared)
    const share = await createShare(userId, type, resourceId);
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    res.status(201).json({
      success: true,
      share: {
        shareId: share.shareId,
        shareUrl: `${baseUrl}/share/${share.shareId}`,
        type: share.type,
        createdAt: share.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});


/**
 * GET /api/shares/resource/:type/:resourceId
 * Check if a resource is currently shared
 * NOTE: This route must be defined BEFORE /:shareId to avoid conflicts
 * Requirements: 7.1, 7.2, 7.3, 7.5
 */
router.get('/resource/:type/:resourceId', validateObjectId('resourceId'), async (req, res, next) => {
  try {
    const { type, resourceId } = req.params;
    const userId = req.user._id;

    // Validate type
    if (!['note', 'folder'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "note" or "folder"'
      });
    }

    // Verify user owns the resource
    let resource;
    if (type === 'note') {
      resource = await Note.findOne({ _id: resourceId, user: userId });
    } else {
      resource = await Folder.findOne({ _id: resourceId, user: userId });
    }

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`
      });
    }

    // Check if resource is shared
    const share = await getShareByResource(type, resourceId);
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (share) {
      res.json({
        success: true,
        isShared: true,
        share: {
          shareId: share.shareId,
          shareUrl: `${baseUrl}/share/${share.shareId}`,
          createdAt: share.createdAt
        }
      });
    } else {
      res.json({
        success: true,
        isShared: false
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/shares/:shareId
 * Get shared content (read-only)
 * Requirements: 3.4, 4.1, 4.2, 4.3, 4.4, 4.5
 */
router.get('/:shareId', async (req, res, next) => {
  try {
    const { shareId } = req.params;

    // Check if share exists and is active
    const share = await getShareByShareId(shareId);
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share link not found or has been revoked'
      });
    }

    // Fetch content based on type
    let content;
    if (share.type === 'note') {
      content = await getSharedNoteContent(shareId);
    } else {
      content = await getSharedFolderContent(shareId);
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'The shared content no longer exists'
      });
    }

    res.json({
      success: true,
      ...content
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/shares/:shareId/save
 * Save a copy of shared content to user's account
 * Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.6
 */
router.post('/:shareId/save', async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const { destinationFolderId } = req.body;
    const userId = req.user._id;

    // Check if share exists and is active
    const share = await getShareByShareId(shareId);
    
    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share link not found or has been revoked'
      });
    }

    let result;
    if (share.type === 'note') {
      // For notes, destinationFolderId is required
      if (!destinationFolderId || !/^[0-9a-fA-F]{24}$/.test(destinationFolderId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid destination folder ID is required for saving notes'
        });
      }
      result = await saveNoteToAccount(shareId, userId, destinationFolderId);
    } else {
      // For folders, destinationFolderId is optional (null = root level)
      if (destinationFolderId && !/^[0-9a-fA-F]{24}$/.test(destinationFolderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid destination folder ID format'
        });
      }
      result = await saveFolderToAccount(shareId, userId, destinationFolderId || null);
    }

    const message = share.type === 'note' 
      ? 'Note saved to your account successfully'
      : `Folder saved with ${result.noteCount} note(s)`;

    res.json({
      success: true,
      message,
      savedResource: result
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('no longer exists')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/shares/:shareId
 * Revoke a share (owner only)
 * Requirements: 7.1, 7.2, 7.3, 7.5
 */
router.delete('/:shareId', async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const userId = req.user._id;

    await revokeShare(shareId, userId);

    res.json({
      success: true,
      message: 'Share link has been revoked successfully'
    });
  } catch (error) {
    if (error.message === 'Share not found') {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }
    if (error.message === 'You can only manage your own shares') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Share is already revoked') {
      return res.status(410).json({
        success: false,
        message: 'This share link is no longer active'
      });
    }
    next(error);
  }
});

export default router;
