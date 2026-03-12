-- Increase accreditation_status column size to accommodate longer status strings
ALTER TABLE intake_details
  MODIFY COLUMN accreditation_status VARCHAR(200) DEFAULT NULL;
