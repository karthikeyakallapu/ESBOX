# 🚀 ESBOX

**ESBOX** is a modern **open-source cloud storage platform** built with **React and FastAPI** that allows users to upload, manage, stream, and organize files with powerful integrations like **Telegram-based storage** and **Google OAuth**.

It delivers a **Google Drive–like experience** while remaining fully **self-hostable and developer-friendly**.

---

# ✨ Features

## 🔐 Authentication

* Email & password authentication
* Secure **refresh-token flow (HTTP-only cookies)**
* **Google OAuth login**
* Email verification
* Forgot password / reset password

---

## 📁 File Management

* Create folders
* Upload files
* Rename files and folders
* Delete files and folders
* Organized storage hierarchy

---

## ⭐ Productivity

* Star important files
* Trash system with:

  * Restore items
  * Permanent delete

---

## 🎬 Media Streaming

Stream media files directly from ESBOX.

* Video streaming
* Image viewer
* Direct file preview

---

## ☁️ Telegram Storage Integration

Use **Telegram channels as file storage**.

Features:

* Telegram account login
* Secure session linking
* Upload files to Telegram
* Retrieve and stream files from Telegram

---

# 🏗️ Architecture

```
                 +-------------+
                 |   React UI  |
                 |  (Vite + TS)|
                 +------+------+
                        |
                        |
                        v
               +------------------+
               |     FastAPI      |
               |   REST Backend   |
               +--------+---------+
                        |
        +---------------+---------------+
        |                               |
        v                               v
   PostgreSQL                      Redis
   (Metadata)                 (Cache + tokens)

        |
        v
   Telegram Storage
```

---

# 🧰 Tech Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* SWR
* Zustand

---

## Backend

* FastAPI
* SQLAlchemy (async)
* Alembic
* PostgreSQL
* Redis

---

## Integrations

* Telegram (Telethon)
* Google OAuth

---

# 📂 Project Structure

```
ESBOX
│
├── client/          # React + Vite frontend
│
└── server/          # FastAPI backend
    ├── app/
    ├── alembic/
    └── migrations/
```

---

# ⚙️ Requirements

Make sure the following are installed:

* Node.js **20+**
* Python **3.11+**
* PostgreSQL
* Redis

---

# 🔧 Environment Variables

## Backend (`server/.env`)

```
TITLE=
VERSION=
HOST=
PORT=
ENVIRONMENT=
LOG_LEVEL=
ALLOWED_ORIGINS=

DATABASE_URL=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ALGORITHM=

TELEGRAM_API_ID=
TELEGRAM_API_HASH=
SESSION_ENCRYPTION_KEY=

REDIS_HOST=
REDIS_PORT=

MAX_FILE_SIZE=
DOWNLOAD_CHUNK_SIZE=

MAILER_USER=
MAILER_PASSKEY=

FRONTEND_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
 
 
MINIO_ENDPOINT= 
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=

```

### Notes

`DATABASE_URL` must use async SQLAlchemy format:

```
postgresql+asyncpg://user:password@host/dbname
```

`ALLOWED_ORIGINS` should be comma-separated.

---

## Frontend (`client/.env`)

```
VITE_BACKEND_URL=http://localhost:8000
DEV=true
```

---

# 🚀 Local Development

## 1) Backend Setup

```
cd server

python -m venv .venv
```

Activate virtual environment.

### Windows

```
.\.venv\Scripts\Activate.ps1
```

### macOS / Linux

```
source .venv/bin/activate
```

Install dependencies.

```
pip install -r requirements.txt
```

Run database migrations.

```
alembic upgrade head
```

Start the API server.

```
python -m app.main
```

Backend will run at:

```
http://localhost:8000
```

Health endpoint:

```
GET /api/v1/health
```

---

## 2) Frontend Setup

```
cd client

npm install
npm run dev
```

Frontend dev server runs at:

```
http://localhost:5173
```

---

# 📡 API Overview

Main API prefix:

```
/api/v1
```

---

## Authentication

```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

---

## Account Recovery

```
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
```

---

## OAuth

```
GET /oauth/google
GET /oauth/google/callback
```

---

## Files & Folders

```
GET    /folders
POST   /folders
PATCH  /folders/{id}
DELETE /folders/{id}
```

```
GET /files/{file_id}/view
GET /files/{file_id}
```

---

## Upload

```
POST /upload/fast
```

---

## Telegram

```
POST /telegram/login
POST /telegram/verify
GET  /telegram/session-status
```

---

## Trash

```
GET    /trash
POST   /trash/restore
DELETE /trash/permanent
```

---

# 🔒 Security Notes

* Authentication uses **JWT tokens**
* Refresh tokens stored in **HTTP-only cookies**
* Secure cookie flags enabled in production
* Email verification required for new accounts

---

# 🤝 Contributing

Contributions are welcome.

Steps:

```
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request
```

---

# ⭐ Support

If you like this project, please **star the repository**.

---

# 📜 License

MIT License
