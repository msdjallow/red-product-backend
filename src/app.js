const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const pool = require('./config/db'); // Importe la configuration

// Vérifie la connexion immédiatement
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connecté à la base de données PostgreSQL');
    }
});

const app = express();

// Middlewares de sécurité et de traitement
app.use(helmet());
app.use(cors());
app.use(express.json()); // Permet de lire le JSON envoyé par le front

// Route de test
app.get('/', (req, res) => {
    res.send('Serveur RED Product opérationnel !');
});

// Import des routes
const authRoutes = require('./routes/authRoutes');
// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', require('./routes/hotelRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur le port ${PORT}`);
});

// Script de migration sécurisé pour créer les colonnes sur Render
const updateDatabaseStructure = async () => {
    try {
        console.log("Vérification et mise à jour de la structure de la base de données...");
        
        let pool;
        try { pool = require('./config/db'); } catch (e) {
            try { pool = require('../config/db'); } catch (err) {
                try { pool = require('./src/config/db'); } catch (lastErr) { return; }
            }
        }

        // Anciennes colonnes (activation)
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_token VARCHAR(255);`);
        
        // 🔑 NOUVELLES COLONNES : Pour le mot de passe oublié
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;`);
        
        console.log("🔥 Base de données mise à jour avec les colonnes de réinitialisation !");
    } catch (err) {
        console.error("Erreur lors de la mise à jour de la base de données :", err.message);
    }
};
updateDatabaseStructure();