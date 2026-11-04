import winston from 'winston';
import { logMessagesTotal } from './metrics.js';

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ],
});

// Count every log line so Grafana can graph log volume / error-log rate.
// Guarded so logging never crashes the app if metrics fail.
const countLog = (level) => {
  try {
    logMessagesTotal.inc({ level });
  } catch {
    // ignore metric errors
  }
};
for (const level of ['info', 'warn', 'error']) {
  const original = logger[level].bind(logger);
  logger[level] = (...args) => {
    countLog(level);
    return original(...args);
  };
}

export default logger;
