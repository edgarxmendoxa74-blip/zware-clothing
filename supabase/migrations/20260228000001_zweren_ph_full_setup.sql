-- Zweren Ph Full Database Setup (Schema + Initial Data)
-- This script creates the necessary tables, functions, and seed data for a fresh Supabase project.

-- 1. Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Tables Creation
-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '👕',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Menu Items Table (Products)
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  category text REFERENCES categories(id),
  popular boolean DEFAULT false,
  available boolean DEFAULT true,
  image_url text,
  discount_price decimal(10,2),
  discount_start_date timestamptz,
  discount_end_date timestamptz,
  discount_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Variations Table (Sizes/Colors)
CREATE TABLE IF NOT EXISTS variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  image text,
  created_at timestamptz DEFAULT now()
);

-- Add-ons Table (Optional extras)
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  description text,
  updated_at timestamptz DEFAULT now()
);

-- 3. Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DO $$ BEGIN
  CREATE POLICY "Public Read Categories" ON categories FOR SELECT TO public USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Menu Items" ON menu_items FOR SELECT TO public USING (available = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Variations" ON variations FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Add-ons" ON add_ons FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Site Settings" ON site_settings FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin Management Policies (Allow all for authenticated/service_role to keep it simple for setup)
DO $$ BEGIN
  CREATE POLICY "Admin Manage Categories" ON categories FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin Manage Menu Items" ON menu_items FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin Manage Variations" ON variations FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin Manage Site Settings" ON site_settings FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. INITIAL DATA (Zweren Ph Catalog)
TRUNCATE TABLE variations CASCADE;
TRUNCATE TABLE menu_items CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Categories
INSERT INTO categories (id, name, icon, sort_order) VALUES
  ('premium-tees', 'Premium Tees', '👕', 1),
  ('essentials', 'Essentials', '🧥', 2),
  ('shorts', 'Shorts', '🩳', 3),
  ('limited', 'Limited Edition', '💎', 4);

-- Products
INSERT INTO menu_items (id, name, description, base_price, category, popular, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Signature Oversized Tee', 'Premium 240GSM cotton, drop-shoulder fit. Minimalist Zweren chest embroidery.', 750, 'premium-tees', true, 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Classic Heavyweight Tee', 'Durable 220GSM cotton, standard fit. Perfect for daily wear.', 550, 'premium-tees', false, 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Urban Cargo Shorts', 'Multi-pocket design, premium twill fabric. Adjustable waist.', 850, 'shorts', true, 'https://images.pexels.com/photos/1030947/pexels-photo-1030947.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Zweren Hoodie v1', 'Limited release. Ultra-soft fleece lining, high-density print logo.', 1200, 'limited', true, 'https://images.pexels.com/photos/6347888/pexels-photo-6347888.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Variations (Sizes)
INSERT INTO variations (menu_item_id, name, price)
SELECT id, unnest(ARRAY['Small', 'Medium', 'Large']), 0 FROM menu_items;

INSERT INTO variations (menu_item_id, name, price)
SELECT id, 'XL', 50 FROM menu_items;

-- Site Settings
INSERT INTO site_settings (id, value, type, description) VALUES
  ('site_name', 'Zweren Ph', 'text', 'Store Name'),
  ('site_logo', '/images/zweren-logo.png', 'image', 'Brand Logo'),
  ('site_description', 'Elevate your daily style with Zweren Ph premium apparel', 'text', 'Store Description')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;
