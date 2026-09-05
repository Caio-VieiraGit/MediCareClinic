# MedicareClinic 🏥

O **MediCare Clinic** é um sistema de gestão para clínicas médicas, desenvolvido para facilitar o gerenciamento de pacientes, consultas, profissionais e atendimentos.

O sistema permite:

* Cadastro e gerenciamento de pacientes 👩‍⚕️
* Agendamento de consultas 📅
* Controle de médicos e especialidades 🩺
* Painel administrativo para acompanhamento de atendimentos 📊
* Registro de atendimentos médicos
* Autenticação e controle de acesso

O projeto possui **frontend desenvolvido em Vue 3 + Vite** e **backend em Node.js + Express**, utilizando SQLite como banco de dados.

---

## 🔄 Sobre esta versão

Este repositório é uma **remodelação e continuidade de um projeto originalmente desenvolvido em equipe**.

A versão inicial do MediCare Clinic foi desenvolvida em conjunto por:

* **Thiago da Silva**
* **Caio Vieira Santos**
* **Andrei Silva**

O projeto original pode ser acessado no repositório da equipe:

🔗 **[Repositório original — MediCareClinic](https://github.com/thigadasilva/MedicareClinic)**

Após o desenvolvimento da versão original, **Caio Vieira Santos** deu continuidade ao projeto individualmente, utilizando a aplicação desenvolvida pela equipe como base para uma nova etapa de desenvolvimento.

Nesta nova versão, o objetivo é **remodelar a aplicação, corrigir problemas identificados, aprimorar funcionalidades existentes e implementar novas funcionalidades**, além de utilizar o projeto como forma de aprofundar conhecimentos em desenvolvimento Full Stack.

> **Os créditos da equipe original são mantidos**, uma vez que esta versão parte do trabalho desenvolvido originalmente em conjunto.

---

## 🚀 Tecnologias Utilizadas

### Frontend

* Vue 3
* Vite
* Axios
* Vue Router
* Vuex
* Vue Cal

### Backend

* Node.js
* Express
* Sequelize
* SQLite
* JWT
* bcrypt
* CORS
* dotenv

### Ferramentas

* Git
* GitHub
* ESLint
* Prettier
* Visual Studio Code

---

## 📂 Estrutura do Projeto

```text
MedicareClinic/
├── src/                  # Código do frontend (Vue)
│   ├── components/
│   ├── services/
│   ├── views/
│   ├── router/
│   └── store/
│
├── server/               # Código do backend (Node/Express)
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── medicare.db
│
├── public/               # Arquivos estáticos
├── index.html            # Entrada do frontend
├── vite.config.js        # Configuração do Vite
├── package.json          # Dependências e scripts
├── package-lock.json
├── .env.example          # Exemplo de variáveis de ambiente
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

* **Node.js 18+**
* **npm**

O banco de dados utilizado é o **SQLite**, já integrado ao projeto.

---

## 📥 Instalação

### Clonar o repositório

```bash
git clone https://github.com/Caio-VieiraGit/MediCareClinic.git
```

### Entrar na pasta

```bash
cd MediCareClinic
```

### Instalar as dependências

```bash
npm install
```

---

## ▶️ Executando o Projeto

O projeto possui frontend e backend dentro do mesmo repositório e deve ser executado em **dois terminais**.

### 1. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto utilizando o `.env.example` como referência.

Exemplo:

```env
PORT=3000
DB_PATH=./server/medicare.db
JWT_SECRET=medicare_secret_dev
```

> Em ambientes de produção, utilize uma chave JWT segura e mantenha o arquivo `.env` fora do controle de versão.

---

### 2. Rodar o Backend

Abra um terminal na pasta do projeto e execute:

```bash
node server/app.js
```

O backend será iniciado em:

```text
http://localhost:3000
```

---

### 3. Rodar o Frontend

Abra **outro terminal** na pasta do projeto e execute:

```bash
npm run dev
```

O frontend será iniciado pelo Vite, normalmente em:

```text
http://localhost:5173
```

---

## 🔑 Funcionalidades Disponíveis

### 👥 Pacientes

* Cadastro de pacientes
* Edição de informações
* Consulta de dados
* Exclusão
* Histórico de consultas e atendimentos

### 📅 Consultas

* Agendamento de consultas
* Seleção de paciente
* Seleção de médico
* Definição de data e horário
* Tipos de consulta
* Controle de status
* Cancelamento de consultas
* Filtros de consultas
* Validação de conflitos de horário

### 🩺 Médicos e profissionais

* Cadastro de profissionais
* Listagem de médicos
* Gerenciamento de especialidades
* CRM
* Controle de perfis de acesso
* Ativação e desativação de profissionais

### 🏥 Atendimentos

* Registro de atendimento médico
* Anamnese
* Diagnóstico
* Prescrição
* Observações
* Histórico de atendimentos

### 📊 Dashboard

* Visão geral do sistema
* Estatísticas
* Consultas
* Pacientes
* Atendimentos

### 📈 Relatórios

* Estatísticas do sistema
* Consultas por status
* Pacientes frequentes
* Informações relacionadas aos atendimentos

### 🔐 Autenticação

* Login
* JWT
* Controle de acesso por perfil
* Proteção das rotas
* Senhas protegidas com bcrypt

---

## 🎯 Objetivo da Remodelação

A continuidade deste projeto tem como objetivo transformar a aplicação original em uma versão mais completa e estruturada, explorando novas funcionalidades e aprimorando aspectos técnicos do sistema.

Entre os objetivos estão:

* Melhorar a organização do código;
* Corrigir problemas encontrados na versão original;
* Aprimorar as regras de negócio;
* Melhorar a experiência do usuário;
* Implementar novas funcionalidades;
* Aprofundar conhecimentos em Vue.js e Node.js;
* Trabalhar com autenticação e autorização;
* Aprimorar conhecimentos em banco de dados e APIs REST;
* Praticar manutenção e evolução de uma aplicação existente.

---

## 👥 Créditos

### Projeto Original

**Equipe responsável pelo desenvolvimento original:**

* **Thiago da Silva**
* **Caio Vieira Santos**
* **Andrei Silva**

🔗 **Repositório original:**
https://github.com/thigadasilva/MedicareClinic

### Continuidade e Remodelação

**Caio Vieira Santos**

Responsável pela continuidade desta versão, incluindo remodelagem, correções, melhorias e implementação de novas funcionalidades a partir do projeto originalmente desenvolvido pela equipe.

---

## 📌 Status do Projeto

🚧 **Em desenvolvimento**

Esta versão está passando por um processo de remodelação e evolução em relação ao projeto original.

Novas funcionalidades, melhorias de interface, regras de negócio e aprimoramentos técnicos serão adicionados conforme o desenvolvimento avançar.

---

## 📄 Contexto

O MediCare Clinic foi originalmente desenvolvido como um projeto acadêmico para aplicação prática de conhecimentos em desenvolvimento de sistemas web.

A continuidade do projeto também possui caráter educacional e de portfólio, permitindo explorar conceitos de:

* Desenvolvimento Full Stack
* Vue.js
* Node.js
* Express
* APIs REST
* Sequelize
* SQLite
* JWT
* Autorização por perfil
* Regras de negócio
* UX/UI
* Git e GitHub

---
