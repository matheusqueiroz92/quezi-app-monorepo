@echo off
set DATABASE_URL=postgresql://postgres:password@localhost:5432/quezi_db
set JWT_SECRET=your-super-secret-jwt-key-with-at-least-32-characters
set JWT_EXPIRES_IN=7d
set CORS_ORIGIN=http://localhost:3000
set SWAGGER_ENABLED=true
set BETTER_AUTH_SECRET=your-super-secret-better-auth-key-with-at-least-32-characters
set BETTER_AUTH_URL=http://localhost:3333
set GOOGLE_CLIENT_ID=
set GOOGLE_CLIENT_SECRET=
set GITHUB_CLIENT_ID=
set GITHUB_CLIENT_SECRET=

echo Starting Quezi API...
npm run dev
