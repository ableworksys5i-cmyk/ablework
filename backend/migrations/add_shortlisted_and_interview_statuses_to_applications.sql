ALTER TABLE applications
MODIFY COLUMN status ENUM('pending','shortlisted','interview','rejected','archived') NOT NULL DEFAULT 'pending';
