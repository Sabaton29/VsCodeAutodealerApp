-- =====================================================
-- CREAR TABLA TIME_CLOCK_ENTRIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.time_clock_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id uuid NOT NULL,
    type text NOT NULL CHECK (type IN ('in', 'out')),
    timestamp timestamp with time zone NOT NULL,
    location_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.time_clock_entries ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Enable read access for all users" ON public.time_clock_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.time_clock_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.time_clock_entries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.time_clock_entries FOR DELETE USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_staff_id ON public.time_clock_entries(staff_id);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_timestamp ON public.time_clock_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_location_id ON public.time_clock_entries(location_id);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_type ON public.time_clock_entries(type);

-- Mensaje de confirmación
SELECT '✅ Tabla time_clock_entries creada exitosamente' as resultado;
