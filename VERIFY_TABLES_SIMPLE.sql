-- =====================================================
-- VERIFICAR TABLAS FINANCIERAS CREADAS
-- =====================================================

-- Verificar que las tablas existen
SELECT 
    table_name,
    '✅ EXISTE' as status
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

-- Verificar datos de ejemplo en financial_accounts
SELECT 
    'financial_accounts' as tabla,
    COUNT(*) as total_registros,
    string_agg(name, ', ') as cuentas_creadas
FROM financial_accounts;

-- Verificar políticas RLS
SELECT 
    tablename,
    COUNT(*) as total_politicas
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
GROUP BY tablename
ORDER BY tablename;
