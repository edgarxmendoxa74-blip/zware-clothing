-- Add weight column to menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS weight decimal(10,2) DEFAULT 0.5;

-- Update existing items with some weights if needed, or leave at default 0.5
COMMENT ON COLUMN menu_items.weight IS 'Weight of the item in kg';
