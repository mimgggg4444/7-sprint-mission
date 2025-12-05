const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProductComment = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { content } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const comment = await prisma.productComment.create({
      data: {
        content,
        productId: parseInt(productId)
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

const createArticleComment = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;

    const article = await prisma.article.findUnique({
      where: { id: parseInt(articleId) }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const comment = await prisma.articleComment.create({
      data: {
        content,
        articleId: parseInt(articleId)
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

const updateProductComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await prisma.productComment.update({
      where: { id: parseInt(commentId) },
      data: { content }
    });

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

const updateArticleComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await prisma.articleComment.update({
      where: { id: parseInt(commentId) },
      data: { content }
    });

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

const deleteProductComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    await prisma.productComment.delete({
      where: { id: parseInt(commentId) }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const deleteArticleComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    await prisma.articleComment.delete({
      where: { id: parseInt(commentId) }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getProductComments = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { cursor, limit = 10 } = req.query;

    const take = parseInt(limit);
    const where = { productId: parseInt(productId) };

    if (cursor) {
      where.id = { lt: parseInt(cursor) };
    }

    const comments = await prisma.productComment.findMany({
      where,
      select: {
        id: true,
        content: true,
        createdAt: true
      },
      orderBy: { id: 'desc' },
      take
    });

    const nextCursor = comments.length === take
      ? comments[comments.length - 1].id
      : null;

    res.json({
      data: comments,
      nextCursor
    });
  } catch (error) {
    next(error);
  }
};

const getArticleComments = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { cursor, limit = 10 } = req.query;

    const take = parseInt(limit);
    const where = { articleId: parseInt(articleId) };

    if (cursor) {
      where.id = { lt: parseInt(cursor) };
    }

    const comments = await prisma.articleComment.findMany({
      where,
      select: {
        id: true,
        content: true,
        createdAt: true
      },
      orderBy: { id: 'desc' },
      take
    });

    const nextCursor = comments.length === take
      ? comments[comments.length - 1].id
      : null;

    res.json({
      data: comments,
      nextCursor
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProductComment,
  createArticleComment,
  updateProductComment,
  updateArticleComment,
  deleteProductComment,
  deleteArticleComment,
  getProductComments,
  getArticleComments
};
