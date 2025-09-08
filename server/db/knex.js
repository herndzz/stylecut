const knexLib = require('knex');

function buildPgConfigFromEnv() {
  const url = process.env.DATABASE_URL;
  if (url) {
    return {
      client: 'pg',
      connection: url,
      pool: { min: 0, max: 10 },
      migrations: { tableName: 'knex_migrations' },
    };
  }
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  if (DB_HOST && DB_NAME && DB_USER) {
    return {
      client: 'pg',
      connection: {
        host: DB_HOST,
        port: DB_PORT ? Number(DB_PORT) : 5432,
        database: DB_NAME,
        user: DB_USER,
        password: DB_PASSWORD,
      },
      pool: { min: 0, max: 10 },
      migrations: { tableName: 'knex_migrations' },
    };
  }
  return null;
}

function buildSqliteConfigFromEnv() {
  return {
    client: 'sqlite3',
    connection: {
      filename: process.env.SQLITE_FILENAME || './database/stylecut.sqlite',
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 1,
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
    migrations: { tableName: 'knex_migrations' },
  };
}

async function createKnex() {
  const pgConfig = buildPgConfigFromEnv();

  if (pgConfig) {
    const pg = knexLib(pgConfig);
    try {
      await pg.raw('select 1');
      console.log('Connected to PostgreSQL');
      return pg;
    } catch (e) {
      console.warn('PostgreSQL unavailable, falling back to SQLite. Reason:', e.message);
      await pg.destroy();
    }
  } else {
    console.log('PostgreSQL not configured. Using SQLite fallback.');
  }

  const sqlite = knexLib(buildSqliteConfigFromEnv());
  await sqlite.raw('select 1');
  console.log('Connected to SQLite');
  return sqlite;
}

let knexInstancePromise;
function getKnex() {
  if (!knexInstancePromise) knexInstancePromise = createKnex();
  return knexInstancePromise;
}

module.exports = { getKnex };
