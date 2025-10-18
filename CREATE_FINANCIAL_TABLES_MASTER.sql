-- =====================================================
-- SCRIPT MAESTRO: CREAR TODAS LAS TABLAS FINANCIERAS
-- =====================================================
-- Este script crea todas las tablas financieras de una vez

-- 1. CREAR TABLA FINANCIAL_ACCOUNTS
-- =====================================================
DROP TABLE IF EXISTS public.financial_accounts CASCADE;
CREATE TABLE public.financial_accounts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('Banco', 'Efectivo', 'Tarjeta de Crédito', 'Otro')),
    location_id uuid,
    assigned_user_ids text[],
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

-- Índices
CREATE INDEX idx_financial_accounts_location_id ON public.financial_accounts(location_id);
CREATE INDEX idx_financial_accounts_type ON public.financial_accounts(type);

-- Insertar datos de ejemplo
INSERT INTO public.financial_accounts (id, name, type, location_id) VALUES
(gen_random_uuid(), 'Caja Principal', 'Efectivo', NULL),
(gen_random_uuid(), 'Banco Bogotá', 'Banco', NULL),
(gen_random_uuid(), 'Tarjeta de Crédito Principal', 'Tarjeta de Crédito', NULL);

-- 2. CREAR TABLA PETTY_CASH_TRANSACTIONS
-- =====================================================
DROP TABLE IF EXISTS public.petty_cash_transactions CASCADE;
CREATE TABLE public.petty_cash_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    description text NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    date timestamp with time zone NOT NULL,
    payment_method text CHECK (payment_method IN ('Efectivo', 'Transferencia', 'Tarjeta de Crédito', 'Tarjeta de Crédito (Socio)', 'Crédito')),
    supplier_id uuid,
    payment_partner_id uuid,
    receipt_image_url text,
    location_id uuid,
    account_id uuid,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.petty_cash_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Enable read access for all users" ON public.petty_cash_transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.petty_cash_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.petty_cash_transactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.petty_cash_transactions FOR DELETE USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX idx_petty_cash_transactions_date ON public.petty_cash_transactions(date);
CREATE INDEX idx_petty_cash_transactions_location_id ON public.petty_cash_transactions(location_id);
CREATE INDEX idx_petty_cash_transactions_account_id ON public.petty_cash_transactions(account_id);
CREATE INDEX idx_petty_cash_transactions_user_id ON public.petty_cash_transactions(user_id);
CREATE INDEX idx_petty_cash_transactions_type ON public.petty_cash_transactions(type);

-- 3. CREAR TABLA OPERATING_EXPENSES
-- =====================================================
DROP TABLE IF EXISTS public.operating_expenses CASCADE;
CREATE TABLE public.operating_expenses (
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
CREATE INDEX idx_operating_expenses_date ON public.operating_expenses(date);
CREATE INDEX idx_operating_expenses_location_id ON public.operating_expenses(location_id);
CREATE INDEX idx_operating_expenses_account_id ON public.operating_expenses(account_id);
CREATE INDEX idx_operating_expenses_user_id ON public.operating_expenses(user_id);
CREATE INDEX idx_operating_expenses_category ON public.operating_expenses(category);

-- 4. CREAR TABLA LOANS
-- =====================================================
DROP TABLE IF EXISTS public.loans CASCADE;
CREATE TABLE public.loans (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id uuid NOT NULL,
    location_id uuid,
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

-- Índices
CREATE INDEX idx_loans_staff_id ON public.loans(staff_id);
CREATE INDEX idx_loans_location_id ON public.loans(location_id);
CREATE INDEX idx_loans_issue_date ON public.loans(issue_date);

-- 5. CREAR TABLA LOAN_PAYMENTS
-- =====================================================
DROP TABLE IF EXISTS public.loan_payments CASCADE;
CREATE TABLE public.loan_payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id uuid NOT NULL,
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

-- Índices
CREATE INDEX idx_loan_payments_loan_id ON public.loan_payments(loan_id);
CREATE INDEX idx_loan_payments_payment_date ON public.loan_payments(payment_date);
CREATE INDEX idx_loan_payments_is_payroll_deduction ON public.loan_payments(is_payroll_deduction);

-- 6. CREAR TABLA TIME_CLOCK_ENTRIES
-- =====================================================
DROP TABLE IF EXISTS public.time_clock_entries CASCADE;
CREATE TABLE public.time_clock_entries (
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
CREATE INDEX idx_time_clock_entries_staff_id ON public.time_clock_entries(staff_id);
CREATE INDEX idx_time_clock_entries_timestamp ON public.time_clock_entries(timestamp);
CREATE INDEX idx_time_clock_entries_location_id ON public.time_clock_entries(location_id);
CREATE INDEX idx_time_clock_entries_type ON public.time_clock_entries(type);

-- 7. VERIFICACIÓN FINAL
-- =====================================================
-- Verificar que las tablas existen
SELECT 
    table_name,
    '✅ CREADA' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'financial_accounts',
        'petty_cash_transactions', 
        'operating_expenses',
        'loans',
        'loan_payments',
        'time_clock_entries'
    )
ORDER BY table_name;

-- Verificar datos de ejemplo
SELECT 
    'financial_accounts' as tabla,
    COUNT(*) as total_registros,
    string_agg(name, ', ') as cuentas_creadas
FROM financial_accounts;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '🎉 ¡TODAS LAS TABLAS FINANCIERAS CREADAS EXITOSAMENTE!';
    RAISE NOTICE '📊 Tablas creadas:';
    RAISE NOTICE '   ✅ financial_accounts';
    RAISE NOTICE '   ✅ petty_cash_transactions';
    RAISE NOTICE '   ✅ operating_expenses';
    RAISE NOTICE '   ✅ loans';
    RAISE NOTICE '   ✅ loan_payments';
    RAISE NOTICE '   ✅ time_clock_entries';
    RAISE NOTICE '🔐 RLS habilitado y políticas de seguridad configuradas';
    RAISE NOTICE '📈 Índices creados para optimizar consultas';
    RAISE NOTICE '💡 Datos de ejemplo insertados en financial_accounts';
    RAISE NOTICE '🚀 ¡El módulo de finanzas está listo para usar!';
END $$;
