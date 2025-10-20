import React from 'react';
import { WorkOrder, Client, Vehicle, CompanyInfo, UnforeseenIssue } from '../types';
import { formatDate } from '../utils/format';

interface PrintableUnforeseenIssueReportProps {
    workOrder: WorkOrder;
    client: Client;
    vehicle: Vehicle;
    companyInfo: CompanyInfo | null;
    issue: UnforeseenIssue;
}

const PrintableUnforeseenIssueReport: React.FC<PrintableUnforeseenIssueReportProps> = ({
    workOrder,
    client,
    vehicle,
    companyInfo,
    issue,
}) => {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return '#10B981'; // green
            case 'medium': return '#F59E0B'; // yellow
            case 'high': return '#F97316'; // orange
            case 'urgent': return '#EF4444'; // red
            default: return '#6B7280'; // gray
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'low': return 'Baja';
            case 'medium': return 'Media';
            case 'high': return 'Alta';
            case 'urgent': return 'Urgente';
            default: return 'Media';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // use shared formatDate which accepts string | Date

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
                        <h1 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>REPORTE DE IMPREVISTO</h1>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Orden de Trabajo: <span style={{ fontWeight: 'bold' }}>{workOrder.id}</span></p>
                        <p style={{ margin: '0', fontSize: '14px' }}>Fecha: <span style={{ fontWeight: 'bold' }}>{formatDate(issue.timestamp)}</span></p>
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

                {/* Issue Details */}
                <div className="mt-6 space-y-4">
                    <div className="border border-gray-300 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-3">Detalles del Imprevisto</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-gray-600">Prioridad:</span>
                                <span 
                                    className="ml-2 px-2 py-1 rounded text-white text-xs font-bold"
                                    style={{ backgroundColor: getPriorityColor(issue.priority) }}
                                >
                                    {getPriorityLabel(issue.priority)}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Estado:</span>
                                <span className="ml-2 text-gray-800">
                                    {issue.status === 'pending' ? 'Pendiente' : 
                                     issue.status === 'approved' ? 'Aprobado' :
                                     issue.status === 'rejected' ? 'Rechazado' : 'Resuelto'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="font-semibold text-gray-600">Descripción:</span>
                            <p className="text-sm text-gray-800 mt-1 p-3 bg-gray-50 rounded">
                                {issue.description}
                            </p>
                        </div>
                        {issue.notes && (
                            <div className="mt-3">
                                <span className="font-semibold text-gray-600">Notas Adicionales:</span>
                                <p className="text-sm text-gray-800 mt-1 p-3 bg-gray-50 rounded">
                                    {issue.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Required Services */}
                    {issue.requiredServices && issue.requiredServices.length > 0 && (
                        <div className="border border-gray-300 rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-3">Servicios Requeridos</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left p-2 border-b">Servicio</th>
                                            <th className="text-center p-2 border-b">Cantidad</th>
                                            <th className="text-right p-2 border-b">Precio Unit.</th>
                                            <th className="text-right p-2 border-b">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issue.requiredServices.map((service, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="p-2">
                                                    <div>
                                                        <p className="font-medium">{service.serviceName}</p>
                                                        {service.notes && (
                                                            <p className="text-xs text-gray-600 italic">{service.notes}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2 text-center">{service.quantity}</td>
                                                <td className="p-2 text-right">{formatCurrency(service.estimatedPrice)}</td>
                                                <td className="p-2 text-right font-semibold">
                                                    {formatCurrency(service.quantity * service.estimatedPrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Required Parts */}
                    {issue.requiredParts && issue.requiredParts.length > 0 && (
                        <div className="border border-gray-300 rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-3">Repuestos Requeridos</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left p-2 border-b">Repuesto</th>
                                            <th className="text-center p-2 border-b">Cantidad</th>
                                            <th className="text-right p-2 border-b">Precio Unit.</th>
                                            <th className="text-right p-2 border-b">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issue.requiredParts.map((part, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="p-2">
                                                    <div>
                                                        <p className="font-medium">{part.partName}</p>
                                                        {part.notes && (
                                                            <p className="text-xs text-gray-600 italic">{part.notes}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2 text-center">{part.quantity}</td>
                                                <td className="p-2 text-right">{formatCurrency(part.estimatedPrice)}</td>
                                                <td className="p-2 text-right font-semibold">
                                                    {formatCurrency(part.quantity * part.estimatedPrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Cost Summary */}
                    {(issue.requiredServices?.length > 0 || issue.requiredParts?.length > 0) && (
                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <h3 className="font-bold text-lg mb-3">Resumen de Costos</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-600">Servicios:</span>
                                    <span className="ml-2">
                                        {formatCurrency(
                                            issue.requiredServices?.reduce((total, s) => total + (s.quantity * s.estimatedPrice), 0) || 0,
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Repuestos:</span>
                                    <span className="ml-2">
                                        {formatCurrency(
                                            issue.requiredParts?.reduce((total, p) => total + (p.quantity * p.estimatedPrice), 0) || 0,
                                        )}
                                    </span>
                                </div>
                                <div className="col-span-2 border-t border-gray-300 pt-2">
                                    <span className="font-bold text-lg text-gray-800">Total Estimado:</span>
                                    <span className="ml-2 font-bold text-lg text-blue-600">
                                        {formatCurrency(issue.estimatedCost || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Images */}
                    {issue.imageUrls && issue.imageUrls.length > 0 && (
                        <div className="border border-gray-300 rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-3">Evidencia Fotográfica</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {issue.imageUrls.map((url, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={url}
                                            alt={`Evidencia ${index + 1}`}
                                            className="w-full h-32 object-cover rounded border"
                                        />
                                        <p className="text-xs text-gray-600 mt-1 text-center">Foto {index + 1}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Signatures */}
                <div className="mt-20 grid grid-cols-2 gap-x-12 pt-8">
                    <div className="border-t border-black pt-2 text-center">
                        <p className="text-sm font-semibold">Firma del Mecánico</p>
                        <p className="text-xs text-gray-600">Reportado por</p>
                    </div>
                    <div className="border-t border-black pt-2 text-center">
                        <p className="text-sm font-semibold">Firma del Asesor de Servicio</p>
                        <p className="text-xs text-gray-600">Revisado por</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintableUnforeseenIssueReport;
