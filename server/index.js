require('dotenv').config();
const app = require('./app');
const { runMigrations } = require('./db/runMigrations');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`StyleCut API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
