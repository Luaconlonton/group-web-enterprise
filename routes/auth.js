const express = require('express');
const router = express.Router();
const authController = require("../controller/auth")

router.post('/login', authController.handleLogin);

router.get('/logout', authController.handleLogout);
router.post("/api/login", authController.login)

module.exports = router;