-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Insert default admin (Password: as requested)
INSERT INTO public.admins (username, password) 
VALUES ('admin', 'PatchUpAdmin2026')
ON CONFLICT (username) DO NOTHING;

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    compare_at_price NUMERIC
);

-- Insert initial product
INSERT INTO public.products (id, name, price, compare_at_price) 
VALUES (1, '30 Day Acne Emergency Kit', 395.00, 495.00)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price;

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Security Policies
-- Allow anyone to read the products so the website can show the price
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT TO anon USING (true);

-- Allow anyone to read the admins so the login page can check credentials
CREATE POLICY "Allow public read on admins" ON public.admins FOR SELECT TO anon USING (true);

-- Allow anyone to update products (Since we don't have secure cookies, the update API call will be done from the frontend)
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE TO anon USING (true);
