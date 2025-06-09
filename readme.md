Style Cut - Sistema de Gerenciamento para Cabeleireiros
Descrição
O Style Cut é um sistema web desenvolvido para atender às necessidades de cabeleireiros autônomos e microempreendedores individuais no setor de beleza. Ele facilita a gestão de agendas, clientes e colaboradores, além de oferecer relatórios básicos de atendimento. O sistema foi implementado com base nos requisitos do projeto da Universidade do Estado de Minas Gerais (UEMG) - Sistemas de Informação.
Funcionalidades Implementadas

RF01 - Agendamento de Serviços: Registro e gerenciamento de horários para clientes, com validação básica para evitar conflitos de horário para o mesmo colaborador.
RF02 - Cadastro de Clientes: Armazenamento de dados de clientes (nome, telefone, preferências).
RF03 - Relatórios de Atendimento: Geração de relatórios básicos com informações sobre serviços prestados, ordenados por data.
RF05 - Gerenciamento de Colaboradores: Cadastro e listagem de colaboradores (nome, cargo).
RNF01 - Interface Intuitiva: Interface web simples e amigável, utilizando Bootstrap 5.3 para design responsivo.
RNF02 - Compatibilidade com Dispositivos Móveis: Interface responsiva, acessível em smartphones, tablets e desktops.
Validação Básica: Mensagens de feedback para ações do usuário (ex.: sucesso ou erro em formulários).

Funcionalidades Não Implementadas

RF04 - Comunicação via WhatsApp: Requer integração com uma API externa (ex.: Twilio), não incluída no protótipo.
RNF03 - Segurança de Dados: Autenticação e criptografia não foram implementadas, mas podem ser adicionadas com Flask-Login e bibliotecas como bcrypt.

Tecnologias Utilizadas

Python 3.12: Linguagem de programação principal.
Flask 2.x: Framework web leve para construção da aplicação.
SQLite: Banco de dados relacional leve para armazenamento de dados.
Bootstrap 5.3: Framework CSS/JS para interface responsiva e estilizada.
Jinja2: Motor de templates para renderização de páginas HTML.

Estrutura do Projeto
```
stylecut/
├── app.py                 # Código principal da aplicação Flask
├── stylecut.db            # Banco de dados SQLite (gerado automaticamente)
├── templates/             # Pasta com templates HTML
│   ├── index.html         # Página inicial
│   ├── add_client.html    # Formulário para cadastro de clientes
│   ├── clients.html       # Lista de clientes
│   ├── add_employee.html  # Formulário para cadastro de colaboradores
│   ├── employees.html     # Lista de colaboradores
│   ├── add_appointment.html # Formulário para agendamento
│   ├── appointments.html   # Lista de agendamentos
│   └── reports.html       # Relatórios de atendimento
└── venv/                  # Ambiente virtual Python
```

Banco de Dados
O banco de dados SQLite (stylecut.db) contém três tabelas:

clients: Armazena clientes (id, name, phone, preferences).
employees: Armazena colaboradores (id, name, role).
appointments: Armazena agendamentos (id, client_id, employee_id, date_time, service), com chaves estrangeiras para clients e employees.

Requisitos

Python 3.12+
Dependências Python:
Flask (pip install flask)



Instalação e Execução

Clone o repositório ou copie os arquivos para um diretório local:git clone <url-do-repositorio>  # Se aplicável
cd stylecut


Crie e ative um ambiente virtual:python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate (Windows)


Instale as dependências:pip install flask


Execute a aplicação:python app.py


Acesse a aplicação em http://127.0.0.1:5000/ no navegador.

Funcionamento

Rotas:
/: Página inicial com links para todas as funcionalidades.
/add_client e /clients: Cadastro e listagem de clientes (RF02).
/add_employee e /employees: Cadastro e listagem de colaboradores (RF05).
/add_appointment e /appointments: Agendamento e listagem de serviços (RF01).
/reports: Relatórios básicos de atendimento (RF03).


Validação: Evita conflitos de horário para colaboradores e valida campos obrigatórios em formulários.
Interface: Usa Bootstrap para design responsivo e mensagens flash para feedback ao usuário.

Limitações

Segurança: Sem autenticação ou criptografia (RNF03).
Relatórios: Relatórios básicos, sem filtros por data ou exportação.
Integração com WhatsApp: Não implementada, requer API externa.
Escalabilidade: SQLite é adequado para protótipos, mas PostgreSQL é recomendado para produção.

Melhorias Futuras

RF04 - Integração com WhatsApp: Usar Twilio para enviar lembretes e confirmações.
RNF03 - Segurança: Implementar autenticação com Flask-Login e criptografia com bcrypt.
RF03 - Relatórios Avançados: Adicionar filtros por período e exportação em CSV/PDF usando pandas e openpyxl.
Validação Avançada: Validar formatos de telefone e datas no frontend.
Migração de Banco: Usar Flask-Migrate para gerenciar alterações no esquema do banco.
Testes Unitários: Adicionar testes com unittest para garantir robustez.

Contribuição
Para contribuir:

Faça um fork do repositório.
Crie uma branch para sua funcionalidade (git checkout -b feature/nova-funcionalidade).
Commit suas alterações (git commit -m "Adiciona nova funcionalidade").
Envie um pull request.

Licença
Este projeto é um protótipo acadêmico e não possui licença formal definida.