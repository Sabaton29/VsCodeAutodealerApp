import React from 'react';
import { Icon } from './Icon';
import { Invoice, WorkOrder, Quote } from '../types';
import { getWorkOrderInvoicingStatus, getQuoteInvoicingSummary } from '../utils/invoiceUtils';

interface InvoicingIndicatorProps {
    workOrderId: string;
    invoices: Invoice[];
    quotes: Quote[];
    showDetails?: boolean;
}

const InvoicingIndicator: React.FC<InvoicingIndicatorProps> = ({ 
    workOrderId, 
    invoices, 
    quotes, 
    showDetails = false, 
}) => {
    const status = getWorkOrderInvoicingStatus(workOrderId, invoices, quotes);
    
    if (!status.isInvoiced && status.pendingQuotes.length === 0) {
        return null; // No hay cotizaciones ni facturas
    }
    
    if (status.isInvoiced && status.pendingQuotes.length === 0) {
        // Completamente facturado
        return (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Icon name="check-circle" className="w-3 h-3" />
                <span className="text-xs font-medium">
                    {showDetails ? `Facturado (${status.invoiceCount})` : 'Facturado'}
                </span>
            </div>
        );
    }
    
    if (status.isInvoiced && status.pendingQuotes.length > 0) {
        // Parcialmente facturado
        return (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Icon name="exclamation-triangle" className="w-3 h-3" />
                <span className="text-xs font-medium">
                    {showDetails ? `Parcial (${status.invoiceCount}/${status.pendingQuotes.length + status.invoicedQuotes.length})` : 'Parcial'}
                </span>
            </div>
        );
    }
    
    if (!status.isInvoiced && status.pendingQuotes.length > 0) {
        // Pendiente de facturar
        return (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Icon name="clock" className="w-3 h-3" />
                <span className="text-xs font-medium">
                    {showDetails ? `Pendiente (${status.pendingQuotes.length})` : 'Pendiente facturar'}
                </span>
            </div>
        );
    }
    
    return null;
};

interface QuoteInvoicingIndicatorProps {
    quoteId: string;
    invoices: Invoice[];
    showDetails?: boolean;
}

export const QuoteInvoicingIndicator: React.FC<QuoteInvoicingIndicatorProps> = ({ 
    quoteId, 
    invoices, 
    showDetails = false, 
}) => {
    const summary = getQuoteInvoicingSummary(quoteId, invoices);
    
    if (summary.invoiceCount === 0) {
        return null; // No hay facturas para esta cotización
    }
    
    return (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Icon name="invoice" className="w-4 h-4" />
            <span className="text-xs font-medium">
                {showDetails ? `Facturado (${summary.invoiceCount})` : 'Facturado'}
            </span>
        </div>
    );
};

export default InvoicingIndicator;
