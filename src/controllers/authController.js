const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuration du transporteur de mail avec les variables Render
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- 1. FONCTION INSCRIPTION (Mise à jour avec envoi de mail) ---
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Cet e-mail est déjà utilisé." });
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Générer le jeton unique d'activation
        const activationToken = crypto.randomBytes(32).toString('hex');

        // Insérer l'utilisateur (is_activated reste FALSE par défaut en DB)
        await pool.query(
            'INSERT INTO users (name, email, password, activation_token) VALUES ($1, $2, $3, $4)',
            [name, email, hashedPassword, activationToken]
        );

        // Lien d'activation pointant vers ton Backend Render
        const activationLink = `https://red-product-backend-jyol.onrender.com/api/auth/activate/${activationToken}`;

        // Contenu du mail d'activation
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Activation de votre compte RED Product',
            html: `
                <h3>Bienvenue ${name} !</h3>
                <p>Merci de vous être inscrit sur RED Product. Veuillez cliquer sur le lien ci-dessous pour activer votre compte :</p>
                <a href="${activationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Activer mon compte</a>
                <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur : <br> ${activationLink}</p>
            `
        };

        // Envoyer le mail
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Inscription réussie ! Un e-mail d'activation vous a été envoyé." });

    } catch (err) {
        console.error("Erreur Inscription:", err.message);
        res.status(500).send('Erreur serveur lors de l\'inscription');
    }
};

// --- 2. FONCTION CONNEXION (Mise à jour avec blocage si non activé) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Vérifier si l'utilisateur existe
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        const user = result.rows[0];

        // 2. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        // 🔒 SÉCURITÉ COACH : Bloquer la connexion si le compte n'est pas activé
        if (!user.is_activated) {
            return res.status(403).json({ 
                message: "Votre compte n'est pas encore activé. Veuillez vérifier vos e-mails." 
            });
        }

        // 3. Créer le Token JWT (si le compte est bien activé)
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Connexion réussie",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error("Erreur Connexion:", err.message);
        res.status(500).send('Erreur serveur');
    }
};

// --- 3. FONCTION D'ACTIVATION (Appelée lors du clic dans le mail) ---
exports.activateAccount = async (req, res) => {
    const { token } = req.params;

    try {
        // 1. Chercher l'utilisateur avec ce jeton d'activation
        const result = await pool.query('SELECT * FROM users WHERE activation_token = $1', [token]);
        
        if (result.rows.length === 0) {
            // Si le jeton n'existe pas ou est invalide, on redirige vers Vercel avec une erreur
            return res.redirect('https://red-product-omega.vercel.app/index.html?error=token_invalid');
        }

        // 2. Activer le compte et effacer le jeton pour des raisons de sécurité
        await pool.query(
            'UPDATE users SET is_activated = true, activation_token = null WHERE activation_token = $1',
            [token]
        );

        // 3. Redirection automatique de l'utilisateur vers ta page de connexion Vercel avec un succès
        res.redirect('https://red-product-omega.vercel.app/index.html?activated=true');

    } catch (err) {
        console.error("Erreur Activation:", err.message);
        res.status(500).send('Erreur serveur lors de l\'activation');
    }
};