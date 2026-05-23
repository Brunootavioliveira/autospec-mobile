# AutoSpec Intelligence Platform

> **Plataforma de inteligência competitiva automotiva** — coleta, padroniza e analisa especificações técnicas de veículos concorrentes com o apoio de Inteligência Artificial.

🔗 **Demo ao vivo:** [autospec-mobile.vercel.app](https://autospec-mobile.vercel.app)  
🏗️ **Backend:** AWS EC2 (Ubuntu 26.04 + Docker)  
📦 **Repositório backend:** [github.com/Brunootavioliveira/autospec-intelligence-platform](https://github.com/Brunootavioliveira/autospec-intelligence-platform)

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Segurança](#segurança)
- [Estrutura do Frontend](#estrutura-do-frontend)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Deploy em Produção](#deploy-em-produção)
- [Papéis e Permissões (RBAC)](#papéis-e-permissões-rbac)
- [Endpoints da API](#endpoints-da-api)

---

## Sobre o Projeto

O **AutoSpec Intelligence** resolve um problema real enfrentado por analistas da Ford: o processo manual de coleta de especificações técnicas de veículos concorrentes consome cerca de **1 hora por versão**. Com a plataforma, esse processo é reduzido a **segundos**, com dados padronizados, comparáveis e sempre no mesmo formato.

O sistema foi desenvolvido como projeto acadêmico para a Ford, cobrindo múltiplas disciplinas: backend, frontend, inteligência artificial, cibersegurança e infraestrutura em nuvem.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    AWS EC2 (Docker)                      │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Nginx   │───▶│ Spring Boot  │───▶│  PostgreSQL   │  │
│  │ TLS 1.3  │    │  (porta 8080)│    │  (porta 5432) │  │
│  └──────────┘    └──────┬───────┘    └───────────────┘  │
│       ▲                 │            ┌───────────────┐  │
│       │                 ├───────────▶│     Redis     │  │
│  HTTPS 8443             │            │  (porta 6379) │  │
│                         │            └───────────────┘  │
│                         ▼                               │
│                  ┌──────────────┐                       │
│                  │  AI Service  │                       │
│                  │  FastAPI/Py  │                       │
│                  │  (porta 5000)│                       │
│                  └──────────────┘                       │
└─────────────────────────────────────────────────────────┘
           ▲
           │ HTTPS
           │
┌──────────────────┐
│  Vercel (Front)  │
│  React + Vite    │
│  autospec-mobile │
│  .vercel.app     │
└──────────────────┘
```

---

## Funcionalidades

### 🤖 Geração de Specs com IA
- Gera especificações técnicas completas de qualquer veículo via IA (marca, modelo, versão, ano)
- Retorna motor, potência, torque, tração, dimensões, peso, autonomia e preço estimado
- Cache automático no Redis — segunda consulta do mesmo veículo é instantânea
- Histórico de todas as specs geradas salvo no banco

### 🔍 Catálogo de Veículos
- Listagem paginada com busca textual e filtros (marca, ano, potência)
- Cards com indicador de combustível (elétrico ⚡, híbrido 🔋, diesel ⛽, gasolina 🛢)
- Visualização detalhada com radar de performance

### ⚖️ Comparação Técnica
- Comparação lado a lado entre dois veículos por ID ou spec
- Score automático por atributo com vencedor destacado
- Salvar comparações para consulta futura

### 📊 Análise Avançada
- Power-to-weight ratio (kg/kW)
- Track Handling Score
- Percentis populacionais em relação à base de dados

### 🚗 Garage Pessoal
- Frota pessoal (`PERSONAL`) e profissional (`WORK`)
- Apelido customizado por veículo
- Insights automáticos: total de veículos, mais potente, mais pesado
- Soft delete preserva histórico

### 📋 Histórico de Atividades
- Registro automático de análises, comparações e service records
- Filtro por tipo de ação
- Soft delete com opção de limpar tudo

### 📄 Relatórios em PDF
- **Comparison Report**: comparação completa entre dois veículos com parâmetros selecionáveis (ENGINE, PERFORMANCE, PRICE, SAFETY, DIMENSIONS)
- **Vehicle Dossier**: dossiê completo de um único veículo
- Download via link com expiração após o primeiro uso

### ⚙️ Configurações e Segurança
- Edição de perfil e troca de senha
- Gerenciamento de sessões ativas com revogação individual ou em massa
- Exibição de IP, browser e dispositivo por sessão

### 👑 Painel Administrativo
- Listagem de todos os usuários
- Alteração de roles em tempo real (VIEWER → ANALYST → ADMIN)

---

## Stack Tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18.3 | Framework UI |
| Vite | 5.3 | Build tool e dev server |
| React Router DOM | 6.24 | Roteamento client-side |
| Axios | 1.7 | Requisições HTTP |
| Zustand | 4.5 | Gerenciamento de estado |
| Lucide React | 1.16 | Ícones |
| CryptoJS | 4.2 | Geração de assinatura HMAC |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Java | 17 | Linguagem |
| Spring Boot | 3.4.1 | Framework principal |
| Spring Security | 6.4 | Autenticação e autorização |
| Spring Data JPA | — | Persistência |
| Spring Cache + Redis | — | Cache distribuído |
| Flyway | 10.x | Migrations de banco |
| MapStruct | 1.5.5 | Mapeamento de DTOs |
| jjwt | 0.12.6 | Geração e validação de JWT |
| Bucket4j | — | Rate limiting |
| springdoc-openapi | 2.8 | Documentação Swagger |
| Lombok | — | Redução de boilerplate |

### Infraestrutura
| Tecnologia | Uso |
|---|---|
| Docker + Docker Compose | Containerização de todos os serviços |
| Nginx | Reverse proxy + TLS 1.2/1.3 |
| PostgreSQL 15 | Banco de dados relacional |
| Redis 7 | Cache e sessões |
| AWS EC2 (t3.micro) | Hospedagem do backend |
| Vercel | Hospedagem do frontend |
| Let's Encrypt / Cert autoassinado | HTTPS |

### IA
| Tecnologia | Uso |
|---|---|
| Python + FastAPI | Microserviço de IA |
| Gemini API (Google) | Modelo de linguagem para geração de specs |

---

## Segurança

O projeto implementa todos os requisitos do Sprint de Cybersecurity:

### 1. Validação de Entrada (20/20 pts)
- `@Size`, `@Min`, `@Max`, `@Email`, `@NotBlank` em todos os DTOs
- JPA com queries parametrizadas — SQL Injection bloqueado
- Handler 500 sem exposição de stack trace ou tecnologia
- Limite de tamanho de request (1MB via Tomcat + Nginx)

### 2. Autenticação e Autorização (20/20 pts)
- JWT com assinatura HMAC-SHA512, expiração configurável
- Refresh token com rotação automática e logout seguro
- BCrypt para hash de senhas
- RBAC com 3 roles: `ADMIN`, `ANALYST`, `VIEWER`
- Sessão STATELESS — nenhum estado no servidor

### 3. Proteção de APIs (19/20 pts)
- **Rate Limiting** via Bucket4j: 5 req/min por IP no login, 10 req/min por usuário na geração de specs
- **CORS** configurado com lista de origens permitidas — sem wildcard `*`
- **HTTPS** obrigatório via Nginx (TLS 1.2 e 1.3) com redirect HTTP → HTTPS
- **HMAC-SHA256** com proteção anti-replay (janela de 5 minutos) em endpoints críticos

### 4. Segurança de Dados (24/25 pts)
- **AES/GCM/NoPadding** com IV aleatório para dados pessoais em repouso (nome e email)
- BCrypt para senhas
- Todas as credenciais por variáveis de ambiente — zero hardcode
- **DataRetentionJob** com `@Scheduled` — deleta specs antigas automaticamente
- Perfis `dev` e `prod` separados — `show-sql: false` em produção

### 5. Monitoramento e Auditoria (15/15 pts)
- `@Slf4j` com logs estruturados em todos os services críticos
- **JPA Auditing** com `@CreatedBy`, `@CreatedDate`, `@LastModifiedBy`, `@LastModifiedDate`
- `AuditorAwareImpl` popula automaticamente o email do usuário autenticado
- Trilha de auditoria via `UserHistory` para análises, comparações e service records

---

## Estrutura do Frontend

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx       # Layout principal com sidebar
│   │   ├── AuthGate.jsx        # Controle de acesso às rotas auth
│   │   ├── MobileNav.jsx       # Navegação mobile
│   │   ├── ProtectedRoute.jsx  # Guarda de rotas autenticadas
│   │   ├── Sidebar.jsx         # Menu lateral desktop
│   │   └── Topbar.jsx          # Barra superior
│   ├── shared/
│   │   └── VehicleSpecForm.jsx # Formulário reutilizável de geração
│   └── ui/
│       ├── CarouselHeader.jsx  # Header com carrossel de veículos
│       ├── Modal.jsx           # Modal genérico
│       ├── RadarChart.jsx      # Gráfico radar de performance
│       └── Skeleton.jsx        # Loading states
├── context/
│   ├── AuthContext.jsx         # Estado global de autenticação
│   └── ToastContext.jsx        # Sistema de notificações
├── hooks/
│   └── useAsync.js             # Hook genérico para chamadas assíncronas
├── pages/
│   ├── AdminPage.jsx           # Painel administrativo
│   ├── AnalyzePage.jsx         # Análise técnica avançada
│   ├── ComparePage.jsx         # Comparação entre veículos
│   ├── GaragePage.jsx          # Frota pessoal/profissional
│   ├── GeneratePage.jsx        # Geração de specs com IA
│   ├── HistoryPage.jsx         # Histórico de atividades
│   ├── HomePage.jsx            # Dashboard principal
│   ├── LoginPage.jsx           # Login
│   ├── RegisterPage.jsx        # Cadastro
│   ├── ReportsPage.jsx         # Geração de PDFs
│   ├── SettingsPage.jsx        # Configurações e segurança
│   └── VehiclesPage.jsx        # Catálogo de veículos
├── services/
│   ├── api.js                  # Axios + interceptors de auth e refresh
│   └── index.js                # Serviços por domínio
└── utils/
    └── hmac.js                 # Geração de assinatura HMAC-SHA256
```

---

## Variáveis de Ambiente

### Frontend (`.env`)
```env
VITE_API_URL=/api/v1                          # Relativo para dev (proxy Vite)
                                               # URL absoluta para produção
VITE_HMAC_SECRET=sua-chave-hmac-aqui
```

### Backend (`infra/docker/.env`)
```env
POSTGRES_DB=autospec_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua-senha-segura

JWT_SECRET=sua-chave-jwt-minimo-32-caracteres
JWT_EXPIRATION=86400000                        # 24h em ms

HMAC_SECRET=sua-chave-hmac-igual-ao-frontend

DB_CRYPTO_KEY=chave-aes-32-bytes-exata

FRONTEND_URL=https://autospec-mobile.vercel.app
```

---

## Como Rodar Localmente

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 20+
- Java 17+ (opcional, o Docker já inclui)

### 1. Clone o repositório
```bash
git clone https://github.com/Brunootavioliveira/autospec-intelligence-platform.git
cd autospec-intelligence-platform
```

### 2. Configure as variáveis de ambiente
```bash
cp infra/docker/.env.example infra/docker/.env
# edite o arquivo com seus valores
```

### 3. Gere os certificados SSL (desenvolvimento)
```bash
mkdir -p infra/docker/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infra/docker/nginx/certs/key.pem \
  -out infra/docker/nginx/certs/cert.pem \
  -subj "/CN=localhost"
```

### 4. Suba os containers
```bash
cd infra/docker
docker compose up -d --build
```

### 5. Inicie o frontend
```bash
cd autospec-ai
npm install
npm run dev
```

Acesse: `http://localhost:5173`

### 6. Acesse o Swagger
```
https://localhost:8443/swagger-ui.html
```

---

## Deploy em Produção

### Backend (AWS EC2)

```bash
# Conectar na EC2
ssh -i ~/.ssh/autospec-key.pem ubuntu@SEU_IP

# Clonar o projeto
git clone https://github.com/Brunootavioliveira/autospec-intelligence-platform.git
cd autospec-intelligence-platform/infra/docker

# Configurar variáveis
nano .env

# Gerar certificados
mkdir -p nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/key.pem \
  -out nginx/certs/cert.pem \
  -subj "/CN=SEU_IP"

# Subir tudo
sudo docker compose up -d --build
```

### Frontend (Vercel)

1. Conecte o repositório do frontend na Vercel
2. Configure as variáveis de ambiente no painel da Vercel:
   - `VITE_API_URL` = `https://SEU_IP_EC2:8443/api/v1`
   - `VITE_HMAC_SECRET` = mesmo valor do backend
3. O deploy é automático a cada push na branch `main`

---

## Papéis e Permissões (RBAC)

| Ação | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| Consultar specs | ✅ | ✅ | ✅ |
| Buscar veículos | ✅ | ✅ | ✅ |
| Comparar veículos | ✅ | ✅ | ✅ |
| Analisar veículos | ✅ | ✅ | ✅ |
| Gerar specs com IA | ❌ | ✅ | ✅ |
| Gerar relatórios PDF | ❌ | ✅ | ✅ |
| Gerenciar garage | ✅ | ✅ | ✅ |
| Deletar specs | ❌ | ❌ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ✅ |

---

## Endpoints da API

A documentação completa está disponível via Swagger em `/swagger-ui.html`.

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/v1/auth/register` | Criar conta |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Renovar access token |
| POST | `/api/v1/auth/logout` | Logout |

### Veículos
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/v1/vehicles/spec` | Gerar spec com IA |
| GET | `/api/v1/vehicles/spec` | Listar specs (paginado) |
| GET | `/api/v1/vehicles/spec/{id}` | Buscar por ID |
| GET | `/api/v1/vehicles/spec/search` | Busca com filtros |
| GET | `/api/v1/vehicles/spec/compare` | Comparar por ID |
| POST | `/api/v1/vehicles/spec/compare` | Comparar por spec |
| DELETE | `/api/v1/vehicles/spec/{id}` | Deletar (ADMIN) |

### Análise e Comparação
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/analysis/{vehicleId}` | Análise técnica completa |
| POST | `/api/v1/comparisons/saved` | Salvar comparação |
| GET | `/api/v1/comparisons/saved` | Listar salvas |
| DELETE | `/api/v1/comparisons/saved/{id}` | Remover |

### Garage
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/v1/garage` | Adicionar veículo |
| GET | `/api/v1/garage` | Listar frota |
| GET | `/api/v1/garage/insights` | Insights da frota |
| PATCH | `/api/v1/garage/{id}` | Atualizar |
| DELETE | `/api/v1/garage/{id}` | Remover (soft delete) |

### Relatórios
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/v1/reports/comparison` | Gerar PDF de comparação |
| POST | `/api/v1/reports/dossier` | Gerar dossiê em PDF |
| GET | `/api/v1/reports/{id}/download` | Download do PDF |

### Usuário
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/users/me` | Perfil do usuário |
| PATCH | `/api/v1/users/me` | Atualizar perfil |
| PATCH | `/api/v1/users/me/password` | Alterar senha |
| GET | `/api/v1/users/me/sessions` | Sessões ativas |
| DELETE | `/api/v1/users/me/sessions/{id}` | Revogar sessão |

---

## Autores

Desenvolvido como projeto acadêmico para o **Projeto FORD** — Engenharia de Software.

---

*AutoSpec Intelligence Platform — Especificações técnicas com IA*
