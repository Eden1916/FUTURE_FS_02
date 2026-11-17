# CRM — Lead Manager

A full-stack CRM for managing leads generated from website contact forms.

## Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React 18, React Router v6, React Query v5 |
| Backend  | Node.js, Express                  |
| Database | PostgreSQL                        |
| Auth     | JWT (bcrypt password hashing)     |

---

## Project Structure

```
crm-app/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── db/            # Pool, schema, seed
│   │   ├── middleware/    # JWT auth
│   │   └── routes/        # Express routers
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    └── src/
        ├── components/    # Shared UI
        ├── context/       # Auth context
        ├── pages/         # Route-level pages
        └── services/      # Axios instance
```

---

## Setup

### Option A — Docker (recommended)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

1. Copy and fill in the backend env:
   ```bash
   cd backend
   copy .env.example .env   # Windows
   # cp .env.example .env   # Mac/Linux
   ```
   Edit `.env` — at minimum set a real `DB_PASSWORD` and `JWT_SECRET`.

2. From the project root:
   ```bash
   docker-compose up --build
   ```

3. Open **http://localhost** in your browser.

   First boot automatically runs the seed (creates tables + default admin).

   Default login: `admin@example.com` / `Admin@123`

4. To stop:
   ```bash
   docker-compose down          # keeps database data
   docker-compose down -v       # also deletes database volume
   ```

---

### Option B — Local development

#### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE crm_db;
```

#### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials and a strong JWT_SECRET
node src/db/seed.js   # Creates tables + default admin
npm run dev           # Starts on http://localhost:5000
```

#### 3. Frontend

```bash
cd frontend
npm install
npm start             # Starts on http://localhost:3000
```

Default admin credentials (set in `.env`):
- Email: `admin@example.com`
- Password: `Admin@123`

---

## API Reference

### Auth
| Method | Path           | Auth | Description          |
|--------|----------------|------|----------------------|
| POST   | /api/auth/login | —   | Get JWT token        |
| GET    | /api/auth/me    | ✅  | Get current admin    |

### Leads
| Method | Path             | Auth | Description              |
|--------|------------------|------|--------------------------|
| GET    | /api/leads        | ✅  | List leads (filterable)  |
| POST   | /api/leads        | ✅  | Create lead              |
| GET    | /api/leads/:id    | ✅  | Get lead + notes         |
| PATCH  | /api/leads/:id    | ✅  | Update lead              |
| DELETE | /api/leads/:id    | ✅  | Delete lead              |

**Query params for GET /api/leads:** `status`, `source`, `search`, `page`, `limit`

### Notes
| Method | Path                      | Auth | Description           |
|--------|---------------------------|------|-----------------------|
| POST   | /api/leads/:leadId/notes  | ✅  | Add note to lead      |
| PATCH  | /api/notes/:id            | ✅  | Update note           |
| DELETE | /api/notes/:id            | ✅  | Delete note           |
| GET    | /api/notes/follow-ups     | ✅  | Upcoming follow-ups   |

### Stats
| Method | Path       | Auth | Description           |
|--------|------------|------|-----------------------|
| GET    | /api/stats | ✅  | Dashboard summary     |

### Public Contact Form
| Method | Path          | Auth | Description                        |
|--------|---------------|------|------------------------------------|
| POST   | /api/contact  | —    | Create lead from website form      |

**Website form integration example:**
```js
fetch('https://your-crm-api.com/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-1234',
    source: 'website'
  })
});
```

---

## Lead Statuses

| Status    | Meaning                        |
|-----------|--------------------------------|
| new       | Fresh lead, not yet contacted  |
| contacted | Admin has reached out          |
| converted | Lead became a customer         |
| lost      | Lead went cold or unqualified  |

---

## Security

- JWT tokens expire in 24 hours (configurable via `JWT_EXPIRES_IN`)
- Passwords hashed with bcrypt (cost factor 12)
- Helmet sets secure HTTP headers
- Login endpoint rate-limited to 10 requests / 15 min
- Global rate limit: 200 requests / 15 min
- Input validation on all write endpoints
