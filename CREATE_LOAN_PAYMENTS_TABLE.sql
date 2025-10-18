-- Crear tabla de pagos de préstamos
CREATE TABLE public.loan_payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id uuid REFERENCES public.loans(id) ON DELETE CASCADE,
    amount numeric NOT NULL CHECK (amount > 0),
    payment_date timestamp with time zone NOT NULL,
    is_payroll_deduction boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Enable read access for all users" ON public.loan_payments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.loan_payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.loan_payments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.loan_payments FOR DELETE USING (auth.role() = 'authenticated');

-- Crear índices para mejor rendimiento
CREATE INDEX idx_loan_payments_loan_id ON public.loan_payments(loan_id);
CREATE INDEX idx_loan_payments_payment_date ON public.loan_payments(payment_date);
CREATE INDEX idx_loan_payments_is_payroll_deduction ON public.loan_payments(is_payroll_deduction);
