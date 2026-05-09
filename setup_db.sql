-- Create the newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts from your web app
CREATE POLICY "Allow anonymous inserts" ON public.newsletter_subscribers
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Optional: Create policy to allow admins (service role) to read all subscribers
CREATE POLICY "Allow service role to read all" ON public.newsletter_subscribers
    FOR SELECT
    TO service_role
    USING (true);
