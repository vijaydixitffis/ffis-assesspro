# replit.md

## Overview

This is a full-stack web application built with a React frontend and Express backend, designed for assessment management. The application uses a PostgreSQL database with Drizzle ORM and follows a modern TypeScript-first architecture with shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement
- **State Management**: React Context for authentication, TanStack Query for server state
- **Routing**: React Router with protected routes based on user roles

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API Design**: RESTful endpoints with `/api` prefix

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema**: Centralized schema definitions in `shared/schema.ts`
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Authentication System
- Role-based access control (admin/client roles)
- Protected routes with role-specific restrictions
- Session-based authentication with PostgreSQL storage
- Authentication context provider for global state management

### Assessment Management
- Multi-level hierarchy: Assessments → Topics → Questions → Answers
- Support for multiple question types (multiple choice, yes/no, free text)
- Assessment assignment system for users
- Status tracking for assessment progress

### User Interface
- Responsive design with mobile-first approach
- Dark/light theme support through CSS variables
- Consistent component library with shadcn/ui
- Navigation sidebar with role-based menu items

### Data Storage
- PostgreSQL database with connection pooling
- Drizzle ORM for type-safe database operations
- Schema-first approach with generated TypeScript types
- Migration system for database versioning

## Data Flow

1. **Client Request**: React frontend makes API calls to Express backend
2. **Authentication**: Middleware checks user session and permissions
3. **Database Operations**: Backend uses Drizzle ORM to interact with PostgreSQL
4. **Response**: JSON responses sent back to frontend
5. **State Updates**: React components update using context providers and hooks

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pooling**: Built-in connection management
- **Environment Variables**: `DATABASE_URL` for connection string

### UI Components
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code quality and formatting

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- Development: Uses tsx for hot reloading
- Production: Node.js serves bundled application
- Database: Environment-specific connection strings

### File Structure
- `client/`: React frontend application
- `server/`: Express backend application
- `shared/`: Common TypeScript definitions and schemas
- `migrations/`: Database migration files

### Key Features
- **Assessment Management**: Create and manage assessments with topics and questions
- **User Management**: Role-based access control for admins and clients
- **Progress Tracking**: Monitor assessment completion status
- **Responsive Design**: Works across desktop and mobile devices
- **Type Safety**: Full TypeScript coverage from database to UI