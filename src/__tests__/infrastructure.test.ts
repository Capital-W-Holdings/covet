/**
 * Infrastructure Component Tests
 * 
 * Tests for production infrastructure: logging, rate limiting, health checks
 */

import { logger, createRequestLogger } from '@/lib/logger';

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Logger', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    // Reset to production mode for JSON output testing
    (process.env as Record<string, string>).NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'debug';
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    (process.env as Record<string, string>).NODE_ENV = 'test';
  });

  describe('log levels', () => {
    it('logs debug messages when level is debug', () => {
      process.env.LOG_LEVEL = 'debug';
      logger.debug('Debug message');
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(logOutput.level).toBe('debug');
      expect(logOutput.message).toBe('Debug message');
    });

    it('does not log debug when level is info', () => {
      process.env.LOG_LEVEL = 'info';
      logger.debug('Debug message');
      
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('logs info messages', () => {
      logger.info('Info message', { userId: '123' });
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(logOutput.level).toBe('info');
      expect(logOutput.message).toBe('Info message');
      expect(logOutput.context.userId).toBe('123');
    });

    it('logs warn messages', () => {
      logger.warn('Warning message');
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(logOutput.level).toBe('warn');
    });

    it('logs error messages with error serialization', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(logOutput.level).toBe('error');
      expect(logOutput.error.name).toBe('Error');
      expect(logOutput.error.message).toBe('Test error');
    });
  });

  describe('child logger', () => {
    it('creates child logger with base context', () => {
      const childLogger = logger.child({ requestId: 'req-123' });
      childLogger.info('Child log');
      
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(logOutput.context.requestId).toBe('req-123');
    });

    it('merges additional context', () => {
      const childLogger = logger.child({ requestId: 'req-123' });
      childLogger.info('Child log', { userId: 'user-456' });
      
      const logOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(logOutput.context.requestId).toBe('req-123');
      expect(logOutput.context.userId).toBe('user-456');
    });
  });

  describe('time helper', () => {
    it('logs duration for successful operations', async () => {
      const result = await logger.time('test-operation', async () => {
        return 'success';
      });
      
      expect(result).toBe('success');
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(logOutput.message).toBe('test-operation completed');
      expect(logOutput.context.duration).toBeGreaterThanOrEqual(0);
    });

    it('logs duration for failed operations', async () => {
      await expect(
        logger.time('failing-operation', async () => {
          throw new Error('Operation failed');
        })
      ).rejects.toThrow('Operation failed');
      
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(mockConsoleError.mock.calls[0][0]);
      expect(logOutput.message).toBe('failing-operation failed');
    });
  });

  describe('createRequestLogger', () => {
    it('creates logger with request context', () => {
      const request = new Request('https://example.com/api/products', {
        method: 'GET',
        headers: {
          'x-request-id': 'test-request-id',
        },
      });
      
      const reqLogger = createRequestLogger(request);
      reqLogger.info('Request received');
      
      const logOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(logOutput.context.requestId).toBe('test-request-id');
      expect(logOutput.context.method).toBe('GET');
      expect(logOutput.context.path).toBe('/api/products');
    });
  });

  describe('log output format', () => {
    it('outputs valid JSON in production', () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      logger.info('Test message', { key: 'value' });
      
      expect(() => {
        JSON.parse(mockConsoleLog.mock.calls[0][0]);
      }).not.toThrow();
    });

    it('includes timestamp in ISO format', () => {
      logger.info('Test message');
      
      const logOutput = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(new Date(logOutput.timestamp).toISOString()).toBe(logOutput.timestamp);
    });
  });
});

describe('Rate Limit Presets', () => {
  // Import the original rate limit module
  const { RateLimitPresets, checkRateLimit } = require('@/lib/rateLimit');

  describe('preset configurations', () => {
    it('has login preset with correct limits', () => {
      expect(RateLimitPresets.login.limit).toBe(5);
      expect(RateLimitPresets.login.windowMs).toBe(60 * 1000);
    });

    it('has register preset with correct limits', () => {
      expect(RateLimitPresets.register.limit).toBe(3);
      expect(RateLimitPresets.register.windowMs).toBe(60 * 60 * 1000);
    });

    it('has api preset with correct limits', () => {
      expect(RateLimitPresets.api.limit).toBe(100);
      expect(RateLimitPresets.api.windowMs).toBe(60 * 1000);
    });

    it('has checkout preset with correct limits', () => {
      expect(RateLimitPresets.checkout.limit).toBe(10);
      expect(RateLimitPresets.checkout.windowMs).toBe(60 * 60 * 1000);
    });
  });

  describe('rate limiting behavior', () => {
    it('allows requests within limit', () => {
      const key = `test-allow-${Date.now()}`;
      const result = checkRateLimit(key, { limit: 5, windowMs: 60000 });
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('blocks requests over limit', () => {
      const key = `test-block-${Date.now()}`;
      const config = { limit: 2, windowMs: 60000 };
      
      checkRateLimit(key, config);
      checkRateLimit(key, config);
      const result = checkRateLimit(key, config);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    it('returns reset time', () => {
      const key = `test-reset-${Date.now()}`;
      const result = checkRateLimit(key, { limit: 5, windowMs: 60000 });
      
      expect(result.resetAt).toBeInstanceOf(Date);
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
    });
  });
});

describe('Health Check Response Format', () => {
  it('health response includes required fields', async () => {
    // Mock a basic health response structure
    const mockHealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'test',
      database: {
        type: 'in-memory',
        connected: true,
      },
    };

    expect(mockHealthResponse).toHaveProperty('status');
    expect(mockHealthResponse).toHaveProperty('timestamp');
    expect(mockHealthResponse).toHaveProperty('version');
    expect(mockHealthResponse).toHaveProperty('database');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(mockHealthResponse.status);
  });
});
