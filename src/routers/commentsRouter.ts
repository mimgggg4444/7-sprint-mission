import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import { updateComment, deleteComment } from '../controllers/commentsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const commentsRouter = express.Router();

commentsRouter.patch('/:id', authenticate, withAsync(updateComment));
commentsRouter.delete('/:id', authenticate, withAsync(deleteComment));

export default commentsRouter;
