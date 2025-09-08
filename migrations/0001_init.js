'use strict';

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  // Enable extensions when in Postgres
  const isPg = knex.client.config.client === 'pg';
  if (isPg) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }

  // clients
  await knex.schema.createTable('clients', (t) => {
    if (isPg) t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    else t.string('id').primary();
    t.string('name').notNullable();
    t.string('email');
    t.string('phone');
    t.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    t.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
  await knex.schema.alterTable('clients', (t) => {
    t.unique(['phone']); // TODO: confirmar necessidade
  });

  // professionals
  await knex.schema.createTable('professionals', (t) => {
    if (isPg) t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    else t.string('id').primary();
    t.string('name').notNullable();
    t.string('email');
    t.string('phone');
    t.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    t.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
  await knex.schema.alterTable('professionals', (t) => {
    t.unique(['phone']); // TODO: confirmar necessidade
  });

  // services
  await knex.schema.createTable('services', (t) => {
    if (isPg) t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    else t.string('id').primary();
    t.string('name').notNullable();
    t.integer('duration_minutes').notNullable();
    t.integer('price_cents').notNullable();
    t.text('description');
    t.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    t.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });

  // appointments
  await knex.schema.createTable('appointments', (t) => {
    if (isPg) t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    else t.string('id').primary();

    t.string('status').notNullable().defaultTo('scheduled'); // scheduled|completed|cancelled

    t.timestamp('start_time').notNullable(); // ISO 8601 UTC

    // foreign keys
    if (isPg) {
      t
        .uuid('client_id')
        .notNullable()
        .references('id')
        .inTable('clients')
        .onDelete('RESTRICT');
      t
        .uuid('professional_id')
        .notNullable()
        .references('id')
        .inTable('professionals')
        .onDelete('RESTRICT');
      t
        .uuid('service_id')
        .notNullable()
        .references('id')
        .inTable('services')
        .onDelete('RESTRICT');
    } else {
      t.string('client_id').notNullable().references('id').inTable('clients');
      t
        .string('professional_id')
        .notNullable()
        .references('id')
        .inTable('professionals');
      t.string('service_id').notNullable().references('id').inTable('services');
    }

    t.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    t.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // unique constraint to prevent conflicts: same professional and same start_time
    t.unique(['professional_id', 'start_time']);
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('appointments');
  await knex.schema.dropTableIfExists('services');
  await knex.schema.dropTableIfExists('professionals');
  await knex.schema.dropTableIfExists('clients');
};
