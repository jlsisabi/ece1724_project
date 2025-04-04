/*
  # Initial Schema Setup for Note Taking App

  1. New Tables
    - `folders`: Hierarchical organization for notes
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `parent_folder_id` (uuid, self-reference)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notes`: Core note content and metadata
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `folder_id` (uuid, foreign key to folders)
      - `title` (text)
      - `content` (text)
      - `is_favorite` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tags`: User-defined tags for organization
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `color` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `note_tags`: Junction table for notes and tags
      - Composite key (note_id, tag_id)
    
    - `files`: Metadata for uploaded attachments
      - `id` (uuid, primary key)
      - `note_id` (uuid, foreign key to notes)
      - `filename` (text)
      - `file_type` (text)
      - `file_size` (integer)
      - `storage_path` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create folders table
CREATE TABLE folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text DEFAULT '',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#000000',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create note_tags junction table
CREATE TABLE note_tags (
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(note_id, tag_id)
);

-- Create files table
CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own folders"
  ON folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tags"
  ON tags
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage note_tags for their notes"
  ON note_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage files for their notes"
  ON files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_id
      AND notes.user_id = auth.uid()
    )
  );