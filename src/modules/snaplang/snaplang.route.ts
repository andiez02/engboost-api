import { Router } from 'express';
import multer from 'multer';
import { detectObjectsController } from './snaplang.controller';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// POST /api/snaplang/detect
router.post('/detect', upload.single('image'), detectObjectsController);

export default router;
