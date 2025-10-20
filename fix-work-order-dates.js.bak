// Script para verificar y corregir las fechas de las órdenes de trabajo
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'your-anon-key'; // Reemplaza con tu clave

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixWorkOrderDates() {
    try {
        console.log('🔍 Verificando órdenes de trabajo...');
        
        // Obtener todas las órdenes de trabajo
        const { data: workOrders, error: fetchError } = await supabase
            .from('work_orders')
            .select('id, date, created_at')
            .order('created_at', { ascending: false });
        
        if (fetchError) {
            console.error('❌ Error al obtener órdenes de trabajo:', fetchError);
            return;
        }
        
        console.log(`📊 Encontradas ${workOrders.length} órdenes de trabajo`);
        
        let updatedCount = 0;
        
        for (const workOrder of workOrders) {
            console.log(`\n🔍 Verificando OT ${workOrder.id}:`);
            console.log(`   - date: ${workOrder.date}`);
            console.log(`   - created_at: ${workOrder.created_at}`);
            
            // Si no tiene fecha o la fecha es null/undefined, usar created_at
            if (!workOrder.date || workOrder.date === null || workOrder.date === undefined) {
                console.log(`   ⚠️  Sin fecha, actualizando con created_at...`);
                
                const { error: updateError } = await supabase
                    .from('work_orders')
                    .update({ date: workOrder.created_at })
                    .eq('id', workOrder.id);
                
                if (updateError) {
                    console.error(`   ❌ Error al actualizar OT ${workOrder.id}:`, updateError);
                } else {
                    console.log(`   ✅ OT ${workOrder.id} actualizada correctamente`);
                    updatedCount++;
                }
            } else {
                console.log(`   ✅ OT ${workOrder.id} ya tiene fecha`);
            }
        }
        
        console.log(`\n🎉 Proceso completado. ${updatedCount} órdenes de trabajo actualizadas.`);
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar el script
fixWorkOrderDates();
