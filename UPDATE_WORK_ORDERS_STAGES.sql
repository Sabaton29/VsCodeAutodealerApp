-- Script para actualizar todas las órdenes de trabajo a la etapa correcta
-- Basado en la lógica de negocio del sistema

-- 1. Actualizar órdenes canceladas (mantener CANCELADO)
UPDATE work_orders 
SET stage = 'CANCELADO', updated_at = NOW()
WHERE status = 'CANCELADO' AND stage != 'CANCELADO';

-- 2. Actualizar órdenes sin diagnóstico a RECEPCION
UPDATE work_orders 
SET stage = 'RECEPCION', updated_at = NOW()
WHERE (diagnostic_data IS NULL OR diagnostic_data = '{}' OR diagnostic_data = 'null')
  AND stage != 'RECEPCION'
  AND stage != 'CANCELADO';

-- 3. Actualizar órdenes con diagnóstico pero sin cotizaciones a PENDIENTE_COTIZACION
UPDATE work_orders 
SET stage = 'PENDIENTE_COTIZACION', updated_at = NOW()
WHERE diagnostic_data IS NOT NULL 
  AND diagnostic_data != '{}' 
  AND diagnostic_data != 'null'
  AND (linked_quote_ids IS NULL OR linked_quote_ids = '[]' OR linked_quote_ids = 'null')
  AND stage != 'PENDIENTE_COTIZACION'
  AND stage != 'CANCELADO';

-- 4. Actualizar órdenes con cotizaciones rechazadas a ATENCION_REQUERIDA
UPDATE work_orders 
SET stage = 'ATENCION_REQUERIDA', updated_at = NOW()
WHERE linked_quote_ids IS NOT NULL 
  AND linked_quote_ids != '[]' 
  AND linked_quote_ids != 'null'
  AND EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.id = ANY(
      SELECT jsonb_array_elements_text(work_orders.linked_quote_ids::jsonb)::uuid
    )
    AND quotes.status = 'RECHAZADO'
  )
  AND stage != 'ATENCION_REQUERIDA'
  AND stage != 'CANCELADO';

-- 5. Actualizar órdenes con cotizaciones aprobadas a EN_REPARACION (si están en etapas anteriores)
UPDATE work_orders 
SET stage = 'EN_REPARACION', updated_at = NOW()
WHERE linked_quote_ids IS NOT NULL 
  AND linked_quote_ids != '[]' 
  AND linked_quote_ids != 'null'
  AND EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.id = ANY(
      SELECT jsonb_array_elements_text(work_orders.linked_quote_ids::jsonb)::uuid
    )
    AND quotes.status = 'APROBADO'
  )
  AND stage IN ('RECEPCION', 'DIAGNOSTICO', 'PENDIENTE_COTIZACION', 'ESPERA_APROBACION')
  AND stage != 'CANCELADO';

-- 6. Actualizar órdenes con cotizaciones enviadas (pero no aprobadas ni rechazadas) a ESPERA_APROBACION
UPDATE work_orders 
SET stage = 'ESPERA_APROBACION', updated_at = NOW()
WHERE linked_quote_ids IS NOT NULL 
  AND linked_quote_ids != '[]' 
  AND linked_quote_ids != 'null'
  AND EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.id = ANY(
      SELECT jsonb_array_elements_text(work_orders.linked_quote_ids::jsonb)::uuid
    )
    AND quotes.status = 'ENVIADO'
  )
  AND NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.id = ANY(
      SELECT jsonb_array_elements_text(work_orders.linked_quote_ids::jsonb)::uuid
    )
    AND quotes.status IN ('APROBADO', 'RECHAZADO')
  )
  AND stage != 'ESPERA_APROBACION'
  AND stage != 'CANCELADO';

-- 7. Actualizar órdenes con solo cotizaciones en borrador a PENDIENTE_COTIZACION
UPDATE work_orders 
SET stage = 'PENDIENTE_COTIZACION', updated_at = NOW()
WHERE linked_quote_ids IS NOT NULL 
  AND linked_quote_ids != '[]' 
  AND linked_quote_ids != 'null'
  AND NOT EXISTS (
    SELECT 1 FROM quotes 
    WHERE quotes.id = ANY(
      SELECT jsonb_array_elements_text(work_orders.linked_quote_ids::jsonb)::uuid
    )
    AND quotes.status IN ('ENVIADO', 'APROBADO', 'RECHAZADO')
  )
  AND stage != 'PENDIENTE_COTIZACION'
  AND stage != 'CANCELADO';

-- Verificar resultados
SELECT 
    stage,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM work_orders 
WHERE status != 'CANCELADO'
GROUP BY stage
ORDER BY 
    CASE stage
        WHEN 'RECEPCION' THEN 1
        WHEN 'DIAGNOSTICO' THEN 2
        WHEN 'PENDIENTE_COTIZACION' THEN 3
        WHEN 'ESPERA_APROBACION' THEN 4
        WHEN 'ATENCION_REQUERIDA' THEN 5
        WHEN 'EN_REPARACION' THEN 6
        WHEN 'CONTROL_CALIDAD' THEN 7
        WHEN 'LISTO_ENTREGA' THEN 8
        WHEN 'ENTREGADO' THEN 9
        ELSE 10
    END;









