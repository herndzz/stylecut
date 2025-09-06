# Configuração do Banco de Dados StyleCut

## PostgreSQL (Banco Principal)

### Configurações Atuais
```
Host: localhost
Porta: 5433
Database: stylecut_db
Usuário: postgres
Senha: stylecut123
```

### 1. Verificação da Conexão
```bash
# Testar conexão
psql -h localhost -p 5433 -U postgres -d stylecut_db

# Ou usando a URL completa
psql postgresql://postgres:stylecut123@localhost:5433/stylecut_db
```

### 2. Comandos Úteis do PostgreSQL
```sql
-- Verificar se o banco existe
SELECT datname FROM pg_database WHERE datname = 'stylecut_db';

-- Listar tabelas
\dt

-- Verificar dados de exemplo
SELECT * FROM services;

-- Status das conexões
SELECT count(*) FROM pg_stat_activity WHERE datname = 'stylecut_db';
```

### 3. Configurações de Desenvolvimento
O sistema está configurado para:
- **5 tentativas** de conexão com PostgreSQL
- **Timeout de 3 segundos** por tentativa
- **Pool de 10 conexões** máximas
- **Fallback automático** para SQLite se PostgreSQL não estiver disponível

## SQLite (Fallback Offline)

O SQLite é usado automaticamente quando:
- PostgreSQL não está disponível
- Há problemas de conectividade
- Todas as tentativas de conexão falharam

Arquivo: `server/stylecut_offline.db`

## Comandos para Execução

### Desenvolvimento Completo
```bash
# Instalar dependências
npm install

# Rodar servidor + frontend
npm run dev:full

# Rodar apenas o servidor (porta 3000)
npm run dev:server

# Rodar apenas o frontend (porta 5173)
npm run dev
```

### Verificação de Status
```bash
# Status da aplicação
curl http://localhost:3000/api/health

# Status detalhado da conexão
curl http://localhost:3000/api/status

# Forçar reconexão com PostgreSQL
curl -X POST http://localhost:3000/api/reconnect
```

## Funcionalidades do Sistema

### Sistema Híbrido Inteligente
- **Online**: PostgreSQL com performance otimizada
- **Offline**: Fallback automático para SQLite
- **Reconexão**: Tentativas automáticas de reconexão
- **Monitoramento**: Endpoints para verificar status

### Dados de Exemplo
O sistema insere automaticamente serviços de exemplo:
- Corte Masculino (R$ 25,00 - 30min)
- Corte Feminino (R$ 45,00 - 60min)
- Barba (R$ 15,00 - 20min)
- Manicure (R$ 20,00 - 45min)
- Pedicure (R$ 25,00 - 60min)
- Escova (R$ 30,00 - 45min)
- Hidratação (R$ 35,00 - 60min)

## Troubleshooting

### PostgreSQL não conecta
1. **Verificar se PostgreSQL está rodando**:
   ```bash
   # No Windows
   net start postgresql
   
   # No Linux/Mac
   sudo systemctl start postgresql
   ```

2. **Verificar porta e configurações**:
   - Confirmar porta 5433 no arquivo `.env`
   - Verificar se `postgresql.conf` permite conexões na porta 5433
   - Verificar `pg_hba.conf` para autenticação

3. **Testar conexão manual**:
   ```bash
   psql -h localhost -p 5433 -U postgres
   ```

### Logs do Sistema
O sistema fornece logs detalhados:
- ✅ Conexões bem-sucedidas
- ⚠️ Tentativas de reconexão
- ❌ Falhas de conexão
- 🔄 Status de fallback

### Reset Completo (Desenvolvimento)
```sql
-- Conectar ao PostgreSQL e executar:
DROP DATABASE IF EXISTS stylecut_db;
CREATE DATABASE stylecut_db;
```

Depois reiniciar o servidor para recriar as tabelas automaticamente.
