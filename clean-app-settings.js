// Script para limpiar duplicados en app_settings
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xoakbkmfnoiwmjtrnscy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvYWtiS21mbm9pd21qdHJuc2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2NDQ4NzMsImV4cCI6MjA0NzIyMDg3M30.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAppSettings() {
    try {
        console.debug('🔍 Verificando registros en app_settings...');
        
        // Obtener todos los registros
        const { data: allSettings, error: fetchError } = await supabase
            .from('app_settings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (fetchError) {
            console.error('❌ Error obteniendo registros:', fetchError);
            return;
        }
        
        console.debug(`📊 Encontrados ${allSettings.length} registros en app_settings`);
        
        if (allSettings.length <= 1) {
            console.debug('✅ No hay duplicados, todo está bien');
            return;
        }
        
        // Mantener solo el más reciente
        const keepRecord = allSettings[0];
        const deleteRecords = allSettings.slice(1);
        
        console.debug('🗑️ Eliminando registros duplicados...');
        
        // Eliminar registros duplicados
        for (const record of deleteRecords) {
            const { error: deleteError } = await supabase
                .from('app_settings')
                .delete()
                .eq('id', record.id);
            
            if (deleteError) {
                console.error(`❌ Error eliminando registro ${record.id}:`, deleteError);
            } else {
                console.debug(`✅ Registro ${record.id} eliminado`);
            }
        }
        
        console.debug('✅ Limpieza completada');
        
        // Verificar resultado
        const { data: finalSettings, error: finalError } = await supabase
            .from('app_settings')
            .select('*');
        
        if (finalError) {
            console.error('❌ Error verificando resultado:', finalError);
        } else {
            console.debug(`📊 Registros restantes: ${finalSettings.length}`);
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

cleanAppSettings();

