const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

router.post('/', upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(201).json({
      message: 'Image uploaded successfully',
      path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
