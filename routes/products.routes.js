const express = require('express');
const router = express.Router();
const PagingMiddleware = require('../middlewares/paging.middleware');
const productsController = require('../controllers/products.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const setUploadPath = require('../middlewares/upload.middleware').setUploadPath;
const upload = require('../utils/upload').upload;

require('./param_loaders/products.loader').init(router);

router.get('', PagingMiddleware.initPage, productsController.index);
router.get('/:product', productsController.getByIdOrSlug);

router.post('', AuthMiddleware.isAuthenticated, AuthMiddleware.isAdmin, setUploadPath('./public/images/products'), upload.array('images', 6), productsController.createProduct);

router.get('/by_id/:product_id', productsController.getByIdOrSlug);
router.get('/by_tag/:tag_name', productsController.getByTag);
router.get('/by_category/:category_name', productsController.getByCategory);

module.exports = router;
