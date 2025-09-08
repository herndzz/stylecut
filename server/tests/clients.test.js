const request = require('supertest');
const app = require('../app');
const { setupDb, truncateAll } = require('./helpers/db');

describe('Clients CRUD', () => {
  beforeAll(async () => { await setupDb(); });
  beforeEach(async () => { await truncateAll(); });

  test('create, list, update, delete client', async () => {
    const created = await request(app).post('/api/clients').send({ name: 'Alice', email: 'a@x.com', phone: '111' }).expect(201);
    expect(created.body.name).toBe('Alice');

    const list1 = await request(app).get('/api/clients').expect(200);
    expect(list1.body.length).toBe(1);

    const id = created.body.id;
    const updated = await request(app).put(`/api/clients/${id}`).send({ name: 'Alice B' }).expect(200);
    expect(updated.body.name).toBe('Alice B');

    await request(app).delete(`/api/clients/${id}`).expect(204);
    const list2 = await request(app).get('/api/clients').expect(200);
    expect(list2.body.length).toBe(0);
  });
});
