const pool = require('../config/db');

// 1. Récupérer tous les hôtels (READ)
exports.getAllHotels = async (req, res) => {
    try {
        const allHotels = await pool.query('SELECT * FROM hotels ORDER BY created_at DESC');
        res.json(allHotels.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// 2. Créer un hôtel (CREATE)
exports.createHotel = async (req, res) => {
    const { name, address, email, phone, price, currency } = req.body;
    try {
        const newHotel = await pool.query(
            'INSERT INTO hotels (name, address, email, phone, price, currency) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, address, email, phone, price, currency]
        );
        res.status(201).json(newHotel.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// 3. Modifier un hôtel (UPDATE)
exports.updateHotel = async (req, res) => {
    const { id } = req.params; // On récupère l'ID dans l'URL
    const { name, address, email, phone, price, currency } = req.body;
    try {
        const updatedHotel = await pool.query(
            'UPDATE hotels SET name = $1, address = $2, email = $3, phone = $4, price = $5, currency = $6 WHERE id = $7 RETURNING *',
            [name, address, email, phone, price, currency, id]
        );
        
        if (updatedHotel.rows.length === 0) {
            return res.status(404).json({ message: "Hôtel non trouvé" });
        }
        
        res.json({ message: "Hôtel mis à jour", hotel: updatedHotel.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// 4. Supprimer un hôtel (DELETE)
exports.deleteHotel = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOp = await pool.query('DELETE FROM hotels WHERE id = $1', [id]);
        
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ message: "Hôtel non trouvé" });
        }
        
        res.json({ message: "Hôtel supprimé avec succès" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};