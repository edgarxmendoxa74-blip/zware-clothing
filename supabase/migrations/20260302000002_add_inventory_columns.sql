-- Add stock column to menu_items and variations
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE variations ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
