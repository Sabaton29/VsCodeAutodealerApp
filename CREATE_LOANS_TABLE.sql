-- Crear tabla de préstamos
CREATE TABLE public.loans (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id uuid NOT NULL, -- ID del empleado que recibió el préstamo
    location_id uuid REFERENCES public.locations(id),
    amount numeric NOT NULL CHECK (amount > 0),
    reason text NOT NULL,
    issue_date date NOT NULL,
    deduction_per_pay_period numeric NOT NULL CHECK (deduction_per_pay_period > 0),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Enable read access for all users" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.loans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.loans FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.loans FOR DELETE USING (auth.role() = 'authenticated');

-- Crear índices para mejor rendimiento
CREATE INDEX idx_loans_staff_id ON public.loans(staff_id);
CREATE INDEX idx_loans_location_id ON public.loans(location_id);
CREATE INDEX idx_loans_issue_date ON public.loans(issue_date);
