const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const auth = require('../middleware/authMiddleware');
const pool = require('../config/db'); // On importe pool pour les statistiques

// --- ROUTES PUBLIQUES ---

// 1. Récupérer la liste de tous les hôtels
router.get('/', hotelController.getAllHotels);

// 2. Récupérer les statistiques du Dashboard (Nombre d'hôtels, d'utilisateurs, etc.)
// Cette route doit rester AVANT les routes avec /:id
router.get('/count/stats', async (req, res) => {
    try {
        // Compte réel des hôtels
        const hotelRes = await pool.query('SELECT COUNT(*) FROM hotels');
        // Compte réel des utilisateurs inscrits
        const userRes = await pool.query('SELECT COUNT(*) FROM users');

        res.json({
            hotels: hotelRes.rows[0].count,
            users: userRes.rows[0].count,
            messages: 45, // Simulation (en attendant une table messages)
            forms: 125    // Simulation (en attendant une table formulaires)
        });
    } catch (err) {
        console.error("Erreur stats backend:", err.message);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des stats' });
    }
});

// --- ROUTES PROTÉGÉES (Nécessitent un Token) ---

// 3. Créer un nouvel hôtel
router.post('/', auth, hotelController.createHotel);

// 4. Modifier un hôtel existant via son ID
router.put('/:id', auth, hotelController.updateHotel);

// 5. Supprimer un hôtel via son ID
router.delete('/:id', auth, hotelController.deleteHotel);

module.exports = router;