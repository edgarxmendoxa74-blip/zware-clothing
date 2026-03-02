-- Add images column to menu_items table to support multiple product images
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Update RLS policies to ensure public can read the new column (usually inherited)
-- No specific changes needed for RLS if it's already "SELECT TO public USING (available = true)"
