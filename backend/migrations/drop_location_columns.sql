-- Migration: Remove latitude/longitude from applicants and employers tables
-- Since location data is now stored in user_locations table, these columns are redundant

-- Backup existing data (optional, for safety):
-- CREATE TABLE applicants_backup AS SELECT * FROM applicants;
-- CREATE TABLE employers_backup AS SELECT * FROM employers;

-- Drop the columns
ALTER TABLE applicants DROP COLUMN latitude;
ALTER TABLE applicants DROP COLUMN longitude;

ALTER TABLE employers DROP COLUMN latitude;
ALTER TABLE employers DROP COLUMN longitude;

-- Verify:
-- DESCRIBE applicants;
-- DESCRIBE employers;
