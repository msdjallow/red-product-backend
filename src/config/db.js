const { Pool } = require('pg');
require('dotenv').config();

// On utilise DATABASE_URL qui contient tout (user, host, password, port)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Obligatoire pour se connecter à Render depuis l'extérieur
    }
});

pool.on('connect', () => {
    console.log('Connecté à la base de données PostgreSQL sur Render !');
});

pool.on('error', (err) => {
    console.error('Erreur inattendue sur le client PostgreSQL', err);
});

module.exports = pool;