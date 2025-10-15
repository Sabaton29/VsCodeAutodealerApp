-- =====================================================
-- AGREGAR COLUMNA TOTAL_DISCOUNT A LA TABLA QUOTES
-- =====================================================

-- Agregar la columna total_discount a la tabla quotes si no existe
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS total_discount NUMERIC DEFAULT 0;

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
AND column_name = 'total_discount';

-- Actualizar todas las cotizaciones existentes para que tengan total_discount = 0
UPDATE quotes 
SET total_discount = 0 
WHERE total_discount IS NULL;
