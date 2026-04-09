CREATE TABLE IF NOT EXISTS interviews (
  interview_id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  interview_date DATE NULL,
  interview_time TIME NULL,
  interview_type VARCHAR(50) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
);
