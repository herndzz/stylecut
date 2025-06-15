# Style Cut
Style Cut é uma aplicação web desenvolvida para cabeleireiros autônomos e microempreendedores do setor de beleza, com o objetivo de gerenciar agendas, clientes, colaboradores e serviços de forma prática e eficiente. O sistema é intuitivo, responsivo e suporta temas claro e escuro para melhor experiência do usuário.
Funcionalidades

* Gerenciamento de Clientes: Cadastre, edite e exclua clientes, com validação para evitar exclusão de clientes com agendamentos.
* Gerenciamento de Colaboradores: Adicione, edite e exclua colaboradores, associando serviços específicos a cada um.
* Gerenciamento de Serviços: Crie, edite e exclua serviços, definindo valores monetários (ex.: R$ 50,00 para corte de cabelo).
* Agendamentos: Registre, edite e exclua agendamentos, selecionando cliente, colaborador, serviço, data, hora e exibindo o valor do serviço.
* Alternar Tema: Alterne entre temas claro e escuro para maior conforto visual, com a escolha salva automaticamente.
* Guia de Uso: Um guia interativo na página inicial explica como usar o sistema, com opção de mostrar/esconder.
* Persistência de Dados: Todos os dados são salvos no localStorage do navegador, mantendo informações entre sessões.
* Validações: Garante que campos obrigatórios sejam preenchidos, datas sejam futuras e exclusões respeitem dependências.

## Requisitos Atendidos     
Com base no documento do projeto, o sistema cobre:     
RF01: Agendamento de serviços com gerenciamento de horários.   
RF02: Cadastro de clientes com nome e telefone.    
RF05: Gerenciamento de colaboradores com associação de serviços.   
RNF01: Interface intuitiva, reforçada com Bootstrap e guia de uso.   
RNF02: Compatibilidade com dispositivos móveis via design responsivo.   
Parcialmente RF03: Lista de agendamentos com valores serve como base para relatórios.   
Parcialmente RNF03: Dados salvos localmente; segurança total requer backend.   

## Tecnologias Utilizadas
HTML5: Estrutura da interface.     
CSS3: Estilização, com temas claro e escuro.     
JavaScript: Lógica da aplicação, incluindo validações e manipulação do DOM.    
Bootstrap 5.3: Framework para design responsivo e componentes interativos.    
LocalStorage: Armazenamento de dados no navegador.      

## Como Instalar e Executar   
Baixe os arquivos:   
Faça o download dos arquivos index.html, styles.css e app.js do repositório.    
Coloque os arquivos na mesma pasta:   
Certifique-se de que index.html, styles.css e app.js estejam no mesmo diretório.    

## Abra no navegador:
Abra o arquivo index.html em um navegador moderno (Chrome, Firefox, etc.).    
Não é necessário servidor, pois o projeto usa CDN para Bootstrap e localStorage para persistência.      

## Como Usar
Acesse o Guia de Uso:    
Na página inicial, clique em "Mostrar Guia de Uso" para ver instruções detalhadas.
Clique novamente para esconder o guia.   

Alternar Tema:   
Clique em "Alternar Tema" no topo para mudar entre modo claro e escuro.    


Gerenciar Clientes:     
Na seção "Clientes", insira nome e telefone, clique em "Adicionar Cliente".
Use os botões "Editar" ou "Excluir" na lista de clientes.    


Gerenciar Colaboradores:     
Em "Colaboradores", insira nome, especialidade e selecione serviços disponíveis.
Clique em "Adicionar Colaborador". Edite ou exclua na lista.    


Gerenciar Serviços:     
Em "Serviços", insira nome e valor (ex.: R$ 50,00), clique em "Adicionar Serviço".
Edite ou exclua serviços na lista.    


Fazer Agendamentos:    
Em "Agendamento", selecione cliente, colaborador, serviço, data e hora.
O valor do serviço aparece automaticamente. Clique em "Agendar".
Edite ou exclua agendamentos na lista.    


Dicas:   
Certifique-se de que datas de agendamento sejam futuras.    
Clientes, colaboradores ou serviços com agendamentos associados não podem ser excluídos.    
Dados são salvos automaticamente no navegador.     

Estrutura do Projeto   
├── index.html      # Página principal com a interface    
├── styles.css      # Estilos CSS, incluindo temas claro e escuro    
├── app.js          # Lógica JavaScript para gerenciamento e validações       

## Possíveis Melhorias Futuras
Relatórios Detalhados: Adicionar uma seção para relatórios financeiros e operacionais (RF03).     
Notificações via WhatsApp: Implementar simulação ou integração com API do WhatsApp (RF04).    
Backend com Banco de Dados: Substituir localStorage por um banco (ex.: MongoDB) para maior escalabilidade e segurança (RNF03).   
Autenticação: Adicionar login para proteger o acesso.   
Testes Automatizados: Incluir testes unitários e de integração.   

Responsável pelo Código   
herndz   
   
Licença    
Este projeto é para uso educacional e não possui uma licença formal definida.    
