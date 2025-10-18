-- Crear tabla de cuentas financieras
CREATE TABLE public.financial_accounts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('Banco', 'Efectivo', 'Tarjeta de Crédito', 'Otro')),
    location_id uuid REFERENCES public.locations(id),
    assigned_user_ids text[], -- Array de IDs de usuarios asignados
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Enable read access for all users" ON public.financial_accounts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.financial_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.financial_accounts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.financial_accounts FOR DELETE USING (auth.role() = 'authenticated');

-- Crear índices para mejor rendimiento
CREATE INDEX idx_financial_accounts_location_id ON public.financial_accounts(location_id);
CREATE INDEX idx_financial_accounts_type ON public.financial_accounts(type);

-- Insertar algunas cuentas de ejemplo
INSERT INTO public.financial_accounts (name, type, location_id) VALUES
('Caja Principal', 'Efectivo', (SELECT id FROM locations LIMIT 1)),
('Banco Bogotá', 'Banco', (SELECT id FROM locations LIMIT 1)),
('Tarjeta de Crédito Principal', 'Tarjeta de Crédito', (SELECT id FROM locations LIMIT 1));
