# Mobiilinutakortti admin-frontend

The admin-frontend directory includes the admin side code for Mobiilinutakortti app.

## Development

Check the README of the root directory for instructions on how to run the admin-frontend for development.

There are two environment variables:

- `VITE_ENDPOINT`: The base URL of the backend, e.g. "http://localhost:3000"
  or "https://api.mobiilinuta-admin-test.com/api"
- `VITE_ADMIN_FRONTEND_URL`: The base URL of the admin frontend itself, only needed outside development when the admin
  frontend runs in e.g. "https://mobiilinuta.example.com/nuorisotyontekijat".
