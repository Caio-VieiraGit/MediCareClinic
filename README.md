# MedicareClinic 🏥

O MedicareClinic é um sistema de gestão para clínicas médicas, permitindo:

Cadastro e gerenciamento de pacientes 👩‍⚕️

Agendamento de consultas 📅

Controle de médicos e especialidades 🩺

Painel administrativo para acompanhar atendimentos 📊

Este projeto possui frontend em Vue 3 + Vite e backend em Node.js/Express.

🚀 Tecnologias Utilizadas
Frontend: Vue 3, Vite, Axios

Backend: Node.js, Express, SQLite

ESLint para padronização de código

## 📂 Estrutura do Projeto

```plaintext
MedicareClinic/
├── src/              # Código do frontend (Vue)
├── server/           # Código do backend (Node/Express)
├── public/           # Arquivos estáticos
├── index.html        # Entrada do frontend
├── vite.config.js    # Configuração do Vite
├── package.json      # Dependências e scripts
└── .env.example      # Exemplo de variáveis de ambiente
```


⚙️ Pré-requisitos </br>
Antes de rodar, instale:

Node.js (versão 18+)

npm ou yarn

Banco de dados SQLite (já integrado) ou MySQL (se configurado no backend)

📥 Instalação
Clone o repositório e instale as dependências:

## Clonar o repositório
git clone https://github.com/thigadasilva/MedicareClinic.git

## Entrar na pasta
cd MedicareClinic

## Instalar dependências
npm install

## ▶️ Executando o Projeto
1. Configurar variáveis de ambiente
Crie um arquivo .env na raiz do projeto baseado no .env.example. Exemplo:

env
PORT=sua_porta
DB_PATH=seu_database
JWT_SECRET=senha_super_secreta

2. Rodar o Backend
Abra o terminal prompt de comando no Visual Studio Code
Insira node server/app.js (ou `npm run server`)
O backend será iniciado em http://localhost:3000

3. Popular o banco com dados de exemplo (opcional, mas recomendado)
`npm run seed`
Recria o banco do zero com profissionais, pacientes, consultas e um atendimento de exemplo
(login de admin: admin@medicare.com / Admin@123 — demais credenciais na seção abaixo).
⚠️ Isso apaga qualquer dado existente no banco.

3b. Alternativa: Migrations (sem dados de exemplo)
`npm run migrate` cria o schema do banco via Sequelize CLI, sem popular dados
(`npm run migrate:undo` reverte). Use isso se quiser começar com o banco vazio;
para os dados de exemplo, use `npm run seed` normalmente.

📁 Sobre o banco (server/medicare.db)
O arquivo .db não é versionado (está no .gitignore) — migrations + seed são
suficientes para reconstruir o banco do zero a qualquer momento.

4. Rodar o Frontend
Em outro terminal:

Abra o terminal prompt de comando no Visual Studio Code
Insira npm run dev
O frontend será iniciado em http://localhost:5173

🔑 Funcionalidades Disponíveis
Cadastro de pacientes: formulário para inserir dados pessoais

Agendamento de consultas: escolha de médico, especialidade e horário, com filtros por médico/status/data

Listagem de médicos: painel administrativo para gerenciar profissionais

Registro de atendimento: anamnese, diagnóstico, prescrição (médico responsável pela consulta)

Histórico do paciente: consultas e atendimentos anteriores

Relatórios (admin): estatísticas gerais e pacientes mais frequentes

Dashboard: visão geral dos atendimentos e estatísticas

Controle de acesso por perfil (admin / médico / recepcionista), aplicado no backend

Validação de entrada (express-validator) nos endpoints de criação/edição

Dados clínicos (anamnese/diagnóstico/prescrição) visíveis só para admin/médico — recepcionista
vê o histórico de consultas, não o conteúdo clínico

👤 Credenciais de exemplo (após rodar `npm run seed`)
| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@medicare.com | Admin@123 |
| Médico | carlos@medicare.com | Med@123 |
| Médico | ana@medicare.com | Med@123 |
| Recepcionista | recepcao@medicare.com | Recep@123 |

📌 Decisões de escopo
Algumas páginas do documento de especificação (`/consultas/novo`, `/pacientes/:id`, `/profissionais`)
foram implementadas como modais dentro de `/consultas` e `/pacientes`, em vez de rotas dedicadas —
cobrem a mesma funcionalidade, mas com URL diferente da sugerida no documento.
Cadastro de admin/recepcionista não tem tela própria (apenas médicos são cadastráveis pela UI);
outros perfis são criados via seed ou diretamente pela API.