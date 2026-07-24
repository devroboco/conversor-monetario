import { Request, Response, NextFunction } from 'express';
import envConfig from '../config/env.js';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header('x-api-key');

    if (!apiKey || apiKey !== envConfig.API_KEY) {
        return res.status(401).json({ error: 'API key ausente ou inválida' });
    }
    return next();
}