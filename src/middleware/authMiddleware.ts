import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/authUtils.js';
import UnauthorizedError from '../lib/errors/UnauthorizedError.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  req.user = { userId: decoded.userId };
  next();
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (decoded) {
      req.user = { userId: decoded.userId };
    }
  }

  next();
}
