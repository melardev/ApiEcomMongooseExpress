const router = require('express').Router();
const passport = require('passport');
const AddressesController = require('../controllers/addresses.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const PagingMiddleware = require('../middlewares/paging.middleware');

router.get('/users/addresses', AuthMiddleware.isAuthenticated, PagingMiddleware.initPage, AddressesController.getAddresses);
router.post('/users/addresses', AuthMiddleware.isAuthenticated, AddressesController.createAddress);

module.exports = router;