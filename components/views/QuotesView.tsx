

import React, { useState, useMemo } from 'react';
import { type Quote, type Permission, QuoteStatus } from '../../types';
import { QUOTE_STATUS_DISPLAY_CONFIG } from '../../constants';
import { Icon } from '../Icon';
import QuoteActions from '../QuoteActions';
import { getQuoteDisplayId } from '../../utils/quoteId';

interface QuotesViewProps {
    selectedLocationId: string;
    quotes: Quote[];
    hasPermission: (permission: Permission) => boolean;
    onViewQuoteDetails: (quoteId: string) => void;
    onDeleteQuote: (quoteId: string) => void;
    onCreateInvoiceFromQuote: (workOrderId: string) => void;
    onCreateManualQuote: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const QuotesView: React.FC<QuotesViewProps> = ({ selectedLocationId, quotes, hasPermission, onViewQuoteDetails, onDeleteQuote, onCreateInvoiceFromQuote, onCreateManualQuote }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    
    console.warn('🔍 QuotesView - Received quotes:', quotes.length);
    console.warn('🔍 QuotesView - Quotes data:', quotes);
    console.warn('🔍 QuotesView - selectedLocationId:', selectedLocationId);

    const filteredQuotes = useMemo(() => {
        console.warn('🔍 QuotesView - filteredQuotes - searchTerm:', searchTerm);
        console.warn('🔍 QuotesView - filteredQuotes - statusFilter:', statusFilter);
        console.warn('🔍 QuotesView - filteredQuotes - input quotes count:', quotes.length);
        
        let filtered = quotes;
        
        // Filtrar por estado
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(q => q.status === statusFilter);
            console.warn('🔍 QuotesView - filteredQuotes - after status filter:', filtered.length);
        }
        
        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(q =>
                q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.vehicleSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.status.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            console.warn('🔍 QuotesView - filteredQuotes - after search filter:', filtered.length);
        }
        
        console.warn('🔍 QuotesView - filteredQuotes - final count:', filtered.length);
        return filtered;
    }, [searchTerm, statusFilter, quotes]);

    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Cotizaciones</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Administra, crea y envía cotizaciones a tus clientes.</p>
            </div>

            <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
                {/* Toolbar */}
                <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex gap-4 w-full">
                        <div className="relative flex-1 max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name="search" className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar cotización, cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text"
                        >
                            <option value="ALL">Todos los Estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Enviado">Enviado</option>
                            <option value="APPROVED">Aprobada</option>
                            <option value="REJECTED">Rechazada</option>
                        </select>
                    </div>
                    {hasPermission('manage:quotes') && (
                        <button
                            onClick={onCreateManualQuote}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-light disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isGlobalView}
                            title={isGlobalView ? 'Seleccione una sede para crear una cotización' : 'Crear Cotización Manual'}
                        >
                            <Icon name="plus" className="w-5 h-5" />
                            Crear Cotización Manual
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Cotización #</th>
                                <th scope="col" className="px-6 py-3">Cliente / Vehículo</th>
                                <th scope="col" className="px-6 py-3">Fecha Emisión</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3 text-right">Total</th>
                                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotes.length > 0 ? (
                                filteredQuotes
                                    .sort((a, b) => new Date(b.createdAt || b.issueDate).getTime() - new Date(a.createdAt || a.issueDate).getTime())
                                    .map((quote: Quote, index: number) => {
                                    console.warn(`🔍 QuotesView - Rendering quote ${index + 1}:`, quote.id, quote.status, quote.workOrderId);
                                    const statusConfig = QUOTE_STATUS_DISPLAY_CONFIG[quote.status] || { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700' };
                                    
                                    // Debug: verificar sequentialId
                                    console.warn('🔍 QuotesView - Quote sequentialId:', {
                                        id: quote.id,
                                        sequentialId: quote.sequentialId,
                                        sequentialIdType: typeof quote.sequentialId,
                                    });
                                    
                                    // Usar función centralizada para generar ID consistente
                                    const displayId = getQuoteDisplayId(quote.id, quote.issueDate, true, quote.sequentialId);
                                    
                                    return (
                                        <tr 
                                            key={quote.id} 
                                            onClick={() => onViewQuoteDetails(quote.id)}
                                            className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                        >
                                            <th scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap dark:text-white">
                                                {displayId}
                                            </th>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-light-text dark:text-dark-text">{quote.clientName}</p>
                                                <p className="text-xs">{quote.vehicleSummary}</p>
                                            </td>
                                            <td className="px-6 py-4">{formatDate(quote.issueDate)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-semibold text-light-text dark:text-dark-text">
                                                {formatCurrency(quote.total)}
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => { e.stopPropagation(); }}>
                                                 <QuoteActions
                                                    quote={quote}
                                                    onViewDetails={() => onViewQuoteDetails(quote.id)}
                                                    onEdit={() => { /* TODO: Implement edit quote modal */ }}
                                                    onDelete={() => onDeleteQuote(quote.id)}
                                                    onCreateInvoiceFromQuote={onCreateInvoiceFromQuote}
                                                    hasPermission={hasPermission}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No se encontraron cotizaciones.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QuotesView;
