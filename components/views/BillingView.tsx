import React, { useState, useMemo } from 'react';
import { type Invoice, type Permission, InvoiceStatus } from '../../types';
import { INVOICE_STATUS_DISPLAY_CONFIG } from '../../constants';
import { Icon } from '../Icon';
import InvoiceActions from '../InvoiceActions';
import { getInvoiceDisplayId } from '../../utils/invoiceId';

interface BillingViewProps {
    selectedLocationId: string;
    invoices: Invoice[];
    hasPermission: (permission: Permission) => boolean;
    setPayingInvoice: (invoice: Invoice) => void;
    onCancelInvoice: (invoiceId: string) => void;
    onViewInvoiceDetails: (invoiceId: string) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const BillingView: React.FC<BillingViewProps> = ({ selectedLocationId, invoices, hasPermission, setPayingInvoice, onCancelInvoice, onViewInvoiceDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = useMemo(() => {
        if (!searchTerm) {
            return invoices;
        }
        return invoices.filter(inv => {
            const displayId = getInvoiceDisplayId(inv.id, inv.issueDate, true, inv.sequentialId);
            return displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.vehicleSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.status.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [searchTerm, invoices]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Facturación</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Creación y seguimiento de facturas, presupuestos y pagos.</p>
            </div>

            <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
                {/* Toolbar */}
                <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative w-full sm:max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar factura, cliente, estado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Factura #</th>
                                <th scope="col" className="px-6 py-3">Cliente / Vehículo</th>
                                <th scope="col" className="px-6 py-3">Fechas (Emisión / Vence)</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3 text-right">Total</th>
                                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice: Invoice) => {
                                    const statusConfig = INVOICE_STATUS_DISPLAY_CONFIG[invoice.status] || { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' };
                                    return (
                                        <tr 
                                            key={invoice.id} 
                                            onClick={() => onViewInvoiceDetails(invoice.id)}
                                            className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                        >
                                            <th scope="row" className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap dark:text-white">
                                                {getInvoiceDisplayId(invoice.id, invoice.issueDate, true, invoice.sequentialId)}
                                            </th>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-light-text dark:text-dark-text">{invoice.clientName}</p>
                                                <p className="text-xs">{invoice.vehicleSummary}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p>{formatDate(invoice.issueDate)}</p>
                                                <p className="font-semibold text-red-400">{formatDate(invoice.dueDate)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-semibold text-light-text dark:text-dark-text">
                                                {formatCurrency(invoice.total)}
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => { e.stopPropagation(); }}>
                                                <InvoiceActions
                                                    invoice={invoice}
                                                    onViewDetails={() => onViewInvoiceDetails(invoice.id)}
                                                    onRegisterPayment={() => setPayingInvoice(invoice)}
                                                    onCancel={() => onCancelInvoice(invoice.id)}
                                                    hasPermission={hasPermission}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No se encontraron facturas.
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

export default BillingView;
