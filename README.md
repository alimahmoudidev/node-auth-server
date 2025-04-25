# Mini Auth Server

A minimal Node.js + Express server with SQLite and JWT authentication, created for testing login and register flows.

## Features

- 🔐 User registration and login
- 🔑 JWT access token + refresh token system
- ⏱️ Short-lived access token (15 seconds) for easy testing
- 📘 Swagger API documentation
- 💾 Uses SQLite as the database
- 🧪 Designed for local testing and experimentation

## Getting Started

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### Install the dependencies:

```bash
npm install
```

### .env

```bash
PORT=5000
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
DOC_API=/api-docs

ACCESS_TOKEN_EXPIRES_IN=15s
REFRESH_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_MS=604800000
```

### Then start the server:

```bash
npm start
```
