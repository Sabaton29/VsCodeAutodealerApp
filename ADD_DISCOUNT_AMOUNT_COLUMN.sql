-- =====================================================
-- AGREGAR COLUMNA DISCOUNT_AMOUNT A LA TABLA QUOTES
-- =====================================================

-- Agregar la columna discount_amount a la tabla quotes si no existe
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
AND column_name = 'discount_amount';

-- Actualizar todas las cotizaciones existentes para que tengan discount_amount = 0
UPDATE quotes 
SET discount_amount = 0 
WHERE discount_amount IS NULL;
