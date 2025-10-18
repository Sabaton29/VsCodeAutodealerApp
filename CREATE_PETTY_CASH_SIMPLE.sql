-- =====================================================
-- CREAR TABLA PETTY_CASH_TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.petty_cash_transactions (
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
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_date ON public.petty_cash_transactions(date);
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_location_id ON public.petty_cash_transactions(location_id);
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_account_id ON public.petty_cash_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_user_id ON public.petty_cash_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_petty_cash_transactions_type ON public.petty_cash_transactions(type);

-- Mensaje de confirmación
SELECT '✅ Tabla petty_cash_transactions creada exitosamente' as resultado;
