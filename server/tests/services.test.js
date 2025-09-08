const request = require('supertest');
const app = require('../app');
const { setupDb, truncateAll } = require('./helpers/db');

describe('Services CRUD', () => {
  beforeAll(async () => { await setupDb(); });
  beforeEach(async () => { await truncateAll(); });

  test('create, list, update, delete service', async () => {
    const created = await request(app).post('/api/services').send({ name: 'Corte', duration_minutes: 30, price_cents: 5000 }).expect(201);
    expect(created.body.name).toBe('Corte');

    const list1 = await request(app).get('/api/services').expect(200);
    expect(list1.body.length).toBe(1);

    const id = created.body.id;
    const updated = await request(app).put(`/api/services/${id}`).send({ price_cents: 5500 }).expect(200);
    expect(updated.body.price_cents).toBe(5500);

    await request(app).delete(`/api/services/${id}`).expect(204);
    const list2 = await request(app).get('/api/services').expect(200);
    expect(list2.body.length).toBe(0);
  });
});
