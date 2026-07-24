import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { convert } from '../controllers/conversionController.js';

const router = Router();

router.post('/convert', authMiddleware, convert);

export default router;