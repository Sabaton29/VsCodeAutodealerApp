-- =====================================================
-- SCRIPT PARA FORZAR LA CREACIÓN DE COLUMNAS FALTANTES
-- =====================================================

-- 1. FORZAR CREACIÓN DE COLUMNAS EN CLIENTS
-- Eliminar la columna si existe y crearla de nuevo
DO $$ 
BEGIN
    -- Intentar eliminar la columna si existe
    BEGIN
        ALTER TABLE clients DROP COLUMN IF EXISTS is_b2_b;
    EXCEPTION
        WHEN OTHERS THEN
            -- Ignorar errores si la columna no existe
            NULL;
    END;
    
    -- Crear la columna de nuevo
    ALTER TABLE clients ADD COLUMN is_b2_b BOOLEAN DEFAULT false;
    
    -- Hacer lo mismo con commission_rate
    BEGIN
        ALTER TABLE clients DROP COLUMN IF EXISTS commission_rate;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    ALTER TABLE clients ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0;
    
    -- Hacer lo mismo con payment_terms
    BEGIN
        ALTER TABLE clients DROP COLUMN IF EXISTS payment_terms;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    ALTER TABLE clients ADD COLUMN payment_terms JSONB;
    
    -- Hacer lo mismo con location_id
    BEGIN
        ALTER TABLE clients DROP COLUMN IF EXISTS location_id;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    ALTER TABLE clients ADD COLUMN location_id UUID DEFAULT '550e8400-e29b-41d4-a716-446655440001';
END $$;

-- 2. FORZAR CREACIÓN DE COLUMNAS EN VEHICLES
DO $$ 
BEGIN
    -- location_id
    BEGIN
        ALTER TABLE vehicles DROP COLUMN IF EXISTS location_id;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    ALTER TABLE vehicles ADD COLUMN location_id UUID DEFAULT '550e8400-e29b-41d4-a716-446655440001';
    
    -- client_id
    BEGIN
        ALTER TABLE vehicles DROP COLUMN IF EXISTS client_id;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    ALTER TABLE vehicles ADD COLUMN client_id UUID;
END $$;

-- 3. FORZAR CREACIÓN DE COLUMNAS EN SERVICES
DO $$ 
BEGIN
    -- location_id
    BEGIN
        ALTER TABLE services DROP COLUMN IF EXISTS location_id;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    ALTER TABLE services ADD COLUMN location_id UUID DEFAULT '550e8400-e29b-41d4-a716-446655440001';
END $$;

-- 4. FORZAR CREACIÓN DE COLUMNAS EN SUPPLIERS
DO $$ 
BEGIN
    -- location_id
    BEGIN
        ALTER TABLE suppliers DROP COLUMN IF EXISTS location_id;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    ALTER TABLE suppliers ADD COLUMN location_id UUID DEFAULT '550e8400-e29b-41d4-a716-446655440001';
END $$;

-- 5. FORZAR CREACIÓN DE COLUMNAS EN INVENTORY_ITEMS
DO $$ 
BEGIN
    -- location_id
    BEGIN
        ALTER TABLE inventory_items DROP COLUMN IF EXISTS location_id;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    ALTER TABLE inventory_items ADD COLUMN location_id UUID DEFAULT '550e8400-e29b-41d4-a716-446655440001';
END $$;

-- 6. FORZAR CREACIÓN DE COLUMNAS EN STAFF_MEMBERS
DO $$ 
BEGIN
    -- location_id
    BEGIN
        ALTER TABLE staff_members DROP COLUMN IF EXISTS location_id;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    ALTER TABLE staff_members ADD COLUMN location_id UUID DEFAULT '550e8400-e29b-41d4-a716-446655440001';
END $$;

-- 7. VERIFICAR QUE LAS COLUMNAS SE CREARON
-- Este query te mostrará todas las columnas de la tabla clients
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- =====================================================
-- FIN DEL SCRIPT FORZADO
-- =====================================================



