-- 1. Create payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  qr_code_url text NOT NULL,
  active boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing restrictive policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Authenticated users can manage payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Anyone can read active payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admin Manage Payment Methods" ON payment_methods;
DROP POLICY IF EXISTS "Public Read Payment Methods" ON payment_methods;

-- 4. Create new public management policy
CREATE POLICY "Admin Manage Payment Methods"
  ON payment_methods
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 5. Create new public read policy
CREATE POLICY "Public Read Payment Methods"
  ON payment_methods
  FOR SELECT
  TO public
  USING (true);

-- 6. Create updated_at trigger if it doesn't exist
DO $$ BEGIN
  CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. Insert default payment methods if table is empty
INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active)
SELECT 'gcash', 'GCash', '09XX XXX XXXX', 'M&C Bakehouse', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 1, true
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE id = 'gcash');

INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active)
SELECT 'maya', 'Maya (PayMaya)', '09XX XXX XXXX', 'M&C Bakehouse', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 2, true
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE id = 'maya');
