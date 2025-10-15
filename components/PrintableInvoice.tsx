import React from 'react';
import { Icon } from './Icon';
import { Invoice, Client, Vehicle, WorkOrder, AppSettings } from '../types';

interface PrintableInvoiceProps {
    invoice: Invoice;
    client: Client;
    vehicle: Vehicle;
    workOrder?: WorkOrder;
    appSettings: AppSettings | null;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice, client, vehicle, workOrder, appSettings }) => {
    
    const InfoField = ({ label, value }: { label: string, value?: string | number }) => (
        <div className="mb-2">
            <span className="text-xs font-semibold text-gray-600 block">{label}</span>
            <p className="text-sm text-black dark:text-white break-words">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="bg-white text-black dark:text-white p-8 font-sans" style={{ fontFamily: 'sans-serif', width: '210mm', minHeight: '297mm' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
                {/* Sección izquierda: Logotipo ampliado */}
                <div style={{ flex: 1, textAlign: 'left', maxWidth: '50%' }}>
                    <img 
                        src={appSettings?.companyInfo.logoUrl || '/images/company/logo.png'} 
                        alt="AUTO DEALER" 
                        style={{ height: '150px', width: 'auto', display: 'block', maxWidth: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                            console.log('Error loading logo:', appSettings?.companyInfo.logoUrl);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }} 
                    />
                    <Icon name="logo-car" className="hidden" />
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6b7280' }}>NIT: {appSettings?.companyInfo.nit}</p>
                </div>
                
                {/* Sección derecha: Título y detalles */}
                <div style={{ flex: 1, textAlign: 'right', maxWidth: '50%' }}>
                    <h1 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>FACTURA DE VENTA</h1>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>{invoice.id}</p>
                    {workOrder && <p style={{ margin: '0', fontSize: '14px' }}>OT Asociada: {workOrder.id}</p>}
                </div>
            </div>
            <hr style={{ border: '1px solid #000', margin: '15px 0' }} />

            {/* Client, Vehicle, Dates */}
            <div className="mt-6 grid grid-cols-3 gap-6 border-b border-black pb-4">
                <div>
                    <h3 className="font-bold text-gray-700 mb-2">FACTURAR A</h3>
                    <InfoField label="Nombre" value={client.name} />
                    <InfoField label="Identificación" value={`${client.idType} ${client.idNumber}`} />
                    <InfoField label="Teléfono" value={client.phone} />
                </div>
                 <div>
                    <h3 className="font-bold text-gray-700 mb-2">VEHÍCULO</h3>
                    <InfoField label="Marca/Modelo" value={invoice.vehicleSummary} />
                    <InfoField label="Kilometraje" value={workOrder?.mileage} />
                </div>
                 <div>
                    <h3 className="font-bold text-gray-700 mb-2">FECHAS</h3>
                    <InfoField label="Fecha de Emisión" value={formatDate(invoice.issueDate)} />
                    <InfoField label="Fecha de Vencimiento" value={formatDate(invoice.dueDate)} />
                </div>
            </div>

            {/* Items Table */}
            <div className="mt-6">
                 <table className="w-full text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-2 py-2 text-left font-bold w-[40%]">Descripción</th>
                            <th className="px-2 py-2 text-center font-bold">Cant.</th>
                            <th className="px-2 py-2 text-right font-bold">Vlr. Unitario</th>
                            <th className="px-2 py-2 text-right font-bold">Descuento</th>
                            <th className="px-2 py-2 text-right font-bold">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {invoice.items.map(item => (
                            <tr key={item.id}>
                                <td className="px-2 py-2 align-top">
                                    <p className="font-semibold">{item.description}</p>
                                    <p className="text-xs text-gray-600">{item.type === 'service' ? 'Servicio' : 'Repuesto'}</p>
                                    {item.suppliedByClient && (
                                        <p className="text-xs text-blue-600 font-bold italic">(Suministrado por el Cliente)</p>
                                    )}
                                </td>
                                <td className="px-2 py-2 text-center align-top">{item.quantity}</td>
                                <td className="px-2 py-2 text-right align-top">{formatCurrency(item.suppliedByClient ? 0 : item.unitPrice)}</td>
                                <td className="px-2 py-2 text-right align-top text-red-600">{formatCurrency(item.discount || 0)}</td>
                                <td className="px-2 py-2 text-right align-top">{formatCurrency((item.quantity * item.unitPrice) - (item.discount || 0))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Totals & Notes */}
            <div className="mt-6 flex justify-between items-start page-break-inside-avoid">
                <div className="w-1/2 text-xs text-gray-700">
                     <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Términos y Condiciones:</h4>
                     <p className="italic">{invoice.notes || appSettings?.billingSettings.defaultTerms}</p>
                     <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1 mt-4">Información de Pago:</h4>
                     <p className="whitespace-pre-wrap">{appSettings?.billingSettings.bankInfo}</p>
                </div>
                <div className="w-1/3 space-y-2 text-sm">
                     <div className="flex justify-between items-center">
                        <span>Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                     </div>
                      <div className="flex justify-between items-center">
                        <span>IVA:</span>
                        <span className="font-semibold">{formatCurrency(invoice.taxAmount)}</span>
                     </div>
                     <div className="flex justify-between items-center text-lg font-bold border-t-2 border-black pt-2 mt-2">
                        <span>TOTAL A PAGAR:</span>
                        <span className="text-brand-red">{formatCurrency(invoice.total)}</span>
                     </div>
                </div>
            </div>
            
            {/* Footer */}
            <div className="mt-16 border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
                <p>Gracias por su confianza.</p>
                <p>{appSettings?.companyInfo.name} - NIT {appSettings?.companyInfo.nit}</p>
            </div>
        </div>
    );
};

export default PrintableInvoice;
