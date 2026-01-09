/**
 * Structured Logging Utility
 * 
 * Provides consistent, structured logging for production environments.
 * Integrates with log aggregation services (Datadog, Logtail, etc.)
 * 
 * Features:
 * - Structured JSON output for production
 * - Pretty-printed console output for development
 * - Request context tracking
 * - Performance timing
 * - Error serialization
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Log level hierarchy
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Get configured log level
function getConfiguredLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
  return LOG_LEVELS[level] !== undefined ? level : 'info';
}

// Check if should log at this level
function shouldLog(level: LogLevel): boolean {
  const configuredLevel = getConfiguredLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[configuredLevel];
}

// Serialize error for logging
function serializeError(error: unknown): LogEntry['error'] | undefined {
  if (!error) return undefined;
  
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
  
  return {
    name: 'UnknownError',
    message: String(error),
  };
}

// Format log entry
function formatEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context ? { ...context } : undefined,
    error: serializeError(error),
  };
}

// Output log entry
function output(entry: LogEntry): void {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Pretty print for development
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[entry.level];
    
    const color = {
      debug: '\x1b[90m', // gray
      info: '\x1b[36m',  // cyan
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    }[entry.level];
    
    const reset = '\x1b[0m';
    
    console.log(
      `${color}${emoji} [${entry.level.toUpperCase()}]${reset} ${entry.message}`,
      entry.context ? entry.context : '',
      entry.error ? `\n${entry.error.stack || entry.error.message}` : ''
    );
  } else {
    // JSON for production (for log aggregation)
    const logFn = entry.level === 'error' ? console.error : console.log;
    logFn(JSON.stringify(entry));
  }
}

// Main logger interface
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      output(formatEntry('debug', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      output(formatEntry('info', message, context));
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      output(formatEntry('warn', message, context));
    }
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    if (shouldLog('error')) {
      output(formatEntry('error', message, context, error));
    }
  },

  /**
   * Create a child logger with preset context
   */
  child(baseContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...baseContext, ...context }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...baseContext, ...context }),
      warn: (message: string, context?: LogContext) =>
        logger.warn(message, { ...baseContext, ...context }),
      error: (message: string, error?: unknown, context?: LogContext) =>
        logger.error(message, error, { ...baseContext, ...context }),
    };
  },

  /**
   * Time an async operation
   */
  async time<T>(
    name: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      logger.info(`${name} completed`, { ...context, duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`${name} failed`, error, { ...context, duration });
      throw error;
    }
  },
};

/**
 * Create request-scoped logger
 */
export function createRequestLogger(request: Request): ReturnType<typeof logger.child> {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const url = new URL(request.url);
  
  return logger.child({
    requestId,
    method: request.method,
    path: url.pathname,
  });
}

/**
 * Log API request/response
 */
export function logApiRequest(
  request: Request,
  response: Response,
  duration: number
): void {
  const url = new URL(request.url);
  const level = response.status >= 500 ? 'error' : response.status >= 400 ? 'warn' : 'info';
  
  logger[level]('API Request', {
    method: request.method,
    path: url.pathname,
    status: response.status,
    duration,
    requestId: request.headers.get('x-request-id') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });
}

export default logger;
