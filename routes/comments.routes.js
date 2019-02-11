const router = require('express').Router();
require('./param_loaders/comments.loader').init(router);
require('./param_loaders/products.loader').init(router);
const initPage = require('../middlewares/paging.middleware').initPage;
const commentsController = require('../controllers/comments.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

router.get('/products/:product/comments', initPage, commentsController.getByProductSlug);

router.post('/products/:product/comments', AuthMiddleware.isAuthenticated, commentsController.createComment);
router.put('/:product/comments/:comment_id', AuthMiddleware.isAuthenticated, AuthMiddleware.userOwnsItOrIsAdmin, commentsController.updateComment);
router.put('/comments/:comment_id', AuthMiddleware.isAuthenticated, AuthMiddleware.userOwnsItOrIsAdmin, commentsController.updateComment);

router.delete('/products/:product/comments/:comment_id', AuthMiddleware.isAuthenticated, AuthMiddleware.userOwnsItOrIsAdmin, commentsController.deleteComment);
router.delete('/comments/:comment_id', AuthMiddleware.isAuthenticated, AuthMiddleware.userOwnsItOrIsAdmin, commentsController.deleteComment);

module.exports = router;