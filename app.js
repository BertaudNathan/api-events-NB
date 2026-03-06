const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

// GET /events : Récupérer tous les événements
app.get('/events', (req, res) => {
    const events = db.prepare('SELECT * FROM events').all();
    res.json(events);
});

// POST /events : Créer un nouvel événement
app.post('/events', (req, res) => {
    try {
        const newEvent = req.body;

        // --- LOGIQUE MÉTIER ---

        // 1. Validation basique
        if (!newEvent.title || !newEvent.date) {
            return res.status(400).json({
                error: "Le titre et la date sont obligatoires"
            });
        }

        // 2. Validation Logique : Pas d'événement dans le passé
        const eventDate = new Date(newEvent.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            return res.status(400).json({
                error: "La date ne peut pas être dans le passé"
            });
        }

        // --- FIN LOGIQUE ---

        // Insertion en base
        const result = db.prepare('INSERT INTO events (title, date) VALUES (?, ?)').run(newEvent.title, newEvent.date);
        console.log("Événement enregistré :", result.lastInsertRowid);

        res.status(201).json({ id: result.lastInsertRowid, title: newEvent.title, date: newEvent.date });
    } catch (error) {
        console.error("LE BUG EST ICI :", error);
        res.status(500).json({ message: error.message });
    }
});

// Export de l'app (nécessaire pour les tests unitaires sans lancer le serveur)
module.exports = app;