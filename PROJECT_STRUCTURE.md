# NoteFlow Project Structure

## Root Configuration Files

```
├── .env                    # Environment variables for Supabase connection
├── .gitignore             # Git ignore rules
├── index.html             # Entry HTML file
├── package.json           # Project dependencies and scripts
├── postcss.config.js      # PostCSS configuration for Tailwind
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # App-specific TypeScript settings
├── tsconfig.node.json     # Node-specific TypeScript settings
└── vite.config.ts         # Vite bundler configuration
```

## Source Code (`src/`)

### Core Files
```
src/
├── main.tsx              # Application entry point, React initialization
├── App.tsx              # Main component, routing, auth state
├── index.css            # Global styles and Tailwind imports
└── vite-env.d.ts        # Vite environment type declarations
```

### Components (`src/components/`)
```
components/
├── Auth.tsx             # Authentication UI and logic
├── DeleteConfirmDialog.tsx  # Reusable delete confirmation modal
├── Favorites.tsx        # Favorite notes view and management
├── Folders.tsx          # Folder management and organization
├── Layout.tsx           # Main application layout structure
├── NoteEditor.tsx       # Markdown note editor component
├── NoteList.tsx         # Note listing and filtering
├── Recent.tsx           # Recent notes view
├── Sidebar.tsx          # Navigation sidebar
└── Tags.tsx             # Tag management and organization
```

### Library (`src/lib/`)
```
lib/
├── auth.ts             # Authentication utilities and API
├── store.ts            # Global state management (Zustand)
├── supabase.ts         # Supabase client configuration
└── themeStore.ts       # Dark mode state management
```

### Types (`src/types/`)
```
types/
└── index.ts            # TypeScript interfaces and types
```

## Database (`supabase/`)

### Migrations
```
supabase/
└── migrations/
    ├── 20250403153023_damp_snow.sql        # Initial schema setup
    ├── 20250403155915_rustic_violet.sql    # Additional tables
    └── 20250403162434_lively_wind.sql      # Security policies
```

## Component Relationships

### Authentication Flow
- `Auth.tsx` → `lib/auth.ts` → `lib/supabase.ts`
- Handles user authentication and session management

### Note Management Flow
- `NoteList.tsx` → `NoteEditor.tsx` → `lib/store.ts`
- Lists notes and provides editing capabilities

### Organization Features
- `Folders.tsx` → `lib/store.ts`
  - Manages folder structure and note organization
- `Tags.tsx` → `lib/store.ts`
  - Handles tag creation and assignment
- `Recent.tsx` & `Favorites.tsx` → `lib/store.ts`
  - Special views for note filtering

### Layout and Navigation
- `App.tsx` → `Layout.tsx` → `Sidebar.tsx`
- Handles routing and overall application structure

## State Management

### Main Store (`store.ts`)
- Notes CRUD operations
- Folder management
- Tag management
- File attachments
- Current note state

### Theme Store (`themeStore.ts`)
- Dark mode preferences
- Theme persistence

## Database Schema Relationships

```
auth_users
    ↓
    ├── notes
    │     ├── note_tags ← tags
    │     └── files
    └── folders
```

## Key Features Implementation

### Note Editor
- Markdown support via `@uiw/react-md-editor`
- File attachments
- Auto-saving
- Tag management

### Organization
- Hierarchical folders
- Tagging system
- Search functionality
- Favorites system

### Security
- Row Level Security (RLS)
- User data isolation
- Protected API endpoints
- Secure file storage

### UI/UX
- Responsive design
- Dark mode support
- Drag and drop
- Modern interface