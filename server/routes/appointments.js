import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/appointments - Listar todos os agendamentos
router.get('/', async (req, res) => {
  try {
    const appointments = await req.db.all(`
      SELECT 
        id,
        client_id as clientId,
        professional_id as professionalId,
        service_id as serviceId,
        date,
        time,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM appointments 
      ORDER BY date ASC, time ASC
    `);
    
    res.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/appointments - Criar novo agendamento
router.post('/', async (req, res) => {
  try {
    const { clientId, professionalId, serviceId, date, time } = req.body;

    // Validações básicas
    if (!clientId || !professionalId || !serviceId || !date || !time) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios: clientId, professionalId, serviceId, date, time' 
      });
    }

    // Verificar se já existe agendamento no mesmo horário para o profissional
    const conflictCheck = await req.db.get(`
      SELECT id FROM appointments 
      WHERE professional_id = ? AND date = ? AND time = ? AND status != 'cancelled'
    `, [professionalId, date, time]);

    if (conflictCheck) {
      return res.status(409).json({ 
        error: 'Já existe um agendamento para este profissional neste horário' 
      });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Verificar qual banco está sendo usado
    if (req.db.currentDatabase === 'PostgreSQL') {
      await req.db.run(`
        INSERT INTO appointments (id, client_id, professional_id, service_id, date, time, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [id, clientId, professionalId, serviceId, date, time, 'scheduled', now, now]);
    } else {
      await req.db.run(`
        INSERT INTO appointments (id, client_id, professional_id, service_id, date, time, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, clientId, professionalId, serviceId, date, time, 'scheduled', now, now]);
    }

    const newAppointment = {
      id,
      clientId,
      professionalId,
      serviceId,
      date,
      time,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now
    };

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/appointments/:id - Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId, professionalId, serviceId, date, time, status } = req.body;

    // Validações básicas
    if (!clientId || !professionalId || !serviceId || !date || !time) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios: clientId, professionalId, serviceId, date, time' 
      });
    }

    // Verificar se o agendamento existe
    const existingAppointment = await req.db.get('SELECT id FROM appointments WHERE id = ?', [id]);
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Verificar conflitos (exceto com o próprio agendamento)
    const conflictCheck = await req.db.get(`
      SELECT id FROM appointments 
      WHERE professional_id = ? AND date = ? AND time = ? AND status != 'cancelled' AND id != ?
    `, [professionalId, date, time, id]);

    if (conflictCheck) {
      return res.status(409).json({ 
        error: 'Já existe um agendamento para este profissional neste horário' 
      });
    }

    const now = new Date().toISOString();
    const appointmentStatus = status || 'scheduled';

    if (req.db.currentDatabase === 'PostgreSQL') {
      await req.db.run(`
        UPDATE appointments 
        SET client_id = $1, professional_id = $2, service_id = $3, date = $4, time = $5, status = $6, updated_at = $7
        WHERE id = $8
      `, [clientId, professionalId, serviceId, date, time, appointmentStatus, now, id]);
    } else {
      await req.db.run(`
        UPDATE appointments 
        SET client_id = ?, professional_id = ?, service_id = ?, date = ?, time = ?, status = ?, updated_at = ?
        WHERE id = ?
      `, [clientId, professionalId, serviceId, date, time, appointmentStatus, now, id]);
    }

    res.json({ message: 'Agendamento atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/appointments/:id - Excluir agendamento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o agendamento existe
    const existingAppointment = await req.db.get('SELECT id FROM appointments WHERE id = ?', [id]);
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await req.db.run('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/appointments/professional/:professionalId/date/:date - Buscar agendamentos por profissional e data
router.get('/professional/:professionalId/date/:date', async (req, res) => {
  try {
    const { professionalId, date } = req.params;

    const appointments = await req.db.all(`
      SELECT 
        id,
        client_id as clientId,
        professional_id as professionalId,
        service_id as serviceId,
        date,
        time,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM appointments 
      WHERE professional_id = ? AND date = ? AND status != 'cancelled'
      ORDER BY time ASC
    `, [professionalId, date]);
    
    res.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos por profissional e data:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
      time || existingAppointment.time,
      status || existingAppointment.status,
      id
    ]);
    
    const updatedAppointment = await req.db.get(`
      SELECT a.*, c.name as client_name, p.name as professional_name, s.name as service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN professionals p ON a.professional_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `, [id]);
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/appointments/:id - Deletar agendamento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se agendamento existe
    const existingAppointment = await req.db.get('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    await req.db.run('DELETE FROM appointments WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/appointments/availability/:professionalId - Verificar disponibilidade
router.get('/availability/:professionalId', async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }
    
    // Buscar agendamentos existentes para o profissional na data
    const appointments = await req.db.all(`
      SELECT time FROM appointments 
      WHERE professional_id = ? AND date = ? AND status != 'cancelled'
    `, [professionalId, date]);
    
    const bookedTimes = appointments.map(apt => apt.time);
    
    // Gerar horários disponíveis (8:00 às 18:00, de 30 em 30 minutos)
    const availableTimes = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (!bookedTimes.includes(time)) {
          availableTimes.push(time);
        }
      }
    }
    
    res.json({ availableTimes });
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
