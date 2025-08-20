import express from 'express';
import { 
  basicHealth, 
  detailedHealth, 
  readinessProbe, 
  livenessProbe 
} from '../controllers/health.js';

const router = express.Router();

// Basic health endpoint - lightweight for load balancers
router.get('/health', basicHealth);

// Detailed health status with system information
router.get('/health/status', detailedHealth);

// Readiness probe - for deployment health checks
router.get('/health/ready', readinessProbe);

// Liveness probe - for container orchestration
router.get('/health/live', livenessProbe);

export default router;
