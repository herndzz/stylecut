const request = require('supertest');
const app = require('../app');
const { setupDb, truncateAll } = require('./helpers/db');

async function seedBasic() {
  const client = await request(app).post('/api/clients').send({ name: 'Alice' }).expect(201);
  const prof = await request(app).post('/api/professionals').send({ name: 'Bob' }).expect(201);
  const serv = await request(app).post('/api/services').send({ name: 'Corte', duration_minutes: 30, price_cents: 5000 }).expect(201);
  return { client: client.body, prof: prof.body, serv: serv.body };
}

describe('Appointments', () => {
  beforeAll(async () => { await setupDb(); });
  beforeEach(async () => { await truncateAll(); });

  test('create appointment and prevent conflict', async () => {
    const { client, prof, serv } = await seedBasic();
    const start = new Date('2030-01-01T12:00:00.000Z').toISOString();

    const a1 = await request(app).post('/api/appointments').send({
      client_id: client.id,
      professional_id: prof.id,
      service_id: serv.id,
      start_time: start,
    }).expect(201);
    expect(a1.body.professional_id).toBe(prof.id);

    await request(app).post('/api/appointments').send({
      client_id: client.id,
      professional_id: prof.id,
      service_id: serv.id,
      start_time: start,
    }).expect(409);

    const list = await request(app).get('/api/appointments?date=2030-01-01').expect(200);
    expect(list.body.length).toBe(1);

    const id = a1.body.id;
    const upd = await request(app).put(`/api/appointments/${id}`).send({ status: 'cancelled' }).expect(200);
    expect(upd.body.status).toBe('cancelled');
  });
});
