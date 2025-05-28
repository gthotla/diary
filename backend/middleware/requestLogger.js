import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const start = process.hrtime(); // high-resolution time
  const { method, originalUrl } = req;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.connection.remoteAddress;

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    const status = res.statusCode;

    logger.info(
      `${method} ${originalUrl} ${status} - ${durationMs}ms - IP: ${ip} - UA: ${userAgent}`
    );
  });

  next();
};

export default requestLogger;
