const fs = require('fs');
const path = require('path');
const { getKnex } = require('./knex');

async function ensureDirs() {
  const dirs = [
    path.resolve(process.cwd(), 'database'),
    path.resolve(process.cwd(), 'migrations'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

async function runMigrations() {
  await ensureDirs();
  const knex = await getKnex();
  await knex.migrate.latest({ directory: path.resolve(process.cwd(), 'migrations') });
}

module.exports = { runMigrations };
