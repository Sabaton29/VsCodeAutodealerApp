import fs from 'fs';
import path from 'path';

// Archivos a limpiar (excluyendo node_modules y dist)
const filesToClean = [
  'services/supabase.ts',
  'fix-contrast-issues.js',
  'test-supabase-simple.js',
  'test-supabase.js',
  'update-work-orders-simple.js',
  'update-work-orders-stages.js',
  'verificar-estado-ordenes.js',
  'setup-local.cjs'
];

function cleanConsoleLogs(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Archivo no encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Eliminar console.log pero mantener console.warn y console.error
    content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\([^)]*\)\s*/g, '');
    
    // Eliminar líneas vacías múltiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Limpiado: ${filePath}`);
    } else {
      console.log(`ℹ️  Sin cambios: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

console.log('🧹 Iniciando limpieza de console.log...\n');

filesToClean.forEach(file => {
  cleanConsoleLogs(file);
});

console.log('\n✨ Limpieza completada!');
