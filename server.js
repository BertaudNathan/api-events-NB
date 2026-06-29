const app = require('./app');
const { initDB } = require('./db');
const port = process.env.PORT || 3000;

initDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`✅ API Events démarrée sur http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Impossible d\'initialiser la base de données :', err);
        process.exit(1);
    });