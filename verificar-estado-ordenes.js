// Script para verificar el estado actual de todas las órdenes de trabajo
// Ejecutar en la consola del navegador (F12) en la aplicación

// Obtener todas las órdenes de trabajo del contexto
const workOrders = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.getCurrentFiber?.()?.memoizedProps?.workOrders || [];

if (workOrders.length === 0) {
    } else {
    // Contar por etapa
    const stageCount = {};
    const statusCount = {};
    
    workOrders.forEach(wo => {
        stageCount[wo.stage] = (stageCount[wo.stage] || 0) + 1;
        statusCount[wo.status] = (statusCount[wo.status] || 0) + 1;
    });
    
    Object.entries(stageCount).forEach(([stage, count]) => {
        });
    
    Object.entries(statusCount).forEach(([status, count]) => {
        });
    
    // Mostrar órdenes activas vs entregadas
    const activeOrders = workOrders.filter(wo => 
        wo.stage !== 'ENTREGADO' && 
'
        wo.status !== 'CANCELADO' && 
'
        wo.status !== 'FACTURADO',
    );
    
'
    const deliveredOrders = workOrders.filter(wo => wo.stage === 'ENTREGADO');
'
    const cancelledOrders = workOrders.filter(wo => wo.status === 'CANCELADO');
    
    // Mostrar detalles de órdenes entregadas
    if (deliveredOrders.length > 0) {
        deliveredOrders.forEach(wo => {
            `);
        });
    }
    
    // Mostrar órdenes que podrían estar mal clasificadas
    const potentiallyMisclassified = workOrders.filter(wo => {
        // Órdenes que tienen cotizaciones aprobadas pero no están en EN_REPARACION o posterior
        const hasApprovedQuotes = wo.linkedQuoteIds?.some(quoteId => {
            // Aquí necesitarías acceso a las cotizaciones para verificar su estado
            return false; // Placeholder
        });
        
'
        return wo.stage === 'PENDIENTE_COTIZACION' && wo.linkedQuoteIds?.length > 0;
    });
    
    if (potentiallyMisclassified.length > 0) {
        potentiallyMisclassified.forEach(wo => {
            `);
        });
    }
}

'
, ve a la vista de "Órdenes de Trabajo" y selecciona la pestaña "Entregadas"');

'"

