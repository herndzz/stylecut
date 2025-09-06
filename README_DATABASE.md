# Configuração do Banco de Dados - StyleCut

## PostgreSQL (Produção/Desenvolvimento)

### Pré-requisitos
- PostgreSQL 13+ instalado
- Porta 5433 disponível (configurável)

### Configuração Inicial

1. **Criar banco de dados e usuário:**
```sql
-- Execute como superuser (postgres)
CREATE DATABASE stylecut_db;
CREATE USER stylecut_user WITH PASSWORD 'stylecut123';
GRANT ALL PRIVILEGES ON DATABASE stylecut_db TO stylecut_user;
```

2. **Configurar arquivo `.env`:**
```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=stylecut_db
DB_USER=postgres
DB_PASSWORD=stylecut123
DB_SSL=false
DB_TIMEOUT=3000
DB_POOL_SIZE=10
DB_MAX_ATTEMPTS=5
NODE_ENV=development
PORT=3000
ENABLE_OFFLINE_FALLBACK=true
DATABASE_URL=postgresql://postgres:stylecut123@localhost:5433/stylecut_db
```

3. **Executar script de inicialização:**
```bash
# Conectar ao PostgreSQL e executar o script init.sql
psql -U postgres -d stylecut_db -f database/init.sql
```

### Inicialização do Projeto

```bash
# Instalar dependências
npm install

# Iniciar servidor e frontend simultaneamente
npm run dev:full

# OU iniciar separadamente:
# Terminal 1 - Servidor API
npm run server

# Terminal 2 - Frontend
npm run dev
```

## SQLite (Fallback/Offline)

O sistema automaticamente utiliza SQLite quando o PostgreSQL não está disponível.
- Arquivo: `server/stylecut_offline.db`
- Criado automaticamente na primeira execução
- Dados salvos localmente no navegador via localStorage

## Estrutura das Tabelas

### clients
- **id**: UUID (Primary Key)
- **name**: VARCHAR(255) - Nome completo
- **phone**: VARCHAR(20) UNIQUE - Telefone no formato (99) 99999-9999
- **email**: VARCHAR(255) NULLABLE - Email opcional
- **created_at, updated_at**: TIMESTAMP

### services
- **id**: UUID (Primary Key)  
- **name**: VARCHAR(255) - Nome do serviço
- **price**: DECIMAL(10,2) - Preço em reais
- **duration**: INTEGER - Duração em minutos
- **created_at, updated_at**: TIMESTAMP

### professionals
- **id**: UUID (Primary Key)
- **name**: VARCHAR(255) - Nome completo
- **phone**: VARCHAR(20) UNIQUE - Telefone no formato (99) 99999-9999
- **email**: VARCHAR(255) NULLABLE - Email opcional
- **created_at, updated_at**: TIMESTAMP

### professional_services
- **professional_id**: UUID (FK para professionals)
- **service_id**: UUID (FK para services)
- Composite Primary Key (professional_id, service_id)

### appointments
- **id**: UUID (Primary Key)
- **client_id**: UUID (FK para clients)
- **professional_id**: UUID (FK para professionals) 
- **service_id**: UUID (FK para services)
- **date**: DATE - Data do agendamento
- **time**: TIME - Horário do agendamento
- **status**: ENUM('scheduled', 'completed', 'cancelled')
- **created_at, updated_at**: TIMESTAMP
- UNIQUE(professional_id, date, time) - Evita conflitos

## Comandos Úteis

### Desenvolvimento
```bash
# Verificar status do servidor
curl http://localhost:3000/api/health

# Verificar conexão com banco
curl http://localhost:3000/api/status

# Forçar reconexão PostgreSQL
curl -X POST http://localhost:3000/api/reconnect
```

### Backup e Restauração
```bash
# Backup PostgreSQL
pg_dump -U postgres stylecut_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U postgres -d stylecut_db < backup_20241220.sql

# Backup SQLite
cp server/stylecut_offline.db backup_offline_$(date +%Y%m%d).db
```

### Logs e Debugging
```bash
# Logs do servidor
npm run server 2>&1 | tee server.log

# Verificar logs específicos
grep "ERROR\|WARN" server.log
```

## Resolução de Problemas

### 1. "Endpoint '/api/clients' não encontrado"
- Verificar se o servidor está rodando na porta 3000
- Conferir se o PostgreSQL está ativo
- Verificar configurações do arquivo `.env`

### 2. Erro de conexão PostgreSQL
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql  # Linux
brew services list postgresql     # macOS
```

### 3. Porta em uso
```bash
# Verificar o que está usando a porta
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar processo se necessário
kill -9 <PID>
```

### 4. Permissões do banco
```sql
-- Dar permissões completas ao usuário
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stylecut_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stylecut_user;
```

## URLs de Teste

- **Frontend**: http://localhost:5173
- **API Health**: http://localhost:3000/api/health
- **API Status**: http://localhost:3000/api/status
- **Clientes**: http://localhost:3000/api/clients
- **Serviços**: http://localhost:3000/api/services
- **Profissionais**: http://localhost:3000/api/professionals
- **Agendamentos**: http://localhost:3000/api/appointments
