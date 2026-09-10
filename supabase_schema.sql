-- ==============================================================================
-- TOMATO AI FARM ASSISTANT - COMPLETE SUPABASE SQL SCHEMA
-- ==============================================================================
-- Run this script in your Supabase Dashboard:
-- SQL Editor -> New Query -> Paste this entire file -> Click "Run"
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES TABLE (Mirrors Supabase Auth Users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        new.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. FARMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    size_acres NUMERIC(6, 2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. FIELDS / TOMATO CROPS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    crop_type TEXT NOT NULL DEFAULT 'Roma VF (Determinate)',
    planting_date DATE,
    plant_count INTEGER DEFAULT 500,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. OBSERVATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notes TEXT,
    symptoms TEXT[] DEFAULT '{}',
    growth_stage TEXT,
    weather_condition TEXT,
    affected_part TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. IMAGES TABLE (Linked to Storage bucket)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observation_id UUID REFERENCES public.observations(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. DIAGNOSES TABLE (Combined Plant.id + Gemini Output)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observation_id UUID REFERENCES public.observations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    plant_id_result JSONB,
    diagnosis TEXT NOT NULL,
    confidence INTEGER NOT NULL DEFAULT 85,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Moderate', 'High', 'Critical')),
    explanation TEXT NOT NULL,
    warning TEXT,
    cultural_controls TEXT[],
    symptoms_detected TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. ACTION PLANS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagnosis_id UUID NOT NULL REFERENCES public.diagnoses(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Immediate', 'Within 48 hours', 'Long-term')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. CHAT SESSIONS & MESSAGES (AI Follow-up Chat)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagnosis_id UUID REFERENCES public.diagnoses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Farms: Users manage their own farms
CREATE POLICY "Users can view own farms" ON public.farms FOR ALL USING (auth.uid() = user_id);

-- Fields: Users manage fields linked to their farms
CREATE POLICY "Users can manage fields of own farms" ON public.fields FOR ALL
    USING (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = fields.farm_id AND farms.user_id = auth.uid()));

-- Observations: Users manage their own observations
CREATE POLICY "Users can manage own observations" ON public.observations FOR ALL USING (auth.uid() = user_id);

-- Images: Users manage images for their observations
CREATE POLICY "Users can manage own images" ON public.images FOR ALL
    USING (EXISTS (SELECT 1 FROM public.observations WHERE observations.id = images.observation_id AND observations.user_id = auth.uid()));

-- Diagnoses: Users view and create their own diagnoses
CREATE POLICY "Users can manage own diagnoses" ON public.diagnoses FOR ALL USING (auth.uid() = user_id);

-- Action Plans: Users manage action plans for their diagnoses
CREATE POLICY "Users can manage action plans" ON public.action_plans FOR ALL
    USING (EXISTS (SELECT 1 FROM public.diagnoses WHERE diagnoses.id = action_plans.diagnosis_id AND diagnoses.user_id = auth.uid()));

-- Chat: Users manage their chat sessions and messages
CREATE POLICY "Users can manage own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat messages" ON public.chat_messages FOR ALL
    USING (EXISTS (SELECT 1 FROM public.chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()));

-- ------------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKET CREATION (tomato-images)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('tomato-images', 'tomato-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: allow authenticated users to upload pictures
CREATE POLICY "Allow authenticated tomato uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tomato-images');

-- Storage Policy: allow public read of tomato plant photos
CREATE POLICY "Allow public read of tomato images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tomato-images');
