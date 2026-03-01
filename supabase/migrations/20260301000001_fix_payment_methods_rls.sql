-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can manage payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Anyone can read active payment methods" ON payment_methods;

-- Create new public management policy
CREATE POLICY "Admin Manage Payment Methods"
  ON payment_methods
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create new public read policy (redundant but kept for clarity/alignment)
CREATE POLICY "Public Read Payment Methods"
  ON payment_methods
  FOR SELECT
  TO public
  USING (true);
