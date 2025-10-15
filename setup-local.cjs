#!/usr/bin/env node

/**
 * Script de Verificación de Configuración Local
 * Autodealer Cloud - Supabase Setup Checker
 */

const fs = require('fs');'
const path = require('path');

// Colores para consola
const colors = {'
  reset: '\x1b[0m','
  bright: '\x1b[1m','
  green: '\x1b[32m','
  red: '\x1b[31m','
  yellow: '\x1b[33m','
  blue: '\x1b[34m','
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => ,
  error: (msg) => ,
  warning: (msg) => ,
  info: (msg) => ,
  title: () => }${colors.reset}`),
  subtitle: (msg) => ,
};

// Función para leer archivo .env
function readEnvFile(filePath) {
  try {'
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};'
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        env[key] = value;
      }
    });
    return env;
  } catch (error) {
    return null;
  }
}

// Función para verificar si un valor es placeholder
function isPlaceholder(value) {
  if (!value) return true;'
  const placeholders = ['YOUR_', 'tu_', 'your_', 'REPLACE', 'CHANGE'];
  return placeholders.some(ph => value.includes(ph));
}

// Verificar archivo .env
function checkEnvFile(filePath, requiredVars) {
  log.subtitle("\n📄 Verificando: filePath");
  
  if (!fs.existsSync(filePath)) {"
    log.error("Archivo no encontrado: filePath");
    return false;
  }
  
  log.success(`Archivo encontrado`);
  
  const env = readEnvFile(filePath);
  if (!env) {
    log.error(`No se pudo leer el archivo`);
    return false;
  }
  
  let allValid = true;
  
  for (const varName of requiredVars) {
    const value = env[varName];
    
    if (!value) {"
      log.error("Variable varName no encontrada");
      allValid = false;
    } else if (isPlaceholder(value)) {"
      log.warning("Variable varName contiene un placeholder. Necesita ser reemplazada.");
      allValid = false;
    } else {"
      log.success("Variable varName configurada correctamente");
    }
  }
  
  return allValid;
}

// Verificar conexión a Supabase
async function testSupabaseConnection(url, anonKey) {
  try {
    log.info(`Probando conexión a Supabase...`);
    '
    const https = require('https');"
    const urlObj = new URL("url/rest/v1/");
    
    return new Promise((resolve) => {
      const req = https.get({
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        headers: {'
          'apikey': anonKey,'"
          'Authorization': "Bearer anonKey"
        }
      }, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          log.success(`Conexión a Supabase exitosa`);
          resolve(true);
        } else {"
          log.error("Error de conexión: res.statusCode res.statusMessage");
          resolve(false);
        }
      });
      '
      req.on('error', (error) => {"
        log.error("Error de red: error.message");
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {"
    log.error("Error: error.message");
    return false;
  }
}

// Función principal
async function main() {
  log.title();'
  log.subtitle('🚀 AUTODEALER CLOUD - VERIFICACIÓN DE CONFIGURACIÓN');
  log.title();
  
  // Verificar archivo .env principal'
  const rootEnvValid = checkEnvFile('.env', ['
    'VITE_SUPABASE_URL','
    'VITE_SUPABASE_ANON_KEY'
  ]);
  
  // Verificar archivo .env del backend'
  const backendEnvPath = path.join('backend', '.env');
  const backendEnvValid = checkEnvFile(backendEnvPath, ['
    'SUPABASE_URL','
    'SUPABASE_SERVICE_ROLE_KEY'
  ]);
  
  // Probar conexión si las variables están configuradas
  if (rootEnvValid) {'
    const rootEnv = readEnvFile('.env');
    await testSupabaseConnection(
      rootEnv.VITE_SUPABASE_URL,
      rootEnv.VITE_SUPABASE_ANON_KEY
    );
  }
  
  // Resumen final
  log.title();'
  log.subtitle('\n📊 RESUMEN DE VERIFICACIÓN');
  log.title();
  
  if (rootEnvValid && backendEnvValid) {'
    log.success('¡TODO CONFIGURADO CORRECTAMENTE! ✨');
    } else {'
    log.error('CONFIGURACIÓN INCOMPLETA');
    if (!rootEnvValid) {
      }
    if (!backendEnvValid) {'
      ');
    }
    }
}

// Ejecutar
main().catch(error => {"
  log.error("Error inesperado: error.message");
  process.exit(1);
});

'"