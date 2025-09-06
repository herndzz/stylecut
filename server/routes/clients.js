import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/clients - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const clients = await req.db.all('SELECT * FROM clients ORDER BY name');
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/clients/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await req.db.get('SELECT * FROM clients WHERE id = ?', [id]);
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clients - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    
    // Validações
    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }
    
    // Verificar se telefone já existe
    const existingClient = await req.db.get('SELECT id FROM clients WHERE phone = ?', [phone]);
    if (existingClient) {
      return res.status(409).json({ error: 'Já existe um cliente com este telefone' });
    }
    
    const id = uuidv4();
    
    // Verificar qual banco está sendo usado
    if (req.db.currentDatabase === 'PostgreSQL') {
      await req.db.run(
        'INSERT INTO clients (id, name, phone, email) VALUES ($1, $2, $3, $4)',
        [id, name, phone, email || null]
      );
    } else {
      await req.db.run(
        'INSERT INTO clients (id, name, phone, email) VALUES (?, ?, ?, ?)',
        [id, name, phone, email || null]
      );
    }
    
    const newClient = await req.db.get('SELECT * FROM clients WHERE id = ?', [id]);
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    
    // Verificar se cliente existe
    const existingClient = await req.db.get('SELECT * FROM clients WHERE id = ?', [id]);
    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Verificar se telefone já existe em outro cliente
    if (phone && phone !== existingClient.phone) {
      const phoneExists = await req.db.get('SELECT id FROM clients WHERE phone = ? AND id != ?', [phone, id]);
      if (phoneExists) {
        return res.status(409).json({ error: 'Já existe um cliente com este telefone' });
      }
    }
    
    // Verificar qual banco está sendo usado
    if (req.db.currentDatabase === 'PostgreSQL') {
      await req.db.run(
        'UPDATE clients SET name = $1, phone = $2, email = $3 WHERE id = $4',
        [
          name || existingClient.name,
          phone || existingClient.phone,
          email !== undefined ? email : existingClient.email,
          id
        ]
      );
    } else {
      await req.db.run(
        'UPDATE clients SET name = ?, phone = ?, email = ? WHERE id = ?',
        [
          name || existingClient.name,
          phone || existingClient.phone,
          email !== undefined ? email : existingClient.email,
          id
        ]
      );
    }
    
    const updatedClient = await req.db.get('SELECT * FROM clients WHERE id = ?', [id]);
    res.json(updatedClient);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/clients/:id - Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se cliente existe
    const existingClient = await req.db.get('SELECT * FROM clients WHERE id = ?', [id]);
    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Verificar se cliente tem agendamentos
    const appointments = await req.db.get('SELECT COUNT(*) as count FROM appointments WHERE client_id = ?', [id]);
    if (appointments.count > 0) {
      return res.status(409).json({ 
        error: 'Não é possível excluir cliente com agendamentos existentes' 
      });
    }
    
    await req.db.run('DELETE FROM clients WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/clients/search/phone/:phone - Buscar cliente por telefone
router.get('/search/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const client = await req.db.get('SELECT * FROM clients WHERE phone = ?', [phone]);
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente por telefone:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
