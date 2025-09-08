const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const rateLimit = require('express-rate-limit');
const addRequestId = require('express-request-id')();
const swaggerUi = require('swagger-ui-express');
const prom = require('prom-client');
const path = require('node:path');
const { getKnex } = require('./db/knex');
const clients = require('./routes/clients');
const professionals = require('./routes/professionals');
const services = require('./routes/services');
const appointments = require('./routes/appointments');

const app = express();

// Segurança e observabilidade
app.use(helmet());
app.use(addRequestId);
app.use(pinoHttp());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// CORS configurável
const origins = (process.env.CORS_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());

// Prometheus metrics
const collectDefaultMetrics = prom.collectDefaultMetrics;
if (process.env.NODE_ENV !== 'test') {
  collectDefaultMetrics();
}
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prom.register.contentType);
  res.end(await prom.register.metrics());
});

// Health checks
app.get('/live', (req, res) => res.status(200).send('OK'));
app.get('/ready', async (req, res) => {
  try {
    const knex = await getKnex();
    await knex.raw('select 1');
    return res.status(200).send('OK');
  } catch (e) {
    return res.status(503).send('DB unavailable');
  }
});

const API_BASE = '/api';

// Swagger UI (OpenAPI)
const openapiPath = path.join(__dirname, 'docs', 'openapi.json');
app.use(`${API_BASE}/docs`, swaggerUi.serve, swaggerUi.setup(require(openapiPath)));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(`${API_BASE}/clients`, clients);
app.use(`${API_BASE}/professionals`, professionals);
app.use(`${API_BASE}/services`, services);
app.use(`${API_BASE}/appointments`, appointments);

// 404 para API
app.use(API_BASE, (req, res, next) => {
  if (!res.headersSent) return res.status(404).json({ error: 'Not Found' });
  next();
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
