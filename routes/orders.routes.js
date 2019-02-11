const router = require('express').Router();
require('./param_loaders/orders.loader').init(router);

const ordersController = require('../controllers/orders.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const PagingMiddleware = require('../middlewares/paging.middleware');


router.get('', AuthMiddleware.isAuthenticated, PagingMiddleware.initPage, ordersController.getOrders);
router.get('/:order_id', AuthMiddleware.isAuthenticated, AuthMiddleware.userOwnsItOrIsAdmin, ordersController.getOrderDetails);
router.post('', ordersController.createOrder);

module.exports = router;