const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/authController');

router.post('/signup', controller.register);
router.post('/login',  controller.login);
router.post('/google', controller.googleLogin);   // ← NEW

module.exports = router;