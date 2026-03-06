-- Migration: Clinical Data Enrichment (Symptoms & History)
-- This script adds the columns required for the advanced clinical profile used by the Flask liver model.

ALTER TABLE liver_reports 
ADD COLUMN IF NOT EXISTS fatigue BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS spiders BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ascites BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS varices BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS steroid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS antivirals BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alk_phosphate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS protime NUMERIC DEFAULT 0;

-- Optional: Add a probability_score column if we want to store the percentage calculation
ALTER TABLE liver_reports 
ADD COLUMN IF NOT EXISTS probability_score NUMERIC DEFAULT 0;

COMMENT ON COLUMN liver_reports.fatigue IS 'Patient reported excessive fatigue';
COMMENT ON COLUMN liver_reports.spiders IS 'Presence of spider angiomas';
COMMENT ON COLUMN liver_reports.ascites IS 'Presence of abdominal fluid buildup';
COMMENT ON COLUMN liver_reports.varices IS 'Presence of esophageal varices';
COMMENT ON COLUMN liver_reports.alk_phosphate IS 'Alkaline Phosphatase (ALP) level in U/L';
COMMENT ON COLUMN liver_reports.protime IS 'Prothrombin Time (PT) in seconds';
