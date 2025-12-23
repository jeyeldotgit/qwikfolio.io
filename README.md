# QwikFolio.io

QwikFolio.io is a form-based portfolio and resume builder designed for speed.  
It allows developers, students, and professionals to generate a career-ready portfolio and printable resume in minutes—without design friction.

## Key Features

- **Schema-driven portfolio builder** - Build your portfolio with structured forms
- **Real-time analytics** - Track views and resume downloads
- **Public portfolio pages** - Share your portfolio via `/{username}` URL
- **Resume PDF export** - Download your portfolio as a PDF
- **Publish/Unpublish** - Control portfolio visibility
- **Toast notifications** - User-friendly success and error messages
- **Protected routes** - Secure authentication flow
- **Profile management** - Complete profile with username, avatar, and bio

## Tech Stack

- **Frontend**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Validation**: Zod (schema-driven validation)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Routing**: React Router DOM
- **State Management**: React Hooks with state machine pattern

## Project Status

**MVP Complete** ✅

- ✅ Full authentication (email/password with Supabase)
- ✅ Portfolio CRUD operations with database persistence
- ✅ Public portfolio pages with dynamic routing
- ✅ Resume PDF download functionality
- ✅ Real-time analytics tracking
- ✅ Profile management with avatar upload
- ✅ Toast notification system

## Documentation

Detailed documentation is available in the `/docs` directory:

- **Architecture** - System design and folder structure
- **Implementation Details** - Feature-by-feature implementation guide
- **API Documentation** - Service layer APIs and usage
- **Schemas** - Data models and validation rules
- **Database Schema** - SQL schema and migrations
- **Roadmap** - Completed features and future plans
- **Git Rules** - Contribution guidelines and workflow
