import React, { useMemo } from 'react';
import { Icon } from './Icon';
import { WorkOrder, Client, Vehicle, ChecklistStatus, CompanyInfo, DiagnosticType } from '../types';
import { DIAGNOSTIC_CHECKLIST_SECTIONS, DIAGNOSTIC_LEVELS } from '../constants';

interface PrintableDiagnosticReportProps {
    workOrder: WorkOrder;
    client: Client;
    vehicle: Vehicle;
    companyInfo: CompanyInfo | null;
}

const PrintableDiagnosticReport: React.FC<PrintableDiagnosticReportProps> = ({ workOrder, client, vehicle, companyInfo }) => {
    // Función para convertir nombres técnicos a amigables
    const getFriendlyName = (technicalName: string): string => {
        const friendlyNames: { [key: string]: string } = {
            '_niveles de _fluidos - fluidos': 'Niveles de Fluidos',
            '_líquido_dirección (nivel)': 'Líquido de Dirección',
            '_refrigerante (nivel y color)': 'Refrigerante',
            '_aceite_motor (nivel y color)': 'Aceite del Motor',
            '_líquido de_frenos (nivel y color)': 'Líquido de Frenos',
            '_filtro_aire': 'Filtro de Aire',
            '_filtro_combustible': 'Filtro de Combustible',
            '_filtro_aceite': 'Filtro de Aceite',
            '_bujías': 'Bujías',
            '_correa_distribución': 'Correa de Distribución',
            '_correa_servicios': 'Correa de Servicios',
            '_pastillas_frenos': 'Pastillas de Frenos',
            '_discos_frenos': 'Discos de Frenos',
            '_amortiguadores': 'Amortiguadores',
            '_neumáticos': 'Neumáticos',
            '_luces': 'Sistema de Luces',
            '_batería': 'Batería',
            '_alternador': 'Alternador',
            '_motor_arranque': 'Motor de Arranque',
        };
        
        return friendlyNames[technicalName] || technicalName.replace(/_/g, ' ').replace(/\(/g, '').replace(/\)/g, '');
    };
    
    const InfoField = ({ label, value }: { label: string, value?: string | number }) => (
        <div>
            <span className="text-xs font-semibold text-gray-600">{label}:</span>
            <p className="text-sm text-black dark:text-white">{value || 'N/A'}</p>
        </div>
    );
    
    const diagnosticData = workOrder.diagnosticData;
    if (!diagnosticData) {
        return <div className="p-8 bg-white text-black dark:text-white">No hay datos de diagnóstico para esta orden.</div>;
    }

    // Use the actual diagnostic data instead of predefined sections
    // Filter out sections that are disabled (isEnabled: false)
    const sectionsToRender = useMemo(() => {
        return Object.entries(diagnosticData)
            .filter(([sectionTitle, sectionData]) => {
                // Only include sections that are enabled (isEnabled !== false)
                return (sectionData as any).isEnabled !== false;
            })
            .map(([sectionTitle, sectionData]) => ({
                title: sectionTitle,
                data: sectionData,
            }));
    }, [diagnosticData]);

    const tableHeader = (
        <thead className="text-[10px] uppercase bg-gray-200">
            <tr>
                <th className="p-1 border border-gray-300 w-[40%]">Elemento</th>
                <th className="p-1 border border-gray-300 text-center">OK</th>
                <th className="p-1 border border-gray-300 text-center">Mal</th>
                <th className="p-1 border border-gray-300 text-center">Mant.</th>
                <th className="p-1 border border-gray-300 text-center">Camb.</th>
                <th className="p-1 border border-gray-300 text-center">N/A</th>
            </tr>
        </thead>
    );
    
    const renderChecklistRow = (status: ChecklistStatus) => {
        return (
            <>
                <td className="p-1 border border-gray-300 text-center">{status === ChecklistStatus.OK ? 'X' : ''}</td>
                <td className="p-1 border border-gray-300 text-center">{status === ChecklistStatus.MAL ? 'X' : ''}</td>
                <td className="p-1 border border-gray-300 text-center">{status === ChecklistStatus.MANTEN ? 'X' : ''}</td>
                <td className="p-1 border border-gray-300 text-center">{status === ChecklistStatus.CAMBIO ? 'X' : ''}</td>
                <td className="p-1 border border-gray-300 text-center">{status === ChecklistStatus.NA ? 'X' : ''}</td>
            </>
        );
    };

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
                    .page-break {
                        page-break-before: always;
                    }
                }
            `}</style>
            <div className="bg-gray-200 min-h-screen">
                <div className="no-print p-4 bg-dark-light text-white flex justify-between items-center shadow-lg sticky top-0 z-10">
                    <h2 className="font-bold">Vista Previa de Impresión - Diagnóstico Técnico</h2>
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
                                    e.currentTarget.src = '/images/company/logo.png';
                                }} 
                            />
                            <Icon name="logo-car" className="hidden" />
                        </div>
                        
                        {/* Sección derecha: Título y detalles */}
                        <div style={{ flex: 1, textAlign: 'right', maxWidth: '50%' }}>
                            <h1 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>Reporte de Diagnóstico Técnico</h1>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Orden de Servicio: <span style={{ fontWeight: 'bold' }}>{workOrder.id}</span></p>
                            <p style={{ margin: '0', fontSize: '14px' }}>Fecha: <span style={{ fontWeight: 'bold' }}>{new Date(workOrder.createdAt).toLocaleDateString('es-CO')}</span></p>
                        </div>
                    </div>
                    <hr style={{ border: '1px solid #000', margin: '15px 0' }} />

                    {/* Client & Vehicle Info */}
                    <div className="grid grid-cols-2 gap-x-8 mt-6 border-b border-black pb-4">
                        <div>
                            <h3 className="font-bold text-lg mb-2">Datos del Cliente</h3>
                            <InfoField label="Nombre" value={client.name} />
                            <InfoField label="Identificación" value={`${client.idType} ${client.idNumber}`} />
                            <InfoField label="Teléfono" value={client.phone} />
                            <InfoField label="Email" value={client.email} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">Datos del Vehículo</h3>
                            <InfoField label="Marca/Modelo" value={`${vehicle.make} ${vehicle.model}`} />
                            <InfoField label="Placa" value={vehicle.plate} />
                            <InfoField label="Año" value={vehicle.year} />
                            <InfoField label="Kilometraje" value={workOrder.mileage} />
                        </div>
                    </div>

                    {/* Checklist Sections */}
                    <div className="mt-6 space-y-4 text-[10px]">
                        {sectionsToRender.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-lg font-semibold">No hay secciones habilitadas para este diagnóstico</p>
                                <p className="text-sm mt-2">Las secciones deshabilitadas no aparecen en el reporte final</p>
                            </div>
                        ) : (
                            sectionsToRender.map(section => (
                            <div key={section.title} className="break-inside-avoid">
                                <h3 className="font-bold text-sm mb-1 bg-gray-200 p-1">{getFriendlyName(section.title)}</h3>
                                <table className="w-full border-collapse">
                                    {tableHeader}
                                    <tbody>
                                        {/* Show items if they exist */}
                                        {section.data.items && Object.entries(section.data.items).map(([item, status]) => (
                                            <tr key={item}>
                                                <td className="p-1 border border-gray-300 font-medium">{getFriendlyName(item)}</td>
                                                {renderChecklistRow(status as ChecklistStatus)}
                                            </tr>
                                        ))}
                                        {/* Show components if they exist */}
                                        {section.data.components && Object.entries(section.data.components).map(([component, status]) => (
                                            <tr key={component}>
                                                <td className="p-1 border border-gray-300 font-medium">{getFriendlyName(component)}</td>
                                                {renderChecklistRow(status as ChecklistStatus)}
                                            </tr>
                                        ))}
                                        {/* Show custom items if they exist */}
                                        {section.data.customItems?.map(customItem => (
                                            <tr key={customItem.id}>
                                                <td className="p-1 border border-gray-300 font-medium italic">+ {customItem.name}</td>
                                                {renderChecklistRow(customItem.status)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {/* Observations and Images */}
                                {(section.data.observations || (section.data as any).imageUrls?.length > 0) && (
                                    <div className="mt-2 border border-gray-300 p-1">
                                        {section.data.observations && (
                                            <>
                                                <p className="font-bold mt-1">Observaciones:</p>
                                                <p className="text-xs italic">{section.data.observations}</p>
                                            </>
                                        )}
                                        {(section.data as any).imageUrls && (section.data as any).imageUrls.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-bold">Evidencia Fotográfica:</p>
                                                <div className="grid grid-cols-4 gap-2 mt-1">
                                                    {(section.data as any).imageUrls.map((imgSrc, index) => (
                                                        <img key={index} src={imgSrc} alt={`Evidencia ${section.title} ${index + 1}`} className="w-full h-auto border border-gray-300"/>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                        )}
                    </div>

                     {/* Signatures */}
                    <div className="mt-20 grid grid-cols-2 gap-x-12 pt-8">
                         <div className="border-t border-black pt-2 text-center">
                            <p className="text-sm font-semibold">Firma del Técnico</p>
                            <p className="text-xs text-gray-600">Autodealer Taller</p>
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

export default PrintableDiagnosticReport;