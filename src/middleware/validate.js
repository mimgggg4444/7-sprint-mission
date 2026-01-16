const validateProduct = (req, res, next) => {
  const { name, description, price } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!description?.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  if (price === undefined || price === null) {
    return res.status(400).json({ error: 'Price is required' });
  }

  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  next();
};

const validateArticle = (req, res, next) => {
  const { title, content } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!content?.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  next();
};

const validateComment = (req, res, next) => {
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  next();
};

module.exports = {
  validateProduct,
  validateArticle,
  validateComment
};
