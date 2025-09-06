import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/professionals - Listar todos os profissionais
router.get('/', async (req, res) => {
  try {
    const professionals = await req.db.all(`
      SELECT p.*, GROUP_CONCAT(ps.service_id) as service_ids
      FROM professionals p
      LEFT JOIN professional_services ps ON p.id = ps.professional_id
      GROUP BY p.id
      ORDER BY p.name
    `);
    
    // Transformar service_ids em array
    const result = professionals.map(prof => ({
      ...prof,
      services: prof.service_ids ? prof.service_ids.split(',') : [],
      service_ids: undefined
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/professionals/:id - Buscar profissional por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const professional = await req.db.get('SELECT * FROM professionals WHERE id = ?', [id]);
    if (!professional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }
    
    const services = await req.db.all(
      'SELECT service_id FROM professional_services WHERE professional_id = ?',
      [id]
    );
    
    professional.services = services.map(s => s.service_id);
    res.json(professional);
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/professionals - Criar novo profissional
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, services } = req.body;
    
    // Validações
    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ error: 'Pelo menos um serviço deve ser selecionado' });
    }
    
    // Verificar se telefone já existe
    const existingProfessional = await req.db.get('SELECT id FROM professionals WHERE phone = ?', [phone]);
    if (existingProfessional) {
      return res.status(409).json({ error: 'Já existe um profissional com este telefone' });
    }
    
    // Verificar se todos os serviços existem
    for (const serviceId of services) {
      const serviceExists = await req.db.get('SELECT id FROM services WHERE id = ?', [serviceId]);
      if (!serviceExists) {
        return res.status(400).json({ error: `Serviço com ID ${serviceId} não encontrado` });
      }
    }
    
    const id = uuidv4();
    
    // Inserir profissional
    await req.db.run(
      'INSERT INTO professionals (id, name, phone, email) VALUES (?, ?, ?, ?)',
      [id, name, phone, email || null]
    );
    
    // Inserir relações com serviços
    for (const serviceId of services) {
      await req.db.run(
        'INSERT INTO professional_services (professional_id, service_id) VALUES (?, ?)',
        [id, serviceId]
      );
    }
    
    const newProfessional = await req.db.get('SELECT * FROM professionals WHERE id = ?', [id]);
    newProfessional.services = services;
    
    res.status(201).json(newProfessional);
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/professionals/:id - Atualizar profissional
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, services } = req.body;
    
    // Verificar se profissional existe
    const existingProfessional = await req.db.get('SELECT * FROM professionals WHERE id = ?', [id]);
    if (!existingProfessional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }
    
    // Verificar se telefone já existe em outro profissional
    if (phone && phone !== existingProfessional.phone) {
      const phoneExists = await req.db.get('SELECT id FROM professionals WHERE phone = ? AND id != ?', [phone, id]);
      if (phoneExists) {
        return res.status(409).json({ error: 'Já existe um profissional com este telefone' });
      }
    }
    
    // Se serviços foram fornecidos, verificar se existem
    if (services && Array.isArray(services)) {
      for (const serviceId of services) {
        const serviceExists = await req.db.get('SELECT id FROM services WHERE id = ?', [serviceId]);
        if (!serviceExists) {
          return res.status(400).json({ error: `Serviço com ID ${serviceId} não encontrado` });
        }
      }
    }
    
    // Atualizar dados do profissional
    await req.db.run(
      'UPDATE professionals SET name = ?, phone = ?, email = ? WHERE id = ?',
      [
        name || existingProfessional.name,
        phone || existingProfessional.phone,
        email !== undefined ? email : existingProfessional.email,
        id
      ]
    );
    
    // Se serviços foram fornecidos, atualizar relações
    if (services && Array.isArray(services)) {
      // Remover relações existentes
      await req.db.run('DELETE FROM professional_services WHERE professional_id = ?', [id]);
      
      // Inserir novas relações
      for (const serviceId of services) {
        await req.db.run(
          'INSERT INTO professional_services (professional_id, service_id) VALUES (?, ?)',
          [id, serviceId]
        );
      }
    }
    
    const updatedProfessional = await req.db.get('SELECT * FROM professionals WHERE id = ?', [id]);
    const professionalServices = await req.db.all(
      'SELECT service_id FROM professional_services WHERE professional_id = ?',
      [id]
    );
    updatedProfessional.services = professionalServices.map(s => s.service_id);
    
    res.json(updatedProfessional);
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/professionals/:id - Deletar profissional
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se profissional existe
    const existingProfessional = await req.db.get('SELECT * FROM professionals WHERE id = ?', [id]);
    if (!existingProfessional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }
    
    // Verificar se profissional tem agendamentos
    const appointments = await req.db.get('SELECT COUNT(*) as count FROM appointments WHERE professional_id = ?', [id]);
    if (appointments.count > 0) {
      return res.status(409).json({ 
        error: 'Não é possível excluir profissional com agendamentos existentes' 
      });
    }
    
    // Remover relações com serviços
    await req.db.run('DELETE FROM professional_services WHERE professional_id = ?', [id]);
    
    // Remover profissional
    await req.db.run('DELETE FROM professionals WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar profissional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
