# 🚀 INICIO RÁPIDO - Autodealer Cloud

## ✅ Tu Configuración de Supabase Ya Está Lista

Has completado exitosamente:
- ✅ Proyecto de Supabase creado
- ✅ Esquema SQL ejecutado
- ✅ Row Level Security (RLS) configurado
- ✅ Usuario de prueba creado

---

## 📋 Estado Actual de Tu Configuración Local

### ✅ Archivos Creados con tus Credenciales Reales:

1. **`.env`** (raíz del proyecto)
   - URL: `https://xoakbkmfnoiwmjtrnscy.supabase.co`
   - Anon Key: Configurado ✅
   - Service Role Key: Configurado ✅

2. **`backend/.env`** (directorio backend)
   - Todas las credenciales configuradas ✅

3. **`setup-local.js`** (script de verificación)
   - Script para validar configuración ✅

---

## 🎯 Próximos 3 Pasos para Ejecutar

### Paso 1️⃣: Verificar Configuración

```bash
node setup-local.js
```

Este script verificará que todo esté configurado correctamente.

### Paso 2️⃣: Instalar Dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### Paso 3️⃣: Ejecutar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

---

## 🔐 Credenciales de Acceso

Una vez que la aplicación esté corriendo:

1. Ve a: http://localhost:5173
2. Verás la pantalla de login
3. Usa las credenciales del usuario que creaste en Supabase

**Si necesitas crear un usuario de prueba**, ejecuta esto en el SQL Editor de Supabase:

```sql
-- Ver usuarios existentes
SELECT id, email FROM auth.users;

-- Si no hay ninguno, créalo desde:
-- Supabase Dashboard → Authentication → Users → Add user
```

Después de crear el usuario en Auth, asegúrate de que tenga un perfil:

```sql
-- Verificar perfil (reemplaza USER_ID con el ID real del usuario)
SELECT * FROM staff_members WHERE id = 'USER_ID';

-- Si no existe, crear perfil:
INSERT INTO staff_members (id, name, email, role, location_id, document_type, document_number, avatar_url)
VALUES (
  'USER_ID_AQUI',
  'Administrador',
  'admin@autodealer.com',
  'Administrador',
  'L1',
  'Cédula de Ciudadanía',
  '1000000001',
  'https://i.pravatar.cc/48?u=admin'
);
```

---

## 🔍 Verificación Rápida

Ejecuta estos comandos para verificar que todo está bien:

```bash
# 1. Verificar que los archivos .env existen
ls -la .env backend/.env

# 2. Verificar configuración
node setup-local.js

# 3. Verificar que las dependencias están instaladas
npm list @supabase/supabase-js
```

---

## ⚡ Comandos Útiles

```bash
# Desarrollo (frontend)
npm run dev

# Desarrollo (backend)
cd backend && npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Missing Supabase environment variables"

**Causa**: El archivo `.env` no está siendo leído.

**Solución**:
```bash
# Verificar que el archivo existe
cat .env

# Reiniciar el servidor
npm run dev
```

### Error: "Failed to fetch"

**Causa**: No hay conexión con Supabase.

**Solución**:
1. Verifica tu conexión a internet
2. Verifica que la URL de Supabase es correcta
3. Ejecuta: `node setup-local.js` para probar conexión

### No puedo iniciar sesión

**Causa**: El usuario no existe o no tiene perfil.

**Solución**:
1. Ve a Supabase Dashboard → Authentication → Users
2. Verifica que el usuario existe
3. Ejecuta el SQL para verificar/crear perfil (ver arriba)

### Error: "new row violates row-level security policy"

**Causa**: Las políticas de RLS están bloqueando la acción.

**Solución**:
1. Verifica que ejecutaste el script de RLS
2. Verifica que el usuario está autenticado
3. Verifica que el usuario tiene el rol correcto

---

## 📊 Tu Proyecto en Números

```
✅ 20+ Tablas en Supabase
✅ 50+ Políticas de RLS configuradas
✅ Sistema completo de autenticación
✅ 10+ Componentes React
✅ Backend API opcional
✅ Documentación completa
```

---

## 🎉 ¡Listo para Empezar!

Tu proyecto está 100% configurado y listo para usarse. Solo ejecuta:

```bash
node setup-local.js && npm run dev
```

Si tienes algún problema, revisa:
- 📄 `INSTRUCCIONES_INSTALACION.md` - Guía detallada
- 📄 `SECURITY_AUDIT_REPORT.md` - Detalles técnicos
- 📄 `MIGRATION_GUIDE.md` - Información sobre Supabase

---

## 🆘 ¿Necesitas Ayuda?

1. Ejecuta `node setup-local.js` para diagnóstico
2. Revisa los logs del navegador (F12 → Console)
3. Revisa los logs del servidor
4. Consulta la documentación de Supabase

---

**¡Felicidades! Tu sistema de gestión de taller está listo para usar.** 🚗✨



