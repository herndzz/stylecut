const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getKnex } = require('../db/knex');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const { q } = req.query;
    let query = knex('professionals').select('*').orderBy('created_at', 'desc');
    if (q) {
      const like = `%${q}%`;
      const isPg = knex.client.config.client === 'pg';
      const cmp = isPg ? 'ilike' : 'like';
      query = query.where((b) => {
        b.where('name', cmp, like).orWhere('email', cmp, like).orWhere('phone', cmp, like);
      });
    }
    const rows = await query;
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const row = await knex('professionals').where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const { name, email, phone } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const isPg = knex.client.config.client === 'pg';
    const id = isPg ? undefined : uuidv4();

    const [created] = await knex('professionals')
      .insert({ id, name, email, phone })
      .returning('*');

    res.status(201).json(created || (await knex('professionals').where({ id }).first()));
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT' || e.code === '23505') {
      return res.status(409).json({ error: 'Phone already in use' });
    }
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const { name, email, phone } = req.body;

    const [updated] = await knex('professionals')
      .where({ id: req.params.id })
      .update({ name, email, phone, updated_at: knex.fn.now() })
      .returning('*');

    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated || (await knex('professionals').where({ id: req.params.id }).first()));
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT' || e.code === '23505') {
      return res.status(409).json({ error: 'Phone already in use' });
    }
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const knex = await getKnex();
    const deleted = await knex('professionals').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
