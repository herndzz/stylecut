const { getKnex } = require('./knex');
const { v4: uuid } = require('uuid');

(async () => {
  const knex = await getKnex();
  try {
    const [c1, c2] = [uuid(), uuid()];
    const [p1, p2] = [uuid(), uuid()];
    const [s1, s2] = [uuid(), uuid()];

    await knex('clients').insert([
      { id: c1, name: 'Ana', email: 'ana@example.com', phone: '11111111' },
      { id: c2, name: 'Bruno', email: 'bruno@example.com', phone: '22222222' },
    ]);
    await knex('professionals').insert([
      { id: p1, name: 'Carlos', email: 'carlos@example.com', phone: '33333333' },
      { id: p2, name: 'Daniela', email: 'daniela@example.com', phone: '44444444' },
    ]);
    await knex('services').insert([
      { id: s1, name: 'Corte', duration_minutes: 30, price_cents: 5000 },
      { id: s2, name: 'Barba', duration_minutes: 20, price_cents: 3000 },
    ]);
    console.log('Seed completed');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
