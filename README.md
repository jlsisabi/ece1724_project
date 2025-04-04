# NoteFlow - Modern Note-Taking Application
A full-featured, modern note-taking application built with React, TypeScript, and Supabase. NoteFlow offers a clean, intuitive interface for managing your notes with powerful organization features.


## APP URL
https://voluble-belekoy-239db9.netlify.app/

## Features

## Note Management
- Rich text editing with Markdown support
- Real-time preview
- Auto-saving
- File attachments
- Favorite notes
- Note history tracking

## Organization
- Folder-based organization
- Tag system with custom colors
- Quick search functionality
- Recent notes view
- Favorites collection

## User Interface
- Clean, modern design
- Dark mode support
- Responsive layout
- Drag and drop file uploads
- Intuitive navigation

## Security
- Secure authentication system
- Row Level Security (RLS) with Supabase
- Protected API endpoints
- Secure file storage

## Technology Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Vite
  - Zustand (State Management)
  - React Router
  - Radix UI Components
  - Lucide React Icons

- **Backend:**
  - Supabase (Database & Authentication)
  - PostgreSQL
  - Row Level Security (RLS)

## Database Schema

The application uses the following database structure:

- `auth_users`: User authentication and profile data
- `folders`: Note organization structure
- `notes`: Main note content and metadata
- `tags`: Tag management with custom colors
- `note_tags`: Many-to-many relationship between notes and tags
- `files`: File attachment metadata

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/noteflow.git
   cd noteflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

4. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the database migrations:
   - Copy the SQL from `supabase/migrations` folder
   - Run them in your Supabase SQL editor

6. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```bash
project
│  .env        # Environment variables for Supabase connection
│  .gitignore  # Git ignore rules
│  eslint.config.js
│  index.html  # Entry HTML file
│  package-lock.json   
│  package.json   # Project dependencies and scripts
│  postcss.config.js # PostCSS configuration for Tailwind 
│  README.md   # Read me file
│  tailwind.config.js   # Tailwind CSS configuration
│  tsconfig.app.json # TypeScript app-specific configuration
│  tsconfig.json  # TypeScript configuration
│  tsconfig.node.json # Node-specific TypeScript settings
│  vite.config.ts  # Vite bundler configuration
│  
├─src
│  │  App.tsx # Main component, routing, auth state
│  │  index.css    # Global styles and Tailwind imports
│  │  main.tsx # Application entry point, React initialization
│  │  vite-env.d.ts   # Vite environment type declarations
│  │  
│  ├─components
│  │      Auth.tsx   # Authentication UI and logic
│  │      DeleteConfirmDialog.tsx   # Reusable delete confirmation modal
│  │      Favorites.tsx # Favorite notes view and management
│  │      Folders.tsx   # Folder management and organization
│  │      Layout.tsx    # Main application layout structure
│  │      NoteEditor.tsx   # Markdown note editor component
│  │      NoteList.tsx  # Note listing and filtering
│  │      Recent.tsx    # Recent notes view
│  │      Settings.tsx  # App settings
│  │      Sidebar.tsx   # Navigation sidebar
│  │      Tags.tsx   # Tag management and organization
│  │      
│  ├─lib
│  │      auth.ts # Authentication utilities and API
│  │      store.ts   # Global state management (Zustand)
│  │      supabase.ts   # Supabase client configuration
│  │      themeStore.ts # Dark mode state management
│  │      
│  └─types
│          index.ts  # TypeScript interfaces and types
│          
└─supabase
    └─migrations
            20250403153023_damp_snow.sql  # Initial schema setup
            20250403155915_rustic_violet.sql # Additional tables
            20250403162434_lively_wind.sql    # Security policies
```

## Security Considerations

- All database access is controlled through Row Level Security (RLS)
- Users can only access their own data
- File uploads are restricted by type and size
- Authentication tokens are handled securely
- All API endpoints are protected



## Acknowledgement

- Icons by [Lucide](https://lucide.dev)
- UI Components by [Radix UI](https://www.radix-ui.com)
- App Deployment by [Netlify](https://www.netlify.com/)
