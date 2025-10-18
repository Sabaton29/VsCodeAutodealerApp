-- =====================================================
-- SCRIPT DE VERIFICACIÓN: TABLAS FINANCIERAS
-- =====================================================
-- Este script verifica que todas las tablas financieras se crearon correctamente

-- Verificar que las tablas existen
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'financial_accounts',
            'petty_cash_transactions', 
            'operating_expenses',
            'loans',
            'loan_payments',
            'time_clock_entries'
        ) THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END as status
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

-- Verificar estructura de financial_accounts
SELECT 
    'financial_accounts' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'financial_accounts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de petty_cash_transactions
SELECT 
    'petty_cash_transactions' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'petty_cash_transactions' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de operating_expenses
SELECT 
    'operating_expenses' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'operating_expenses' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de loans
SELECT 
    'loans' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'loans' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de loan_payments
SELECT 
    'loan_payments' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'loan_payments' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de time_clock_entries
SELECT 
    'time_clock_entries' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'time_clock_entries' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar datos de ejemplo en financial_accounts
SELECT 
    'financial_accounts' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN type = 'Efectivo' THEN 1 END) as cuentas_efectivo,
    COUNT(CASE WHEN type = 'Banco' THEN 1 END) as cuentas_banco,
    COUNT(CASE WHEN type = 'Tarjeta de Crédito' THEN 1 END) as cuentas_tarjeta
FROM financial_accounts;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN (
        'financial_accounts',
        'petty_cash_transactions', 
        'operating_expenses',
        'loans',
        'loan_payments',
        'time_clock_entries'
    )
ORDER BY tablename, policyname;

-- Verificar índices
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN (
        'financial_accounts',
        'petty_cash_transactions', 
        'operating_expenses',
        'loans',
        'loan_payments',
        'time_clock_entries'
    )
ORDER BY tablename, indexname;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '🔍 VERIFICACIÓN COMPLETADA';
    RAISE NOTICE '📊 Revisa los resultados arriba para confirmar que:';
    RAISE NOTICE '   ✅ Todas las tablas existen';
    RAISE NOTICE '   ✅ Todas las columnas están correctas';
    RAISE NOTICE '   ✅ RLS está habilitado';
    RAISE NOTICE '   ✅ Índices están creados';
    RAISE NOTICE '   ✅ Datos de ejemplo están insertados';
END $$;
