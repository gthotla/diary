# Timely

Timely is a productivity management app with an integrated diary. It helps you plan your time, stay on top of todos, and capture daily diary entries — with dashboards that show how your time and mood trend. Built as a React frontend with a Node.js/Express backend.

## What the app does

- Helps you manage time and priorities with todo tracking, status, and filters.
- Lets users register, log in, and manage a private session with JWT cookies.
- Captures diary entries with text, mood, dates, links, and image uploads.
- Stores media in AWS S3 and serves private assets through CloudFront-signed delivery.
- Shows dashboard insights such as recent entries, mood distribution, and activity summaries.
- Exposes health endpoints and Swagger API documentation.

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis for recent-entry caching
- AWS S3 and CloudFront for media storage and delivery
- Swagger for API docs
- Jest and Supertest for tests

### Frontend
- React 19 + Vite
- React Router
- Tailwind CSS v4
- Radix UI components
- Recharts for charts
- Framer Motion for animations

## Repository Layout

- `backend/` contains the API, database models, services, middleware, tests, and infrastructure files.
- `frontend/` contains the React UI, pages, shared components, and client services.
- `docs/` contains the SRS, architecture diagrams, and UML sources.
- `diagrams/` contains source diagram files.
- `scripts/` contains documentation generation helpers.

## Main Features

- Authentication and session handling
- Diary CRUD and media upload flow
- Todo CRUD and status management
- Recent-entry caching and dashboard analytics
- User profile management
- Health checks and API documentation

## Local Setup

Typical local development uses:

- MongoDB on `localhost:27017`
- Backend on port `5000`
- Frontend on port `5173`

Environment values are never committed. Copy `backend/.env.example` to `backend/.env` and fill in values for local development.

## Useful Commands

### Backend
- `npm test`
- `npm run dev`
- `npm start`

### Frontend
- `npm run dev`
- `npm run build`
- `npm run lint`

## Notes

- The project is designed as a responsive web app for desktop and mobile.
- Media and authentication depend on production-ready AWS and cookie settings.
- The detailed functional specification lives in `docs/SRS.md`.
