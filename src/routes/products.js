const express = require('express');
const router = express.Router();
const { validateProduct } = require('../middleware/validate');
const {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProducts
} = require('../controllers/productController');

router.route('/')
  .get(getProducts)
  .post(validateProduct, createProduct);

router.route('/:id')
  .get(getProduct)
  .patch(updateProduct)
  .delete(deleteProduct);

module.exports = router;
