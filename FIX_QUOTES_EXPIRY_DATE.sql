-- FIX QUOTES EXPIRY DATE COLUMN
-- ============================================

-- Verificar si existe la columna expiry_date
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'expiry_date') THEN
        -- Si no existe expiry_date, crear la columna
        ALTER TABLE quotes ADD COLUMN expiry_date DATE;
        
        -- Copiar datos de valid_until a expiry_date si existe
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'valid_until') THEN
            UPDATE quotes SET expiry_date = valid_until WHERE expiry_date IS NULL;
        END IF;
        
        -- Establecer fecha de expiración por defecto (30 días desde issue_date)
        UPDATE quotes SET expiry_date = issue_date + INTERVAL '30 days' WHERE expiry_date IS NULL;
        
        -- Hacer la columna NOT NULL
        ALTER TABLE quotes ALTER COLUMN expiry_date SET NOT NULL;
        
        RAISE NOTICE 'Columna expiry_date creada exitosamente';
    ELSE
        RAISE NOTICE 'La columna expiry_date ya existe';
    END IF;
END $$;

-- Verificar si existe la columna subtotal
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'subtotal') THEN
        ALTER TABLE quotes ADD COLUMN subtotal NUMERIC DEFAULT 0;
        RAISE NOTICE 'Columna subtotal creada exitosamente';
    ELSE
        RAISE NOTICE 'La columna subtotal ya existe';
    END IF;
END $$;

-- Verificar si existe la columna tax_amount
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'tax_amount') THEN
        ALTER TABLE quotes ADD COLUMN tax_amount NUMERIC DEFAULT 0;
        RAISE NOTICE 'Columna tax_amount creada exitosamente';
    ELSE
        RAISE NOTICE 'La columna tax_amount ya existe';
    END IF;
END $$;

-- Verificar si existe la columna total
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'total') THEN
        ALTER TABLE quotes ADD COLUMN total NUMERIC DEFAULT 0;
        RAISE NOTICE 'Columna total creada exitosamente';
    ELSE
        RAISE NOTICE 'La columna total ya existe';
    END IF;
END $$;

-- Verificar si existe la columna status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'status') THEN
        ALTER TABLE quotes ADD COLUMN status TEXT DEFAULT 'DRAFT';
        RAISE NOTICE 'Columna status creada exitosamente';
    ELSE
        RAISE NOTICE 'La columna status ya existe';
    END IF;
END $$;

-- Verificar si existe la columna notes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'notes') THEN
        ALTER TABLE quotes ADD COLUMN notes TEXT;
        RAISE NOTICE 'Columna notes creada exitosamente';
    ELSE
        RAISE NOTICE 'La columna notes ya existe';
    END IF;
END $$;

-- Verificar si existe la columna linked_invoice_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'linked_invoice_id') THEN
        ALTER TABLE quotes ADD COLUMN linked_invoice_id TEXT;
        RAISE NOTICE 'Columna linked_invoice_id creada exitosamente';
    ELSE
        RAISE NOTICE 'La columna linked_invoice_id ya existe';
    END IF;
END $$;

-- Mostrar estructura final de la tabla quotes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;

