-- Zweren Ph Initial Data Migration
-- Clean up existing data to avoid conflicts and start fresh for the conversion
TRUNCATE TABLE variations CASCADE;
TRUNCATE TABLE menu_items CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Insert Clothing Categories
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('premium-tees', 'Premium Tees', '👕', 1, true),
  ('essentials', 'Essentials', '🧥', 2, true),
  ('shorts', 'Shorts', '🩳', 3, true),
  ('limited', 'Limited Edition', '💎', 4, true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

-- Insert Products (Menu Items)
-- Premium Tees
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url) VALUES
  ('sig-ov-tee', 'Signature Oversized Tee', 'Premium 240GSM cotton, drop-shoulder fit. Minimalist Zweren chest embroidery.', 750, 'premium-tees', true, true, 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('heavy-tee', 'Classic Heavyweight Tee', 'Durable 220GSM cotton, standard fit. Perfect for daily wear.', 550, 'premium-tees', false, true, 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Shorts
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url) VALUES
  ('urban-cargo', 'Urban Cargo Shorts', 'Multi-pocket design, premium twill fabric. Adjustable waist for maximum comfort.', 850, 'shorts', true, true, 'https://images.pexels.com/photos/1030947/pexels-photo-1030947.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('util-shorts', 'Minimalist Utility Shorts', 'Sleek, lightweight fabric. Water-resistant and breathable.', 650, 'shorts', false, true, 'https://images.pexels.com/photos/1030947/pexels-photo-1030947.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Limited
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url) VALUES
  ('hoodie-v1', 'Zweren Hoodie v1', 'Limited release. Ultra-soft fleece lining, high-density print logo.', 1200, 'limited', true, true, 'https://images.pexels.com/photos/6347888/pexels-photo-6347888.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Add Size Variations for all items
INSERT INTO variations (menu_item_id, name, price)
SELECT id, unnest(ARRAY['Small', 'Medium', 'Large']), 0 FROM menu_items;

INSERT INTO variations (menu_item_id, name, price)
SELECT id, 'XL', 50 FROM menu_items;

-- Add Color Variations for Signature Tee
INSERT INTO variations (menu_item_id, name, price) VALUES
  ('sig-ov-tee', 'Black Edition', 0),
  ('sig-ov-tee', 'White Edition', 0);


-- Update Site Settings to Zweren Ph
INSERT INTO site_settings (id, value, type, description) VALUES
  ('site_name', 'Zweren Ph', 'text', 'The name of the clothing store'),
  ('site_logo', '/images/zweren-logo.png', 'image', 'The logo image for the site'),
  ('site_description', 'Elevate your daily style with Zweren Ph premium apparel', 'text', 'Short description of the store')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;
