-- =====================================================================
-- Zweren Ph - Full Database Setup (Admin Dashboard + Storefront)
-- Tables: categories, menu_items, variations, add_ons, site_settings,
--         payment_methods, coupons + storage bucket 'menu-images'
--
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT, no TRUNCATE.
-- Paste into Supabase Dashboard -> SQL Editor -> Run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Helper function
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------

-- Categories (Collections)
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,                       -- kebab-case, e.g. 'premium-tees'
  name text NOT NULL,
  icon text NOT NULL DEFAULT '👕',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Menu Items (Products)
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  category text REFERENCES categories(id) ON UPDATE CASCADE,
  popular boolean DEFAULT false,
  available boolean DEFAULT true,
  image_url text,
  images text[] DEFAULT '{}',
  weight decimal(10,2) DEFAULT 0.5,          -- kg, used for shipping rates
  stock integer DEFAULT 0,
  discount_price decimal(10,2),
  discount_start_date timestamptz,
  discount_end_date timestamptz,
  discount_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Upgrade older menu_items tables with any missing columns
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS available boolean DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS weight decimal(10,2) DEFAULT 0.5;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_price decimal(10,2);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_start_date timestamptz;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_end_date timestamptz;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_active boolean DEFAULT false;

-- Variations (Sizes / Colors)
CREATE TABLE IF NOT EXISTS variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  image text,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE variations ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE variations ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;

-- Add-ons (Optional extras)
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Site Settings (key/value)
CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',         -- text | image | boolean | number
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id text PRIMARY KEY,                       -- e.g. 'gcash'
  name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  qr_code_url text NOT NULL,
  active boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL,
  min_spend decimal(10,2) DEFAULT 0,
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_variations_menu_item ON variations(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_add_ons_menu_item ON add_ons(menu_item_id);

-- ---------------------------------------------------------------------
-- 3. updated_at triggers
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------
-- 4. Row Level Security
-- NOTE: The admin dashboard logs in with a client-side password and talks
-- to Supabase using the public anon key, so write access is granted to
-- 'public'. This matches how the app currently works, but anyone with the
-- anon key can modify data. Switch to Supabase Auth + 'authenticated'
-- policies for real security.
-- ---------------------------------------------------------------------
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE variations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons         ENABLE ROW LEVEL SECURITY;

-- Categories
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Admin Manage Categories" ON categories;
CREATE POLICY "Public Read Categories"  ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Admin Manage Categories" ON categories FOR ALL    TO public USING (true) WITH CHECK (true);

-- Menu Items
DROP POLICY IF EXISTS "Public Read Menu Items" ON menu_items;
DROP POLICY IF EXISTS "Admin Manage Menu Items" ON menu_items;
CREATE POLICY "Public Read Menu Items"  ON menu_items FOR SELECT TO public USING (true);
CREATE POLICY "Admin Manage Menu Items" ON menu_items FOR ALL    TO public USING (true) WITH CHECK (true);

-- Variations
DROP POLICY IF EXISTS "Public Read Variations" ON variations;
DROP POLICY IF EXISTS "Admin Manage Variations" ON variations;
CREATE POLICY "Public Read Variations"  ON variations FOR SELECT TO public USING (true);
CREATE POLICY "Admin Manage Variations" ON variations FOR ALL    TO public USING (true) WITH CHECK (true);

-- Add-ons
DROP POLICY IF EXISTS "Public Read Add-ons" ON add_ons;
DROP POLICY IF EXISTS "Admin Manage Add-ons" ON add_ons;
CREATE POLICY "Public Read Add-ons"  ON add_ons FOR SELECT TO public USING (true);
CREATE POLICY "Admin Manage Add-ons" ON add_ons FOR ALL    TO public USING (true) WITH CHECK (true);

-- Site Settings
DROP POLICY IF EXISTS "Public Read Site Settings" ON site_settings;
DROP POLICY IF EXISTS "Admin Manage Site Settings" ON site_settings;
CREATE POLICY "Public Read Site Settings"  ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admin Manage Site Settings" ON site_settings FOR ALL    TO public USING (true) WITH CHECK (true);

-- Payment Methods
DROP POLICY IF EXISTS "Public Read Payment Methods" ON payment_methods;
DROP POLICY IF EXISTS "Admin Manage Payment Methods" ON payment_methods;
CREATE POLICY "Public Read Payment Methods"  ON payment_methods FOR SELECT TO public USING (true);
CREATE POLICY "Admin Manage Payment Methods" ON payment_methods FOR ALL    TO public USING (true) WITH CHECK (true);

-- Coupons
DROP POLICY IF EXISTS "Public Read Coupons" ON coupons;
DROP POLICY IF EXISTS "Admin Manage Coupons" ON coupons;
CREATE POLICY "Public Read Coupons"  ON coupons FOR SELECT TO public
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Admin Manage Coupons" ON coupons FOR ALL    TO public USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------
-- 5. Storage bucket for product / logo / QR images
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('menu-images', 'menu-images', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access"  ON storage.objects;
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Manage"  ON storage.objects;
DROP POLICY IF EXISTS "Public Delete"  ON storage.objects;
CREATE POLICY "Public Access"  ON storage.objects FOR SELECT TO public USING (bucket_id = 'menu-images');
CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'menu-images');
CREATE POLICY "Public Manage"  ON storage.objects FOR UPDATE TO public USING (bucket_id = 'menu-images');
CREATE POLICY "Public Delete"  ON storage.objects FOR DELETE TO public USING (bucket_id = 'menu-images');

-- =====================================================================
-- 6. SEED DATA
-- =====================================================================

-- Categories
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('premium-tees', 'Premium Tees',    '👕', 1, true),
  ('essentials',   'Essentials',      '🧥', 2, true),
  ('shorts',       'Shorts',          '🩳', 3, true),
  ('limited',      'Limited Edition', '💎', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Products (menu list)
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url, weight, stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Signature Oversized Tee',   'Premium 240GSM cotton, drop-shoulder fit. Minimalist Zweren chest embroidery.', 750,  'premium-tees', true,  true, 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800', 0.5, 50),
  ('550e8400-e29b-41d4-a716-446655440001', 'Classic Heavyweight Tee',   'Durable 220GSM cotton, standard fit. Perfect for daily wear.',                  550,  'premium-tees', false, true, 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800', 0.5, 50),
  ('550e8400-e29b-41d4-a716-446655440002', 'Urban Cargo Shorts',        'Multi-pocket design, premium twill fabric. Adjustable waist for maximum comfort.', 850, 'shorts',      true,  true, 'https://images.pexels.com/photos/1030947/pexels-photo-1030947.jpeg?auto=compress&cs=tinysrgb&w=800', 0.5, 50),
  ('550e8400-e29b-41d4-a716-446655440004', 'Minimalist Utility Shorts', 'Sleek, lightweight fabric. Water-resistant and breathable.',                     650,  'shorts',       false, true, 'https://images.pexels.com/photos/1030947/pexels-photo-1030947.jpeg?auto=compress&cs=tinysrgb&w=800', 0.5, 50),
  ('550e8400-e29b-41d4-a716-446655440003', 'Zweren Hoodie v1',          'Limited release. Ultra-soft fleece lining, high-density print logo.',            1200, 'limited',      true,  true, 'https://images.pexels.com/photos/6347888/pexels-photo-6347888.jpeg?auto=compress&cs=tinysrgb&w=800', 1.0, 20)
ON CONFLICT (id) DO NOTHING;

-- Size variations (only for seeded products that have no variations yet)
INSERT INTO variations (menu_item_id, name, price, stock)
SELECT m.id, s.name, s.price, 10
FROM menu_items m
CROSS JOIN (VALUES ('Small', 0), ('Medium', 0), ('Large', 0), ('XL', 50)) AS s(name, price)
WHERE m.id::text LIKE '550e8400-e29b-41d4-a716-44665544000%'
  AND NOT EXISTS (SELECT 1 FROM variations v WHERE v.menu_item_id = m.id);

-- Site settings
INSERT INTO site_settings (id, value, type, description) VALUES
  ('site_name',        'Zweren Ph', 'text', 'Store Name'),
  ('site_logo',        '/zweren-logo.jpg', 'image', 'Brand Logo'),
  ('site_description', 'Elevate your daily style with Zweren Ph premium apparel', 'text', 'Store Description'),
  ('currency',         '₱',   'text', 'Currency symbol for prices'),
  ('currency_code',    'PHP', 'text', 'Currency code for payments'),
  ('hero_subtitle',    'Elevate your lifestyle with our curated collection of premium essentials.', 'text', 'Hero section subtitle'),
  ('hero_images',      '["/images/promo-1.png", "/images/promo-2.png", "/images/promo-3.png"]', 'text', 'JSON array of hero slideshow image URLs'),
  ('shipping_rates',   '{"LUZON": {"3": 190, "5": 320, "10": 620, "19": 1220}, "VISAYAS": {"3": 200, "5": 370, "10": 720, "19": 1420}, "MINDANAO": {"3": 200, "5": 370, "10": 720, "19": 1420}, "ISLANDER": {"3": 220, "5": 420, "10": 820, "19": 1620}}', 'text', 'Shipping rates by location and weight (3kg, 5kg, 10kg, 19kg)')
ON CONFLICT (id) DO NOTHING;

-- Payment methods (replace account details / QR in the admin dashboard)
INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active) VALUES
  ('gcash', 'GCash', '09XX XXX XXXX', 'Zweren Ph', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_spend) VALUES
  ('ZWEREN10',  'percentage', 10, 0),
  ('WELCOME50', 'fixed',      50, 500)
ON CONFLICT (code) DO NOTHING;
