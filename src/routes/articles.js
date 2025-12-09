const express = require('express');
const router = express.Router();
const { validateArticle } = require('../middleware/validate');
const {
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  getArticles
} = require('../controllers/articleController');

router.route('/')
  .get(getArticles)
  .post(validateArticle, createArticle);

router.route('/:id')
  .get(getArticle)
  .patch(updateArticle)
  .delete(deleteArticle);

module.exports = router;
