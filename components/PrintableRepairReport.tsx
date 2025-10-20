import React from 'react';
import { Icon } from './Icon';
import { WorkOrder, Quote, Client, Vehicle, CompanyInfo } from '../types';

interface PrintableRepairReportProps {
    workOrder: WorkOrder;
    quote: Quote;
    client: Client;
    vehicle: Vehicle;
    companyInfo: CompanyInfo | null;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const PrintableRepairReport: React.FC<PrintableRepairReportProps> = ({ 
    workOrder, 
    quote, 
    client, 
    vehicle, 
    companyInfo, 
}) => {
    
    const InfoField = ({ label, value }: { label: string, value?: string | number }) => (
        <div className="mb-2">
            <span className="text-xs font-semibold text-gray-600 block">{label}</span>
            <p className="text-sm text-black dark:text-white break-words">{value || 'N/A'}</p>
        </div>
    );

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
                    <h2 className="font-bold">Vista Previa de Impresión - Reporte de Reparación</h2>
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
                                    console.warn('Error loading logo:', companyInfo?.logoUrl);
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }} 
                            />
                            <Icon name="logo-car" className="hidden" />
                        </div>
                        
                        {/* Sección derecha: Título y detalles */}
                        <div style={{ flex: 1, textAlign: 'right', maxWidth: '50%' }}>
                            <h1 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>REPORTE DE REPARACIÓN</h1>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>{workOrder.id}</p>
                            <p style={{ margin: '0', fontSize: '14px' }}>Fecha: {formatDate(new Date().toISOString())}</p>
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
                            <InfoField label="Marca/Modelo" value={`${vehicle.make} ${vehicle.model}`} />
                            <InfoField label="Año" value={vehicle.year} />
                            <InfoField label="Placa" value={vehicle.plate} />
                            <InfoField label="Kilometraje" value={workOrder.mileage} />
                        </div>
                         <div>
                            <h3 className="font-bold text-gray-700 mb-2">ESTADO</h3>
                            <InfoField label="Estado Actual" value={workOrder.stage} />
                            <InfoField label="Fecha de Inicio" value={formatDate(workOrder.date)} />
                            <InfoField label="Motivo" value={(workOrder as any).issue} />
                        </div>
                    </div>

                    {/* Tareas de Reparación */}
                    <div className="mt-6">
                        <h3 className="font-bold text-gray-700 mb-4 text-lg">TAREAS DE REPARACIÓN</h3>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700 w-8">✓</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Descripción</th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-700 w-20">Cant.</th>
                                        <th className="px-4 py-2 text-right font-semibold text-gray-700 w-24">Precio Unit.</th>
                                        <th className="px-4 py-2 text-right font-semibold text-gray-700 w-20">Descuento</th>
                                        <th className="px-4 py-2 text-right font-semibold text-gray-700 w-24">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quote.items.map((item, index) => (
                                        <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${item.isCompleted ? 'bg-green-50' : ''}`}>
                                            <td className="px-4 py-2 text-center">
                                                <div className={`w-4 h-4 border border-gray-400 mx-auto ${item.isCompleted ? 'bg-green-500 border-green-500' : ''}`}>
                                                    {item.isCompleted && <span className="text-white text-xs">✓</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className={`${item.isCompleted ? 'line-through text-green-700' : 'text-gray-900'}`}>
                                                    {item.description}
                                                </div>
                                                {item.suppliedByClient && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                                        Cliente Suministra
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center text-gray-700">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                                            <td className="px-4 py-2 text-right text-gray-700">{item.discount || 0}%</td>
                                            <td className="px-4 py-2 text-right font-semibold text-gray-900">
                                                {formatCurrency((item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals & Notes */}
                    <div className="mt-6 flex justify-between items-start page-break-inside-avoid">
                        <div className="w-1/2 text-xs text-gray-700">
                             <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Notas:</h4>
                             <p className="italic">{(workOrder as any).notes || 'No se añadieron notas adicionales.'}</p>
                        </div>
                        <div className="w-1/3 space-y-2 text-sm">
                             <div className="flex justify-between items-center">
                                <span>Subtotal:</span>
                                <span className="font-semibold">{formatCurrency(quote.subtotal)}</span>
                             </div>
                             
                             <div className="flex justify-between items-center">
                                <span>IVA:</span>
                                <span className="font-semibold">{formatCurrency(quote.taxAmount)}</span>
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

export default PrintableRepairReport;
