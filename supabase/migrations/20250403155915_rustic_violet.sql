/*
  # Fix Notes RLS Policies

  1. Changes
    - Enable RLS on notes table
    - Add policies for authenticated users to:
      - Create their own notes
      - Read their own notes
      - Update their own notes
      - Delete their own notes

  2. Security
    - Ensures users can only access their own notes
    - Prevents unauthorized access to notes
*/

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own notes"
ON notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notes"
ON notes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON notes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON notes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);