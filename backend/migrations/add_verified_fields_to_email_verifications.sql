-- Add missing fields to email_verifications table
ALTER TABLE email_verifications
ADD COLUMN email VARCHAR(255) NOT NULL AFTER user_id,
ADD COLUMN verified BOOLEAN DEFAULT FALSE AFTER expires_at,
ADD COLUMN verified_at TIMESTAMP NULL AFTER verified;

-- Create index for email lookups (ignore error if already exists)
CREATE INDEX idx_email_verifications_email ON email_verifications(email);