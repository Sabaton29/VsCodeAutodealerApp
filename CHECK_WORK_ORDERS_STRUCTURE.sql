-- Verificar la estructura de la tabla work_orders
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
ORDER BY ordinal_position;
