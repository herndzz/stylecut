# StyleCut API (MVP Backend)

Stack: Node.js + Express + Knex (pg + sqlite3 fallback)

Requisitos atendidos:
- Rotas REST: /api/clients, /api/professionals, /api/services, /api/appointments
- Migrations e modelos via Knex
- Prevenção de conflitos por profissional/start_time (unique + checagem)
- Variáveis de ambiente para porta e banco
- Organização: server/, migrations/

## Pré-requisitos
- Node.js 18+
- PostgreSQL 13+ (opcional; se indisponível, cai para SQLite)

## Configuração
1. Copie .env.example para .env e ajuste credenciais
2. Opcional: crie o DB Postgres (stylecut_db). Caso não use Postgres, será criado um arquivo SQLite em database/stylecut.sqlite.

## Instalação
```
npm install
```

## Executar migrações
```
npm run migrate
```

## Rodar o servidor
- Desenvolvimento (com nodemon):
```
npm run server
```
- Produção:
```
npm start
```

Server em: http://localhost:${PORT:-3000}
Healthcheck: GET /health

## API Base
Base URL: /api

Recursos:
- Clients: GET/POST/PUT/DELETE /api/clients
- Professionals: GET/POST/PUT/DELETE /api/professionals
- Services: GET/POST/PUT/DELETE /api/services
- Appointments:
  - GET /api/appointments?date=YYYY-MM-DD
  - GET /api/appointments/:id
  - POST /api/appointments
  - PUT /api/appointments/:id
  - DELETE /api/appointments/:id

Notas:
- Datas em ISO 8601 (UTC). Campo start_time em appointments.
- Conflitos: o backend impede dois agendamentos com mesmo professional_id e start_time (HTTP 409).
- Status do agendamento: scheduled | completed | cancelled.
- Unicidade de phone em clients e professionals pode ser ajustada conforme necessidade.

## Estrutura
- server/
  - index.js (boot + migrations)
  - app.js (Express + rotas)
  - db/
    - knex.js (seleção Postgres/SQLite)
    - runMigrations.js
  - routes/
    - clients.js
    - professionals.js
    - services.js
    - appointments.js
- migrations/
  - 0001_init.js
- database/ (criado em runtime)

## CORS
CORS habilitado. No Vite, use proxy para /api -> http://localhost:3000.

## Frontend (Vite + React + Tailwind + React Query)

Pré-requisitos: Node.js 18+

Passos:
1. Instale dependências (mesmo comando do projeto):
```
npm install
```
2. Crie o arquivo .env a partir do .env.example (opcional ajustar VITE_DEV_SERVER_PORT e VITE_PROXY_TARGET)
3. Inicie o backend em um terminal:
```
npm run server
```
4. Inicie o frontend em outro terminal:
```
npm run dev
```
- Acesse: http://localhost:5173 (proxy /api -> http://localhost:3000)

Build de produção do frontend:
```
npm run build
npm run preview
```

Páginas:
- /clients, /professionals, /services: CRUD completo + busca (campo "Buscar")
- /appointments: criar, listar, editar, cancelar e excluir; filtros por data e status

Observações:
- Datas/horários em ISO 8601 UTC; o input usa datetime-local e converte para UTC.
- Erros 409 de conflito são exibidos ao usuário.
- Layout simples com Tailwind.
- Validações de formulário no frontend com React Hook Form + Zod (mensagens inline e bloqueio de submit inválido).

## Deploy com Docker Compose

Pré-requisitos:
- Docker e Docker Compose
- Arquivo .env no diretório raiz (pode usar .env.example como base)

Serviços:
- db (PostgreSQL 14): porta 5432
- backend (Express): porta 3000
- frontend (Vite dev server com proxy /api): porta 5173

Passos:
1. Crie/ajuste o arquivo .env com as variáveis (ex.: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD). A URL do banco para o backend pode ser:
```
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```
2. Suba os containers:
```
docker-compose up -d --build
```
3. Acesse:
- Frontend: http://localhost:5173
- API: http://localhost:3000/api
- Postgres: localhost:5432 (credenciais do .env)

Observações:
- O script database/init.sql é executado automaticamente no primeiro start do Postgres (cria extensões e tabelas).
- O backend aplica migrations ao iniciar.
- O frontend usa proxy do Vite para /api -> backend.
- Para logs: `docker-compose logs -f backend` (ou frontend/db).
- Para parar: `docker-compose down` (use `-v` para remover volumes do banco se necessário).

## Testes (Backend e Frontend)

Instalar dependências:
```
npm install
```

Backend (Jest + Supertest):
```
npm run test:backend
```
Frontend (Vitest + Testing Library):
```
npm run test:frontend
```
Rodar ambos:
```
npm test
```

Observações:
- Backend usa SQLite em memória e aplica migrations automaticamente.
- Frontend usa jsdom e mock de fetch (src/test/setup.ts). Cada teste pode sobrescrever o mock.
