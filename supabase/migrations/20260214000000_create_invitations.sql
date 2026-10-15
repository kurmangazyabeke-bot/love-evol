-- Migration: Create invitations table for LoveEvol builder
-- Compatible with PostgreSQL & Supabase

-- 1. Status enum type
DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- References auth.users(id) in Supabase or custom auth
    config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Full Zustand store configuration
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    status invitation_status NOT NULL DEFAULT 'pending',
    guest_answers JSONB NOT NULL DEFAULT '{}'::jsonb, -- Guest interaction results (selected activities, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON public.invitations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_config_gin ON public.invitations USING GIN (config);
CREATE INDEX IF NOT EXISTS idx_invitations_guest_answers_gin ON public.invitations USING GIN (guest_answers);

-- 4. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invitations_updated_at ON public.invitations;
CREATE TRIGGER trigger_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 5. Row Level Security (RLS) policies for Supabase
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view an invitation by its UUID (public guest view)
CREATE POLICY "Public guest read access"
ON public.invitations
FOR SELECT
USING (true);

-- Policy: Anyone can insert a draft invitation (anonymous or authenticated)
CREATE POLICY "Public draft insert"
ON public.invitations
FOR INSERT
WITH CHECK (true);

-- Policy: Author can update their own invitation
CREATE POLICY "Author can update invitation"
ON public.invitations
FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
