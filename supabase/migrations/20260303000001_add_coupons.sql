-- Create coupons table
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

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public READ (to check if a coupon is valid at checkout)
DO $$ BEGIN
  CREATE POLICY "Public Read Coupons" ON coupons FOR SELECT TO public USING (active = true AND (expires_at IS NULL OR expires_at > now()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin Manage
DO $$ BEGIN
  CREATE POLICY "Admin Manage Coupons" ON coupons FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed some initial coupons
INSERT INTO coupons (code, discount_type, discount_value, min_spend) VALUES
  ('ZWEREN10', 'percentage', 10, 0),
  ('WELCOME50', 'fixed', 50, 500)
ON CONFLICT (code) DO NOTHING;
