/*
  # Fix appointments foreign key constraint

  1. Changes
    - Update appointments table foreign key to reference auth.users instead of profiles
    - This ensures proper referential integrity with Supabase auth system

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing foreign key
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;

-- Add new foreign key constraint
ALTER TABLE appointments
  ADD CONSTRAINT appointments_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;