-- Verificar la estructura actual de la tabla work_orders
-- Para confirmar qué columnas existen realmente

-- Ver todas las columnas de la tabla work_orders
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
ORDER BY ordinal_position;
