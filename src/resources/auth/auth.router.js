const router = require('express').Router();
const AuthController = require('./auth.controller');

router.route('/').post(AuthController.authenticate);

module.exports = router;