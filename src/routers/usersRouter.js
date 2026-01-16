import express from 'express';
import {
  signUp,
  signIn,
  refreshAccessToken,
  getMe,
  updateMe,
  changePassword,
  getMyProducts,
  getFavoriteProducts,
} from '../controllers/usersController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import withAsync from '../lib/withAsync.js';

const router = express.Router();

router.post('/signup', withAsync(signUp));
router.post('/signin', withAsync(signIn));
router.post('/refresh', withAsync(refreshAccessToken));
router.get('/me', authenticate, withAsync(getMe));
router.patch('/me', authenticate, withAsync(updateMe));
router.patch('/me/password', authenticate, withAsync(changePassword));
router.get('/me/products', authenticate, withAsync(getMyProducts));
router.get('/me/favorite-products', authenticate, withAsync(getFavoriteProducts));

export default router;
