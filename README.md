# Full-Stack Project Tracker

This is a complete full-stack website with both frontend and backend:

- **Frontend**: HTML + CSS + vanilla JavaScript (`public/`)
- **Backend**: Node.js HTTP server + REST API (`server.js`)
- **Automated tests**: Node's built-in test runner (`test/server.test.js`)

## How to run

```bash
npm start
```

Then open: **http://localhost:3000**

That is where you can see and use the website.

## How to test

```bash
npm test
```

## API endpoints

- `GET /api/health` - Server health check
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
