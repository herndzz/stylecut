'use strict';

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  const isPg = knex.client.config.client === 'pg';
  if (isPg) {
    await knex.schema.alterTable('appointments', (t) => {
      t.check("status in ('scheduled','completed','cancelled')");
    });
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time)');
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id)');
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id)');
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id)');
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  const isPg = knex.client.config.client === 'pg';
  if (isPg) {
    await knex.raw('DROP INDEX IF EXISTS idx_appointments_start_time');
    await knex.raw('DROP INDEX IF EXISTS idx_appointments_client');
    await knex.raw('DROP INDEX IF EXISTS idx_appointments_professional');
    await knex.raw('DROP INDEX IF EXISTS idx_appointments_service');
    // Remoção de CHECK não é trivial sem nome; mantendo para integridade.
  }
};
