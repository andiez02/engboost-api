# EngBoost Backend

REST API for the EngBoost English learning platform. Built with **Express + TypeScript + PostgreSQL + Sequelize**.

## Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Express 4
- **Language**: TypeScript
- **Database**: PostgreSQL 16 (Sequelize ORM)
- **Auth**: JWT (access token in httpOnly cookie + refresh token)
- **File upload**: Multer + Cloudinary
- **AI**: Google Gemini 2.5 Flash (deck generation), custom object detection (Snaplang)
- **Email**: Brevo (transactional)
- **Testing**: Vitest + fast-check (property-based)

---

## Project Structure

```
src/
├── config/          # DB, CORS, environment config
├── middlewares/     # auth, error handler, validation
├── models/          # Sequelize models (User, Folder, Flashcard, Course)
├── modules/
│   ├── user/        # auth + profile
│   ├── folder/      # flashcard folders
│   ├── flashcard/   # CRUD + legacy SRS endpoints
│   ├── study/       # SRS study session (primary)
│   ├── deck/        # AI deck generation
│   ├── snaplang/    # image → vocabulary detection
│   └── course/      # courses
├── utils/
│   ├── srsEngine.ts # SM-2 spaced repetition algorithm
│   └── ApiError.ts
└── server.ts
```

---

## API Reference

All protected routes require a valid JWT access token (sent automatically via httpOnly cookie).

### Auth — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | ✗ | Register new account |
| POST | `/login` | ✗ | Login, sets access + refresh token cookies |
| PUT | `/verify` | ✗ | Verify email with OTP code |
| GET | `/refresh-token` | ✗ | Rotate access token using refresh token |
| DELETE | `/logout` | ✗ | Clear auth cookies |
| GET | `/me` | ✓ | Get current user profile |
| PUT | `/` | ✓ | Update profile (name, avatar, etc.) |

### Folders — `/api/folders`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create folder |
| GET | `/` | Get my folders |
| GET | `/public` | Get all public folders |
| GET | `/:id` | Get folder by ID |
| PUT | `/:id` | Update folder (title, is_public) |
| DELETE | `/:id` | Delete folder + all its flashcards |

### Flashcards — `/api/flashcards`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/save-to-folder` | Save flashcards to a folder |
| GET | `/folder/:folderId` | Get all cards in a folder |
| GET | `/due` | Get due cards (legacy, use `/api/study` instead) |
| GET | `/:id` | Get card by ID |
| PATCH | `/:id/review` | Submit SRS review (legacy) |
| DELETE | `/:id` | Delete card |

### Study (SRS) — `/api/study`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get due cards. Query: `?folderId=<uuid>` (optional). Returns max 20 cards ordered by `next_review_at ASC` |
| POST | `/review` | Submit review. Body: `{ cardId, rating }` where rating is 0–3 |
| GET | `/stats` | Get `{ due, reviewedToday }` counts |

**Rating scale:**

| Value | Label | Effect |
|-------|-------|--------|
| 0 | Again | Reset — review again in 1 day |
| 1 | Hard | Slow growth — interval × 1.2 |
| 2 | Good | Normal growth — interval × ease_factor |
| 3 | Easy | Fast growth — interval × ease_factor × 1.3 |

### AI Deck Generation — `/api/decks`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/generate` | Generate a flashcard deck from a topic using Gemini AI. Body: `{ topic, count? }` |

Returns the created folder with all generated flashcards. Folder title is auto-suffixed with a timestamp to avoid uniqueness conflicts.

### Snaplang — `/api/snaplang`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/detect` | ✗ | Upload image (multipart `image` field, max 5MB) → returns detected objects with English/Vietnamese vocabulary |

---

## Spaced Repetition (SM-2)

### Data per flashcard

Each flashcard stores 5 SRS fields:

| Field | Default | Description |
|-------|---------|-------------|
| `repetition` | 0 | Consecutive successful reviews |
| `interval` | 0 | Days until next review |
| `ease_factor` | 2.5 | Multiplier for interval growth |
| `next_review_at` | NOW | When the card is next due |
| `last_reviewed_at` | null | Last review timestamp |

New cards have `next_review_at = NOW` so they appear immediately in the first session.

---

### GET /study — fetching due cards

```ts
WHERE user_id = :userId
  AND next_review_at <= NOW()
  AND folder_id = :folderId   -- optional
ORDER BY next_review_at ASC   -- most overdue first
LIMIT 20
```

Only cards that have reached or passed their `next_review_at` are returned. Max 20 cards per session.

---

### POST /review — rating a card

The user picks one of 4 ratings after flipping the card:

| Rating | Label | Meaning |
|--------|-------|---------|
| 0 | Again | Completely forgot |
| 1 | Hard | Remembered with difficulty |
| 2 | Good | Remembered correctly |
| 3 | Easy | Remembered effortlessly |

The backend calls `updateSpacedRepetition(card, rating)` and persists the result.

---

### SM-2 algorithm — computing the new interval

**New interval:**

```
rating 0 (Again)  → interval = 1,  reset repetition to 0
rating 1 (Hard)   → interval = max(1, interval × 1.2)
rating 2 (Good)   → rep=0: 1 day | rep=1: 6 days | rep≥2: interval × ease_factor
rating 3 (Easy)   → rep=0: 4 days | rep≥1: interval × ease_factor × 1.3
```

**New ease_factor:**

```
new_ef = max(1.3,  ef + 0.1 - (3 - rating) × (0.08 + (3 - rating) × 0.02))
```

Per rating:
- rating 3 → ef **+0.10** (card gets easier over time)
- rating 2 → ef **±0.00** (unchanged)
- rating 1 → ef **−0.14**
- rating 0 → ef **−0.32** (card gets harder)

`ease_factor` is floored at **1.3** to prevent intervals from stagnating.

**Next review date:**

```
next_review_at = now + newInterval × 24h
```

---

### Example — lifecycle of one card

```
Created:  rep=0, interval=0, ef=2.5  →  due immediately

Review 1: rate Good (2)  →  interval=1,   rep=1, ef=2.5  →  due in 1 day
Review 2: rate Good (2)  →  interval=6,   rep=2, ef=2.5  →  due in 6 days
Review 3: rate Good (2)  →  interval=15,  rep=3, ef=2.5  →  due in 15 days
Review 4: rate Easy (3)  →  interval=49,  rep=4, ef=2.6  →  due in 49 days
Review 5: rate Hard (1)  →  interval=59,  rep=5, ef=2.46 →  due in 59 days
Review 6: rate Again (0) →  interval=1,   rep=0, ef=2.14 →  due in 1 day  ← reset
```

Cards reviewed as Easy repeatedly grow their intervals exponentially. Cards rated Again reset to 1-day interval and lose ease_factor.

---

### GET /study/stats

Returns two counters used by the frontend dashboard and post-session screen:

```json
{ "due": 12, "reviewedToday": 8 }
```

- `due` — total cards with `next_review_at ≤ now`
- `reviewedToday` — cards with `last_reviewed_at ≥ start of today (UTC)`

---

### Study flow summary

```
New card created
    │  next_review_at = NOW
    ▼
GET /api/study  ──►  returns up to 20 due cards
    │
    ▼  (user flips card, picks rating)
POST /api/study/review  ──►  SM-2 recalculates interval  ──►  saved to DB
    │
    ▼
Card removed from queue, reappears after N days
```

---

## Development Setup

### Prerequisites

- Node.js 22+
- Docker (for PostgreSQL) or a local PostgreSQL 16 instance

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your values
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Start dev server

```bash
npm run dev
```

Server runs at `http://localhost:5000` by default.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:migrate:undo` | Undo last migration |
| `npm run db:seed` | Seed database |
| `npm test` | Run tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `APP_HOST` | Server host (default: `localhost`) |
| `APP_PORT` | Server port (default: `5000`) |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `ACCESS_TOKEN_SECRET` | JWT access token secret |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `BREVO_API_KEY` | Brevo email API key |
| `ADMIN_EMAIL_ADDRESS` | Sender email address |
| `WEBSITE_DOMAIN` | Frontend URL (for CORS + email links) |
| `GEMINI_API_KEY` | Google Gemini API key |

---

## Auth Flow

1. `POST /api/users/login` → sets `accessToken` (1h) and `refreshToken` (15d) as httpOnly cookies
2. All protected requests send cookies automatically
3. On 401, frontend calls `GET /api/users/refresh-token` to rotate the access token
4. `DELETE /api/users/logout` clears both cookies
