const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase - REEMPLAZA CON TUS CREDENCIALES
'
const supabaseUrl = 'https://yfqyqjqjqjqjqjqj.supabase.co'; // Reemplaza con tu URL real
'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Reemplaza con tu key real

const supabase = createClient(supabaseUrl, supabaseKey);

// Orden de etapas según tu constants.ts
const KANBAN_STAGES_ORDER = [
'
    'RECEPCION',
'
    'DIAGNOSTICO', 
'
    'PENDIENTE_COTIZACION',
'
    'ESPERA_APROBACION',
'
    'ATENCION_REQUERIDA',
'
    'EN_REPARACION',
'
    'CONTROL_CALIDAD',
'
    'LISTO_ENTREGA',
'
    'ENTREGADO',
];

async function determineCorrectStage(workOrder) {
    // Si está cancelada, mantener cancelada
'
    if (workOrder.stage === 'CANCELADO' || workOrder.status === 'CANCELADO') {
'
        return 'CANCELADO';
    }
    
    // Si no tiene diagnóstico, debería estar en RECEPCION
    if (!workOrder.diagnostic_data || Object.keys(workOrder.diagnostic_data).length === 0) {
        `);
'
        return 'RECEPCION';
    }
    
    // Si tiene diagnóstico pero no cotizaciones, debería estar en PENDIENTE_COTIZACION
    if (!workOrder.linked_quote_ids || workOrder.linked_quote_ids.length === 0) {
        `);
'
        return 'PENDIENTE_COTIZACION';
    }
    
    // Si tiene cotizaciones, necesitamos verificar su estado
    if (workOrder.linked_quote_ids && workOrder.linked_quote_ids.length > 0) {
        // Obtener las cotizaciones vinculadas
        const { data: quotes, error } = await supabase
'
            .from('quotes')
'
            .select('status')
'
            .in('id', workOrder.linked_quote_ids);
            
        if (error) {
            return workOrder.stage; // Mantener etapa actual
        }
        
'
        .join(', ')}`);
        
        // Si alguna cotización está aprobada, debería estar en EN_REPARACION o posterior
'
        const hasApprovedQuote = quotes.some(q => q.status === 'APROBADO');
'
        const hasRejectedQuote = quotes.some(q => q.status === 'RECHAZADO');
'
        const hasSentQuote = quotes.some(q => q.status === 'ENVIADO');
        
        if (hasApprovedQuote) {
            // Si tiene cotización aprobada, determinar si está en reparación o posterior
            const currentStageIndex = KANBAN_STAGES_ORDER.indexOf(workOrder.stage);
'
            const enReparacionIndex = KANBAN_STAGES_ORDER.indexOf('EN_REPARACION');
            
            if (currentStageIndex < enReparacionIndex) {
                `);
'
                return 'EN_REPARACION';
            } else {
                `);
                return workOrder.stage;
            }
        } else if (hasRejectedQuote) {
            `);
'
            return 'ATENCION_REQUERIDA';
        } else if (hasSentQuote) {
            `);
'
            return 'ESPERA_APROBACION';
        } else {
            // Solo cotizaciones en borrador
            `);
'
            return 'PENDIENTE_COTIZACION';
        }
    }
    
    // Si tiene diagnóstico pero no cotizaciones, debería estar en PENDIENTE_COTIZACION
    `);
'
    return 'PENDIENTE_COTIZACION';
}

async function updateWorkOrderStages() {
    try {
        // Obtener todas las órdenes de trabajo
        const { data: workOrders, error } = await supabase
'
            .from('work_orders')
'
            .select('*');
            
        if (error) {
'
            console.error('❌ Error obteniendo órdenes de trabajo:', error);
            return;
        }
        
        let updated = 0;
        let skipped = 0;
        
        for (const workOrder of workOrders) {
            const correctStage = await determineCorrectStage(workOrder);
            
            if (correctStage !== workOrder.stage) {
                // Actualizar en la base de datos
                const { error: updateError } = await supabase
'
                    .from('work_orders')
                    .update({ 
                        stage: correctStage,
                        updated_at: new Date().toISOString(),
                    })
'
                    .eq('id', workOrder.id);
                    
                if (updateError) {
                    } else {
                    updated++;
                }
            } else {
                skipped++;
            }
        }
        
        } catch (error) {
'
        console.error('❌ Error general:', error);
    }
}

// Ejecutar el script
updateWorkOrderStages();

'

