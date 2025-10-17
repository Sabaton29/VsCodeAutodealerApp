-- =====================================================
-- AGREGAR CAMPO SECUENCIAL A LA TABLA QUOTES
-- =====================================================

-- 1. AGREGAR COLUMNA SEQUENTIAL_ID A LA TABLA QUOTES
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS sequential_id INTEGER;

-- 2. CREAR SECUENCIA PARA LOS IDs SECUENCIALES
CREATE SEQUENCE IF NOT EXISTS quotes_sequential_seq START 39;

-- 3. ACTUALIZAR COTIZACIONES EXISTENTES CON IDs SECUENCIALES
-- (Asumiendo que ya hay cotizaciones con IDs como 0038, 0039, etc.)
UPDATE quotes 
SET sequential_id = CASE 
    WHEN id = '3808c52f-c9a6-4011-9d10-93340f0bc655' THEN 39  -- COT-039
    WHEN id = 'f9a3ad3f-e347-4cb3-8736-e45b0b774741' THEN 38  -- COT-038
    WHEN id = 'd3e71b04-df1e-4d7c-a6a6-579d3aafe4ef' THEN 38  -- COT-038 (duplicado)
    WHEN id = 'f1fb03a9-a92e-4ed4-a9bd-3f5287d914cd' THEN 37  -- COT-037
    ELSE nextval('quotes_sequential_seq')
END
WHERE sequential_id IS NULL;

-- 4. CREAR FUNCIÓN PARA GENERAR ID SECUENCIAL AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION generate_sequential_quote_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sequential_id IS NULL THEN
        NEW.sequential_id := nextval('quotes_sequential_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CREAR TRIGGER PARA GENERAR ID SECUENCIAL AUTOMÁTICAMENTE
DROP TRIGGER IF EXISTS trigger_generate_sequential_quote_id ON quotes;
CREATE TRIGGER trigger_generate_sequential_quote_id
    BEFORE INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION generate_sequential_quote_id();

-- 6. CREAR ÍNDICE EN EL CAMPO SECUENCIAL
CREATE INDEX IF NOT EXISTS idx_quotes_sequential_id ON quotes(sequential_id);

-- 7. VERIFICAR RESULTADO
SELECT 
    id,
    sequential_id,
    client_name,
    created_at
FROM quotes 
ORDER BY sequential_id DESC
LIMIT 10;





