const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route pour l'inscription : POST http://localhost:5000/api/auth/register
router.post('/register', authController.register);

// Route pour la connexion : POST http://localhost:5000/api/auth/login
router.post('/login', authController.login);
// Route pour activer le compte (méthode GET car c'est un lien cliquable)
router.get('/activate/:token', authController.activateAccount);
// Demande de réinitialisation (envoi du mail)
router.post('/forgot-password', authController.forgotPassword);

// Soumission du nouveau mot de passe
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;