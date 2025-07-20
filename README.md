# CLG Admin Management System

A comprehensive admin dashboard for College management built with Remix, TypeScript, and Supabase.

## Features

- **Admin Dashboard** with 9 management modules:
  - Assignments Management
  - Deadlines & Record Ending Dates
  - Daily Homework Tracking
  - Daily Updates & Announcements
  - Notes & Study Materials
  - Test Scheduling & Updates
  - Syllabus Management
  - Birthday Tracking
  - Seminars & Events

- **Authentication System** for students and administrators
- **Professional UI** with glassmorphism design and premium styling
- **Database Integration** with Supabase PostgreSQL

## Development

Run the dev server:

```sh
npm run dev
```

**Admin Login:** Use pass key `admin123` at http://localhost:5173/login/admin

## Database Setup

1. Run the database setup script in your Supabase SQL Editor:
```sql
-- Use database-reset-and-setup.sql
```

2. Configure your `.env` file with Supabase credentials

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

## Technology Stack

- **Framework:** Remix.run with TypeScript
- **Styling:** Tailwind CSS with custom glassmorphism effects
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Custom session management
- **Build Tool:** Vite
