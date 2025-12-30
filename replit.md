# History Trivia Challenge

## Overview

This is a full-stack web application built for multiplayer history trivia games. The application features a React-based frontend with a Node.js/Express backend, designed to provide fast-paced 5-minute trivia challenges for 2-4 players. The system uses a modern tech stack with TypeScript, Tailwind CSS, and PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Radix UI components for consistent design
- **State Management**: Zustand for game state and audio management
- **3D Graphics**: React Three Fiber for potential 3D elements
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Comprehensive set of reusable components using Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with `/api` prefix for all endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: In-memory storage for game state with plans for database persistence

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Type-safe schema definitions in shared directory
- **Migrations**: Automated database migrations with Drizzle Kit

## Key Components

### Game Logic
- **Multi-phase Game Flow**: Lobby → Playing → Question → Results → Final
- **Real-time Scoring**: Dynamic score calculation based on answer speed and accuracy
- **Timer Management**: Both game-wide (5 minutes) and per-question (15 seconds) timers
- **Question Management**: Categorized questions with difficulty levels and explanations

### Audio System
- **Background Music**: Looped ambient music during gameplay
- **Sound Effects**: Hit sounds for interactions and success sounds for achievements
- **Mute Controls**: User-controllable audio with persistent state

### User Interface
- **Responsive Design**: Mobile-first approach with tablet/desktop optimizations
- **Accessibility**: Keyboard navigation and screen reader support via Radix UI
- **Real-time Updates**: Live scoreboard and timer updates during gameplay

### Player Management
- **Multi-player Support**: 2-4 players per game session
- **Color-coded Players**: Unique color assignment for easy identification
- **Score Tracking**: Real-time score updates with position rankings

## Data Flow

1. **Game Initialization**: Players join lobby and enter names
2. **Game Start**: Random questions selected from categorized pool
3. **Question Phase**: Timer starts, players submit answers
4. **Answer Reveal**: Correct answer shown with explanations
5. **Score Update**: Points awarded based on correctness and speed
6. **Game End**: Final results displayed after 5 minutes or all questions

### State Management Flow
- Zustand stores handle game state, audio controls, and player data
- Shared types ensure consistency between frontend and backend
- Real-time updates through timer subscriptions and event handlers

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, React DOM, React Three Fiber
- **State Management**: Zustand with subscriptions
- **Styling**: Tailwind CSS, Radix UI components
- **Utilities**: date-fns, clsx, class-variance-authority
- **Development**: Vite, TypeScript, ESBuild

### Backend Dependencies
- **Server**: Express.js with TypeScript support
- **Database**: Drizzle ORM, Neon Database connector
- **Validation**: Zod for schema validation
- **Session**: Connect-pg-simple for PostgreSQL session store
- **Development**: tsx for TypeScript execution

### Build Tools
- **Bundler**: Vite for frontend, ESBuild for backend
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Type Checking**: TypeScript with strict mode enabled
- **Database Tools**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR (Hot Module Replacement)
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Neon Database with environment-based connection strings
- **Asset Handling**: Support for 3D models, audio files, and shaders

### Production Build
- **Frontend**: Static assets built to `dist/public`
- **Backend**: Bundled to `dist/index.js` with external packages
- **Database**: Production PostgreSQL instance via DATABASE_URL
- **Static Serving**: Express serves built frontend assets

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Assets**: GLTF/GLB models, MP3/OGG audio files, GLSL shaders supported
- **CORS**: Configured for cross-origin requests during development

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```