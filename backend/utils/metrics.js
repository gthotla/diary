import client from 'prom-client';

// Dedicated registry so /metrics output is stable and testable.
export const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Bucket set tuned for a CRUD API: most requests < 1s, slow ones up to 5s.
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.5, 2, 5],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestErrorsTotal = new client.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of failed HTTP requests (status >= 400)',
  labelNames: ['method', 'route', 'status_code'],
});

// Live in-flight requests. Display as a gauge in Grafana.
export const httpRequestsInProgress = new client.Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently being processed',
});

// Log volume by level. Incremented from utils/logger.js.
export const logMessagesTotal = new client.Counter({
  name: 'log_messages_total',
  help: 'Total number of log messages by level',
  labelNames: ['level'],
});

register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestErrorsTotal);
register.registerMetric(httpRequestsInProgress);
register.registerMetric(logMessagesTotal);

// Collapse high-cardinality IDs so `route` stays groupable in Grafana.
// /api/diary/65f1...c9 -> /api/diary/:id, /api/todos/123 -> /api/todos/:id
export function normalizeRoute(req) {
  const base = req.baseUrl || '';
  const path = req.route?.path ?? req.path ?? '';
  const full = `${base}${path}`;
  return full
    .replace(/\/[0-9a-fA-F]{24}(?=\/|$)/g, '/:id')
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}

export function observeRequest(req, res, durationSeconds) {
  const route = normalizeRoute(req);
  const labels = {
    method: req.method,
    route,
    status_code: String(res.statusCode),
  };
  httpRequestDurationSeconds.observe(labels, durationSeconds);
  httpRequestsTotal.inc(labels);
  if (res.statusCode >= 400) {
    httpRequestErrorsTotal.inc(labels);
  }
}
