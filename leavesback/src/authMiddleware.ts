// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import admin from './firebase';

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // 이후 req.user.sub로 유저 식별.
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token', err });
    return
  }
};
