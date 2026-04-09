-- Migration: Add employer website and job required skills fields
-- Run this against your AbleWorkSystem MySQL database.

ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS company_website VARCHAR(255) DEFAULT NULL;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS required_skills TEXT DEFAULT NULL;
