# Customer Management Application

## Overview

This is a full-stack customer management application built with React on the frontend and Express/Node.js on the backend. The application provides comprehensive CRUD functionality for managing customers and their associated addresses, featuring search, filtering, pagination, and a responsive design using modern UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern development experience
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query (React Query)** for server state management, caching, and API interactions
- **React Hook Form** with Zod validation for robust form handling and validation
- **shadcn/ui** component library built on Radix UI primitives for accessible, customizable UI components
- **Tailwind CSS** for utility-first styling with custom design tokens and responsive design
- Component-based architecture with clear separation of concerns (pages, components, hooks, utilities)

### Backend Architecture
- **Express.js** server with TypeScript for API routes and middleware
- **RESTful API design** with structured endpoints for customers and addresses
- **In-memory storage implementation** (MemStorage class) with interface-based design for easy database migration
- **Zod schema validation** for request/response validation and type inference
- **CRUD operations** with advanced features like search, filtering, sorting, and pagination
- **Error handling middleware** with consistent API response format

### Data Layer
- **Drizzle ORM** configured for PostgreSQL with SQLite schema definition
- **Shared schema** between frontend and backend using Zod for type consistency
- **Database-agnostic interface** allowing easy migration from in-memory to persistent storage
- **One-to-many relationship** between customers and addresses with cascade delete

### UI/UX Design
- **Responsive design** with mobile-first approach
- **Modern design system** with consistent spacing, colors, and typography
- **Accessible components** using Radix UI primitives
- **Loading states and error handling** with toast notifications
- **Advanced filtering** with search, city, state, and PIN code filters
- **Pagination and sorting** for large datasets

### Development Tools
- **Vite** for fast development and optimized builds
- **TypeScript** throughout the stack for type safety
- **Path aliases** for clean imports (@/, @shared/, etc.)
- **Hot module replacement** for rapid development
- **ESLint and Prettier** configuration for code quality

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing for React applications
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolvers for react-hook-form

### UI Component Libraries
- **@radix-ui/**: Complete suite of accessible UI primitives (dialog, dropdown, select, etc.)
- **shadcn/ui**: Pre-built component library with customizable design
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx** and **tailwind-merge**: Conditional CSS class utilities

### Database and Validation
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Integration between Drizzle and Zod schemas
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **zod**: Runtime type checking and validation

### Development and Build Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production builds

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel/slider functionality
- **lucide-react**: Icon library with React components

### Replit-Specific Dependencies
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment