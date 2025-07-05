-- Superbaset migration script
-- Execute this in the Supabase SQL editor

-- Ensure Row Level Security is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watched_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

-- Create policies for user_preferences table
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid()::text = userId);

-- Create policies for watchlist_items table
CREATE POLICY "Users can manage own watchlist" ON public.watchlist_items
  FOR ALL USING (auth.uid()::text = userId);

-- Create policies for watched_series table
CREATE POLICY "Users can manage own watched history" ON public.watched_series
  FOR ALL USING (auth.uid()::text = userId);

-- Create policies for ratings table
CREATE POLICY "Users can manage own ratings" ON public.ratings
  FOR ALL USING (auth.uid()::text = userId);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
