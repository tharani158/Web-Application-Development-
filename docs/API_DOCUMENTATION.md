# API Documentation

## Auth

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT token
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password/:token` — Reset password with token

## Users
- `GET /api/users` — List users (admin only)
- `GET /api/users/:id` — Get own details or any user's details (admin only)
- `PUT /api/users/:id` — Update own name/email/phone or any user's details (admin only)
- `DELETE /api/users/:id` — Delete user (admin only)

## Providers
- `GET /api/providers` — List providers
- `GET /api/providers/:id` — Get provider detail
- `POST /api/providers` — Create provider (admin only)
- `PUT /api/providers/:id` — Update provider (admin only)
- `DELETE /api/providers/:id` — Delete provider (admin only)

## Appointments
- `GET /api/appointments` — List own appointments (customer/provider) or all appointments (admin)
- `GET /api/appointments/availability?providerId=:id&date=YYYY-MM-DD` — List blocked times for the selected date (customer/admin)
- `POST /api/appointments` — Create a future appointment within a provider's availability (customer only)
- `PUT /api/appointments/:id` — Provider status update or admin update
- `DELETE /api/appointments/:id` — Cancel own pending appointment or delete any (admin)

## Schedules
- `GET /api/schedules` — List own schedules (provider) or schedules (customer/admin)
- `POST /api/schedules` — Create schedule (provider/admin)
- `PUT /api/schedules/:id` — Update schedule (provider/admin)
- `DELETE /api/schedules/:id` — Delete schedule (provider/admin)
