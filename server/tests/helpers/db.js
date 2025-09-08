const { runMigrations } = require('../../db/runMigrations');
const { getKnex } = require('../../db/knex');

async function setupDb() {
  await runMigrations();
}

async function truncateAll() {
  const knex = await getKnex();
  await knex('appointments').del();
  await knex('services').del();
  await knex('professionals').del();
  await knex('clients').del();
}

module.exports = { setupDb, truncateAll };
