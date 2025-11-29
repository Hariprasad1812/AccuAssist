# AccuAssist - Full Project
AccuAssist is a Zoho Cliq bot that lets users perform account operations (password reset/change, display name change, profile updates) with secure verification, risk scoring and an admin dashboard.

## What's included
- Node.js Express backend
- Mongoose models (MongoDB)
- Zoho API wrapper (OAuth refresh token)
- OTP service via email (nodemailer)
- Risk engine (rule-based)
- Cliq webhook handlers and admin APIs
- Static admin dashboard (mockup)
- Dockerfile & .env.example

## Quickstart (local)
1. Install Node.js and MongoDB.
2. Copy `.env.example` to `.env` and fill values.
3. `npm install`
4. `node server.js`
5. Expose with `ngrok http 4000` and set Zoho Cliq webhook to `https://<ngrok>/api/cliq/webhook`

## Files
See project structure in repository.

