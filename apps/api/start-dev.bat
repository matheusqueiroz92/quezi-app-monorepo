@echo off
set DATABASE_URL=postgresql://userquezi-app:passwordquezi-app@localhost:5432/quezi-app_db
set JWT_SECRET=C+5mZ7xJzGJ8U0OpbKTjNFkAYbqSnv0/0RhWCHQbpnY=
set JWT_EXPIRES_IN=7d
set CORS_ORIGIN=http://localhost:3000
set SWAGGER_ENABLED=true
set BETTER_AUTH_SECRET=YHuEXTrz8pHmOaNzWMaSSR+xGC+PXe0cAZO6o8Qq7i8=
set BETTER_AUTH_URL=http://localhost:3333
set GOOGLE_CLIENT_ID=
set GOOGLE_CLIENT_SECRET=
set GITHUB_CLIENT_ID=
set GITHUB_CLIENT_SECRET=

echo Starting Quezi API...
npm run dev
