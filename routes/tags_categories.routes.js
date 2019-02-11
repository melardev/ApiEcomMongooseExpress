const express = require('express');
const router = express.Router();
const upload = require('../utils/upload').upload;
const AuthMiddleware = require('../middlewares/auth.middleware');
const initPage = require('../middlewares/paging.middleware').initPage;

function setUploadPath(uploadPath) {
    return (req, res, next) => {
        req.uploadPath = uploadPath;
        next();
    }
}

const tagCategoriesController = require('../controllers/tags_categories.controller');

router.get('/categories', initPage, tagCategoriesController.getCategories);
router.get('/tags', initPage, tagCategoriesController.getTags);

router.post('/categories', AuthMiddleware.isAuthenticated, AuthMiddleware.isAdmin, setUploadPath('./public/images/categories'), upload.array('images', 6), tagCategoriesController.createCategory);
router.post('/tags', AuthMiddleware.isAuthenticated, AuthMiddleware.isAdmin, setUploadPath('./public/images/tags'), upload.array('images', 6), tagCategoriesController.createTag);

module.exports = router;