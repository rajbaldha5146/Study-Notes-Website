/**
 * Structured logging utility
 * Provides consistent logging across the application
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Format log message with timestamp and level
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    if (this.isDevelopment) {
      return JSON.stringify(logEntry, null, 2);
    }
    return JSON.stringify(logEntry);
  }

  /**
   * Log error message
   */
  error(message, error = null, meta = {}) {
    const logData = {
      ...meta,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    };
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message, logData));
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message, meta));
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    console.log(this.formatMessage(LOG_LEVELS.INFO, message, meta));
  }

  /**
   * Log debug message (only in development)
   */
  debug(message, meta = {}) {
    if (this.isDevelopment) {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }

  /**
   * Log HTTP request
   */
  request(req) {
    this.info('HTTP Request', {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }

  /**
   * Log HTTP response
   */
  response(req, res, duration) {
    this.info('HTTP Response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  }
}

export const logger = new Logger();
