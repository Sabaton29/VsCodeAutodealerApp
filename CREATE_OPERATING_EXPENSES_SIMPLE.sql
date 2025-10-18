-- =====================================================
-- CREAR TABLA OPERATING_EXPENSES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.operating_expenses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    description text NOT NULL,
    category text NOT NULL CHECK (category IN ('Nómina', 'Arriendo', 'Servicios Públicos', 'Marketing', 'Administrativos', 'Otro')),
    amount numeric NOT NULL CHECK (amount > 0),
    date timestamp with time zone NOT NULL,
    location_id uuid,
    account_id uuid,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.operating_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Enable read access for all users" ON public.operating_expenses FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.operating_expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.operating_expenses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.operating_expenses FOR DELETE USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX IF NOT EXISTS idx_operating_expenses_date ON public.operating_expenses(date);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_location_id ON public.operating_expenses(location_id);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_account_id ON public.operating_expenses(account_id);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_user_id ON public.operating_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_category ON public.operating_expenses(category);

-- Mensaje de confirmación
SELECT '✅ Tabla operating_expenses creada exitosamente' as resultado;
