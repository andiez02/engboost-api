# EngBoost Backend (Express + PostgreSQL)

A modern backend for the EngBoost language learning application, rebuilt with **ExpressJS**, **TypeScript**, **Sequelize**, and **PostgreSQL**.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Sequelize
- **Auth**: JWT (cookie + Bearer)
- **Validation**: Zod
- **Image Storage**: Cloudinary

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run migrations

```bash
npm run db:migrate
```

### 4. Start dev server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

## Project Structure

```
src/
├── config/          # Environment, DB, Cloudinary, CORS
├── database/
│   └── migrations/  # Sequelize migrations
├── middlewares/      # Auth, error, role, validation
├── models/          # Sequelize models + associations
├── modules/
│   ├── user/        # Auth & user management
│   ├── folder/      # Folder CRUD
│   ├── flashcard/   # Flashcard CRUD
│   └── course/      # Course management
├── types/           # TypeScript types
├── utils/           # ApiError, catchAsync, JWT, constants
└── server.ts        # Entry point
```

## API Endpoints

### Users (`/api/users`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | ❌ | Register |
| POST | `/login` | ❌ | Login |
| PUT | `/verify` | ❌ | Verify account |
| GET | `/refresh-token` | ❌ | Refresh JWT |
| DELETE | `/logout` | ✅ | Logout |
| GET | `/me` | ✅ | Get profile |
| PUT | `/` | ✅ | Update profile |

### Folders (`/api/folders`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | ✅ | Create folder |
| GET | `/` | ✅ | My folders |
| GET | `/public` | ✅ | Public folders |
| GET | `/:id` | ✅ | Get by ID |
| PUT | `/:id` | ✅ | Update |
| DELETE | `/:id` | ✅ | Delete |

### Flashcards (`/api/flashcards`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/save-to-folder` | ✅ | Bulk save |
| GET | `/folder/:folderId` | ✅ | Get by folder |
| GET | `/:id` | ✅ | Get by ID |
| DELETE | `/:id` | ✅ | Delete |

### Courses (`/api/courses`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/public` | ❌ | Public courses |
| GET | `/` | ✅ | All courses |
| GET | `/:id` | ✅ | Get by ID |
| POST | `/:id/register` | ✅ | Register for course |
| POST | `/` | 🔒 Admin | Create |
| PUT | `/:id` | 🔒 Admin | Update |
| DELETE | `/:id` | 🔒 Admin | Delete |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run db:migrate` | Run migrations |
| `npm run db:migrate:undo` | Undo last migration |

## Docker Services

| Service | Port | Credentials |
|---------|------|-------------|
| PostgreSQL | 5432 | `engboost` / `engboost123` |
| pgAdmin | 5050 | `admin@engboost.com` / `admin123` |
