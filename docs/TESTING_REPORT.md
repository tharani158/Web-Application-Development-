# Testing and Verification

## Checks run
- Client production build: `npm run build` (passed).
- Server JavaScript syntax: `node --check` on all 22 server JavaScript files (passed).

## Manual API scenarios to verify against a configured database
- Public registration always creates a customer, even if a `role` field is submitted.
- Customer appointment lists, edits, and cancellations are restricted to that customer's pending appointments.
- Appointment requests must use an available provider time; occupied slots cannot be booked twice.
- Providers can manage only their own schedules and appointment statuses.
- Admin-only provider and user management endpoints reject other roles.
- Password reset is development-only until an email delivery adapter is added.

The repository does not currently include an automated backend test suite. These API scenarios have not been run as integration tests.
