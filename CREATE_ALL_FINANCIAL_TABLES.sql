-- =====================================================
-- SCRIPT MAESTRO: CREAR TODAS LAS TABLAS FINANCIERAS
-- =====================================================
-- Este script crea todas las tablas necesarias para el módulo de finanzas
-- Ejecutar en el orden correcto para evitar errores de dependencias

-- 1. CUENTAS FINANCIERAS (debe ir primero)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financial_accounts (
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
DROP POLICY IF EXISTS "Enable read access for all users" ON public.financial_accounts;
CREATE POLICY "Enable read access for all users" ON public.financial_accounts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.financial_accounts;
CREATE POLICY "Enable insert for authenticated users only" ON public.financial_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.financial_accounts;
CREATE POLICY "Enable update for authenticated users only" ON public.financial_accounts FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.financial_accounts;
CREATE POLICY "Enable delete for authenticated users only" ON public.financial_accounts FOR DELETE USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX IF NOT EXISTS idx_financial_accounts_location_id ON public.financial_accounts(location_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_type ON public.financial_accounts(type);

-- 2. PRÉSTAMOS (debe ir antes de loan_payments)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.loans (
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
DROP POLICY IF EXISTS "Enable read access for all users" ON public.loans;
CREATE POLICY "Enable read access for all users" ON public.loans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.loans;
CREATE POLICY "Enable insert for authenticated users only" ON public.loans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.loans;
CREATE POLICY "Enable update for authenticated users only" ON public.loans FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.loans;
CREATE POLICY "Enable delete for authenticated users only" ON public.loans FOR DELETE USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX IF NOT EXISTS idx_loans_staff_id ON public.loans(staff_id);
CREATE INDEX IF NOT EXISTS idx_loans_location_id ON public.loans(location_id);
CREATE INDEX IF NOT EXISTS idx_loans_issue_date ON public.loans(issue_date);

-- 3. PAGOS DE PRÉSTAMOS (depende de loans)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.loan_payments (
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
DROP POLICY IF EXISTS "Enable read access for all users" ON public.loan_payments;
CREATE POLICY "Enable read access for all users" ON public.loan_payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.loan_payments;
CREATE POLICY "Enable insert for authenticated users only" ON public.loan_payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.loan_payments;
CREATE POLICY "Enable update for authenticated users only" ON public.loan_payments FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.loan_payments;
CREATE POLICY "Enable delete for authenticated users only" ON public.loan_payments FOR DELETE USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON public.loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_payment_date ON public.loan_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_loan_payments_is_payroll_deduction ON public.loan_payments(is_payroll_deduction);

-- 4. TRANSACCIONES DE CAJA MENOR (depende de financial_accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.petty_cash_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    description text NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    date timestamp with time zone NOT NULL,
    payment_method text CHECK (payment_method IN ('Efectivo', 'Transferencia', 'Tarjeta de Crédito', 'Tarjeta de Crédito (Socio)', 'Crédito')),
    supplier_id uuid REFERENCES public.suppliers(id),
    payment_partner_id uuid REFERENCES public.suppliers(id),
    receipt_image_url text,
    location_id uuid REFERENCES public.locations(id),
    account_id uuid REFERENCES public.financial_accounts(id),
    user_id uuid NOT NULL, -- ID del usuario que registró la transacción
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.petty_cash_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DROP POLICY IF EXISTS "Enable read access for all users" ON public.petty_cash_transactions;
CREATE POLICY "Enable read access for all users" ON public.petty_cash_transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.petty_cash_transactions;
CREATE POLICY "Enable insert for authenticated users only" ON public.petty_cash_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.petty_cash_transactions;
CREATE POLICY "Enable update for authenticated users only" ON public.petty_cash_transactions FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.petty_cash_transactions;
CREATE POLICY "Enable delete for authenticated users only" ON public.petty_cash_transactions FOR DELETE USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_date ON public.petty_cash_transactions(date);
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_location_id ON public.petty_cash_transactions(location_id);
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_account_id ON public.petty_cash_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_user_id ON public.petty_cash_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_type ON public.petty_cash_transactions(type);

-- 5. GASTOS OPERATIVOS (depende de financial_accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.operating_expenses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    description text NOT NULL,
    category text NOT NULL CHECK (category IN ('Nómina', 'Arriendo', 'Servicios Públicos', 'Marketing', 'Administrativos', 'Otro')),
    amount numeric NOT NULL CHECK (amount > 0),
    date timestamp with time zone NOT NULL,
    location_id uuid REFERENCES public.locations(id),
    account_id uuid REFERENCES public.financial_accounts(id),
    user_id uuid NOT NULL, -- ID del usuario que registró el gasto
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.operating_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DROP POLICY IF EXISTS "Enable read access for all users" ON public.operating_expenses;
CREATE POLICY "Enable read access for all users" ON public.operating_expenses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.operating_expenses;
CREATE POLICY "Enable insert for authenticated users only" ON public.operating_expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.operating_expenses;
CREATE POLICY "Enable update for authenticated users only" ON public.operating_expenses FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.operating_expenses;
CREATE POLICY "Enable delete for authenticated users only" ON public.operating_expenses FOR DELETE USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX IF NOT EXISTS idx_operating_expenses_date ON public.operating_expenses(date);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_location_id ON public.operating_expenses(location_id);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_account_id ON public.operating_expenses(account_id);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_user_id ON public.operating_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_category ON public.operating_expenses(category);

-- 6. CONTROL DE TIEMPO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.time_clock_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id uuid NOT NULL, -- ID del empleado
    type text NOT NULL CHECK (type IN ('in', 'out')),
    timestamp timestamp with time zone NOT NULL,
    location_id uuid REFERENCES public.locations(id),
    notes text, -- Notas opcionales sobre la entrada
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.time_clock_entries ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DROP POLICY IF EXISTS "Enable read access for all users" ON public.time_clock_entries;
CREATE POLICY "Enable read access for all users" ON public.time_clock_entries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.time_clock_entries;
CREATE POLICY "Enable insert for authenticated users only" ON public.time_clock_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.time_clock_entries;
CREATE POLICY "Enable update for authenticated users only" ON public.time_clock_entries FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.time_clock_entries;
CREATE POLICY "Enable delete for authenticated users only" ON public.time_clock_entries FOR DELETE USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_staff_id ON public.time_clock_entries(staff_id);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_timestamp ON public.time_clock_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_location_id ON public.time_clock_entries(location_id);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_type ON public.time_clock_entries(type);

-- 7. INSERTAR DATOS DE EJEMPLO
-- =====================================================
-- Insertar algunas cuentas financieras de ejemplo
INSERT INTO public.financial_accounts (name, type, location_id) 
SELECT 'Caja Principal', 'Efectivo', id FROM locations LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.financial_accounts (name, type, location_id) 
SELECT 'Banco Bogotá', 'Banco', id FROM locations LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.financial_accounts (name, type, location_id) 
SELECT 'Tarjeta de Crédito Principal', 'Tarjeta de Crédito', id FROM locations LIMIT 1
ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Todas las tablas financieras han sido creadas exitosamente!';
    RAISE NOTICE '📊 Tablas creadas:';
    RAISE NOTICE '   - financial_accounts';
    RAISE NOTICE '   - loans';
    RAISE NOTICE '   - loan_payments';
    RAISE NOTICE '   - petty_cash_transactions';
    RAISE NOTICE '   - operating_expenses';
    RAISE NOTICE '   - time_clock_entries';
    RAISE NOTICE '🔐 RLS habilitado y políticas de seguridad configuradas';
    RAISE NOTICE '📈 Índices creados para optimizar consultas';
    RAISE NOTICE '💡 Datos de ejemplo insertados en financial_accounts';
END $$;
