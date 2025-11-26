import { nanoid } from 'nanoid';
import Share from '../models/Share.js';
import Note from '../models/Note.js';
import Folder from '../models/Folder.js';

/**
 * Share Service
 * Handles all business logic for sharing notes and folders
 */

/**
 * Generates a unique URL-safe share ID using nanoid
 * @returns {string} A 21-character unique share ID
 */
export const generateShareId = () => {
  return nanoid();
};

/**
 * Creates a new share for a note or folder
 * @param {string} userId - The ID of the user creating the share
 * @param {string} type - The type of resource ('note' or 'folder')
 * @param {string} resourceId - The ID of the note or folder to share
 * @returns {Promise<Object>} The created or existing share document
 */
export const createShare = async (userId, type, resourceId) => {
  // Check if a share already exists for this resource
  const existingShare = await getShareByResource(type, resourceId);
  if (existingShare) {
    return existingShare;
  }

  // Create new share
  const share = new Share({
    shareId: generateShareId(),
    type,
    resourceId,
    owner: userId,
    isActive: true
  });

  await share.save();
  return share;
};

/**
 * Retrieves a share by its unique shareId
 * @param {string} shareId - The unique share identifier
 * @returns {Promise<Object|null>} The share document or null if not found
 */
export const getShareByShareId = async (shareId) => {
  return await Share.findOne({ shareId, isActive: true });
};

/**
 * Checks if a resource already has an active share
 * @param {string} type - The type of resource ('note' or 'folder')
 * @param {string} resourceId - The ID of the note or folder
 * @returns {Promise<Object|null>} The existing share or null
 */
export const getShareByResource = async (type, resourceId) => {
  return await Share.findOne({ type, resourceId, isActive: true });
};


/**
 * Fetches the content of a shared note with owner info
 * Returns a read-only data structure (no internal IDs exposed for editing)
 * @param {string} shareId - The unique share identifier
 * @returns {Promise<Object|null>} The shared note content or null
 */
export const getSharedNoteContent = async (shareId) => {
  const share = await Share.findOne({ shareId, isActive: true })
    .populate('owner', 'name');

  if (!share || share.type !== 'note') {
    return null;
  }

  const note = await Note.findById(share.resourceId);
  if (!note) {
    return null;
  }

  // Return read-only structure without exposing internal IDs
  return {
    type: 'note',
    owner: {
      name: share.owner.name
    },
    content: {
      title: note.title,
      content: note.content,
      createdAt: note.createdAt
    },
    shareCreatedAt: share.createdAt
  };
};

/**
 * Recursively fetches all subfolders and their notes
 * @param {string} folderId - The folder ID to fetch subfolders for
 * @param {string} userId - The owner's user ID
 * @returns {Promise<Array>} Array of subfolder objects with their notes
 */
const fetchSubfoldersRecursively = async (folderId, userId) => {
  const subfolders = await Folder.find({ parentFolder: folderId, user: userId });
  
  const result = [];
  for (const subfolder of subfolders) {
    const notes = await Note.find({ folder: subfolder._id, user: userId });
    const nestedSubfolders = await fetchSubfoldersRecursively(subfolder._id, userId);
    
    result.push({
      folder: {
        name: subfolder.name,
        icon: subfolder.icon,
        color: subfolder.color,
        description: subfolder.description
      },
      notes: notes.map(note => ({
        title: note.title,
        content: note.content,
        createdAt: note.createdAt
      })),
      subfolders: nestedSubfolders
    });
  }
  
  return result;
};

/**
 * Fetches the content of a shared folder with all nested content recursively
 * Returns a read-only data structure (no internal IDs exposed for editing)
 * @param {string} shareId - The unique share identifier
 * @returns {Promise<Object|null>} The shared folder content or null
 */
export const getSharedFolderContent = async (shareId) => {
  const share = await Share.findOne({ shareId, isActive: true })
    .populate('owner', 'name');

  if (!share || share.type !== 'folder') {
    return null;
  }

  const folder = await Folder.findById(share.resourceId);
  if (!folder) {
    return null;
  }

  // Fetch notes directly in this folder
  const notes = await Note.find({ folder: folder._id, user: share.owner._id });
  
  // Recursively fetch all subfolders and their content
  const subfolders = await fetchSubfoldersRecursively(folder._id, share.owner._id);

  // Return read-only structure without exposing internal IDs
  return {
    type: 'folder',
    owner: {
      name: share.owner.name
    },
    content: {
      folder: {
        name: folder.name,
        icon: folder.icon,
        color: folder.color,
        description: folder.description
      },
      notes: notes.map(note => ({
        title: note.title,
        content: note.content,
        createdAt: note.createdAt
      })),
      subfolders
    },
    shareCreatedAt: share.createdAt
  };
};


/**
 * Saves a shared note to the user's account as a copy
 * Creates a complete copy with no reference to the original
 * @param {string} shareId - The unique share identifier
 * @param {string} userId - The ID of the user saving the note
 * @param {string} destinationFolderId - The folder to save the note into
 * @returns {Promise<Object>} The saved note info
 */
export const saveNoteToAccount = async (shareId, userId, destinationFolderId) => {
  const share = await Share.findOne({ shareId, isActive: true });
  
  if (!share || share.type !== 'note') {
    throw new Error('Share not found or is not a note');
  }

  const originalNote = await Note.findById(share.resourceId);
  if (!originalNote) {
    throw new Error('Original note no longer exists');
  }

  // Verify destination folder exists and belongs to user
  const destinationFolder = await Folder.findOne({ _id: destinationFolderId, user: userId });
  if (!destinationFolder) {
    throw new Error('Destination folder not found');
  }

  // Create a complete copy with no reference to original
  const noteCopy = new Note({
    title: originalNote.title,
    content: originalNote.content,
    drawings: originalNote.drawings || [],
    folder: destinationFolderId,
    user: userId
  });

  await noteCopy.save();

  return {
    type: 'note',
    id: noteCopy._id,
    title: noteCopy.title,
    noteCount: 1
  };
};

/**
 * Recursively copies a folder structure with all notes
 * @param {string} originalFolderId - The original folder ID to copy
 * @param {string} originalOwnerId - The original owner's user ID
 * @param {string} newParentFolderId - The parent folder ID for the copy (null for root)
 * @param {string} newUserId - The user ID who will own the copy
 * @returns {Promise<Object>} Object with copied folder ID and note count
 */
const copyFolderRecursively = async (originalFolderId, originalOwnerId, newParentFolderId, newUserId) => {
  const originalFolder = await Folder.findById(originalFolderId);
  if (!originalFolder) {
    throw new Error('Original folder not found');
  }

  // Create copy of the folder
  const folderCopy = new Folder({
    name: originalFolder.name,
    description: originalFolder.description,
    color: originalFolder.color,
    icon: originalFolder.icon,
    parentFolder: newParentFolderId,
    user: newUserId
  });
  await folderCopy.save();

  let totalNoteCount = 0;

  // Copy all notes in this folder
  const notes = await Note.find({ folder: originalFolderId, user: originalOwnerId });
  for (const note of notes) {
    const noteCopy = new Note({
      title: note.title,
      content: note.content,
      drawings: note.drawings || [],
      folder: folderCopy._id,
      user: newUserId
    });
    await noteCopy.save();
    totalNoteCount++;
  }

  // Recursively copy all subfolders
  const subfolders = await Folder.find({ parentFolder: originalFolderId, user: originalOwnerId });
  for (const subfolder of subfolders) {
    const result = await copyFolderRecursively(subfolder._id, originalOwnerId, folderCopy._id, newUserId);
    totalNoteCount += result.noteCount;
  }

  return {
    folderId: folderCopy._id,
    noteCount: totalNoteCount
  };
};

/**
 * Saves a shared folder to the user's account as a deep copy
 * Creates a complete copy of the folder structure with all notes
 * @param {string} shareId - The unique share identifier
 * @param {string} userId - The ID of the user saving the folder
 * @param {string|null} parentFolderId - The parent folder ID (null for root level)
 * @returns {Promise<Object>} The saved folder info with note count
 */
export const saveFolderToAccount = async (shareId, userId, parentFolderId) => {
  const share = await Share.findOne({ shareId, isActive: true });
  
  if (!share || share.type !== 'folder') {
    throw new Error('Share not found or is not a folder');
  }

  const originalFolder = await Folder.findById(share.resourceId);
  if (!originalFolder) {
    throw new Error('Original folder no longer exists');
  }

  // If parentFolderId is provided, verify it exists and belongs to user
  if (parentFolderId) {
    const parentFolder = await Folder.findOne({ _id: parentFolderId, user: userId });
    if (!parentFolder) {
      throw new Error('Parent folder not found');
    }
  }

  // Deep copy the entire folder structure
  const result = await copyFolderRecursively(
    share.resourceId,
    share.owner,
    parentFolderId,
    userId
  );

  return {
    type: 'folder',
    id: result.folderId,
    noteCount: result.noteCount
  };
};


/**
 * Validates that a user owns a specific share
 * @param {string} shareId - The unique share identifier
 * @param {string} userId - The user ID to validate ownership for
 * @returns {Promise<Object>} The share document if valid
 * @throws {Error} If share not found or user is not the owner
 */
export const validateShareOwnership = async (shareId, userId) => {
  const share = await Share.findOne({ shareId });
  
  if (!share) {
    throw new Error('Share not found');
  }

  if (share.owner.toString() !== userId.toString()) {
    throw new Error('You can only manage your own shares');
  }

  return share;
};

/**
 * Revokes/deactivates a share (owner only)
 * This immediately prevents new access via the share link
 * Does not affect copies already saved by recipients
 * @param {string} shareId - The unique share identifier
 * @param {string} userId - The ID of the user attempting to revoke
 * @returns {Promise<Object>} The updated share document
 */
export const revokeShare = async (shareId, userId) => {
  // Validate ownership first
  const share = await validateShareOwnership(shareId, userId);

  if (!share.isActive) {
    throw new Error('Share is already revoked');
  }

  share.isActive = false;
  await share.save();

  return share;
};
