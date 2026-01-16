const express = require('express');
const router = express.Router();
const { validateComment } = require('../middleware/validate');
const {
  createProductComment,
  createArticleComment,
  updateProductComment,
  updateArticleComment,
  deleteProductComment,
  deleteArticleComment,
  getProductComments,
  getArticleComments
} = require('../controllers/commentController');

router.post('/products/:productId', validateComment, createProductComment);
router.get('/products/:productId', getProductComments);

router.post('/articles/:articleId', validateComment, createArticleComment);
router.get('/articles/:articleId', getArticleComments);

router.patch('/products/:productId/:commentId', validateComment, updateProductComment);
router.delete('/products/:productId/:commentId', deleteProductComment);

router.patch('/articles/:articleId/:commentId', validateComment, updateArticleComment);
router.delete('/articles/:articleId/:commentId', deleteArticleComment);

module.exports = router;
