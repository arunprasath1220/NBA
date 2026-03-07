-- Add academic year snapshot support for allied course mapping groups.
-- Format: academic_year = 'YYYY-YY' (example: 2026-27)

ALTER TABLE allied_course_group
  ADD COLUMN academic_year VARCHAR(9) NULL AFTER id;

-- Backfill existing rows to a baseline year. Adjust this value if needed.
UPDATE allied_course_group
SET academic_year = '2025-26'
WHERE academic_year IS NULL;

ALTER TABLE allied_course_group
  MODIFY COLUMN academic_year VARCHAR(9) NOT NULL;

CREATE INDEX idx_allied_course_group_academic_year
  ON allied_course_group (academic_year);
