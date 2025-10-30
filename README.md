# ChatGPT Proxy Backend (NestJS) - Minimal Example

This project is a minimal NestJS-based backend that demonstrates:

- JWT authentication (in-memory users for demo)
- An OpenAI proxy service that forwards chat requests to the OpenAI API
- A reverse-proxy middleware example that can forward traffic to the official ChatGPT UI and inject a session cookie

This is intended as a starting point. It does not implement production-grade security.

## Quick start

1. Copy `.env.example` to `.env` and fill values (OPENAI_API_KEY, JWT_SECRET, CHATGPT_SESSION_COOKIE if you plan to use the UI proxy)

2. Install dependencies:

```powershell
cd c:\dev\cmpc\chatgpt-proxy-backend
npm install
```

3. Start in dev mode:

```powershell
npm run start:dev
```

4. Endpoints:
- POST /auth/login { username, password } -> returns JWT
- POST /openai/chat (Authorization: Bearer <token>) { prompt } -> forwards to OpenAI chat completions
- Proxy example: GET /ui/* -> will be proxied to https://chat.openai.com/* (requires CHATGPT_SESSION_COOKIE)


## Notes
- This is a demo scaffold. For production, secure secrets, use a DB for users, add rate limiting, and review OpenAI terms of service.
