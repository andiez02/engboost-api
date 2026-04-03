import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import { env } from '../../config/environment';
import { enrichDetections } from './snaplang.service';

export const detectObjectsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    // Forward the file buffer to the Python AI Microservice
    const formData = new FormData();
    formData.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const aiServiceUrl = `${env.AI_MICROSERVICE_URL}/api/detect`;

    const response = await axios.post(aiServiceUrl, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 30000,
    });

    const rawDetections: any[] = response.data?.detections ?? [];

    if (!rawDetections.length) {
      res.status(200).json({ detections: [] });
      return;
    }

    // Enrich detections with full lexical data via Gemini
    const enriched = await enrichDetections(rawDetections);

    res.status(200).json({ detections: enriched });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('AI Microservice Error:', error.response?.data || error.message);
      res.status(error.response?.status || 502).json({
        error: 'Failed to communicate with AI service',
        details: error.response?.data || error.message,
      });
    } else {
      next(error);
    }
  }
};
