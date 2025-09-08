const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getKnex } = require('../db/knex');
const { appointmentCreateSchema, appointmentUpdateSchema } = require('../validation/schemas');

const router = express.Router();

const ALLOWED_STATUS = new Set(['scheduled','completed','cancelled']);

function parseISODateOnly(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function isValidISODate(s) {
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && /\d{4}-\d{2}-\d{2}T/.test(s);
}

router.get('/', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const { date, status, limit = 50, offset = 0, sort = 'a.start_time', order = 'asc' } = req.query;

    const allowedSort = new Set(['a.start_time','a.created_at','a.status']);
    const s = allowedSort.has(sort) ? sort : 'a.start_time';
    const o = ['asc','desc'].includes(String(order).toLowerCase()) ? order : 'asc';

    let query = knex('appointments as a')
      .select('a.*','c.name as client_name','p.name as professional_name','s.name as service_name','s.duration_minutes','s.price_cents')
      .leftJoin('clients as c', 'c.id', 'a.client_id')
      .leftJoin('professionals as p', 'p.id', 'a.professional_id')
      .leftJoin('services as s', 's.id', 'a.service_id')
      .orderByRaw(`${s} ${o}`)
      .limit(Number(limit))
      .offset(Number(offset));

    if (date) {
      const d = parseISODateOnly(date);
      if (!d) return res.status(400).json({ error: 'invalid date' });
      const start = new Date(`${d}T00:00:00.000Z`).toISOString();
      const end = new Date(`${d}T23:59:59.999Z`).toISOString();
      query = query.whereBetween('a.start_time', [start, end]);
    }
    if (status) query = query.where('a.status', status);

    const rows = await query;
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const row = await knex('appointments').where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const body = appointmentCreateSchema.parse(req.body);
    const knex = await getKnex();
    const { client_id, professional_id, service_id, start_time, status } = body;

    if (!client_id || !professional_id || !service_id || !start_time) {
      return res.status(400).json({ error: 'client_id, professional_id, service_id and start_time are required' });
    }
    if (!isValidISODate(start_time)) return res.status(400).json({ error: 'start_time must be ISO 8601' });
    const st = status || 'scheduled';
    if (!ALLOWED_STATUS.has(st)) return res.status(400).json({ error: 'invalid status' });

    // conflict check (redundant to unique index, but provides friendly message)
    const existing = await knex('appointments')
      .where({ professional_id, start_time })
      .first();
    if (existing) return res.status(409).json({ error: 'Conflicting appointment for this professional at the same start_time' });

    const isPg = knex.client.config.client === 'pg';
    const id = isPg ? undefined : uuidv4();

    const payload = { id, client_id, professional_id, service_id, start_time, status: st };

    const [created] = await knex('appointments')
      .insert(payload)
      .returning('*');

    res.status(201).json(created || (await knex('appointments').where({ professional_id, start_time }).first()));
  } catch (e) {
    // unique violation
    if (e.code === 'SQLITE_CONSTRAINT' || e.code === '23505') {
      return res.status(409).json({ error: 'Conflicting appointment for this professional at the same start_time' });
    }
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = appointmentUpdateSchema.parse(req.body);
    const knex = await getKnex();
    const { client_id, professional_id, service_id, start_time, status } = body;

    const current = await knex('appointments').where({ id: req.params.id }).first();
    if (!current) return res.status(404).json({ error: 'Not found' });

    if (start_time && !isValidISODate(start_time)) return res.status(400).json({ error: 'start_time must be ISO 8601' });
    if (status && !ALLOWED_STATUS.has(status)) return res.status(400).json({ error: 'invalid status' });

    const nextProfessionalId = professional_id ?? current.professional_id;
    const nextStartTime = start_time ?? current.start_time;

    // If changing professional or start_time (or even not changing), ensure no conflict with other rows
    const existing = await knex('appointments')
      .where({ professional_id: nextProfessionalId, start_time: nextStartTime })
      .andWhereNot({ id: req.params.id })
      .first();
    if (existing) return res.status(409).json({ error: 'Conflicting appointment for this professional at the same start_time' });

    const patch = {
      client_id: client_id ?? current.client_id,
      professional_id: nextProfessionalId,
      service_id: service_id ?? current.service_id,
      start_time: nextStartTime,
      status: status ?? current.status,
    };

    const [updated] = await knex('appointments')
      .where({ id: req.params.id })
      .update({ ...patch, updated_at: knex.fn.now() })
      .returning('*');

    res.json(updated || (await knex('appointments').where({ id: req.params.id }).first()));
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT' || e.code === '23505') {
      return res.status(409).json({ error: 'Conflicting appointment for this professional at the same start_time' });
    }
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const deleted = await knex('appointments').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
