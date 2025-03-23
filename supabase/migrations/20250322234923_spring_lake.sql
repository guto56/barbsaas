/*
  # Fix appointments schema and foreign key references

  1. Changes
    - Drop existing appointments table
    - Recreate appointments table with correct foreign key reference
    - Add RLS policies for proper security

  2. Security
    - Enable RLS on appointments table
    - Add policies for authenticated users
*/

-- Drop existing table
DROP TABLE IF EXISTS appointments;

-- Create appointments table with correct references
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  status text DEFAULT 'scheduled'::text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, time)
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments
CREATE POLICY "Users can create their own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.email = 'adminbarber' 
    AND profiles.id = auth.uid()
  ));

CREATE POLICY "Users can update their own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.email = 'adminbarber' 
    AND profiles.id = auth.uid()
  ));

CREATE POLICY "Users can delete their own appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.email = 'adminbarber' 
    AND profiles.id = auth.uid()
  ));