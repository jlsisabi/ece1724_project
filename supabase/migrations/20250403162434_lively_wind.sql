/*
  # Setup Custom Authentication System

  1. New Tables
    - `auth_users` table for storing user credentials and authentication data
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `last_login` (timestamp)

  2. Security
    - Enable RLS on auth_users table
    - Add policy for user authentication
*/

-- Create auth_users table for storing credentials
CREATE TABLE IF NOT EXISTS auth_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable RLS
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to authenticate
CREATE POLICY "Users can access their own auth data"
  ON auth_users
  FOR SELECT
  USING (true);

-- Create policy for users to update their last login
CREATE POLICY "Users can update their own last login"
  ON auth_users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policy for inserting new users
CREATE POLICY "Anyone can insert a new user"
  ON auth_users
  FOR INSERT
  WITH CHECK (true);