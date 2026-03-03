-- Insert hero-related site settings
INSERT INTO site_settings (id, value, type, description) VALUES
  ('hero_subtitle', 'Elevate your lifestyle with our curated collection of premium essentials.', 'text', 'The subtitle text displayed in the hero section'),
  ('hero_images', '["/images/promo-1.png", "/images/promo-2.png", "/images/promo-3.png"]', 'text', 'JSON array of image URLs for the hero slideshow')
ON CONFLICT (id) DO NOTHING;
