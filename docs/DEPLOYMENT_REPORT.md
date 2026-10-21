# Deployment Guide

## Frontend
1. Create a static web project on the hosting service and set its root directory to `client/`.
2. Use `npm run build` as the build command and `build` as the output directory.
3. Set `REACT_APP_API_URL` to the deployed backend API base, including `/api` (for example, `https://api.example.com/api`).

## Backend
1. Create a Node web service with root directory `server/` and start command `npm start`.
2. Set `NODE_ENV=production`, a unique `JWT_SECRET` of at least 32 characters, `MONGO_URI`, and `CLIENT_URL` to the frontend origin (no path).
3. Optionally set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to provision the first admin on startup. These values are only used to create a new admin account; startup does not reset an existing account's password.
4. Add a persistent MongoDB database. The in-memory database fallback is development-only and loses data on restart.

## Password reset limitation
The application logs reset links to the server console only in development. Production password reset returns `503` until an email delivery service is implemented and configured.
