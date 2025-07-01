# 💅 Style Cut - Sistema de Agendamento Moderno

<div align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
</div>

## 🌟 Visão Geral

O **Style Cut** é um sistema de agendamento moderno e intuitivo, desenvolvido especialmente para salões de beleza e barbearias. Com uma interface elegante e responsiva, oferece uma experiência completa para gerenciar clientes, colaboradores, serviços e agendamentos.

### ✨ Características Principais

- 🎨 **Interface Moderna**: Design glassmorphism com gradientes e efeitos visuais sofisticados
- 🌙 **Tema Escuro/Claro**: Alternância suave entre temas para melhor experiência visual
- 📱 **Totalmente Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- 🔔 **Notificações Toast**: Feedback visual elegante para todas as ações
- ⚡ **Performance Otimizada**: Carregamento rápido e transições suaves
- ♿ **Acessibilidade**: Suporte completo a leitores de tela e navegação por teclado
- 💾 **Armazenamento Local**: Dados salvos automaticamente no navegador

## 🚀 Melhorias Implementadas na UI/UX

### 🎨 **Design Visual**
- **Glassmorphism**: Efeitos de vidro fosco com blur e transparência
- **Gradientes Modernos**: Cores suaves e transições harmoniosas
- **Animações Suaves**: Transições CSS com cubic-bezier para movimento natural
- **Ícones Bootstrap**: Iconografia consistente e profissional
- **Cards Flutuantes**: Elementos com sombras e efeitos de hover

### 🧭 **Navegação Melhorada**
- **Single Page Application**: Navegação fluida entre seções sem recarregamento
- **Navegação Intuitiva**: Menu principal com ícones e indicadores visuais
- **Breadcrumbs Visuais**: Indicação clara da seção atual
- **Scroll Suave**: Animações de rolagem para melhor experiência

### 📝 **Formulários Inteligentes**
- **Validação em Tempo Real**: Feedback instantâneo durante digitação
- **Máscaras de Input**: Formatação automática para telefone e valores
- **Estados Visuais**: Indicadores de campo válido/inválido
- **Labels Flutuantes**: Campos com design material moderno
* Persistência de Dados: Todos os dados são salvos no localStorage do navegador, mantendo informações entre sessões.
* Validações: Garante que campos obrigatórios sejam preenchidos, datas sejam futuras e exclusões respeitem dependências.

### 📋 **Listas Interativas**
- **Hover Effects**: Animações ao passar o mouse
- **Botões de Ação**: Aparecem dinamicamente ao interagir
- **Estados de Loading**: Indicadores visuais durante operações
- **Skeleton Loading**: Placeholder elegante para conteúdo carregando

### 🔔 **Sistema de Notificações**
- **Toast Moderno**: Notificações não-intrusivas
- **Tipos Contextuais**: Sucesso, erro, aviso e informação
- **Auto-dismiss**: Desaparecimento automático após tempo determinado
- **Posicionamento Inteligente**: Localização otimizada na tela

## Requisitos Atendidos     
Com base no documento do projeto, o sistema cobre:     
RF01: Agendamento de serviços com gerenciamento de horários.   
RF02: Cadastro de clientes com nome e telefone.    
RF05: Gerenciamento de colaboradores com associação de serviços.   
RNF01: Interface intuitiva, reforçada com Bootstrap e guia de uso.   
RNF02: Compatibilidade com dispositivos móveis via design responsivo.   
Parcialmente RF03: Lista de agendamentos com valores serve como base para relatórios.   
Parcialmente RNF03: Dados salvos localmente; segurança total requer backend.   

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilos modernos com flexbox e grid
- **JavaScript ES6+**: Funcionalidades interativas e módulos
- **Bootstrap 5.3**: Framework CSS responsivo
- **Bootstrap Icons**: Biblioteca de ícones

### Recursos Avançados
- **CSS Custom Properties**: Variáveis para temas dinâmicos
- **CSS Grid & Flexbox**: Layout responsivo e flexível
- **CSS Animations**: Transições e animações personalizadas
- **LocalStorage API**: Persistência de dados local
- **Intersection Observer**: Animações baseadas em scroll

## 📱 Responsividade

O sistema se adapta perfeitamente a diferentes tamanhos de tela:

- **Desktop (≥1200px)**: Layout completo com sidebar
- **Tablet (768px-1199px)**: Layout adaptado com navegação colapsável  
- **Mobile (≤767px)**: Interface otimizada para touch

## 🎯 Funcionalidades

### 👥 **Gestão de Clientes**
- Cadastro com nome e telefone
- Edição e exclusão de registros
- Validação de campos obrigatórios
- Busca e filtros

### 👨‍💼 **Gestão de Colaboradores**
- Cadastro com especialidade
- Associação com serviços oferecidos
- Gerenciamento de disponibilidade

### ✂️ **Gestão de Serviços**
- Cadastro com nome e valor
- Cálculo automático de preços
- Categorização por tipo

### 📅 **Sistema de Agendamentos**
- Interface calendário intuitiva
- Seleção de data e horário
- Validação de disponibilidade
- Cálculo automático de valores
- Confirmação visual

## 🔧 Como Usar

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/stylecut.git
   cd stylecut
   ```

2. **Abra o arquivo index.html**
   - Pode ser aberto diretamente no navegador
   - Ou use um servidor local (Live Server, etc.)

3. **Comece a usar**
   - Cadastre primeiro os serviços
   - Adicione colaboradores e associe aos serviços
   - Registre clientes
   - Faça agendamentos

## 🎨 Personalização de Temas

### Tema Claro
- Background: Gradientes suaves em tons de azul e branco
- Cards: Vidro fosco com transparência
- Textos: Tons escuros para contraste

### Tema Escuro  
- Background: Gradientes escuros em tons de azul profundo
- Cards: Transparência com bordas luminosas
- Textos: Tons claros para melhor legibilidade

## 🔮 Próximas Melhorias

- [ ] **Sistema de Backup**: Exportar/importar dados
- [ ] **Relatórios**: Dashboard com métricas e gráficos
- [ ] **Notificações Push**: Lembretes de agendamentos
- [ ] **Multi-idioma**: Suporte a diferentes idiomas
- [ ] **Modo Offline**: Funcionamento sem internet
- [ ] **API Integration**: Sincronização com serviços externos

## 👨‍💻 Desenvolvimento

### Estrutura de Arquivos
```
stylecut/
├── index.html              # Página principal
├── style.css              # Estilos globais e temas
├── README.md              # Documentação
└── src/
    ├── app.js             # Aplicação principal
    ├── ui-enhancements.js # Melhorias de UI/UX
    ├── clientes.js        # Gestão de clientes
    ├── colaboradores.js   # Gestão de colaboradores  
    ├── servicos.js        # Gestão de serviços
    ├── agendamentos.js    # Sistema de agendamentos
    ├── storage.js         # Gerenciamento de dados
    └── temas.js           # Sistema de temas
```

## 🤝 Contribuições

Contribuições são sempre bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

<div align="center">
  <p>Desenvolvido com ❤️ para modernizar a gestão de salões de beleza</p>
  <p>© 2024 Style Cut - Todos os direitos reservados</p>
</div>
