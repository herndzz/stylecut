const request = require('supertest');
const app = require('../app');
const { setupDb, truncateAll } = require('./helpers/db');

describe('Professionals CRUD', () => {
  beforeAll(async () => { await setupDb(); });
  beforeEach(async () => { await truncateAll(); });

  test('create, list, update, delete professional', async () => {
    const created = await request(app).post('/api/professionals').send({ name: 'Bob', phone: '22222222' }).expect(201);
    expect(created.body.name).toBe('Bob');

    const list1 = await request(app).get('/api/professionals').expect(200);
    expect(list1.body.length).toBe(1);

    const id = created.body.id;
    const updated = await request(app).put(`/api/professionals/${id}`).send({ phone: '33333333' }).expect(200);
    expect(updated.body.phone).toBe('33333333');

    await request(app).delete(`/api/professionals/${id}`).expect(204);
    const list2 = await request(app).get('/api/professionals').expect(200);
    expect(list2.body.length).toBe(0);
  });
});
