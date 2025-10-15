# Debug de Formularios

## Problemas Identificados

### 1. Error de UUID inválido en inventario
- **Problema**: `supplierId` se inicializa como cadena vacía `''` en `AddInventoryItemForm`
- **Solución**: Cambiar inicialización a `undefined` y manejar valores vacíos correctamente

### 2. Dropdown de clientes vacío
- **Problema**: Los formularios filtran clientes por `locationId`, pero los datos pueden no tener este campo
- **Solución**: Verificar y corregir datos en Supabase

## Scripts de Corrección

### Para ejecutar en Supabase:

1. **Verificar estado actual**:
   ```sql
   -- Ejecutar check-data-status.sql
   ```

2. **Corregir datos**:
   ```sql
   -- Ejecutar fix-all-data.sql
   ```

3. **Insertar datos de prueba si es necesario**:
   ```sql
   -- Ejecutar insert-test-data.sql
   ```

## Cambios Realizados en el Código

### AddInventoryItemForm.tsx
- Cambiado `supplierId: ''` a `supplierId: undefined`
- Actualizado `handleChange` para manejar valores vacíos como `undefined`
- Actualizado el select para usar `value={formData.supplierId || ''}`

## Próximos Pasos

1. Ejecutar los scripts SQL en Supabase
2. Verificar que los formularios funcionen correctamente
3. Probar la creación de clientes, vehículos, artículos de inventario, etc.
4. Verificar que los dropdowns se llenen correctamente



