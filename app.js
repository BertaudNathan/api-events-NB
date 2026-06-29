const express = require('express');
const { pool } = require('./db');

const app = express();
app.use(express.json());

const VALID_CATEGORIES = ['Music', 'Sport', 'Conference', 'Art', 'Other'];

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /events : Récupérer tous les événements
app.get('/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /events : Créer un nouvel événement
app.post('/events', async (req, res) => {
    try {
        const newEvent = req.body;

        if (!newEvent.title || !newEvent.date) {
            return res.status(400).json({ error: "Le titre et la date sont obligatoires" });
        }
        if (!newEvent.lieu) {
            return res.status(400).json({ error: "Le lieu est obligatoire" });
        }
        if (newEvent.categorie === undefined || newEvent.categorie === null) {
            return res.status(400).json({ error: "La catégorie est obligatoire" });
        }
        if (!VALID_CATEGORIES.includes(newEvent.categorie)) {
            return res.status(400).json({ error: "Catégorie invalide. Valeurs acceptées : " + VALID_CATEGORIES.join(', ') });
        }
        if (newEvent.participants === undefined || newEvent.participants === null) {
            return res.status(400).json({ error: "Le nombre de participants est obligatoire" });
        }
        if (newEvent.participants <= 0) {
            return res.status(400).json({ error: "Le nombre de participants doit être positif" });
        }
        if (newEvent.participants > 50) {
            return res.status(400).json({ error: "Le nombre de participants ne peut pas dépasser 50" });
        }

        const eventDate = new Date(newEvent.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) {
            return res.status(400).json({ error: "La date ne peut pas être dans le passé" });
        }

        const result = await pool.query(
            'INSERT INTO events (title, date, lieu, categorie, participants) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [newEvent.title, newEvent.date, newEvent.lieu, newEvent.categorie, newEvent.participants]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erreur POST /events :", error);
        res.status(500).json({ message: error.message });
    }
});

// PUT /events/:id : Mettre à jour un événement
app.put('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedEvent = req.body;

        const existing = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: "Événement non trouvé" });
        }

        if (!updatedEvent.title || !updatedEvent.date) {
            return res.status(400).json({ error: "Le titre et la date sont obligatoires" });
        }

        const eventDate = new Date(updatedEvent.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) {
            return res.status(400).json({ error: "La date ne peut pas être dans le passé" });
        }

        const ex = existing.rows[0];
        const lieu = updatedEvent.lieu !== undefined ? updatedEvent.lieu : ex.lieu;
        const categorie = updatedEvent.categorie !== undefined ? updatedEvent.categorie : ex.categorie;
        const participants = updatedEvent.participants !== undefined ? updatedEvent.participants : ex.participants;

        const result = await pool.query(
            'UPDATE events SET title = $1, date = $2, lieu = $3, categorie = $4, participants = $5 WHERE id = $6 RETURNING *',
            [updatedEvent.title, updatedEvent.date, lieu, categorie, participants, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erreur PUT /events :", error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE /events/:id : Supprimer un événement
app.delete('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM events WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Événement non trouvé" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Erreur DELETE /events :", error);
        res.status(500).json({ message: error.message });
    }
});

// Export de l'app (nécessaire pour les tests unitaires sans lancer le serveur)
module.exports = app;

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /events : Récupérer tous les événements
app.get('/events', (req, res) => {
    const events = db.prepare('SELECT * FROM events').all();
    res.json(events);
});

// POST /events : Créer un nouvel événement
app.post('/events', (req, res) => {
    try {
        const newEvent = req.body;

        // 1. Validation des champs obligatoires
        if (!newEvent.title || !newEvent.date) {
            return res.status(400).json({ error: "Le titre et la date sont obligatoires" });
        }
        if (!newEvent.lieu) {
            return res.status(400).json({ error: "Le lieu est obligatoire" });
        }
        if (newEvent.categorie === undefined || newEvent.categorie === null) {
            return res.status(400).json({ error: "La catégorie est obligatoire" });
        }
        if (!VALID_CATEGORIES.includes(newEvent.categorie)) {
            return res.status(400).json({ error: "Catégorie invalide. Valeurs acceptées : " + VALID_CATEGORIES.join(', ') });
        }
        if (newEvent.participants === undefined || newEvent.participants === null) {
            return res.status(400).json({ error: "Le nombre de participants est obligatoire" });
        }
        if (newEvent.participants <= 0) {
            return res.status(400).json({ error: "Le nombre de participants doit être positif" });
        }
        if (newEvent.participants > 50) {
            return res.status(400).json({ error: "Le nombre de participants ne peut pas dépasser 50" });
        }

        // 2. Pas d'événement dans le passé
        const eventDate = new Date(newEvent.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) {
            return res.status(400).json({ error: "La date ne peut pas être dans le passé" });
        }

        // Insertion en base
        const result = db.prepare(
            'INSERT INTO events (title, date, lieu, categorie, participants) VALUES (?, ?, ?, ?, ?)'
        ).run(newEvent.title, newEvent.date, newEvent.lieu, newEvent.categorie, newEvent.participants);

        res.status(201).json({
            id: result.lastInsertRowid,
            title: newEvent.title,
            date: newEvent.date,
            lieu: newEvent.lieu,
            categorie: newEvent.categorie,
            participants: newEvent.participants
        });
    } catch (error) {
        console.error("Erreur POST /events :", error);
        res.status(500).json({ message: error.message });
    }
});

// PUT /events/:id : Mettre à jour un événement
app.put('/events/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updatedEvent = req.body;

        const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: "Événement non trouvé" });
        }

        if (!updatedEvent.title || !updatedEvent.date) {
            return res.status(400).json({ error: "Le titre et la date sont obligatoires" });
        }

        const eventDate = new Date(updatedEvent.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate < today) {
            return res.status(400).json({ error: "La date ne peut pas être dans le passé" });
        }

        const lieu = updatedEvent.lieu !== undefined ? updatedEvent.lieu : existing.lieu;
        const categorie = updatedEvent.categorie !== undefined ? updatedEvent.categorie : existing.categorie;
        const participants = updatedEvent.participants !== undefined ? updatedEvent.participants : existing.participants;

        db.prepare(
            'UPDATE events SET title = ?, date = ?, lieu = ?, categorie = ?, participants = ? WHERE id = ?'
        ).run(updatedEvent.title, updatedEvent.date, lieu, categorie, participants, id);

        res.status(200).json({ id: Number(id), title: updatedEvent.title, date: updatedEvent.date, lieu, categorie, participants });
    } catch (error) {
        console.error("Erreur PUT /events :", error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE /events/:id : Supprimer un événement
app.delete('/events/:id', (req, res) => {
    try {
        const { id } = req.params;
        const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Événement non trouvé" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Erreur DELETE /events :", error);
        res.status(500).json({ message: error.message });
    }
});

// Export de l'app (nécessaire pour les tests unitaires sans lancer le serveur)
module.exports = app;