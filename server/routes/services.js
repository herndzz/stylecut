const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getKnex } = require('../db/knex');
const { serviceSchema } = require('../validation/schemas');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const { q, limit = 50, offset = 0, sort = 'created_at', order = 'desc' } = req.query;
    const allowedSort = new Set(['name','duration_minutes','price_cents','created_at']);
    const s = allowedSort.has(sort) ? sort : 'created_at';
    const o = ['asc','desc'].includes(String(order).toLowerCase()) ? order : 'desc';
    let query = knex('services').select('*').orderBy(s, o).limit(Number(limit)).offset(Number(offset));
    if (q) {
      const like = `%${q}%`;
      const isPg = knex.client.config.client === 'pg';
      const cmp = isPg ? 'ilike' : 'like';
      query = query.where((b) => {
        b.where('name', cmp, like).orWhere('description', cmp, like);
      });
    }
    const rows = await query;
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const row = await knex('services').where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = serviceSchema.parse(req.body);
    const knex = await getKnex();
    const { name, duration_minutes, price_cents, description } = payload;
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (duration_minutes == null) return res.status(400).json({ error: 'duration_minutes is required' });
    if (price_cents == null) return res.status(400).json({ error: 'price_cents is required' });

    const isPg = knex.client.config.client === 'pg';
    const id = isPg ? undefined : uuidv4();

    const [created] = await knex('services')
      .insert({ id, name, duration_minutes, price_cents, description })
      .returning('*');

    res.status(201).json(created || (await knex('services').where({ id }).first()));
  } catch (e) {
    if (e.errors) return res.status(400).json({ error: e.errors[0].message });
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = serviceSchema.partial().parse(req.body);
    const knex = await getKnex();
    const { name, duration_minutes, price_cents, description } = payload;

    const [updated] = await knex('services')
      .where({ id: req.params.id })
      .update({ name, duration_minutes, price_cents, description, updated_at: knex.fn.now() })
      .returning('*');

    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated || (await knex('services').where({ id: req.params.id }).first()));
  } catch (e) {
    if (e.errors) return res.status(400).json({ error: e.errors[0].message });
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const deleted = await knex('services').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
