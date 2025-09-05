-- Criação das tabelas
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    data_nascimento DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colaboradores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    especialidade VARCHAR(255),
    comissao DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    duracao INTEGER DEFAULT 60, -- em minutos
    categoria VARCHAR(100),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    colaborador_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
    servico_id INTEGER REFERENCES servicos(id) ON DELETE SET NULL,
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME,
    status VARCHAR(50) DEFAULT 'agendado',
    valor_total DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colaborador_servicos (
    colaborador_id INTEGER REFERENCES colaboradores(id) ON DELETE CASCADE,
    servico_id INTEGER REFERENCES servicos(id) ON DELETE CASCADE,
    PRIMARY KEY (colaborador_id, servico_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_colaborador ON agendamentos(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_colaboradores_nome ON colaboradores(nome);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_timestamp 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_colaboradores_timestamp 
    BEFORE UPDATE ON colaboradores 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_servicos_timestamp 
    BEFORE UPDATE ON servicos 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_agendamentos_timestamp 
    BEFORE UPDATE ON agendamentos 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Views úteis para relatórios
CREATE OR REPLACE VIEW v_agendamentos_completo AS
SELECT 
    a.id,
    a.data_agendamento,
    a.hora_inicio,
    a.hora_fim,
    a.status,
    a.valor_total,
    a.observacoes,
    c.nome as cliente_nome,
    c.telefone as cliente_telefone,
    col.nome as colaborador_nome,
    s.nome as servico_nome,
    s.valor as servico_valor,
    s.duracao as servico_duracao
FROM agendamentos a
LEFT JOIN clientes c ON a.cliente_id = c.id
LEFT JOIN colaboradores col ON a.colaborador_id = col.id
LEFT JOIN servicos s ON a.servico_id = s.id
ORDER BY a.data_agendamento DESC, a.hora_inicio;

-- Função para verificar conflitos de horário
CREATE OR REPLACE FUNCTION verificar_conflito_horario(
    p_colaborador_id INTEGER,
    p_data_agendamento DATE,
    p_hora_inicio TIME,
    p_hora_fim TIME,
    p_agendamento_id INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    conflito_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflito_count
    FROM agendamentos
    WHERE colaborador_id = p_colaborador_id
      AND data_agendamento = p_data_agendamento
      AND status != 'cancelado'
      AND (p_agendamento_id IS NULL OR id != p_agendamento_id)
      AND (
          (hora_inicio <= p_hora_inicio AND hora_fim > p_hora_inicio) OR
          (hora_inicio < p_hora_fim AND hora_fim >= p_hora_fim) OR
          (hora_inicio >= p_hora_inicio AND hora_fim <= p_hora_fim)
      );
    
    RETURN conflito_count > 0;
END;
$$ LANGUAGE plpgsql;