-- ==========================================
-- SECTION 0: ULTIMATE REPAIR (RUN THESE FIRST)
-- ==========================================

-- This block renames existing lowercase columns to camelCase if they exist
-- and adds them if they are missing. Use double quotes for exact casing.
DO $$ 
BEGIN 
    -- 1. FIX COLUMN CASING (Renaming any old lowercase columns)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='invno') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='invNo') THEN ALTER TABLE public.invoices RENAME COLUMN invno TO "invNo"; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='invdate') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='invDate') THEN ALTER TABLE public.invoices RENAME COLUMN invdate TO "invDate"; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='billto') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='billTo') THEN ALTER TABLE public.invoices RENAME COLUMN billto TO "billTo"; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='shipto') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='shipTo') THEN ALTER TABLE public.invoices RENAME COLUMN shipto TO "shipTo"; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='paymentmode') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='paymentMode') THEN ALTER TABLE public.invoices RENAME COLUMN paymentmode TO "paymentMode"; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='paymentstatus') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='paymentStatus') THEN ALTER TABLE public.invoices RENAME COLUMN paymentstatus TO "paymentStatus"; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='amountinwords') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='amountInWords') THEN ALTER TABLE public.invoices RENAME COLUMN amountinwords TO "amountInWords"; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='savedat') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='savedAt') THEN ALTER TABLE public.invoices RENAME COLUMN savedat TO "savedAt"; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='pdfurl') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='pdfUrl') THEN ALTER TABLE public.invoices RENAME COLUMN pdfurl TO "pdfUrl"; END IF;

    -- 2. ENSURE ALL COLUMNS EXIST WITH EXACT CASE
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "invNo" TEXT;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "invDate" TIMESTAMPTZ;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "billTo" JSONB;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "shipTo" JSONB;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "items" JSONB;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "totals" JSONB;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "paymentMode" TEXT;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "paymentLink" TEXT;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "qrDataUri" TEXT;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "amountInWords" TEXT;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "extraNotes" TEXT;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "status" TEXT;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "savedAt" TIMESTAMPTZ;
END $$;

-- 3. FORCE SCHEMA CACHE RELOAD (Critical for resolving 'not in schema cache' errors)
NOTIFY pgrst, 'reload schema';

-- 2. Unlock Storage Bucket with Explicit Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old policies to clear any blocks
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Delete" ON storage.objects;

-- Create explicit policies for the 'invoices' bucket
CREATE POLICY "Allow Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'invoices');
CREATE POLICY "Allow Public Select" ON storage.objects FOR SELECT USING (bucket_id = 'invoices');
CREATE POLICY "Allow Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'invoices');
CREATE POLICY "Allow Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'invoices');

-- ==========================================
-- SECTION 1: FULL TABLE SETUP
-- ==========================================

-- 1. Metal Rates Table
CREATE TABLE IF NOT EXISTS public.metal_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "pureGold" FLOAT8 DEFAULT 0,
    "pureSilver" FLOAT8 DEFAULT 0,
    "gold22k" FLOAT8 DEFAULT 0,
    "silver925" FLOAT8 DEFAULT 0,
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT DEFAULT 'default_user'
);

-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "invNo" TEXT NOT NULL,
    "invDate" TIMESTAMPTZ NOT NULL,
    "billTo" JSONB NOT NULL,
    "shipTo" JSONB,
    items JSONB NOT NULL,
    totals JSONB NOT NULL,
    "paymentMode" TEXT,
    "paymentStatus" TEXT,
    "paymentLink" TEXT,
    "qrDataUri" TEXT,
    "amountInWords" TEXT,
    "extraNotes" TEXT,
    status TEXT,
    "pdfUrl" TEXT,
    "savedAt" TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    "metalType" TEXT,
    purity TEXT,
    hsn TEXT,
    "grossWeight" FLOAT8 DEFAULT 0,
    "netWeight" FLOAT8 DEFAULT 0,
    "mc_type" TEXT,
    "mc_value" FLOAT8 DEFAULT 0,
    stock INT4 DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.metal_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Add Public Access Policies
DROP POLICY IF EXISTS "Allow public access" ON public.metal_rates;
CREATE POLICY "Allow public access" ON public.metal_rates FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access" ON public.invoices;
CREATE POLICY "Allow public access" ON public.invoices FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access" ON public.products;
CREATE POLICY "Allow public access" ON public.products FOR ALL USING (true);
