-- ==========================================
-- REPAIR SCRIPT: FIX METAL RATES SYNC
-- ==========================================

-- 1. Ensure the table has the correct column casing (Case-Sensitive)
DO $$ 
BEGIN 
    -- Add columns with double quotes to force exact casing that matches the website code
    ALTER TABLE public.metal_rates ADD COLUMN IF NOT EXISTS "pureGold" FLOAT8 DEFAULT 0;
    ALTER TABLE public.metal_rates ADD COLUMN IF NOT EXISTS "pureSilver" FLOAT8 DEFAULT 0;
    ALTER TABLE public.metal_rates ADD COLUMN IF NOT EXISTS "gold22k" FLOAT8 DEFAULT 0;
    ALTER TABLE public.metal_rates ADD COLUMN IF NOT EXISTS "silver925" FLOAT8 DEFAULT 0;
    ALTER TABLE public.metal_rates ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();
    
    -- Rename any old lowercase columns if they exist to avoid confusion
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='metal_rates' AND column_name='puregold') THEN 
        ALTER TABLE public.metal_rates RENAME COLUMN puregold TO "pureGold_old"; 
    END IF;
END $$;

-- 2. Ensure Public Access is allowed
ALTER TABLE public.metal_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access" ON public.metal_rates;
CREATE POLICY "Allow public access" ON public.metal_rates FOR ALL USING (true);

-- 3. CRITICAL: Force Supabase to refresh its internal cache
NOTIFY pgrst, 'reload schema';
