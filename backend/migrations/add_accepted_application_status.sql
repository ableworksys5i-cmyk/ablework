-- Migration: Add accepted to application status enum
ALTER TABLE applications
MODIFY COLUMN status ENUM('pending','shortlisted','interview','accepted','rejected','archived')
NOT NULL DEFAULT 'pending';
