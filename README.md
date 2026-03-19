# Client Manager - Frontend

Frontend React para a API Client Manager.

## Tecnologias

- **React 18** + **Vite**
- **Ant Design 5** (componentes UI)
- **React Router 6** (rotas protegidas)
- **Axios** (HTTP client com interceptor JWT)
- **Context API** (estado de autenticação)

## Pré-requisitos

- **Node.js 18+**
- **Backend rodando** em `http://localhost:8080`

## Setup

```bash
git clone https://github.com/Satsuj1n/Desafio-SEA-FrontEnd.git
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Estrutura

```
src/
├── api/
│   ├── axios.js          # Instância Axios com interceptor JWT
│   └── services.js       # Funções de chamada à API
├── context/
│   └── AuthContext.jsx    # Provider de autenticação (login, logout, role)
├── components/
│   ├── AppLayout.jsx      # Layout com sidebar e header
│   └── ProtectedRoute.jsx # Guarda de rota autenticada
├── pages/
│   ├── LoginPage.jsx      # Tela de login
│   ├── ClientListPage.jsx # Listagem com busca, CRUD
│   └── ClientFormModal.jsx# Modal de criação/edição com consulta CEP
├── utils/
│   └── masks.js           # Máscaras de CPF, CEP, telefone
├── App.jsx                # Configuração de rotas
├── main.jsx               # Entry point com ConfigProvider Ant Design
└── index.css              # Reset CSS
```

## Funcionalidades

- **Login/Logout** com JWT
- **CRUD de clientes** (criar, listar, editar, excluir)
- **Consulta de CEP** com preenchimento automático
- **Máscaras** em CPF, CEP e telefone (input em tempo real)
- **Controle de acesso**: USER vê apenas listagem, ADMIN vê botões de ação
- **Busca** por nome, CPF ou e-mail
- **Telefones e e-mails dinâmicos** (adicionar/remover)
