# 📝 INSTRUCCIONES: Crear Archivos .env

## ⚠️ IMPORTANTE

Los archivos `.env` contienen tus credenciales de Supabase y **NO PUEDEN** ser creados automáticamente por seguridad. Debes crearlos manualmente.

---

## 📋 Paso 1: Crear `.env` en la Raíz del Proyecto

### Ubicación:
```
autodealer-cloud/
├── .env  ← CREAR AQUÍ
├── package.json
├── index.html
└── ...
```

### Contenido del Archivo:

Crea un archivo llamado **`.env`** (sin extensión antes del punto) con este contenido:

```env
# ============================================
# SUPABASE CONFIGURATION - AUTODEALER CLOUD
# ============================================

# URL del proyecto Supabase
VITE_SUPABASE_URL=https://xoakbkmfnoiwmjtrnscy.supabase.co

# Anon/Public Key (segura para frontend)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvYWtia21mbm9pd21qdHJuc2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDM1NzMsImV4cCI6MjA3NTQ3OTU3M30.CydhAQrumD6JxH6Aoc0UkZyh0h2jPdWrVFX9TvI1zlc

# API URL (opcional)
VITE_API_URL=http://localhost:3001
```

---

## 📋 Paso 2: Crear `backend/.env`

### Ubicación:
```
autodealer-cloud/
└── backend/
    ├── .env  ← CREAR AQUÍ
    ├── package.json
    ├── server.js
    └── ...
```

### Contenido del Archivo:

Crea un archivo llamado **`.env`** en la carpeta `backend` con este contenido:

```env
# ============================================
# BACKEND CONFIGURATION - AUTODEALER CLOUD
# ============================================

# Supabase Configuration
SUPABASE_URL=https://xoakbkmfnoiwmjtrnscy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvYWtia21mbm9pd21qdHJuc2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDM1NzMsImV4cCI6MjA3NTQ3OTU3M30.CydhAQrumD6JxH6Aoc0UkZyh0h2jPdWrVFX9TvI1zlc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvYWtia21mbm9pd21qdHJuc2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwMzU3MywiZXhwIjoyMDc1NDc5NTczfQ.XOOQ28Z4WVnQ-9Ido98mLzmsxkq_lFu1oZk9qOSx3P8

# Database Configuration
DB_HOST=db.xoakbkmfnoiwmjtrnscy.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=tu_password_postgres_si_lo_necesitas

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

---

## 🖥️ Instrucciones Específicas por Sistema Operativo

### Windows (Notepad, VS Code, etc.)

1. **Opción A - Usando el Explorador de Archivos:**
   - Abre el explorador en la carpeta del proyecto
   - Clic derecho → Nuevo → Documento de texto
   - Nómbralo como `.env` (incluyendo el punto al inicio)
   - Windows te advertirá que no tiene extensión, acepta
   - Abre el archivo con Notepad o VS Code
   - Pega el contenido de arriba
   - Guarda el archivo

2. **Opción B - Usando VS Code:**
   - Abre VS Code en la carpeta del proyecto
   - Clic en el ícono "Nuevo archivo" en el explorador lateral
   - Escribe `.env` como nombre
   - Pega el contenido
   - Guarda (Ctrl + S)

3. **Opción C - Usando PowerShell:**
   ```powershell
   # En la raíz del proyecto
   New-Item -Path ".env" -ItemType File
   
   # En backend
   New-Item -Path "backend\.env" -ItemType File
   ```

### macOS / Linux (Terminal)

```bash
# Crear .env en la raíz
touch .env

# Crear .env en backend
touch backend/.env

# Editar con nano
nano .env
# (Pega el contenido, Ctrl+O para guardar, Ctrl+X para salir)

# O editar con VS Code
code .env
```

---

## ✅ Paso 3: Verificar la Configuración

Una vez creados los archivos, ejecuta el script de verificación:

```bash
node setup-local.cjs
```

Este script verificará:
- ✅ Que los archivos existen
- ✅ Que las variables están configuradas
- ✅ Que la conexión a Supabase funciona

---

## 🔐 Seguridad

### ⚠️ NUNCA hagas lo siguiente:

- ❌ Subir archivos `.env` a Git/GitHub
- ❌ Compartir tus credenciales públicamente
- ❌ Incluir `.env` en capturas de pantalla
- ❌ Enviar `.env` por email o chat

### ✅ Los archivos `.env` YA están en `.gitignore`

Esto significa que Git los ignorará automáticamente y no se subirán al repositorio.

---

## 🔍 Verificar que los Archivos se Crearon Correctamente

### Windows (PowerShell):
```powershell
# Verificar archivo raíz
Test-Path .env

# Verificar archivo backend
Test-Path backend\.env

# Ver contenido (primeras líneas)
Get-Content .env -Head 5
```

### macOS/Linux:
```bash
# Verificar archivos
ls -la .env backend/.env

# Ver contenido
head .env
```

---

## 🆘 Problemas Comunes

### "No puedo ver el archivo .env"

**Causa**: Los archivos que empiezan con punto están ocultos por defecto.

**Solución Windows**:
- Explorador de archivos → Ver → Mostrar → Elementos ocultos

**Solución macOS**:
- Finder → Cmd + Shift + . (punto)

**Solución Linux**:
- Usar `ls -la` en terminal

### "El archivo no tiene el formato correcto"

**Causa**: Se guardó con extensión incorrecta (ej: `.env.txt`)

**Solución**:
- Renombrar el archivo eliminando cualquier extensión después de `.env`
- El nombre correcto es **solo** `.env` (nada más)

### "Las variables no se cargan"

**Causa**: El servidor no se reinició después de crear el archivo.

**Solución**:
```bash
# Detener el servidor (Ctrl + C)
# Volver a ejecutar
npm run dev
```

---

## 📊 Estructura Final Esperada

```
autodealer-cloud/
├── .env                    ← Archivo creado ✅
├── .env.example            ← Template de ejemplo
├── .gitignore             ← Contiene .env (ya configurado)
├── package.json
├── setup-local.cjs        ← Script de verificación
├── backend/
│   ├── .env               ← Archivo creado ✅
│   ├── .env.example       ← Template de ejemplo
│   ├── package.json
│   └── server.js
└── ...
```

---

## 🚀 Siguiente Paso

Una vez creados los archivos `.env`, ejecuta:

```bash
# 1. Verificar configuración
node setup-local.cjs

# 2. Instalar dependencias (si no lo has hecho)
npm install
cd backend && npm install && cd ..

# 3. Ejecutar la aplicación
npm run dev
```

---

## ✨ ¡Listo!

Ahora tu aplicación debería conectarse correctamente a Supabase. Si tienes problemas, revisa:

- 📄 `INICIO_RAPIDO.md` - Guía de inicio rápido
- 📄 `INSTRUCCIONES_INSTALACION.md` - Instalación detallada
- 📄 `SECURITY_AUDIT_REPORT.md` - Detalles técnicos

**¿Sigues teniendo problemas?** Ejecuta `node setup-local.cjs` para diagnóstico detallado.



