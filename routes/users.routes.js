const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/users.controller');
const passport = require('passport');
const requiresLocalAuth = passport.authenticate('local', {session: false});

router.post('/users/login', requiresLocalAuth, UsersController.login);
router.post('/auth/login', requiresLocalAuth, UsersController.login);
router.post('/users', UsersController.register);
router.post('/users/register', UsersController.register);

module.exports = router;