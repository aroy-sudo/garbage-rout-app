-- CREATE DISTRICTS TABLE
CREATE TABLE IF NOT EXISTS public.lgd_districts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

-- CREATE BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.lgd_blocks (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    district_id INTEGER NOT NULL REFERENCES public.lgd_districts(id) ON DELETE CASCADE
);

-- CREATE PANCHAYATS TABLE
CREATE TABLE IF NOT EXISTS public.lgd_panchayats (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    block_id INTEGER NOT NULL REFERENCES public.lgd_blocks(id) ON DELETE CASCADE
);

-- CREATE VILLAGES TABLE
CREATE TABLE IF NOT EXISTS public.lgd_villages (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    panchayat_id INTEGER NOT NULL REFERENCES public.lgd_panchayats(id) ON DELETE CASCADE
);

-- ENABLE ROW LEVEL SECURITY (RLS) FOR READ ACCESSIBILITY
ALTER TABLE public.lgd_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgd_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgd_panchayats ENABLE ROW SECURITY;
ALTER TABLE public.lgd_villages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to lgd_districts" ON public.lgd_districts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to lgd_blocks" ON public.lgd_blocks FOR SELECT USING (true);
CREATE POLICY "Allow public read access to lgd_panchayats" ON public.lgd_panchayats FOR SELECT USING (true);
CREATE POLICY "Allow public read access to lgd_villages" ON public.lgd_villages FOR SELECT USING (true);

-- CREATE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_lgd_blocks_district_id ON public.lgd_blocks(district_id);
CREATE INDEX IF NOT EXISTS idx_lgd_panchayats_block_id ON public.lgd_panchayats(block_id);
CREATE INDEX IF NOT EXISTS idx_lgd_villages_panchayat_id ON public.lgd_villages(panchayat_id);
