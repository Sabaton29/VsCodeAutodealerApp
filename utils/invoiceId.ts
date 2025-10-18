/**
 * Utilidades para generar IDs de factura secuenciales
 */

/**
 * Genera un ID de factura basado en fecha
 * Formato: FAC-YYYYMMDD-XXX
 * @param invoiceId - UUID de la factura
 * @param createdAt - Fecha de creación
 * @returns ID basado en fecha
 */
export function formatInvoiceId(invoiceId: string, createdAt?: string | Date): string {
    const date = createdAt ? new Date(createdAt) : new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Validar que invoiceId existe y tiene al menos 3 caracteres
    const uuidSuffix = invoiceId && invoiceId.length >= 3 
        ? invoiceId.slice(-3).toUpperCase() 
        : 'XXX';
    
    return `FAC-${year}${month}${day}-${uuidSuffix}`;
}

/**
 * Genera un ID secuencial basado en el campo sequential_id de la base de datos
 * Formato: FAC-XXXX (hasta 9999), luego FAC-X.XXX
 * @param invoiceId - UUID de la factura (ignorado si tenemos sequentialId)
 * @param sequentialId - ID secuencial de la base de datos (REQUERIDO)
 * @returns ID secuencial consistente
 */
export function formatSequentialInvoiceId(invoiceId: string, sequentialId?: number): string {
    // SIEMPRE usar el sequential_id de la base de datos si está disponible
    if (sequentialId !== undefined && sequentialId !== null && sequentialId > 0) {
        if (sequentialId > 9999) {
            const thousands = Math.floor(sequentialId / 1000);
            const remainder = sequentialId % 1000;
            return `FAC-${thousands}.${remainder.toString().padStart(3, '0')}`;
        }
        return `FAC-${sequentialId.toString().padStart(4, '0')}`;
    }
    
    // Si no hay sequential_id, usar formato basado en fecha como fallback
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Validar que invoiceId existe y tiene al menos 3 caracteres
    const uuidSuffix = invoiceId && invoiceId.length >= 3 
        ? invoiceId.slice(-3).toUpperCase() 
        : 'XXX';
    
    return `FAC-${year}${month}${day}-${uuidSuffix}`;
}

/**
 * Función principal que decide qué tipo de ID usar
 * @param invoiceId - UUID de la factura
 * @param createdAt - Fecha de creación (opcional, para compatibilidad)
 * @param useSequential - Si usar formato secuencial (true) o basado en fecha (false)
 * @param sequentialId - ID secuencial de la base de datos (opcional)
 * @returns ID formateado
 */
export function getInvoiceDisplayId(
    invoiceId: string, 
    createdAt?: string | Date, 
    useSequential: boolean = false,
    sequentialId?: number,
): string {
    // Validar que invoiceId existe
    if (!invoiceId || typeof invoiceId !== 'string') {
        console.warn('getInvoiceDisplayId: invoiceId is undefined or not a string, using fallback');
        return 'FAC-XXXX';
    }
    
    if (useSequential) {
        return formatSequentialInvoiceId(invoiceId, sequentialId);
    }
    
    return formatInvoiceId(invoiceId, createdAt);
}

