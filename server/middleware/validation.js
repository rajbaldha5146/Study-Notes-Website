/**
 * Request validation middleware
 * Validates incoming request data to prevent invalid data from reaching the database
 */

/**
 * Sanitize string to prevent XSS
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
};

export const validateNote = (req, res, next) => {
  const { title, content, folder } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }

  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    errors.push('Content is required and must be a non-empty string');
  }

  if (content && content.length > 1000000) {
    errors.push('Content must be less than 1MB');
  }

  if (!folder || typeof folder !== 'string') {
    errors.push('Folder ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.title = sanitizeString(title.trim());
  req.body.content = sanitizeString(content);

  next();
};

export const validateFolder = (req, res, next) => {
  const { name, description, color, icon } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Folder name is required and must be a non-empty string');
  }

  if (name && name.length > 100) {
    errors.push('Folder name must be less than 100 characters');
  }

  if (description && description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
    errors.push('Color must be a valid hex color code');
  }

  if (icon && icon.length > 10) {
    errors.push('Icon must be a valid emoji or short string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.name = sanitizeString(name.trim());
  if (description) {
    req.body.description = sanitizeString(description.trim());
  }

  next();
};

export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    // MongoDB ObjectId validation (24 hex characters)
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};
