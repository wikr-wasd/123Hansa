import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'users',
    timestamp: new Date().toISOString()
  });
});

// TODO: Implement user routes
router.get('/profile', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented yet',
    message: 'User profile endpoint is under development'
  });
});

export default router;