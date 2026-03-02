# DeliveryApp - Documentação

Sistema de gerenciamento de entregas com backend Laravel 12 e quatro frontends React 19.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Instalação e Configuração](#instalação-e-configuração)
5. [Executando o Projeto](#executando-o-projeto)
6. [Banco de Dados](#banco-de-dados)
7. [API REST](#api-rest)
8. [Aplicações Frontend](#aplicações-frontend)
9. [Fluxo de Entrega](#fluxo-de-entrega)
10. [Testes](#testes)
11. [Credenciais de Teste](#credenciais-de-teste)

---

## Visão Geral

O **DeliveryApp** é um sistema completo para gerenciamento de entregas, permitindo que clientes solicitem entregas, entregadores aceitem e realizem as entregas, e destinatários acompanhem o status em tempo real.

### Papéis de Usuário

| Papel | Descrição |
|-------|-----------|
| **Cliente** | Cria solicitações de entrega, acompanha o status e compartilha link de rastreamento |
| **Entregador** | Aceita solicitações, realiza entregas e envia localização em tempo real |
| **Root** | Administrador do sistema, visualiza estatísticas, logs e gerencia usuários |
| **Público** | Qualquer pessoa com link de rastreamento pode acompanhar a entrega |

### Aplicações do Sistema

O sistema é composto por **1 backend** e **4 frontends**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DeliveryApp                              │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Laravel 12)                                           │
│  └── API REST em /api/v1/                                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontends (React 19)                                           │
│  ├── client-app       → App para clientes                      │
│  ├── deliverer-app    → App para entregadores                  │
│  ├── shared-trip-app  → Página de rastreamento público         │
│  └── root-app         → Painel administrativo                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológica

### Backend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **PHP** | 8.2+ | Linguagem de programação |
| **Laravel** | 12.x | Framework PHP para APIs |
| **SQLite** | 3.x | Banco de dados (desenvolvimento) |
| **Laravel Sanctum** | 4.x | Autenticação via tokens |
| **L5-Swagger** | 9.x | Documentação OpenAPI |
| **PHPUnit** | 11.x | Testes automatizados |
| **Laravel Pint** | 1.x | Formatação de código |

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **React** | 19.x | Biblioteca de UI |
| **Vite** | 7.x | Build tool e dev server |
| **React Router** | 7.x | Roteamento SPA |
| **Axios** | 1.x | Cliente HTTP |
| **Leaflet** | 1.9.x | Mapas interativos |
| **React-Leaflet** | 5.x | Componentes React para Leaflet |
| **ESLint** | 9.x | Linting de código |

### Dependências de Sistema

- **Node.js** 20+ com NPM 10+
- **PHP** 8.2+ com extensões: `pdo_sqlite`, `mbstring`, `openssl`, `xml`
- **Composer** 2.x

---

## Arquitetura do Sistema

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USUÁRIOS                                  │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│   Cliente   │  Entregador │    Root     │       Público           │
│  (Browser)  │  (Browser)  │  (Browser)  │      (Browser)          │
└──────┬──────┴──────┬──────┴──────┬──────┴───────────┬─────────────┘
       │             │             │                  │
       ▼             ▼             ▼                  ▼
┌──────────────┬──────────────┬──────────────┬────────────────────┐
│ client-app   │deliverer-app │  root-app    │ shared-trip-app    │
│  :3000       │   :3001      │   :3003      │     :3002          │
│              │              │              │                    │
│ React 19     │ React 19     │ React 19     │   React 19         │
│ + Leaflet    │ + Leaflet    │              │   + Leaflet        │
└──────┬───────┴──────┬───────┴──────┬───────┴─────────┬──────────┘
       │              │              │                 │
       └──────────────┴──────────────┴─────────────────┘
                              │
                              ▼ HTTP (REST API)
              ┌───────────────────────────────────────┐
              │           Backend Laravel             │
              │              :8000                    │
              │                                       │
              │  ┌─────────────────────────────────┐  │
              │  │         API Routes              │  │
              │  │  /api/v1/auth/*                 │  │
              │  │  /api/v1/client/*               │  │
              │  │  /api/v1/deliverer/*            │  │
              │  │  /api/v1/root/*                 │  │
              │  │  /api/v1/track/{token}          │  │
              │  └─────────────────────────────────┘  │
              │                  │                    │
              │                  ▼                    │
              │  ┌─────────────────────────────────┐  │
              │  │         SQLite Database         │  │
              │  │    database/database.sqlite     │  │
              │  └─────────────────────────────────┘  │
              └───────────────────────────────────────┘
```

### Estrutura de Pastas

```
deliveryApp/
├── backend/                    # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # Controladores da API
│   │   │   ├── Middleware/    # Middlewares customizados
│   │   │   ├── Requests/      # Form Requests (validação)
│   │   │   └── Resources/     # API Resources (transformação)
│   │   └── Models/            # Modelos Eloquent
│   ├── database/
│   │   ├── migrations/        # Migrações do banco
│   │   └── seeders/           # Seeds de dados
│   ├── routes/
│   │   └── api.php            # Rotas da API
│   └── tests/                 # Testes PHPUnit
│
├── client-app/                # Frontend do Cliente
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── hooks/             # Hooks customizados
│   │   ├── services/          # API service (Axios)
│   │   └── context/           # React Context
│   └── package.json
│
├── deliverer-app/             # Frontend do Entregador
│   └── (mesma estrutura de client-app)
│
├── shared-trip-app/           # Rastreamento Público
│   └── (mesma estrutura de client-app)
│
├── root-app/                  # Painel Administrativo
│   └── (mesma estrutura de client-app)
│
├── docs/                      # Documentação
│   └── README.md              # Este arquivo
│
└── schema.sql                 # Schema do banco de dados
```

### Portas dos Serviços

| Serviço | Porta | URL |
|---------|-------|-----|
| Backend API | 8000 | http://localhost:8000 |
| Client App | 3000 | http://localhost:3000 |
| Deliverer App | 3001 | http://localhost:3001 |
| Shared Trip App | 3002 | http://localhost:3002 |
| Root App | 3003 | http://localhost:3003 |
| Swagger Docs | 8000 | http://localhost:8000/api/documentation |

---

## Instalação e Configuração

### Pré-requisitos

```bash
# Verificar versões instaladas
php -v        # PHP 8.2+
node -v       # Node.js 20+
npm -v        # NPM 10+
composer -V   # Composer 2+
```

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio> deliveryApp
cd deliveryApp
```

### 2. Configurar o Backend

```bash
cd backend

# Instalar dependências PHP
composer install

# Copiar arquivo de ambiente
cp .env.example .env

# Gerar chave da aplicação
php artisan key:generate

# Criar banco de dados SQLite
touch database/database.sqlite

# Executar migrações
php artisan migrate

# Popular com dados de teste
php artisan db:seed

# Gerar documentação Swagger (opcional)
php artisan l5-swagger:generate
```

#### Configuração do `.env`

```env
APP_NAME=DeliveryApp
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/caminho/absoluto/para/backend/database/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001,localhost:3002,localhost:3003
```

### 3. Configurar os Frontends

Cada frontend precisa ser configurado individualmente:

```bash
# Client App (porta 3000)
cd client-app
npm install

# Deliverer App (porta 3001)
cd ../deliverer-app
npm install

# Shared Trip App (porta 3002)
cd ../shared-trip-app
npm install

# Root App (porta 3003)
cd ../root-app
npm install
```

---

## Executando o Projeto

### Iniciar Todos os Serviços

Abra **5 terminais** e execute:

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
# Servidor em http://localhost:8000
```

**Terminal 2 - Client App:**
```bash
cd client-app
npm run dev
# Aplicação em http://localhost:3000
```

**Terminal 3 - Deliverer App:**
```bash
cd deliverer-app
npm run dev
# Aplicação em http://localhost:3001
```

**Terminal 4 - Shared Trip App:**
```bash
cd shared-trip-app
npm run dev
# Aplicação em http://localhost:3002
```

**Terminal 5 - Root App:**
```bash
cd root-app
npm run dev
# Aplicação em http://localhost:3003
```

### Scripts Disponíveis

#### Backend (Composer/Artisan)

| Comando | Descrição |
|---------|-----------|
| `php artisan serve` | Inicia o servidor de desenvolvimento |
| `php artisan migrate` | Executa migrações do banco |
| `php artisan migrate:fresh --seed` | Recria banco e popula com dados |
| `php artisan db:seed` | Popula banco com dados de teste |
| `php artisan test` | Executa testes automatizados |
| `php artisan l5-swagger:generate` | Gera documentação Swagger |
| `./vendor/bin/pint` | Formata código PHP |

#### Frontend (NPM)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run preview` | Visualiza build de produção |
| `npm run lint` | Verifica código com ESLint |

---

## Banco de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    usuario      │       │     cliente     │       │   entregador    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ idusuario (PK)  │──┐    │ idcliente (PK)  │       │ identregador(PK)│
│ name            │  │    │ usuario_id (FK) │───────│ usuario_id (FK) │
│ email           │  │    │ status          │       │ status          │
│ password        │  └────│                 │       │ current_loc_id  │
│ role            │       └────────┬────────┘       │ motorcycle_id   │
└─────────────────┘                │                └────────┬────────┘
                                   │                         │
                                   ▼                         │
┌─────────────────┐       ┌─────────────────┐                │
│    location     │       │   solicitacao   │                │
├─────────────────┤       ├─────────────────┤                │
│ idlocation (PK) │◄──────│ idsolicitacao   │                │
│ latitude        │       │ cliente_id (FK) │                │
│ longitude       │       │ pickup_loc_id   │                │
│ created_at      │       │ dropoff_loc_id  │                │
└─────────────────┘       │ status          │                │
                          │ checkin_code    │                │
                          │ item_*          │                │
                          └────────┬────────┘                │
                                   │                         │
                                   ▼                         │
┌─────────────────┐       ┌─────────────────┐                │
│ delivery_share  │       │     entrega     │                │
├─────────────────┤       ├─────────────────┤                │
│ id (PK)         │◄──────│ identrega (PK)  │                │
│ entrega_id (FK) │       │ solicitacao_id  │◄───────────────┘
│ share_token     │       │ entregador_id   │
│ checkout_code   │       │ status          │
│ checkout_visible│       │ checkin_at      │
└─────────────────┘       │ checkout_at     │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   motorcycle    │       │  status_history │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ entregador_id   │       │ entity_type     │
│ plate           │       │ entity_id       │
│ model           │       │ from_status     │
│ color           │       │ to_status       │
└─────────────────┘       │ changed_at      │
                          └─────────────────┘
```

### Tabelas Principais

#### `usuario`
Tabela central de autenticação. Todos os usuários (clientes, entregadores, root) possuem um registro aqui.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idusuario` | INTEGER PK | ID único do usuário |
| `name` | VARCHAR | Nome completo |
| `email` | VARCHAR | E-mail (único) |
| `password` | VARCHAR | Senha hasheada (bcrypt) |
| `role` | ENUM | `cliente`, `entregador`, `root` |

#### `cliente`
Perfil específico de clientes.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idcliente` | INTEGER PK | ID único do cliente |
| `usuario_idusuario` | INTEGER FK | Referência ao usuário |
| `status` | ENUM | `active`, `blocked` |

#### `entregador`
Perfil específico de entregadores.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `identregador` | INTEGER PK | ID único do entregador |
| `usuario_idusuario` | INTEGER FK | Referência ao usuário |
| `status` | ENUM | `offline`, `online`, `busy` |
| `current_location_id` | INTEGER FK | Localização atual |
| `motorcycle_id` | INTEGER FK | Moto do entregador |

#### `solicitacao`
Solicitações de entrega criadas por clientes.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idsolicitacao` | INTEGER PK | ID único da solicitação |
| `cliente_idcliente` | INTEGER FK | Cliente que solicitou |
| `pickup_location_id` | INTEGER FK | Local de retirada |
| `dropoff_location_id` | INTEGER FK | Local de entrega |
| `status` | ENUM | Status da solicitação |
| `checkin_code` | VARCHAR(6) | Código de check-in |
| `item_type` | VARCHAR | Tipo do item |
| `item_weight_kg` | DECIMAL | Peso em kg |
| `item_height_cm`, `item_width_cm`, `item_length_cm` | DECIMAL | Dimensões |
| `item_notes` | TEXT | Observações |

#### `entrega`
Entregas em andamento ou concluídas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `identrega` | INTEGER PK | ID único da entrega |
| `solicitacao_idsolicitacao` | INTEGER FK | Solicitação relacionada |
| `entregador_identregador` | INTEGER FK | Entregador responsável |
| `status` | ENUM | Status da entrega |
| `checkin_at` | TIMESTAMP | Data/hora do check-in |
| `checkout_at` | TIMESTAMP | Data/hora do checkout |

### Enums de Status

#### Status do Cliente (`cliente.status`)
| Valor | Descrição |
|-------|-----------|
| `active` | Cliente ativo, pode criar solicitações |
| `blocked` | Cliente bloqueado pelo administrador |

#### Status do Entregador (`entregador.status`)
| Valor | Descrição |
|-------|-----------|
| `offline` | Não disponível para entregas |
| `online` | Disponível, aguardando solicitações |
| `busy` | Ocupado com entrega em andamento |

#### Status da Solicitação (`solicitacao.status`)
| Valor | Descrição |
|-------|-----------|
| `requested` | Aguardando entregador aceitar |
| `accepted` | Entregador aceitou, indo buscar |
| `canceled` | Cancelada pelo cliente ou entregador |
| `expired` | Expirada (sem aceitação) |
| `fulfilled` | Entrega concluída com sucesso |

#### Status da Entrega (`entrega.status`)
| Valor | Descrição |
|-------|-----------|
| `checkin_pending` | Aguardando check-in no local de retirada |
| `in_progress` | Entrega em andamento |
| `completed` | Entrega concluída |
| `canceled` | Entrega cancelada |

---

## API REST

### Base URL

```
http://localhost:8000/api/v1
```

### Autenticação

A API utiliza **Laravel Sanctum** com tokens Bearer. Após login, inclua o token em todas as requisições autenticadas:

```http
Authorization: Bearer {token}
```

### Documentação Swagger

Acesse a documentação interativa em:
```
http://localhost:8000/api/documentation
```

### Grupos de Endpoints

#### Auth (`/api/v1/auth/*`)
Endpoints públicos de autenticação.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registro de novo usuário |
| POST | `/auth/login` | Login e obtenção de token |
| POST | `/auth/logout` | Logout (invalida token) |
| GET | `/auth/me` | Dados do usuário autenticado |

#### Client (`/api/v1/client/*`)
Requer autenticação com `role:cliente`.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/client/profile` | Perfil do cliente |
| GET | `/client/requests` | Listar solicitações do cliente |
| GET | `/client/requests/active` | Solicitação ativa atual |
| POST | `/client/requests` | Criar nova solicitação |
| DELETE | `/client/requests/{id}` | Cancelar solicitação |
| GET | `/client/requests/{id}/tracking` | Rastreamento da entrega |
| POST | `/client/requests/{id}/share` | Gerar link de compartilhamento |

#### Deliverer (`/api/v1/deliverer/*`)
Requer autenticação com `role:entregador`.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/deliverer/profile` | Perfil do entregador |
| PUT | `/deliverer/status` | Atualizar status (online/offline) |
| PUT | `/deliverer/location` | Atualizar localização GPS |
| GET | `/deliverer/motorcycle` | Dados da moto |
| POST | `/deliverer/motorcycle` | Cadastrar moto |
| PUT | `/deliverer/motorcycle` | Atualizar moto |
| GET | `/deliverer/requests` | Solicitações disponíveis |
| POST | `/deliverer/requests/{id}/accept` | Aceitar solicitação |
| GET | `/deliverer/delivery` | Entrega ativa atual |
| POST | `/deliverer/delivery/checkin` | Check-in (início da entrega) |
| POST | `/deliverer/delivery/checkout` | Checkout (conclusão) |
| POST | `/deliverer/delivery/cancel` | Cancelar entrega |

#### Root (`/api/v1/root/*`)
Requer autenticação com `role:root`.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/root/dashboard/stats` | Estatísticas do sistema |
| GET | `/root/users` | Listar todos os usuários |
| GET | `/root/requests` | Listar todas as solicitações |
| GET | `/root/deliveries` | Listar todas as entregas |
| GET | `/root/logs` | Logs de status do sistema |

#### Tracking (`/api/v1/track/*`)
Endpoint público para rastreamento.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/track/{token}` | Dados de rastreamento público |

### Exemplo de Requisição

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@deliveryapp.com", "password": "password123"}'

# Resposta
{
  "user": {
    "id": 2,
    "name": "Cliente Teste",
    "email": "cliente@deliveryapp.com",
    "role": "cliente"
  },
  "token": "1|abc123xyz..."
}

# Criar solicitação (com token)
curl -X POST http://localhost:8000/api/v1/client/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|abc123xyz..." \
  -d '{
    "item_type": "Documentos",
    "item_notes": "Envelope lacrado",
    "pickup_latitude": -23.5505,
    "pickup_longitude": -46.6333,
    "dropoff_latitude": -23.5629,
    "dropoff_longitude": -46.6544
  }'
```

---

## Aplicações Frontend

### Client App (Porta 3000)

**Público-alvo:** Clientes que solicitam entregas.

**Funcionalidades:**
- Registro e login
- Criar nova solicitação de entrega (fluxo em 2 etapas)
- Visualizar solicitação ativa com mapa de rastreamento
- Acompanhar status em tempo real
- Ver código de check-in (para o entregador)
- Gerar link de compartilhamento
- Histórico de solicitações
- Cancelar solicitações pendentes

**Páginas principais:**
- `/login` - Login
- `/register` - Cadastro
- `/` - Dashboard (solicitação ativa ou nova)
- `/new-request` - Criar solicitação (2 etapas)
- `/requests/:id` - Detalhes da solicitação
- `/history` - Histórico

### Deliverer App (Porta 3001)

**Público-alvo:** Entregadores de moto.

**Funcionalidades:**
- Registro e login
- Cadastrar motocicleta
- Toggle online/offline
- Ver solicitações disponíveis
- Aceitar solicitação
- Navegar até local de retirada (abre Google Maps)
- Inserir código de check-in
- Navegar até destino
- Inserir código de checkout
- Enviar localização em tempo real

**Páginas principais:**
- `/login` - Login
- `/register` - Cadastro
- `/` - Dashboard (toggle status + solicitações)
- `/motorcycle` - Cadastrar/editar moto
- `/delivery` - Entrega ativa
- `/history` - Histórico

### Shared Trip App (Porta 3002)

**Público-alvo:** Destinatários (público).

**Funcionalidades:**
- Visualizar status da entrega
- Acompanhar localização do entregador no mapa
- Ver código de checkout (quando visível)
- Não requer login

**Páginas principais:**
- `/track/:token` - Rastreamento público

### Root App (Porta 3003)

**Público-alvo:** Administradores.

**Funcionalidades:**
- Dashboard com estatísticas
- Lista de usuários
- Lista de solicitações
- Lista de entregas
- Logs de alterações de status

**Páginas principais:**
- `/login` - Login
- `/` - Dashboard
- `/users` - Usuários
- `/requests` - Solicitações
- `/deliveries` - Entregas
- `/logs` - Logs

---

## Fluxo de Entrega

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CLIENTE   │     │ ENTREGADOR  │     │ DESTINATÁRIO│
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  1. Cria          │                   │
       │  solicitação      │                   │
       │  ──────────────►  │                   │
       │                   │                   │
       │  [status: requested]                  │
       │                   │                   │
       │                   │  2. Aceita        │
       │                   │  solicitação      │
       │  ◄────────────────│                   │
       │                   │                   │
       │  [status: accepted]                   │
       │                   │                   │
       │  3. Exibe código  │                   │
       │  de CHECK-IN      │                   │
       │  123456           │                   │
       │                   │                   │
       │                   │  4. Vai até       │
       │                   │  local de         │
       │                   │  retirada         │
       │                   │                   │
       │  5. Informa       │                   │
       │  código 123456    │                   │
       │  ──────────────►  │                   │
       │                   │                   │
       │                   │  6. Insere        │
       │                   │  código CHECK-IN  │
       │                   │                   │
       │  [entrega: in_progress]               │
       │                   │                   │
       │  7. Gera link     │                   │
       │  de compartilhar  │  8. Entregador    │
       │  ──────────────────────────────────►  │
       │                   │  vai até destino  │
       │                   │                   │
       │                   │                   │  9. Acessa link
       │                   │                   │  vê mapa + código
       │                   │                   │  CHECKOUT: 654321
       │                   │                   │
       │                   │  10. Destinatário │
       │                   │  ◄────────────────│
       │                   │  informa código   │
       │                   │  654321           │
       │                   │                   │
       │                   │  11. Insere       │
       │                   │  código CHECKOUT  │
       │                   │                   │
       │  [entrega: completed]                 │
       │  [solicitacao: fulfilled]             │
       │                   │                   │
       ▼                   ▼                   ▼
```

### Resumo dos Códigos

| Código | Quem gera | Quem informa | Quem insere | Quando |
|--------|-----------|--------------|-------------|--------|
| **Check-in** (6 dígitos) | Sistema ao criar solicitação | Cliente para Entregador | Entregador no app | Na retirada do pacote |
| **Checkout** (6 dígitos) | Sistema ao criar link de compartilhamento | Destinatário para Entregador | Entregador no app | Na entrega do pacote |

---

## Testes

### Backend

```bash
cd backend

# Executar todos os testes
php artisan test

# Executar teste específico
php artisan test --filter=AuthTest

# Com cobertura (requer Xdebug)
php artisan test --coverage
```

**Cobertura de testes:**
- 28 testes
- 103 asserções
- Cobertura: Auth, Client, Deliverer flows

### Frontend

```bash
cd client-app  # ou deliverer-app, etc.

# Lint
npm run lint
```

---

## Credenciais de Teste

Após executar `php artisan db:seed`, os seguintes usuários estarão disponíveis:

| E-mail | Senha | Role | App |
|--------|-------|------|-----|
| `root@deliveryapp.com` | `password123` | root | root-app |
| `cliente@deliveryapp.com` | `password123` | cliente | client-app |
| `entregador@deliveryapp.com` | `password123` | entregador | deliverer-app |

---

## Licença

Este projeto foi desenvolvido para fins educacionais no SENAI.

---

*Documentação atualizada em: Julho 2025*
