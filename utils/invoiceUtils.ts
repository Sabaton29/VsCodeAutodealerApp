import { Invoice, WorkOrder, Quote } from '../types';

/**
 * Verifica si una orden de trabajo ya tiene facturas asociadas
 */
export function isWorkOrderInvoiced(workOrderId: string, invoices: Invoice[]): boolean {
    return invoices.some(invoice => invoice.workOrderId === workOrderId);
}

/**
 * Obtiene todas las facturas asociadas a una orden de trabajo
 */
export function getInvoicesForWorkOrder(workOrderId: string, invoices: Invoice[]): Invoice[] {
    return invoices.filter(invoice => invoice.workOrderId === workOrderId);
}

/**
 * Obtiene todas las facturas que provienen de una cotización específica
 */
export function getInvoicesForQuote(quoteId: string, invoices: Invoice[]): Invoice[] {
    return invoices.filter(invoice => invoice.quoteId === quoteId);
}

/**
 * Agrupa facturas por cotización de origen
 */
export function groupInvoicesByQuote(invoices: Invoice[]): { [quoteId: string]: Invoice[] } {
    const grouped: { [quoteId: string]: Invoice[] } = {};
    
    invoices.forEach(invoice => {
        if (invoice.quoteId) {
            if (!grouped[invoice.quoteId]) {
                grouped[invoice.quoteId] = [];
            }
            grouped[invoice.quoteId].push(invoice);
        }
    });
    
    return grouped;
}

/**
 * Obtiene el estado de facturación de una orden de trabajo
 */
export function getWorkOrderInvoicingStatus(workOrderId: string, invoices: Invoice[], quotes: Quote[]): {
    isInvoiced: boolean;
    invoiceCount: number;
    totalInvoiced: number;
    pendingQuotes: Quote[];
    invoicedQuotes: Quote[];
} {
    const workOrderInvoices = getInvoicesForWorkOrder(workOrderId, invoices);
    const workOrderQuotes = quotes.filter(quote => quote.workOrderId === workOrderId);
    
    const invoicedQuoteIds = workOrderInvoices
        .map(invoice => invoice.quoteId)
        .filter(Boolean) as string[];
    
    const pendingQuotes = workOrderQuotes.filter(quote => 
        quote.status === 'Aprobado' && !invoicedQuoteIds.includes(quote.id),
    );
    
    const invoicedQuotes = workOrderQuotes.filter(quote => 
        invoicedQuoteIds.includes(quote.id),
    );
    
    const totalInvoiced = workOrderInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    return {
        isInvoiced: workOrderInvoices.length > 0,
        invoiceCount: workOrderInvoices.length,
        totalInvoiced,
        pendingQuotes,
        invoicedQuotes,
    };
}

/**
 * Obtiene un resumen de facturación por cotización
 */
export function getQuoteInvoicingSummary(quoteId: string, invoices: Invoice[]): {
    invoiceCount: number;
    totalInvoiced: number;
    invoices: Invoice[];
} {
    const quoteInvoices = getInvoicesForQuote(quoteId, invoices);
    const totalInvoiced = quoteInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    return {
        invoiceCount: quoteInvoices.length,
        totalInvoiced,
        invoices: quoteInvoices,
    };
}
