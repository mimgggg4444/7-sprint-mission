import { verifyAccessToken } from '../lib/authUtils.js';
import UnauthorizedError from '../lib/errors/UnauthorizedError.js';

export function authenticate(req, res, next) {
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

export function optionalAuthenticate(req, res, next) {
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
