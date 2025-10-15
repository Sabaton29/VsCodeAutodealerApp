import React, { useMemo } from 'react';
import { Icon } from './Icon';
import { Quote, Client, Vehicle, WorkOrder, CompanyInfo } from '../types';

interface PrintableQuoteProps {
    quote: Quote;
    client: Client;
    vehicle: Vehicle;
    workOrder?: WorkOrder;
    companyInfo: CompanyInfo | null;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const PrintableQuote: React.FC<PrintableQuoteProps> = ({ quote, client, vehicle, workOrder, companyInfo }) => {
    
    const InfoField = ({ label, value }: { label: string, value?: string | number }) => (
        <div className="mb-2">
            <span className="text-xs font-semibold text-gray-600 block">{label}</span>
            <p className="text-sm text-black dark:text-white break-words">{value || 'N/A'}</p>
        </div>
    );

    const totalDiscount = quote.items.reduce((acc, item) => acc + (item.discount || 0), 0);

    // Calculate IVA dynamically based on quote items
    const calculatedTaxAmount = useMemo(() => {
        return quote.items.reduce((acc, item) => {
            const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
            const itemTax = itemTotal * (item.taxRate / 100);
            return acc + itemTax;
        }, 0);
    }, [quote.items]);

    return (
        <>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background-color: #fff !important; }
                    .page-break-inside-avoid { page-break-inside: avoid; }
                }
            `}</style>
            <div className="bg-gray-200 min-h-screen">
                 <div className="no-print p-4 bg-dark-light text-white flex justify-between items-center shadow-lg sticky top-0 z-10">
                    <h2 className="font-bold">Vista Previa de Impresión - Cotización</h2>
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors"
                    >
                        <Icon name="printer" className="w-5 h-5"/>
                        Imprimir o Guardar como PDF
                    </button>
                </div>
                <div className="bg-white text-black dark:text-white p-8 font-sans shadow-lg mx-auto my-8" style={{ fontFamily: 'sans-serif', width: '210mm', minHeight: '297mm' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
                        {/* Sección izquierda: Logotipo ampliado */}
                        <div style={{ flex: 1, textAlign: 'left', maxWidth: '50%' }}>
                            <img 
                                src={companyInfo?.logoUrl || '/images/company/logo.png'} 
                                alt="AUTO DEALER" 
                                style={{ height: '150px', width: 'auto', display: 'block', maxWidth: '100%', objectFit: 'contain' }}
                                onError={(e) => {
                                    console.log('Error loading logo:', companyInfo?.logoUrl);
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }} 
                            />
                            <Icon name="logo-car" className="hidden" />
                        </div>
                        
                        {/* Sección derecha: Título y detalles */}
                        <div style={{ flex: 1, textAlign: 'right', maxWidth: '50%' }}>
                            <h1 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>COTIZACIÓN</h1>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>{quote.id}</p>
                            {workOrder && <p style={{ margin: '0', fontSize: '14px' }}>OT Asociada: {workOrder.id}</p>}
                        </div>
                    </div>
                    <hr style={{ border: '1px solid #000', margin: '15px 0' }} />

                    {/* Client, Vehicle, Dates */}
                    <div className="mt-6 grid grid-cols-3 gap-6 border-b border-black pb-4">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">CLIENTE</h3>
                            <InfoField label="Nombre" value={client.name} />
                            <InfoField label="Teléfono" value={client.phone} />
                            <InfoField label="Email" value={client.email} />
                        </div>
                         <div>
                            <h3 className="font-bold text-gray-700 mb-2">VEHÍCULO</h3>
                            <InfoField label="Marca/Modelo" value={quote.vehicleSummary} />
                            <InfoField label="Kilometraje" value={workOrder?.mileage} />
                        </div>
                         <div>
                            <h3 className="font-bold text-gray-700 mb-2">FECHAS</h3>
                            <InfoField label="Fecha de Emisión" value={formatDate(quote.issueDate)} />
                            <InfoField label="Válida Hasta" value={formatDate(quote.expiryDate)} />
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
                                {(quote.items || []).map(item => (
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
                             <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Notas:</h4>
                             <p className="italic">{quote.notes || 'No se añadieron notas adicionales.'}</p>
                        </div>
                        <div className="w-1/3 space-y-2 text-sm">
                             <div className="flex justify-between items-center">
                                <span>Subtotal:</span>
                                <span className="font-semibold">{formatCurrency(quote.subtotal)}</span>
                             </div>
                             
                             {/* Descuento general - solo si existe */}
                             {quote.totalDiscount && quote.totalDiscount > 0 && (
                                 <div className="flex justify-between items-center text-red-600">
                                     <span>Descuento ({quote.totalDiscount}%):</span>
                                     <span className="font-semibold">-{formatCurrency(quote.discountAmount || 0)}</span>
                                 </div>
                             )}
                             
                              <div className="flex justify-between items-center">
                                <span>IVA:</span>
                                <span className="font-semibold">{formatCurrency(calculatedTaxAmount)}</span>
                             </div>
                             <div className="flex justify-between items-center text-lg font-bold border-t-2 border-black pt-2 mt-2">
                                <span>TOTAL:</span>
                                <span className="text-brand-red">{formatCurrency(quote.total)}</span>
                             </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-16 border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
                        <p>Gracias por su confianza.</p>
                        <p>{companyInfo?.name} - NIT {companyInfo?.nit}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintableQuote;