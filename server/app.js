const express = require('express');
const cors = require('cors');
const clients = require('./routes/clients');
const professionals = require('./routes/professionals');
const services = require('./routes/services');
const appointments = require('./routes/appointments');

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE = '/api';

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(`${API_BASE}/clients`, clients);
app.use(`${API_BASE}/professionals`, professionals);
app.use(`${API_BASE}/services`, services);
app.use(`${API_BASE}/appointments`, appointments);

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
