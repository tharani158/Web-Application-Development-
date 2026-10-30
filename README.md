# Online Appointment Booking System

This repository contains a full-stack MERN application for an online appointment booking system suitable for university-level web application development.

## Structure

- `client/`: React frontend with Bootstrap 5 UI, routing, and API integration.
- `server/`: Express backend with MongoDB/Mongoose models, JWT authentication, and REST APIs.
- `docs/`: Project documentation including requirements, API docs, deployment, and testing.

## Setup

1. Install dependencies:
   - `cd server && npm install`
   - `cd ../client && npm install`
2. Copy `server/.env.example` to `server/.env` and replace `JWT_SECRET` with a unique random value of at least 32 characters. Set `MONGO_URI` for a persistent database. For an initial admin, set `ADMIN_EMAIL` and `ADMIN_PASSWORD`; no shared default admin account is created.
3. Start development servers:
   - `cd server && npm run dev`
   - `cd client && npm start`

## Features

- JWT authentication
- Role-based access control
- Customer booking workflow
- Provider schedule management
- Admin analytics
- Responsive Bootstrap UI
- RESTful API endpoints

## Development notes

- Password-reset links are printed to the server console in development. Production requests return `503` because this project does not include an email delivery adapter.
- The in-memory MongoDB fallback is for local development only; its data is lost when the server stops.
- This project uses MongoDB for persistent appointment data, with role-based access for customers, providers, and administrators.
