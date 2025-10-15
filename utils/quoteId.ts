/**
 * Utilidad centralizada para generar IDs de cotizaciones consistentes
 * Resuelve el problema de nomenclatura donde diferentes componentes
 * generaban IDs diferentes para la misma cotización
 */

/**
 * Genera un ID de cotización consistente basado en el UUID y fecha de creación
 * Formato: COT-YYYYMMDD-XXX
 * @param quoteId - UUID de la cotización
 * @param createdAt - Fecha de creación de la cotización
 * @returns ID formateado consistente
 */
export function formatQuoteId(quoteId: string, createdAt?: string | Date): string {
    try {
        // Usar la fecha de creación si está disponible, sino usar la fecha actual
        const date = createdAt ? new Date(createdAt) : new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        // Generar un sufijo numérico consistente basado en el UUID
        const uuidSuffix = quoteId.slice(-4);
        const numericSuffix = parseInt(uuidSuffix, 16) % 1000;
        
        return `COT-${year}${month}${day}-${numericSuffix.toString().padStart(3, '0')}`;
    } catch (error) {
        console.error('Error formatting quote ID:', error);
        // Fallback: usar solo el sufijo del UUID
        return `COT-${quoteId.slice(-8)}`;
    }
}

/**
 * Genera un ID secuencial basado en el campo sequential_id de la base de datos
 * Formato: COT-XXXX (hasta 9999), luego COT-X.XXX
 * @param quoteId - UUID de la cotización (ignorado si tenemos sequentialId)
 * @param sequentialId - ID secuencial de la base de datos (REQUERIDO)
 * @returns ID secuencial consistente
 */
export function formatSequentialQuoteId(quoteId: string, sequentialId?: number): string {
    // SIEMPRE usar el sequential_id de la base de datos si está disponible
    if (sequentialId !== undefined && sequentialId !== null && sequentialId > 0) {
        if (sequentialId > 9999) {
            const thousands = Math.floor(sequentialId / 1000);
            const remainder = sequentialId % 1000;
            return `COT-${thousands}.${remainder.toString().padStart(3, '0')}`;
        }
        return `COT-${sequentialId.toString().padStart(4, '0')}`;
    }
    
    // Si no hay sequential_id, usar formato basado en fecha como fallback
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const uuidSuffix = quoteId.slice(-4);
    const numericSuffix = parseInt(uuidSuffix, 16) % 1000;
    
    return `COT-${year}${month}${day}-${numericSuffix.toString().padStart(3, '0')}`;
}

/**
 * Función principal que decide qué tipo de ID usar
 * @param quoteId - UUID de la cotización
 * @param createdAt - Fecha de creación (opcional, para compatibilidad)
 * @param useSequential - Si usar formato secuencial (true) o basado en fecha (false)
 * @param sequentialId - ID secuencial de la base de datos (opcional)
 * @returns ID formateado
 */
export function getQuoteDisplayId(
    quoteId: string, 
    createdAt?: string | Date, 
    useSequential: boolean = false,
    sequentialId?: number,
): string {
    if (useSequential) {
        return formatSequentialQuoteId(quoteId, sequentialId);
    }
    
    return formatQuoteId(quoteId, createdAt);
}
