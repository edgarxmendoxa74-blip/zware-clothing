-- Insert shipping rates into site settings
INSERT INTO site_settings (id, value, type, description) VALUES
  ('shipping_rates', '{"LUZON": {"3": 190, "5": 320, "10": 620, "19": 1220}, "VISAYAS": {"3": 200, "5": 370, "10": 720, "19": 1420}, "MINDANAO": {"3": 200, "5": 370, "10": 720, "19": 1420}, "ISLANDER": {"3": 220, "5": 420, "10": 820, "19": 1620}}', 'text', 'JSON object containing shipping rates by location and weight (3kg, 5kg, 10kg, 19kg)')
ON CONFLICT (id) DO NOTHING;
