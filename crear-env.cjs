#!/usr/bin/env node

/**
 * Script para Crear Archivos .env Automáticamente
 * Autodealer Cloud - Configuración de Supabase
 */

const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  title: () => console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`),
  subtitle: (msg) => console.log(`${colors.bright}${msg}${colors.reset}`),
};

// Credenciales de Supabase
const SUPABASE_URL = 'https://xoakbkmfnoiwmjtrnscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvYWtia21mbm9pd21qdHJuc2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDM1NzMsImV4cCI6MjA3NTQ3OTU3M30.CydhAQrumD6JxH6Aoc0UkZyh0h2jPdWrVFX9TvI1zlc';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvYWtia21mbm9pd21qdHJuc2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwMzU3MywiZXhwIjoyMDc1NDc5NTczfQ.XOOQ28Z4WVnQ-9Ido98mLzmsxkq_lFu1oZk9qOSx3P8';

// Contenido del archivo .env principal
const ROOT_ENV_CONTENT = `# ============================================
# SUPABASE CONFIGURATION - AUTODEALER CLOUD
# ============================================
# IMPORTANTE: Este archivo contiene credenciales sensibles.
# NO subir a Git. Ya está en .gitignore.

# URL del proyecto Supabase
VITE_SUPABASE_URL=${SUPABASE_URL}

# Anon/Public Key (segura para frontend)
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# API URL (opcional, si usas backend propio)
VITE_API_URL=http://localhost:3001

# Gemini API (si se usa)
VITE_GEMINI_API_KEY=
`;

// Contenido del archivo backend/.env
const BACKEND_ENV_CONTENT = `# ============================================
# BACKEND CONFIGURATION - AUTODEALER CLOUD
# ============================================
# IMPORTANTE: Este archivo contiene credenciales sensibles.
# NO subir a Git.

# Supabase Configuration
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# Database Configuration (conexión directa a PostgreSQL si es necesaria)
DB_HOST=db.xoakbkmfnoiwmjtrnscy.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=tu_password_postgres_aqui

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
`;

// Función para crear archivo .env
function createEnvFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    
    // Crear directorio si no existe
    if (!fs.existsSync(dir) && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
      log.info(`Directorio creado: ${dir}`);
    }
    
    // Verificar si el archivo ya existe
    if (fs.existsSync(filePath)) {
      log.warning(`El archivo ${filePath} ya existe. Creando respaldo...`);
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      log.info(`Respaldo creado: ${backupPath}`);
    }
    
    // Crear archivo
    fs.writeFileSync(filePath, content, 'utf8');
    log.success(`Archivo creado exitosamente: ${filePath}`);
    return true;
  } catch (error) {
    log.error(`Error al crear ${filePath}: ${error.message}`);
    return false;
  }
}

// Función para verificar .gitignore
function checkGitignore() {
  const gitignorePath = '.gitignore';
  
  if (!fs.existsSync(gitignorePath)) {
    log.warning('Archivo .gitignore no encontrado');
    return false;
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf8');
  const hasEnv = content.includes('.env');
  const hasBackendEnv = content.includes('backend/.env');
  
  if (hasEnv && hasBackendEnv) {
    log.success('Archivos .env están protegidos en .gitignore');
    return true;
  } else {
    log.warning('Los archivos .env podrían no estar protegidos en .gitignore');
    return false;
  }
}

// Función principal
function main() {
  log.title();
  log.subtitle('🔧 CREANDO ARCHIVOS .ENV PARA AUTODEALER CLOUD');
  log.title();
  
  console.log('\nEste script creará automáticamente los archivos .env con tus credenciales de Supabase.\n');
  
  let successCount = 0;
  
  // Crear .env en la raíz
  log.subtitle('\n📝 Creando archivo .env en la raíz del proyecto...');
  if (createEnvFile('.env', ROOT_ENV_CONTENT)) {
    successCount++;
  }
  
  // Crear .env en backend
  log.subtitle('\n📝 Creando archivo backend/.env...');
  if (createEnvFile(path.join('backend', '.env'), BACKEND_ENV_CONTENT)) {
    successCount++;
  }
  
  // Verificar .gitignore
  log.subtitle('\n🔒 Verificando protección en .gitignore...');
  checkGitignore();
  
  // Resumen final
  log.title();
  log.subtitle('\n📊 RESUMEN');
  log.title();
  
  if (successCount === 2) {
    log.success('¡ARCHIVOS .ENV CREADOS EXITOSAMENTE! ✨');
    console.log('\n🎉 Tu configuración está completa.\n');
    console.log('Próximos pasos:');
    console.log('  1. node setup-local.cjs    (verificar configuración)');
    console.log('  2. npm install             (instalar dependencias)');
    console.log('  3. cd backend && npm install && cd ..');
    console.log('  4. npm run dev             (ejecutar aplicación)\n');
  } else {
    log.error('HUBO ERRORES AL CREAR LOS ARCHIVOS');
    console.log('\n⚠️  Revisa los errores arriba e intenta nuevamente.\n');
  }
  
  // Mostrar información de las credenciales
  log.subtitle('\n🔐 INFORMACIÓN DE CREDENCIALES');
  console.log(`\nURL de Supabase: ${colors.cyan}${SUPABASE_URL}${colors.reset}`);
  console.log(`Anon Key: ${colors.cyan}${SUPABASE_ANON_KEY.substring(0, 40)}...${colors.reset}`);
  console.log(`Service Role: ${colors.cyan}${SUPABASE_SERVICE_ROLE_KEY.substring(0, 40)}...${colors.reset}`);
  
  console.log(`\n${colors.yellow}⚠️  IMPORTANTE: Estos archivos contienen información sensible.${colors.reset}`);
  console.log(`${colors.yellow}   NO los subas a Git ni los compartas públicamente.${colors.reset}\n`);
}

// Ejecutar
try {
  main();
} catch (error) {
  log.error(`Error inesperado: ${error.message}`);
  process.exit(1);
}



