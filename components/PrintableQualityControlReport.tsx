import React from 'react';
import { WorkOrder, Client, Vehicle, CompanyInfo } from '../types';

interface PrintableQualityControlReportProps {
    workOrder: WorkOrder;
    client: Client;
    vehicle: Vehicle;
    companyInfo: CompanyInfo | null;
    qualityChecks: Array<{
        id: string;
        description: string;
        category: string;
        isChecked: boolean;
        notes?: string;
        status?: 'ok' | 'no-ok' | 'na' | 'unset';
    }>;
    overallNotes: string;
    isApproved: boolean;
    inspectorName?: string;
    inspectionDate: string;
}

const PrintableQualityControlReport: React.FC<PrintableQualityControlReportProps> = ({
    workOrder,
    client,
    vehicle,
    companyInfo,
    qualityChecks,
    overallNotes,
    isApproved,
    inspectorName,
    inspectionDate
}) => {
    const getCategoryTitle = (category: string) => {
        switch (category) {
            case 'exterior': return 'Exterior del vehículo limpio';
            case 'funcionalidad': return 'Funcionamiento y Pruebas';
            case 'verificacion': return 'Verificación de Tareas';
            case 'documentacion': return 'Documentación y Entrega';
            default: return 'General';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'exterior': return '🚗';
            case 'funcionalidad': return '⚙️';
            case 'verificacion': return '✅';
            case 'documentacion': return '📋';
            default: return '✓';
        }
    };

    const categories = ['exterior', 'funcionalidad', 'verificacion', 'documentacion'];
    // Contar elementos que tienen una respuesta (OK, NO OK, o N/A)
    const completedChecks = qualityChecks.filter(item => 
        item.status === 'ok' || item.status === 'no-ok' || item.status === 'na'
    ).length;
    const totalChecks = qualityChecks.length;

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
            <div className="bg-white text-black p-8 font-sans shadow-lg mx-auto my-8" style={{ fontFamily: 'sans-serif', width: '210mm', minHeight: '297mm' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
                    <div style={{ flex: 1, textAlign: 'left', maxWidth: '50%' }}>
                        <img 
                            src={companyInfo?.logoUrl || '/images/company/logo.png'} 
                            alt="AUTO DEALER" 
                            style={{ height: '150px', width: 'auto', display: 'block', maxWidth: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                                e.currentTarget.src = '/images/company/logo.png';
                            }}
                        />
                    </div>
                    
                    <div style={{ flex: 1, textAlign: 'right', maxWidth: '50%' }}>
                        <h1 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>REPORTE DE CONTROL DE CALIDAD</h1>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Orden de Trabajo: <span style={{ fontWeight: 'bold' }}>{workOrder.id}</span></p>
                        <p style={{ margin: '0', fontSize: '14px' }}>Fecha: <span style={{ fontWeight: 'bold' }}>{new Date().toLocaleDateString('es-CO')}</span></p>
                    </div>
                </div>
                <hr style={{ border: '1px solid #000', margin: '15px 0' }} />

                {/* Client & Vehicle Info */}
                <div className="grid grid-cols-2 gap-x-8 mt-6 border-b border-black pb-4">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Datos del Cliente</h3>
                        <div>
                            <span className="text-xs font-semibold text-gray-600">Nombre:</span>
                            <p className="text-sm text-black">{client?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-600">Identificación:</span>
                            <p className="text-sm text-black">{client ? `${client.idType || ''} ${client.idNumber || ''}`.trim() : 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-600">Teléfono:</span>
                            <p className="text-sm text-black">{client?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-600">Email:</span>
                            <p className="text-sm text-black">{client?.email || 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Datos del Vehículo</h3>
                        <div>
                            <span className="text-xs font-semibold text-gray-600">Marca/Modelo:</span>
                            <p className="text-sm text-black">{vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim() : 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-600">Placa:</span>
                            <p className="text-sm text-black">{vehicle?.plate || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-600">Año:</span>
                            <p className="text-sm text-black">{vehicle?.year || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-600">Kilometraje:</span>
                            <p className="text-sm text-black">{workOrder.mileage || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Resumen de Verificación */}
                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-3">Resumen de Verificación</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold">Verificaciones Completadas:</span>
                            <span className="ml-2">{completedChecks}/{totalChecks}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Porcentaje de Completitud:</span>
                            <span className="ml-2">{((completedChecks / totalChecks) * 100).toFixed(0)}%</span>
                        </div>
                        <div>
                            <span className="font-semibold">Inspector:</span>
                            <span className="ml-2">{inspectorName || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Fecha de Inspección:</span>
                            <span className="ml-2">{inspectionDate}</span>
                        </div>
                    </div>
                </div>

                {/* Verificaciones por Categoría */}
                <div className="mt-6 space-y-4">
                    {categories.map(category => {
                        const categoryItems = qualityChecks.filter(item => item.category === category);
                        const completedInCategory = categoryItems.filter(item => 
                            item.status === 'ok' || item.status === 'no-ok' || item.status === 'na'
                        ).length;
                        
                        const getStatusIcon = (status?: string) => {
                            switch (status) {
                                case 'ok': return '✅';
                                case 'no-ok': return '❌';
                                case 'na': return '➖';
                                case 'unset': return '❓';
                                default: return '❓';
                            }
                        };

                        const getStatusText = (status?: string) => {
                            switch (status) {
                                case 'ok': return 'OK';
                                case 'no-ok': return 'NO OK';
                                case 'na': return 'N/A';
                                case 'unset': return 'Sin evaluar';
                                default: return 'Sin evaluar';
                            }
                        };
                        
                        return (
                            <div key={category} className="border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <span className="text-2xl mr-3">{getCategoryIcon(category)}</span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {getCategoryTitle(category)}
                                    </h3>
                                    <span className="ml-auto text-sm text-gray-600">
                                        {completedInCategory}/{categoryItems.length}
                                    </span>
                                </div>
                                
                                <div className="space-y-2">
                                    {categoryItems.map(item => (
                                        <div key={item.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                                            <span className="text-lg">
                                                {getStatusIcon(item.status)}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.description}
                                                    </p>
                                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-200 text-gray-700">
                                                        {getStatusText(item.status)}
                                                    </span>
                                                </div>
                                                {item.notes && (
                                                    <p className="text-xs text-gray-600 mt-1 italic">
                                                        Notas: {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Notas Generales */}
                <div className="mt-6 border border-gray-300 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-3">Notas Generales del Control de Calidad</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{overallNotes || 'No se agregaron notas adicionales.'}</p>
                </div>

                {/* Resultado Final */}
                <div className="mt-6 border-2 border-gray-400 rounded-lg p-4">
                    <div className="text-center">
                        <h3 className="font-bold text-xl mb-2">RESULTADO FINAL</h3>
                        <div className={`inline-block px-6 py-3 rounded-lg text-white font-bold text-lg ${
                            isApproved ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                            {isApproved ? '✅ APROBADO' : '❌ RECHAZADO'}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {isApproved 
                                ? 'El vehículo cumple con todos los estándares de calidad y está listo para entrega.'
                                : 'El vehículo requiere trabajo adicional antes de la entrega.'
                            }
                        </p>
                    </div>
                </div>

                {/* Signatures */}
                <div className="mt-20 grid grid-cols-2 gap-x-12 pt-8">
                    <div className="border-t border-black pt-2 text-center">
                        <p className="text-sm font-semibold">Firma del Inspector de Calidad</p>
                        <p className="text-xs text-gray-600">{inspectorName || 'Autodealer Taller'}</p>
                    </div>
                    <div className="border-t border-black pt-2 text-center">
                        <p className="text-sm font-semibold">Firma del Jefe de Taller</p>
                        <p className="text-xs text-gray-600">Autodealer Taller</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintableQualityControlReport;
