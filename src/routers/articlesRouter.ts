import express from 'express';
import { withAsync } from '../lib/withAsync.js';
import {
  createArticle,
  getArticleList,
  getArticle,
  updateArticle,
  deleteArticle,
  createComment,
  getCommentList,
  toggleArticleLike,
} from '../controllers/articlesController.js';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware.js';

const articlesRouter = express.Router();

articlesRouter.post('/', authenticate, withAsync(createArticle));
articlesRouter.get('/', withAsync(getArticleList));
articlesRouter.get('/:id', optionalAuthenticate, withAsync(getArticle));
articlesRouter.patch('/:id', authenticate, withAsync(updateArticle));
articlesRouter.delete('/:id', authenticate, withAsync(deleteArticle));
articlesRouter.post('/:id/comments', authenticate, withAsync(createComment));
articlesRouter.get('/:id/comments', withAsync(getCommentList));
articlesRouter.post('/:id/like', authenticate, withAsync(toggleArticleLike));

export default articlesRouter;
