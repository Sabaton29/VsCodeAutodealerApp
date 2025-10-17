# Instrucciones para Añadir Columna registration_date

## ❌ **PROBLEMA ACTUAL**

La tabla `clients` en Supabase **NO tiene la columna `registration_date`**, por eso aparece el error:
```
Could not find the 'registration_date' column of 'clients' in the schema cache
```

## ✅ **SOLUCIÓN**

Necesitas ejecutar un script SQL en Supabase para añadir la columna faltante.

---

## 🛠️ **PASOS PARA EJECUTAR**

### **Paso 1: Abrir Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto `autodealer-cloud`

### **Paso 2: Abrir SQL Editor**
1. En el menú lateral, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"**

### **Paso 3: Ejecutar el Script**
Copia y pega este script SQL:

```sql
-- Añadir la columna registration_date si no existe
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS registration_date DATE DEFAULT CURRENT_DATE;

-- Verificar que la columna se añadió correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'registration_date';

-- Actualizar registros existentes que no tengan registration_date
UPDATE clients 
SET registration_date = CURRENT_DATE 
WHERE registration_date IS NULL;

-- Verificar los datos actualizados
SELECT id, name, registration_date 
FROM clients 
ORDER BY registration_date DESC 
LIMIT 10;
```

### **Paso 4: Ejecutar**
1. Haz clic en **"Run"** (botón verde)
2. Verifica que no hay errores
3. Deberías ver la estructura de la columna y los datos actualizados

---

## 🎯 **RESULTADO ESPERADO**

Después de ejecutar el script:

✅ **Columna añadida**: `registration_date` existe en la tabla `clients`
✅ **Datos actualizados**: Todos los clientes existentes tendrán `registration_date`
✅ **Creación funciona**: Los nuevos clientes se crearán sin errores
✅ **Fechas válidas**: La tabla mostrará fechas reales en lugar de "Invalid Date"
✅ **Contador funciona**: "Clientes Nuevos" contará correctamente

---

## 🧪 **VERIFICACIÓN**

Después de ejecutar el script:

1. **Crear un cliente nuevo** en la aplicación
2. **Verificar que no hay errores** en la consola
3. **Verificar que la fecha aparece** en la tabla de clientes
4. **Verificar que el contador** "Clientes Nuevos" funciona

---

## 📝 **NOTAS IMPORTANTES**

- **Backup**: El script es seguro y no elimina datos existentes
- **IF NOT EXISTS**: Solo añade la columna si no existe
- **DEFAULT CURRENT_DATE**: Los nuevos registros tendrán fecha automática
- **UPDATE**: Los registros existentes se actualizan con la fecha actual

---

**Una vez ejecutado este script, la aplicación funcionará correctamente.** 🎉

¿Necesitas ayuda para ejecutar el script en Supabase?
