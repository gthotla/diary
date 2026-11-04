# MyDiary

MyDiary is a full-stack personal diary and productivity web application. It combines diary entries, todo tracking, dashboards, and media uploads in a React frontend with a Node.js/Express backend.

## What the app does

- Lets users register, log in, and manage a private session with JWT cookies.
- Supports diary entries with text, mood, dates, links, and image uploads.
- Stores media in AWS S3 and serves private assets through CloudFront-signed delivery.
- Provides todo management with status, priority, and filters.
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

Environment values are stored in `backend/.env` for the server side.

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
