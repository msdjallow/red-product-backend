const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Récupérer le token dans l'entête (header) de la requête
    const token = req.header('Authorization');

    // 2. Vérifier si le token existe
    if (!token) {
        return res.status(401).json({ message: "Accès refusé, token manquant" });
    }

    try {
        // 3. Vérifier la validité du token (on enlève "Bearer " s'il est présent)
        const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        
        // 4. Ajouter l'utilisateur décodé à la requête pour que les prochaines fonctions l'utilisent
        req.user = decoded;
        next(); // On laisse passer à la fonction suivante (le contrôleur)
    } catch (err) {
        res.status(401).json({ message: "Token non valide" });
    }
};