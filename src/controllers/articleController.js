const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createArticle = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const article = await prisma.article.create({
      data: { title, content }
    });

    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
};

const getArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.content !== undefined) updates.content = req.body.content;

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: updates
    });

    res.json(article);
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.article.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getArticles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      orderBy = 'recent',
      keyword
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { content: { contains: keyword, mode: 'insensitive' } }
          ]
        }
      : {};

    const orderByClause = orderBy === 'recent'
      ? { createdAt: 'desc' }
      : { createdAt: 'asc' };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true
        },
        orderBy: orderByClause,
        skip,
        take
      }),
      prisma.article.count({ where })
    ]);

    res.json({
      data: articles,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle,
  getArticles
};
