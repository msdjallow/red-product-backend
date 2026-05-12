const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route pour l'inscription : POST http://localhost:5000/api/auth/register
router.post('/register', authController.register);

// Route pour la connexion : POST http://localhost:5000/api/auth/login
router.post('/login', authController.login);

module.exports = router;