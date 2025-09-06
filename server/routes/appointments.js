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

// GET /api/appointments/:id - Buscar agendamento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await req.db.get(`
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
      WHERE id = ?
    `, [id]);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
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
        error: 'Cliente, profissional, serviço, data e horário são obrigatórios' 
      });
    }

    // Verificar se cliente existe
    const client = await req.db.get('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (!client) {
      return res.status(400).json({ error: 'Cliente não encontrado' });
    }

    // Verificar se profissional existe
    const professional = await req.db.get('SELECT id FROM professionals WHERE id = ?', [professionalId]);
    if (!professional) {
      return res.status(400).json({ error: 'Profissional não encontrado' });
    }

    // Verificar se serviço existe
    const service = await req.db.get('SELECT id FROM services WHERE id = ?', [serviceId]);
    if (!service) {
      return res.status(400).json({ error: 'Serviço não encontrado' });
    }

    // Verificar se o profissional oferece este serviço
    const professionalService = await req.db.get(
      'SELECT 1 FROM professional_services WHERE professional_id = ? AND service_id = ?',
      [professionalId, serviceId]
    );
    if (!professionalService) {
      return res.status(400).json({ 
        error: 'Este profissional não oferece o serviço selecionado' 
      });
    }

    // Verificar se já existe agendamento no mesmo horário para o profissional
    const conflictCheck = await req.db.get(`
      SELECT id FROM appointments 
      WHERE professional_id = ? AND date = ? AND time = ? AND status != 'cancelled'
    `, [professionalId, date, time]);

    if (conflictCheck) {
      return res.status(409).json({ 
        error: 'Já existe um agendamento neste horário para este profissional' 
      });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await req.db.run(`
      INSERT INTO appointments (id, client_id, professional_id, service_id, date, time, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
    `, [id, clientId, professionalId, serviceId, date, time, now, now]);

    const newAppointment = await req.db.get(`
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
      WHERE id = ?
    `, [id]);

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

    // Verificar se o agendamento existe
    const existingAppointment = await req.db.get(
      'SELECT * FROM appointments WHERE id = ?', 
      [id]
    );
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Validar status se fornecido
    if (status && !['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status deve ser: scheduled, completed ou cancelled' 
      });
    }

    // Se está alterando profissional, data ou hora, verificar conflitos
    const newProfessionalId = professionalId || existingAppointment.professional_id;
    const newDate = date || existingAppointment.date;
    const newTime = time || existingAppointment.time;
    const newStatus = status || existingAppointment.status;

    // Verificar conflitos (exceto com o próprio agendamento e se não está cancelado)
    if (newStatus !== 'cancelled' && 
        (professionalId || date || time)) {
      const conflictCheck = await req.db.get(`
        SELECT id FROM appointments 
        WHERE professional_id = ? AND date = ? AND time = ? AND status != 'cancelled' AND id != ?
      `, [newProfessionalId, newDate, newTime, id]);

      if (conflictCheck) {
        return res.status(409).json({ 
          error: 'Já existe um agendamento neste horário para este profissional' 
        });
      }
    }

    // Verificar se o profissional oferece o serviço (se está alterando)
    const newServiceId = serviceId || existingAppointment.service_id;
    if (professionalId || serviceId) {
      const professionalService = await req.db.get(
        'SELECT 1 FROM professional_services WHERE professional_id = ? AND service_id = ?',
        [newProfessionalId, newServiceId]
      );
      if (!professionalService) {
        return res.status(400).json({ 
          error: 'Este profissional não oferece o serviço selecionado' 
        });
      }
    }

    const now = new Date().toISOString();

    await req.db.run(`
      UPDATE appointments 
      SET client_id = ?, professional_id = ?, service_id = ?, date = ?, time = ?, status = ?, updated_at = ?
      WHERE id = ?
    `, [
      clientId || existingAppointment.client_id,
      newProfessionalId,
      newServiceId,
      newDate,
      newTime,
      newStatus,
      now,
      id
    ]);

    const updatedAppointment = await req.db.get(`
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
      WHERE id = ?
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
    const existingAppointment = await req.db.get(
      'SELECT * FROM appointments WHERE id = ?', 
      [id]
    );
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
    console.error('Erro ao buscar agendamentos:', error);
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
    
    // Buscar agendamentos do profissional na data
    const appointments = await req.db.all(`
      SELECT time FROM appointments 
      WHERE professional_id = ? AND date = ? AND status != 'cancelled'
    `, [professionalId, date]);
    
    // Horários disponíveis (exemplo: 8h às 18h, intervalos de 30min)
    const allSlots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allSlots.push(time);
      }
    }
    
    // Remover horários ocupados
    const bookedTimes = appointments.map(apt => apt.time);
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
    
    res.json({ 
      date,
      professionalId,
      availableSlots,
      bookedSlots: bookedTimes
    });
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;