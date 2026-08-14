-- Non-destructive migration: add is_duplicate column to toolkit_reveals.
-- Safe to run multiple times (IF NOT EXISTS guard).
ALTER TABLE toolkit_reveals
  ADD COLUMN IF NOT EXISTS is_duplicate boolean NOT NULL DEFAULT false;
