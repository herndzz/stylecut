import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/services - Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const services = await req.db.all('SELECT * FROM services ORDER BY name');
    res.json(services);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/services/:id - Buscar serviço por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await req.db.get('SELECT * FROM services WHERE id = ?', [id]);
    
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/services - Criar novo serviço
router.post('/', async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    
    // Validações
    if (!name || price === undefined || !duration) {
      return res.status(400).json({ error: 'Nome, preço e duração são obrigatórios' });
    }
    
    if (price < 0) {
      return res.status(400).json({ error: 'Preço deve ser maior ou igual a zero' });
    }
    
    if (duration < 15) {
      return res.status(400).json({ error: 'Duração deve ser pelo menos 15 minutos' });
    }
    
    const id = uuidv4();
    
    // Verificar qual banco está sendo usado
    if (req.db.currentDatabase === 'PostgreSQL') {
      await req.db.run(
        'INSERT INTO services (id, name, price, duration) VALUES ($1, $2, $3, $4)',
        [id, name, price, duration]
      );
    } else {
      await req.db.run(
        'INSERT INTO services (id, name, price, duration) VALUES (?, ?, ?, ?)',
        [id, name, price, duration]
      );
    }
    
    const newService = await req.db.get('SELECT * FROM services WHERE id = ?', [id]);
    res.status(201).json(newService);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/services/:id - Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration } = req.body;
    
    // Verificar se serviço existe
    const existingService = await req.db.get('SELECT * FROM services WHERE id = ?', [id]);
    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    // Validações para novos valores
    if (price !== undefined && price < 0) {
      return res.status(400).json({ error: 'Preço deve ser maior ou igual a zero' });
    }
    
    if (duration !== undefined && duration < 15) {
      return res.status(400).json({ error: 'Duração deve ser pelo menos 15 minutos' });
    }
    
    // Verificar qual banco está sendo usado
    if (req.db.currentDatabase === 'PostgreSQL') {
      await req.db.run(
        'UPDATE services SET name = $1, price = $2, duration = $3 WHERE id = $4',
        [
          name || existingService.name,
          price !== undefined ? price : existingService.price,
          duration || existingService.duration,
          id
        ]
      );
    } else {
      await req.db.run(
        'UPDATE services SET name = ?, price = ?, duration = ? WHERE id = ?',
        [
          name || existingService.name,
          price !== undefined ? price : existingService.price,
          duration || existingService.duration,
          id
        ]
      );
    }
    
    const updatedService = await req.db.get('SELECT * FROM services WHERE id = ?', [id]);
    res.json(updatedService);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/services/:id - Deletar serviço
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se serviço existe
    const existingService = await req.db.get('SELECT * FROM services WHERE id = ?', [id]);
    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    // Verificar se serviço está sendo usado por profissionais ou agendamentos
    const professionalServices = await req.db.get('SELECT COUNT(*) as count FROM professional_services WHERE service_id = ?', [id]);
    if (professionalServices.count > 0) {
      return res.status(409).json({ 
        error: 'Não é possível excluir serviço que está sendo usado por profissionais' 
      });
    }
    
    const appointments = await req.db.get('SELECT COUNT(*) as count FROM appointments WHERE service_id = ?', [id]);
    if (appointments.count > 0) {
      return res.status(409).json({ 
        error: 'Não é possível excluir serviço com agendamentos existentes' 
      });
    }
    
    await req.db.run('DELETE FROM services WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
