const { getKnex } = require('./knex');

(async () => {
  const knex = await getKnex();
  try {
    await knex('appointments').del();
    await knex('services').del();
    await knex('professionals').del();
    await knex('clients').del();
    console.log('Reset completed');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
