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