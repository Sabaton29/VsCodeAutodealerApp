import React from 'react';
import { Icon } from './Icon';
import { WorkOrder, Client, Vehicle, CompanyInfo } from '../types';
import FuelGauge from './FuelGauge';
import VehicleDiagram from './VehicleDiagram';

interface PrintableReceptionReportProps {
    workOrder: WorkOrder;
    client: Client;
    vehicle: Vehicle;
    companyInfo: CompanyInfo | null;
}

const PrintableReceptionReport: React.FC<PrintableReceptionReportProps> = ({ workOrder, client, vehicle, companyInfo }) => {
    
    
    const InfoField = ({ label, value }: { label: string, value?: string | number }) => (
        <div className="mb-2">
            <span className="text-xs font-semibold text-gray-600 block">{label}</span>
            <p className="text-sm text-black dark:text-white break-words">{value || 'N/A'}</p>
        </div>
    );

    const CheckItem = ({ label, checked }: { label: string, checked?: boolean }) => (
        <div className="flex items-center">
            <div className={`w-3 h-3 border border-black mr-2 ${checked ? 'bg-black dark:bg-gray-900' : ''}`}></div>
            <span className="text-xs">{label}</span>
        </div>
    );

    return (
        <>
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background-color: #fff !important;
                    }
                     .page-break-inside-avoid {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
            <div className="bg-gray-200 min-h-screen">
                 <div className="no-print p-4 bg-dark-light text-white flex justify-between items-center shadow-lg sticky top-0 z-10">
                    <h2 className="font-bold">Vista Previa de Impresión - Reporte de Recepción</h2>
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
                            <h1 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>Reporte de Recepción</h1>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Orden de Servicio: <span style={{ fontWeight: 'bold' }}>{workOrder.id}</span></p>
                            <p style={{ margin: '0', fontSize: '14px' }}>Fecha: <span style={{ fontWeight: 'bold' }}>{new Date(workOrder.createdAt).toLocaleDateString('es-CO')}</span></p>
                        </div>
                    </div>
                    <hr style={{ border: '1px solid #000', margin: '15px 0' }} />

                    {/* Compact Info Section */}
                    <div className="mt-4 border-b border-black pb-4">
                        <div className="grid grid-cols-3 gap-x-6">
                            <div>
                                <h3 className="font-bold text-base mb-2">Datos del Cliente</h3>
                                <InfoField label="Nombre" value={client.name} />
                                <InfoField label="Identificación" value={`${client.idType} ${client.idNumber}`} />
                                <InfoField label="Teléfono" value={client.phone} />
                                <InfoField label="Email" value={client.email} />
                            </div>
                            <div>
                                <h3 className="font-bold text-base mb-2">Datos del Vehículo</h3>
                                <InfoField label="Marca/Modelo" value={`${vehicle.make} ${vehicle.model}`} />
                                <InfoField label="Placa" value={vehicle.plate} />
                                <InfoField label="Año" value={vehicle.year} />
                                <InfoField label="Kilometraje" value={workOrder.mileage} />
                            </div>
                            <div>
                                <h3 className="font-bold text-base mb-2">Detalles de Ingreso</h3>
                                <InfoField label="Motivo de Ingreso" value={workOrder.serviceRequested} />
                                <InfoField label="Objetos de valor reportados" value={workOrder.reportedValuables} />
                                {workOrder.comments && (
                                    <InfoField label="Comentarios y Evidencias" value={workOrder.comments} />
                                )}
                                <div className="text-black dark:text-white mt-2">
                                    <span className="text-xs font-semibold text-gray-600 block">Nivel de Combustible:</span>
                                    <div className="w-24 h-16 -ml-2 -mt-2">
                                        <FuelGauge level={workOrder.fuelLevel || 'N/A'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Compact Inspection Section */}
                     <div className="mt-4 border-b border-black pb-4 page-break-inside-avoid">
                         <h3 className="font-bold text-lg mb-2">Inspección de Estado y Daños</h3>
                         <div className="grid grid-cols-2 gap-x-8">
                            {/* Inventory Checklist */}
                            <div>
                                <h4 className="font-semibold mb-2">Inventario de Ingreso</h4>
                                <div className="space-y-1 text-sm">
                                    <CheckItem label="Llanta de repuesto" checked={(workOrder.inventoryChecklist as any)?.spare_tire} />
                                    <CheckItem label="Kit de carretera" checked={(workOrder.inventoryChecklist as any)?.jack_kit} />
                                    <CheckItem label="Herramientas" checked={(workOrder.inventoryChecklist as any)?.tools} />
                                    <CheckItem label="Extintor" checked={(workOrder.inventoryChecklist as any)?.fire_extinguisher} />
                                    <CheckItem label="Botiquín" checked={(workOrder.inventoryChecklist as any)?.first_aid_kit} />
                                    <div>
                                        <CheckItem label="Otros" checked={(workOrder.inventoryChecklist as any)?.other} />
                                        {(workOrder.inventoryChecklist as any)?.other && workOrder.inventoryOtherText && (
                                            <div className="ml-5 mt-1 text-xs text-gray-600">
                                                <strong>Especificación:</strong> {workOrder.inventoryOtherText}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Damages */}
                            <div>
                                <h4 className="font-semibold mb-2">Diagrama de Daños</h4>
                                {workOrder.damageLocations && (
                                    <div className="mx-auto" style={{ maxWidth: '300px' }}>
                                        <VehicleDiagram damageLocations={workOrder.damageLocations} readOnly={true} />
                                    </div>
                                )}
                                <div className="mt-2">
                                    <InfoField label="Descripción de otros daños" value={workOrder.otherDamages} />
                                </div>
                            </div>
                         </div>
                    </div>


                    {workOrder.entryEvidenceImageUrls && workOrder.entryEvidenceImageUrls.length > 0 && (
                        <div className="mt-4 page-break-inside-avoid">
                            <h3 className="font-bold text-lg mb-2">Evidencia Fotográfica de Ingreso</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {workOrder.entryEvidenceImageUrls.map((url, index) => (
                                    <img key={index} src={url} alt={`Evidencia ${index + 1}`} className="w-full h-auto border border-gray-300" />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Signatures */}
                    <div className="mt-16 grid grid-cols-2 gap-x-12 pt-8">
                         <div className="border-t border-black pt-2 text-center">
                            <p className="text-sm font-semibold">Firma del Cliente</p>
                            <p className="text-xs text-gray-600">He leído y acepto el estado de recepción del vehículo.</p>
                         </div>
                         <div className="border-t border-black pt-2 text-center">
                            <p className="text-sm font-semibold">Firma Asesor de Servicio</p>
                            <p className="text-xs text-gray-600">Autodealer Taller</p>
                         </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintableReceptionReport;