import React, { useMemo, useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server.browser';
import { Icon } from '../Icon';
import { WorkOrder, Client, Vehicle, ChecklistStatus, Permission, DiagnosticData, Quote, QuoteStatus, KanbanStage, Supplier, AppSettings, CompanyInfo, StaffMember, DiagnosticType, UnforeseenIssue } from '../../types';
import PrintableDiagnosticReport from '../PrintableDiagnosticReport';
import PrintableReceptionReport from '../PrintableReceptionReport';
import PrintableQualityControlReport from '../PrintableQualityControlReport';
import { DIAGNOSTIC_CHECKLIST_SECTIONS, QUOTE_STATUS_DISPLAY_CONFIG } from '../../constants';
import FuelGauge from '../FuelGauge';
import VehicleDiagram from '../VehicleDiagram';
import ProgressTracker from '../ProgressTracker';
import QualityControlView from '../QualityControlView';
import ImageGallery from '../ImageGallery';
import { getQuoteDisplayId } from '../../utils/quoteId';

interface WorkOrderDetailViewProps {
    workOrder: WorkOrder;
    quotes: Quote[];
    onBack: () => void;
    client?: Client;
    vehicle?: Vehicle;
    stageConfig: { text: string; bg: string };
    hasPermission: (permission: Permission) => boolean;
    onCreateQuote: (workOrder: WorkOrder, isAdditional: boolean) => void;
    onShareWithClient: () => void;
    onCreateInvoiceFromWorkOrder: (workOrderId: string) => void;
    onViewQuote: (quoteId: string) => void;
    onEditQuote: (quote: Quote) => void;
    onRegisterCosts: (workOrderId: string, costs: { itemId: string; costPrice: number; supplierId: string }[]) => void;
    suppliers: Supplier[];
    appSettings: AppSettings | null;
    onReportUnforeseenIssue: () => void;
    staffMembers: StaffMember[];
    onUpdateDiagnosticType: (workOrderId: string, newType: DiagnosticType) => void;
    onStartDiagnostic: (workOrderId: string) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <li><strong className="text-gray-400">{label}:</strong> {value || 'N/A'}</li>
);

const CheckItem: React.FC<{ label: string; checked?: boolean }> = ({ label, checked }) => (
    <div className="flex items-center text-sm">
        <Icon name={checked ? "check-circle" : "x-circle"} className={`w-4 h-4 mr-2 ${checked ? 'text-green-400' : 'text-red-400'}`} />
        <span>{label}</span>
    </div>
);


const DiagnosticDetailSection: React.FC<{ diagnosticData: DiagnosticData }> = ({ diagnosticData }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const tableHeader = (
        <thead className="text-xs uppercase text-gray-400 bg-black dark:bg-gray-900/20">
            <tr>
                <th className="p-2 w-[40%] text-left">Elemento</th>
                <th className="p-2 text-center">OK</th><th className="p-2 text-center">Mal</th>
                <th className="p-2 text-center">Mant.</th><th className="p-2 text-center">Camb.</th>
                <th className="p-2 text-center">N/A</th>
            </tr>
        </thead>
    );

    const renderChecklistRow = (status: ChecklistStatus) => (
        <>
            <td className="p-2 text-center">{status === ChecklistStatus.OK ? '✔' : ''}</td>
            <td className="p-2 text-center">{status === ChecklistStatus.MAL ? '✔' : ''}</td>
            <td className="p-2 text-center">{status === ChecklistStatus.MANTEN ? '✔' : ''}</td>
            <td className="p-2 text-center">{status === ChecklistStatus.CAMBIO ? '✔' : ''}</td>
            <td className="p-2 text-center">{status === ChecklistStatus.NA ? '✔' : ''}</td>
        </>
    );

    return (
        <div className="bg-dark-light rounded-xl">
             <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-5 text-left">
                <h2 className="text-xl font-bold text-white">Diagnóstico Técnico Detallado</h2>
                <Icon name="chevron-down" className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-5 pt-0 space-y-6">
                    {/* Resumen de secciones */}
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-semibold text-white mb-3">Resumen del Alcance del Diagnóstico</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(diagnosticData).map(([sectionTitle, sectionData]) => {
                                const isSectionEnabled = (sectionData as any).isEnabled !== false;
                                return (
                                    <div key={sectionTitle} className="flex items-center gap-2 text-sm">
                                        {isSectionEnabled ? (
                                            <Icon name="check-circle" className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Icon name="x-circle" className="w-4 h-4 text-red-400" />
                                        )}
                                        <span className={isSectionEnabled ? 'text-green-300' : 'text-red-300 line-through'}>
                                            {sectionTitle}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            ({isSectionEnabled ? 'Revisado' : 'No revisado'})
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Detalles de secciones */}
                    {(() => {
                        const enabledSections = Object.entries(diagnosticData).filter(([_, sectionData]) => 
                            (sectionData as any).isEnabled !== false,
                        );
                        
                        if (enabledSections.length === 0) {
                            return (
                                <div className="text-center py-8 text-gray-400">
                                    <Icon name="exclamation-triangle" className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                                    <p className="text-lg font-semibold mb-2">No hay secciones revisadas en este diagnóstico</p>
                                    <p className="text-sm">Todas las secciones fueron excluidas del alcance del servicio</p>
                                </div>
                            );
                        }
                        
                        return Object.entries(diagnosticData).map(([sectionTitle, sectionData]) => {
                            const typedSectionData = sectionData as any;
                            const sectionImages = typedSectionData?.imageUrls || [];
                            const isSectionEnabled = typedSectionData?.isEnabled !== false;

                            return (
                                <div key={sectionTitle} className={!isSectionEnabled ? 'opacity-60' : ''}>
                                <div className="flex items-center justify-between mb-2 p-2 bg-black dark:bg-gray-900/30 rounded-t-md">
                                    <h3 className="text-lg font-semibold text-white">{sectionTitle}</h3>
                                    {!isSectionEnabled && (
                                        <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-600/30">
                                            No Revisado
                                        </span>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-300">
                                        {tableHeader}
                                        <tbody>
                                            {/* Show items if they exist */}
                                            {typedSectionData.items && Object.entries(typedSectionData.items).map(([item, status]) => (
                                                <tr key={item} className="border-b border-gray-700">
                                                    <td className="p-2 font-medium">{item}</td>
                                                    {renderChecklistRow(status as ChecklistStatus)}
                                                </tr>
                                            ))}
                                            {/* Show components if they exist */}
                                            {typedSectionData.components && Object.entries(typedSectionData.components).map(([component, status]) => (
                                                <tr key={component} className="border-b border-gray-700">
                                                    <td className="p-2 font-medium">{component}</td>
                                                    {renderChecklistRow(status as ChecklistStatus)}
                                                </tr>
                                            ))}
                                            {/* Show custom items if they exist */}
                                            {typedSectionData.customItems?.map(customItem => (
                                                <tr key={customItem.id} className="border-b border-gray-700">
                                                    <td className="p-2 font-medium">{customItem.name}</td>
                                                    {renderChecklistRow(customItem.status)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {(typedSectionData?.observations || sectionImages.length > 0) && (
                                    <div className="mt-2 border border-gray-700 bg-black dark:bg-gray-900/20 p-2 rounded-b-md">
                                        {typedSectionData.observations && (
                                            <>
                                                <p className="font-bold text-xs">Observaciones:</p>
                                                <p className="text-xs italic">{typedSectionData.observations}</p>
                                            </>
                                        )}
                                        {sectionImages.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-bold text-xs">Evidencia Fotográfica:</p>
                                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-1">
                                                    {sectionImages.map((url, index) => (
                                                        <img key={index} src={url} alt={`Evidencia ${index + 1}`} className="w-full h-20 object-cover rounded"/>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    });
                    })()}
                </div>
            )}
        </div>
    );
};

const CostManagementSection: React.FC<{
    quote: Quote;
    suppliers: Supplier[];
    onSave: (costs: { itemId: string; costPrice: number; supplierId: string }[]) => void;
}> = ({ quote, suppliers, onSave }) => {
    const [costs, setCosts] = useState<Record<string, { costPrice: string; supplierId: string }>>({});

    const inventoryItems = useMemo(() => quote.items.filter(item => item.type === 'inventory'), [quote.items]);
    
    useEffect(() => {
        const initialCosts: Record<string, { costPrice: string; supplierId: string }> = {};
        inventoryItems.forEach(item => {
            initialCosts[item.id] = {
                costPrice: item.costPrice?.toString() || '',
                supplierId: item.supplierId || '',
            };
        });
        setCosts(initialCosts);
    }, [inventoryItems]);


    const handleCostChange = (itemId: string, value: string) => {
        setCosts(prev => ({ ...prev, [itemId]: { ...prev[itemId], costPrice: value } }));
    };

    const handleSupplierChange = (itemId: string, value: string) => {
        setCosts(prev => ({ ...prev, [itemId]: { ...prev[itemId], supplierId: value } }));
    };

    const handleSaveCosts = () => {
        console.log('🔍 CostManagementSection - handleSaveCosts called');
        console.log('🔍 CostManagementSection - costs state:', costs);
        
        const costsToSave = Object.entries(costs)
            .filter(([_, value]) => value.costPrice && parseFloat(value.costPrice) > 0)
            .map(([itemId, value]) => ({
                itemId,
                costPrice: parseFloat(value.costPrice),
                supplierId: value.supplierId,
            }));
        
        console.log('🔍 CostManagementSection - costsToSave:', costsToSave);
        console.log('🔍 CostManagementSection - onSave function:', onSave);
        
        if (costsToSave.length === 0) {
            alert('No hay costos válidos para guardar. Por favor ingresa al menos un costo mayor a 0.');
            return;
        }
        
        try {
            onSave(costsToSave);
            console.log('✅ CostManagementSection - onSave called successfully');
        } catch (error) {
            console.error('❌ CostManagementSection - Error calling onSave:', error);
            alert('Error al guardar los costos. Por favor intenta nuevamente.');
        }
    };

    if (inventoryItems.length === 0) {
        return null;
    }

    return (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-5">
            <h3 className="font-bold text-blue-200 flex items-center gap-2 mb-3">
                <Icon name="wallet" className="w-5 h-5"/> Gestión de Costos de Repuestos
            </h3>
            <div className="space-y-3">
                {inventoryItems.map(item => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center bg-black dark:bg-gray-900/20 p-2 rounded-md">
                        <span className="text-sm text-gray-300 md:col-span-1">{item.description}</span>
                        <div className="md:col-span-1">
                            <input
                                type="number"
                                placeholder="Costo Real"
                                value={costs[item.id]?.costPrice || ''}
                                onChange={(e) => handleCostChange(item.id, e.target.value)}
                                className="w-full text-sm px-2 py-1 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-red text-white"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <select
                                value={costs[item.id]?.supplierId || ''}
                                onChange={(e) => handleSupplierChange(item.id, e.target.value)}
                                className="w-full text-sm px-2 py-1 border border-gray-600 rounded bg-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-red text-white"
                            >
                                <option value="">-- Proveedor --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleSaveCosts}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                >
                    <Icon name="check-circle" className="w-4 h-4"/> Guardar Costos
                </button>
            </div>
        </div>
    );
};


const WorkOrderDetailView: React.FC<WorkOrderDetailViewProps> = ({ workOrder, quotes, onBack, client, vehicle, stageConfig, hasPermission, onCreateQuote, onShareWithClient, onCreateInvoiceFromWorkOrder, onViewQuote, onEditQuote, onRegisterCosts, suppliers, appSettings, onReportUnforeseenIssue, staffMembers, onUpdateDiagnosticType, onStartDiagnostic }) => {
    
    const [showQualityControlModal, setShowQualityControlModal] = useState(false);
    const [isQualityControlExpanded, setIsQualityControlExpanded] = useState(false);
    
    const galleryImages = useMemo(() => {
        const allImages: { src: string; type: 'Ingreso' | 'Avance' | 'Entrega' | 'Diagnóstico'; timestamp: string; notes?: string; }[] = [];

        (workOrder.entryEvidenceImageUrls || []).forEach(url => {
            allImages.push({ src: url, type: 'Ingreso', timestamp: (workOrder as any).createdAt || new Date().toISOString(), notes: 'Evidencia de Ingreso' });
        });
        
        if (workOrder.diagnosticData) {
            const diagnosticDate = (workOrder.history || []).find(h => h.stage === 'Diagnóstico')?.date || (workOrder as any).createdAt || new Date().toISOString();
            Object.entries(workOrder.diagnosticData).forEach(([sectionTitle, sectionData]) => {
                ((sectionData as any).imageUrls || []).forEach(url => {
                    allImages.push({
                        src: url,
                        type: 'Diagnóstico',
                        timestamp: diagnosticDate,
                        notes: `Diagnóstico: ${sectionTitle}`,
                    });
                });
            });
        }

        if (workOrder.progressLog) {
            workOrder.progressLog.forEach(log => {
                if (log.imageUrls) {
                    log.imageUrls.forEach(url => {
                        allImages.push({ src: url, type: 'Avance', timestamp: log.timestamp, notes: log.notes });
                    });
                }
            });
        }

        // Agregar fotos de las tareas de la cotización
        quotes.forEach(quote => {
            if (quote.items) {
                quote.items.forEach(item => {
                    if (item.imageUrls && item.imageUrls.length > 0) {
                        item.imageUrls.forEach(url => {
                            allImages.push({
                                src: url,
                                type: 'Avance',
                                timestamp: (workOrder as any).updatedAt || (workOrder as any).createdAt || new Date().toISOString(),
                                notes: `Tarea: ${item.description}`
                            });
                        });
                    }
                });
            }
        });

        // Agregar fotos de los imprevistos
        (workOrder.unforeseenIssues || []).forEach(issue => {
            if (issue.imageUrls && issue.imageUrls.length > 0) {
                issue.imageUrls.forEach(url => {
                    allImages.push({
                        src: url,
                        type: 'Diagnóstico', // Usar tipo Diagnóstico para imprevistos
                        timestamp: issue.timestamp,
                        notes: `Imprevisto: ${issue.description}`
                    });
                });
            }
        });
        
        (workOrder.deliveryEvidenceImageUrls || []).forEach(url => {
            allImages.push({ src: url, type: 'Entrega', timestamp: workOrder.deliveryDate || new Date().toISOString(), notes: 'Evidencia de Entrega' });
        });

        return allImages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [workOrder]);

    const handlePrint = async(type: 'diagnostic' | 'reception') => {
        if (!client || !vehicle) {
            alert('Faltan datos de cliente o vehículo para generar el reporte.');
            return;
        }

        let reportElement;
        const companyInfo = appSettings?.companyInfo || {
            name: 'Autodealer Taller SAS',
            nit: '900.123.456-7',
            logoUrl: '',
        };

        if (type === 'diagnostic') {
            if (!workOrder.diagnosticData) {
                alert('No hay datos de diagnóstico para generar el reporte.');
                return;
            }
            reportElement = <PrintableDiagnosticReport workOrder={workOrder} client={client} vehicle={vehicle} companyInfo={companyInfo} />;

        } else { // reception
            reportElement = <PrintableReceptionReport workOrder={workOrder} client={client} vehicle={vehicle} companyInfo={companyInfo} />;
        }

        const reportHtml = renderToString(reportElement);

        const fullHtml = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Reporte ${type === 'diagnostic' ? 'de Diagnóstico' : 'de Recepción'} - ${workOrder.id}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Impact&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Inter', sans-serif; }
                </style>
                <script>
                    tailwind.config = {
                        theme: {
                            extend: {
                                fontFamily: {
                                    heading: ['Impact', 'sans-serif'],
                                    sans: ['Inter', 'sans-serif'],
                                },
                                colors: {
                                    brand: { red: '#C8102E' }
                                }
                            }
                        }
                    }
                </script>
            </head>
            <body>
                ${reportHtml}
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(fullHtml);
            printWindow.document.close();
        } else {
            alert('No se pudo abrir la ventana de impresión. Por favor, deshabilite los bloqueadores de ventanas emergentes.');
        }
    };

    // Función para imprimir reporte de imprevisto
    const handlePrintUnforeseenIssue = async(issue: any) => {
        if (!client || !vehicle) {
            alert('Faltan datos de cliente o vehículo para generar el reporte.');
            return;
        }

        const companyInfo = appSettings?.companyInfo || {
            name: 'Autodealer Taller SAS',
            nit: '900.123.456-7',
            logoUrl: '',
        };

        // Crear el HTML del reporte de imprevisto
        const reportHtml = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Reporte de Imprevisto - ${workOrder.id}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body class="bg-white text-black">
                <div class="max-w-4xl mx-auto p-6">
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-6 border-b-2 border-gray-300 pb-4">
                        <div>
                            <img src="${companyInfo.logoUrl || '/images/company/logo.png'}" alt="Logo" class="h-20 w-auto" onerror="this.style.display='none'">
                        </div>
                        <div class="text-right">
                            <h1 class="text-2xl font-bold text-gray-900">Reporte de Imprevisto</h1>
                            <p class="text-sm text-gray-600">Orden de Trabajo: <span class="font-bold">${workOrder.id}</span></p>
                            <p class="text-sm text-gray-600">Fecha: <span class="font-bold">${new Date().toLocaleDateString('es-CO')}</span></p>
                        </div>
                    </div>

                    <!-- Información del Cliente y Vehículo -->
                    <div class="grid grid-cols-2 gap-6 mb-6">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="font-bold text-lg mb-2">Datos del Cliente</h3>
                            <p class="text-sm"><span class="font-semibold">Nombre:</span> ${client.name || 'N/A'}</p>
                            <p class="text-sm"><span class="font-semibold">Identificación:</span> ${client.idType || ''} ${client.idNumber || ''}</p>
                            <p class="text-sm"><span class="font-semibold">Teléfono:</span> ${client.phone || 'N/A'}</p>
                            <p class="text-sm"><span class="font-semibold">Email:</span> ${client.email || 'N/A'}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="font-bold text-lg mb-2">Datos del Vehículo</h3>
                            <p class="text-sm"><span class="font-semibold">Marca/Modelo:</span> ${vehicle.make || ''} ${vehicle.model || ''}</p>
                            <p class="text-sm"><span class="font-semibold">Placa:</span> ${vehicle.plate || 'N/A'}</p>
                            <p class="text-sm"><span class="font-semibold">Año:</span> ${vehicle.year || 'N/A'}</p>
                            <p class="text-sm"><span class="font-semibold">Kilometraje:</span> ${workOrder.mileage || 'N/A'}</p>
                        </div>
                    </div>

                    <!-- Detalles del Imprevisto -->
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <h3 class="font-bold text-lg mb-3 text-orange-800">Detalles del Imprevisto</h3>
                        <div class="space-y-2">
                            <p class="text-sm"><span class="font-semibold">Reportado por:</span> ${staffMap.get(issue.reportedById) || 'Desconocido'}</p>
                            <p class="text-sm"><span class="font-semibold">Fecha:</span> ${formatDateTime(issue.timestamp)}</p>
                            <p class="text-sm"><span class="font-semibold">Prioridad:</span> <span class="font-bold text-orange-600">${issue.priority?.toUpperCase() || 'MEDIA'}</span></p>
                            <p class="text-sm"><span class="font-semibold">Descripción:</span></p>
                            <p class="text-sm bg-white p-3 rounded border italic">"${issue.description}"</p>
                        </div>
                    </div>

                    <!-- Servicios Requeridos -->
                    ${issue.requiredServices && issue.requiredServices.length > 0 ? `
                    <div class="mb-6">
                        <h3 class="font-bold text-lg mb-3">Servicios Requeridos</h3>
                        <div class="bg-gray-50 rounded-lg overflow-hidden">
                            <table class="w-full">
                                <thead class="bg-gray-200">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-sm font-semibold">Servicio</th>
                                        <th class="px-4 py-2 text-center text-sm font-semibold">Cantidad</th>
                                        <th class="px-4 py-2 text-right text-sm font-semibold">Precio Unit.</th>
                                        <th class="px-4 py-2 text-right text-sm font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${issue.requiredServices.map((service: any) => `
                                        <tr class="border-b">
                                            <td class="px-4 py-2 text-sm">${service.serviceName}</td>
                                            <td class="px-4 py-2 text-center text-sm">${service.quantity}</td>
                                            <td class="px-4 py-2 text-right text-sm">$${service.estimatedPrice.toLocaleString()}</td>
                                            <td class="px-4 py-2 text-right text-sm font-semibold">$${(service.quantity * service.estimatedPrice).toLocaleString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Repuestos Requeridos -->
                    ${issue.requiredParts && issue.requiredParts.length > 0 ? `
                    <div class="mb-6">
                        <h3 class="font-bold text-lg mb-3">Repuestos Requeridos</h3>
                        <div class="bg-gray-50 rounded-lg overflow-hidden">
                            <table class="w-full">
                                <thead class="bg-gray-200">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-sm font-semibold">Repuesto</th>
                                        <th class="px-4 py-2 text-center text-sm font-semibold">Cantidad</th>
                                        <th class="px-4 py-2 text-right text-sm font-semibold">Precio Unit.</th>
                                        <th class="px-4 py-2 text-right text-sm font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${issue.requiredParts.map((part: any) => `
                                        <tr class="border-b">
                                            <td class="px-4 py-2 text-sm">${part.partName}</td>
                                            <td class="px-4 py-2 text-center text-sm">${part.quantity}</td>
                                            <td class="px-4 py-2 text-right text-sm">$${part.estimatedPrice.toLocaleString()}</td>
                                            <td class="px-4 py-2 text-right text-sm font-semibold">$${(part.quantity * part.estimatedPrice).toLocaleString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Resumen de Costos -->
                    ${issue.estimatedCost && issue.estimatedCost > 0 ? `
                    <div class="bg-gray-100 p-4 rounded-lg">
                        <h3 class="font-bold text-lg mb-2">Resumen de Costos Estimados</h3>
                        <div class="text-right">
                            <p class="text-lg font-bold text-gray-900">Total Estimado: $${issue.estimatedCost.toLocaleString()}</p>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Evidencia Fotográfica -->
                    ${issue.imageUrls && issue.imageUrls.length > 0 ? `
                    <div class="mt-6">
                        <h3 class="font-bold text-lg mb-3">Evidencia Fotográfica del Daño</h3>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            ${issue.imageUrls.map((imageUrl: string, imgIndex: number) => `
                                <div class="bg-gray-50 p-2 rounded border">
                                    <img src="${imageUrl}" alt="Evidencia ${imgIndex + 1}" class="w-full h-32 object-cover rounded" onerror="this.style.display='none'">
                                    <p class="text-xs text-center mt-1 text-gray-600">Evidencia ${imgIndex + 1}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Notas Adicionales -->
                    ${issue.notes ? `
                    <div class="mt-6">
                        <h3 class="font-bold text-lg mb-2">Notas Adicionales</h3>
                        <p class="text-sm bg-gray-50 p-3 rounded border">${issue.notes}</p>
                    </div>
                    ` : ''}

                    <!-- Footer -->
                    <div class="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                        <p>Este reporte fue generado automáticamente el ${new Date().toLocaleString('es-CO')}</p>
                        <p>${companyInfo.name} - ${companyInfo.nit}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(reportHtml);
            printWindow.document.close();
        } else {
            alert('No se pudo abrir la ventana de impresión. Por favor, deshabilite los bloqueadores de ventanas emergentes.');
        }
    };

    // Función para crear cotización desde imprevisto
    const handleCreateQuoteFromIssue = (issue: any) => {
        // Convertir el imprevisto en una cotización
        const quoteItems: any[] = [];
        
        // Agregar servicios del imprevisto
        if (issue.requiredServices) {
            issue.requiredServices.forEach((service: any) => {
                quoteItems.push({
                    id: `service_${service.serviceId}_${Date.now()}`,
                    type: 'service',
                    description: service.serviceName,
                    quantity: service.quantity,
                    unitPrice: service.estimatedPrice,
                    taxRate: 19,
                    discount: 0,
                    costPrice: service.estimatedPrice * 0.7, // Asumir 30% de margen
                    supplierId: undefined,
                    isCompleted: false,
                    suppliedByClient: false,
                });
            });
        }
        
        // Agregar repuestos del imprevisto
        if (issue.requiredParts) {
            issue.requiredParts.forEach((part: any) => {
                quoteItems.push({
                    id: `part_${part.partId}_${Date.now()}`,
                    type: 'inventory',
                    description: part.partName,
                    quantity: part.quantity,
                    unitPrice: part.estimatedPrice,
                    taxRate: 19,
                    discount: 0,
                    costPrice: part.estimatedPrice * 0.6, // Asumir 40% de margen
                    supplierId: part.supplierId,
                    isCompleted: false,
                    suppliedByClient: false,
                });
            });
        }
        
        if (quoteItems.length === 0) {
            alert('No hay servicios o repuestos en este imprevisto para crear una cotización.');
            return;
        }
        
        // Crear la cotización
        const newQuote = {
            workOrderId: workOrder.id,
            clientId: workOrder.client?.id || '',
            items: quoteItems,
            subtotal: quoteItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
            taxAmount: quoteItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0),
            total: quoteItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 + item.taxRate / 100)), 0),
            status: 'PENDIENTE_COTIZACION' as any,
            notes: `Cotización generada desde imprevisto: ${issue.description}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Llamar a la función de crear cotización
        onCreateQuote(workOrder, true);
    };

    const attentionPoints = useMemo(() => {
        if (!workOrder.diagnosticData) {
            return [];
        }
        
        const points = [];
        for (const sectionTitle in workOrder.diagnosticData) {
            const section = workOrder.diagnosticData[sectionTitle];
            
            // Check items (old structure)
            if (section.items) {
                for (const item in section.items) {
                    const status = section.items[item];
                    if (status === ChecklistStatus.MAL || status === ChecklistStatus.MANTEN || status === ChecklistStatus.CAMBIO) {
                        points.push({ item, section: sectionTitle, status });
                    }
                }
            }
            
            // Check components (new structure)
            if (section.components) {
                for (const component in section.components) {
                    const status = section.components[component];
                    if (status === ChecklistStatus.MAL || status === ChecklistStatus.MANTEN || status === ChecklistStatus.CAMBIO) {
                        points.push({ item: component, section: sectionTitle, status });
                    }
                }
            }
            
            // Check custom items
            if (section.customItems) {
                for (const customItem of section.customItems) {
                    if (customItem.status === ChecklistStatus.MAL || customItem.status === ChecklistStatus.MANTEN || customItem.status === ChecklistStatus.CAMBIO) {
                        points.push({ item: customItem.name, section: sectionTitle, status: customItem.status });
                    }
                }
            }
        }
        return points;
    }, [workOrder.diagnosticData]);

    const generalConclusions = useMemo(() => {
        if (!workOrder.diagnosticData) return 'No hay diagnóstico completado.';
        const allObservations = Object.values(workOrder.diagnosticData)
            .map(section => section.observations)
            .filter(Boolean); // Filter out empty strings
        return allObservations.length > 0 ? allObservations.join('. ') : 'Sin conclusiones generales.';
    }, [workOrder.diagnosticData]);


    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Function to convert technical names to user-friendly names
    const getFriendlyName = (technicalName: string): string => {
        // Remove underscores and technical prefixes
        let friendlyName = technicalName
            .replace(/^_+/g, '') // Remove leading underscores
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/\(.*?\)/g, '') // Remove parentheses content
            .trim();
        
        // Capitalize first letter of each word
        friendlyName = friendlyName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        
        // Handle specific technical terms
        const replacements: { [key: string]: string } = {
            'Refrigerante': 'Sistema de Refrigeración',
            'Liquido de Frenos': 'Sistema de Frenos',
            'Liquido Direccion': 'Sistema de Dirección',
            'Aceite Motor': 'Aceite del Motor',
            'Pintura': 'Pintura del Vehículo',
            'Cristales': 'Cristales y Vidrios',
            'Luces': 'Sistema de Iluminación',
            'Neumaticos': 'Neumáticos',
            'Niveles de Fluidos': 'Niveles de Fluidos',
            'Inspeccion Visual General': 'Inspección Visual',
            'Sistema Electrico': 'Sistema Eléctrico',
            'Sistema Mecanico': 'Sistema Mecánico',
        };
        
        // Apply replacements
        for (const [technical, friendly] of Object.entries(replacements)) {
            if (friendlyName.includes(technical)) {
                friendlyName = friendlyName.replace(technical, friendly);
            }
        }
        
        return friendlyName;
    };

    const staffMap = useMemo(() => new Map(staffMembers.map(s => [s.id, s.name])), [staffMembers]);
    
    const hasApprovedQuotes = quotes.some(q => q.status === QuoteStatus.APROBADO);
    const hasUninvoicedApprovedQuotes = quotes.some(q => q.status === QuoteStatus.APROBADO && !q.linkedInvoiceId);
    
    const showProgressTracker = hasApprovedQuotes;
    
    // Debug: verificar estado de cotizaciones
    console.log('🔍 WorkOrderDetailView - quotes debug:', {
        quotesCount: quotes.length,
        quotes: quotes.map(q => ({ id: q.id, status: q.status })),
        hasApprovedQuotes,
        showProgressTracker,
        condition: (showProgressTracker || quotes.length > 0),
        approvedQuote: quotes.find(q => q.status === QuoteStatus.APROBADO),
        firstQuote: quotes[0]
    });
    
    // Check if diagnostic data is actually meaningful (has content)
    const hasValidDiagnosticData = workOrder.diagnosticData && 
        typeof workOrder.diagnosticData === 'object' && 
        Object.keys(workOrder.diagnosticData).length > 0;
    
    const canCreateQuote = hasPermission('manage:quotes') && quotes.length === 0 && (!workOrder.requiresInitialDiagnosis || hasValidDiagnosticData);
    const canAddAdditionalQuote = hasPermission('manage:quotes') && (workOrder.stage === KanbanStage.EN_REPARACION || workOrder.stage === KanbanStage.ATENCION_REQUERIDA) && hasApprovedQuotes;
    const canCreateInvoice = hasPermission('manage:billing') && hasUninvoicedApprovedQuotes;


    return (
        <>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700/50 transition-colors">
                        <Icon name="arrow-left" className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Detalle de la Orden de Servicio</h1>
                        <p className="mt-1 text-gray-500 dark:text-dark-text">Orden #{workOrder.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     {workOrder.publicAccessToken && hasPermission('manage:quotes') && (
                         <button onClick={onShareWithClient} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-500 transition-colors">
                            <Icon name="share" className="w-5 h-5" /> Compartir con Cliente
                        </button>
                    )}
                    <span className={`px-4 py-2 text-sm font-bold rounded-md ${stageConfig.bg} ${stageConfig.text}`}>
                        {workOrder.stage}
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Main Details) */}
                <div className="lg:col-span-2 space-y-6">
                    {workOrder.stage === KanbanStage.ATENCION_REQUERIDA && workOrder.unforeseenIssues && (
                         <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-5">
                             <div className="flex items-center gap-3 mb-4">
                                <Icon name="exclamation-triangle" className="w-6 h-6 text-orange-400" />
                                <h2 className="text-xl font-bold text-orange-200">Imprevistos Reportados</h2>
                            </div>
                            {(workOrder.unforeseenIssues || []).map((issue, index) => (
                                <div key={index} className="bg-black dark:bg-gray-900/20 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-bold text-white">{staffMap.get(issue.reportedById) || 'Desconocido'}</span>
                                            <span className="text-gray-400">· {formatDateTime(issue.timestamp)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handlePrintUnforeseenIssue(issue)}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-300 bg-blue-600/50 rounded hover:bg-blue-600 transition-colors"
                                            >
                                                <Icon name="printer" className="w-3 h-3" />
                                                Imprimir
                                            </button>
                                            <button 
                                                onClick={() => handleCreateQuoteFromIssue(issue)}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-300 bg-green-600/50 rounded hover:bg-green-600 transition-colors"
                                            >
                                                <Icon name="plus" className="w-3 h-3" />
                                                Cotizar
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 italic">"{issue.description}"</p>
                                    
                                    {/* Mostrar servicios y repuestos si existen */}
                                    {(issue.requiredServices && issue.requiredServices.length > 0) && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-400 mb-1">Servicios requeridos:</p>
                                            <ul className="text-xs text-gray-300 space-y-1">
                                                {issue.requiredServices.map((service, sIndex) => (
                                                    <li key={sIndex} className="flex justify-between">
                                                        <span>{service.serviceName}</span>
                                                        <span className="text-green-400">${service.estimatedPrice.toLocaleString()}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {(issue.requiredParts && issue.requiredParts.length > 0) && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-400 mb-1">Repuestos requeridos:</p>
                                            <ul className="text-xs text-gray-300 space-y-1">
                                                {issue.requiredParts.map((part, pIndex) => (
                                                    <li key={pIndex} className="flex justify-between">
                                                        <span>{part.partName}</span>
                                                        <span className="text-green-400">${part.estimatedPrice.toLocaleString()}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {issue.estimatedCost && issue.estimatedCost > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-700">
                                            <p className="text-xs text-gray-400">
                                                Costo estimado total: <span className="text-green-400 font-bold">${issue.estimatedCost.toLocaleString()}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                         </div>
                    )}
                    
                    {workOrder.diagnosticData && (
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <Icon name="exclamation-triangle" className="w-6 h-6 text-yellow-400" />
                                <h2 className="text-xl font-bold text-yellow-200">Resumen de Diagnóstico Técnico</h2>
                            </div>
                            
                            <div className="bg-black dark:bg-gray-900/20 rounded-lg p-2 flex flex-wrap items-center justify-between gap-2 mb-4">
                                <span className="text-sm font-semibold text-gray-300 px-2">Acciones del Diagnóstico:</span>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => handlePrint('diagnostic')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-600/50 rounded-lg hover:bg-gray-600 transition-colors">
                                        <Icon name="printer" className="w-4 h-4" />
                                        Imprimir Diagnóstico
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-black dark:bg-gray-900/20 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-300">Conclusiones Generales del Técnico</h3>
                                    <p className="text-sm text-gray-400 italic mt-1">"{generalConclusions}"</p>
                                </div>
                                <div className="bg-black dark:bg-gray-900/20 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-300">Puntos de Atención ({attentionPoints.length})</h3>
                                    <ul className="mt-2 space-y-2">
                                        {attentionPoints.map((point, index) => (
                                            <li key={index} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                                                <span className="text-sm text-gray-300">{getFriendlyName(point.item)} <span className="text-xs text-gray-500">({getFriendlyName(point.section)})</span></span>
                                                <span className="text-xs font-bold text-yellow-300">{point.status}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {(showProgressTracker || quotes.length > 0) && <ProgressTracker workOrder={workOrder} quote={quotes.find(q => q.status === QuoteStatus.APROBADO) || quotes[0]} quotes={quotes} client={client} vehicle={vehicle} hasPermission={hasPermission} onReportUnforeseenIssue={onReportUnforeseenIssue} />}
                    
                    {/* Control de Calidad */}
                    {workOrder.stage === KanbanStage.CONTROL_CALIDAD && quotes.length > 0 && (
                        <QualityControlView 
                            workOrder={workOrder} 
                            quote={quotes.find(q => q.status === QuoteStatus.APROBADO)!} 
                            client={client} 
                            vehicle={vehicle} 
                            hasPermission={hasPermission} 
                            onBack={onBack} 
                            staffMembers={staffMembers}
                        />
                    )}

                    {/* Mostrar resultado del Control de Calidad cuando esté completado */}
                    {(workOrder.stage === KanbanStage.LISTO_ENTREGA || workOrder.stage === KanbanStage.ENTREGADO) && quotes.length > 0 && (() => {
                        // Debug: verificar el historial
                        console.log('🔍 WorkOrderDetailView - Verificando control de calidad:', {
                            workOrderStage: workOrder.stage,
                            historyLength: workOrder.history?.length || 0,
                            historyEntries: workOrder.history?.map(h => ({
                                stage: h.stage,
                                notes: h.notes,
                                user: h.user,
                                date: h.date
                            })) || []
                        });
                        
                        // Buscar la entrada de historial del control de calidad
                        const qualityControlEntry = workOrder.history?.find(entry => 
                            entry.notes?.includes('Control de Calidad APROBADO') || 
                            entry.notes?.includes('Control de Calidad RECHAZADO') ||
                            entry.stage === 'Control de Calidad' ||
                            entry.notes?.includes('Control de Calidad')
                        );
                        
                        console.log('🔍 WorkOrderDetailView - qualityControlEntry encontrada:', qualityControlEntry);
                        
                        if (qualityControlEntry) {
                            // Determinar si fue aprobado basándose en la etapa actual y el texto
                            const isApproved = qualityControlEntry.notes?.includes('APROBADO') || 
                                             qualityControlEntry.notes?.includes('Listo para Entrega') ||
                                             workOrder.stage === 'Listo para Entrega';
                            
                            // Usar el estado global para controlar si está expandido
                            
                            return (
                                <div className="bg-dark-light rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Icon name="check-circle" className="w-6 h-6" />
                                            Control de Calidad Completado
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                isApproved 
                                                    ? 'bg-green-600 text-white' 
                                                    : 'bg-red-600 text-white'
                                            }`}>
                                                {isApproved ? '✅ APROBADO' : '❌ RECHAZADO'}
                                            </div>
                                            <button
                                                onClick={() => setIsQualityControlExpanded(!isQualityControlExpanded)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                title={isQualityControlExpanded ? "Ocultar detalles" : "Ver detalles"}
                                            >
                                                <Icon name={isQualityControlExpanded ? "chevron-up" : "chevron-down"} className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {isQualityControlExpanded && (
                                        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Icon name="user" className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-300">
                                                    <strong className="text-white">Inspector:</strong> {
                                                        qualityControlEntry.user || 'N/A'
                                                    }
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <Icon name="calendar" className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-300">
                                                    <strong className="text-white">Fecha:</strong> {
                                                        new Date(qualityControlEntry.date).toLocaleDateString('es-CO')
                                                    }
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-start gap-3">
                                                <Icon name="document-text" className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div className="text-gray-300">
                                                    <strong className="text-white">Observaciones:</strong>
                                                    <p className="mt-1">{qualityControlEntry.notes}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Checklist detallado del control de calidad */}
                                            <div className="border-t border-gray-700 pt-4">
                                                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                    <Icon name="clipboard" className="w-5 h-5" />
                                                    Detalles del Control de Calidad
                                                </h4>
                                                
                                                {/* Mostrar el checklist completo */}
                                                {(() => {
                                                    // Extraer información del checklist del historial
                                                    const checklistInfo = qualityControlEntry.notes?.match(/Verificaciones completadas: (\d+)\/(\d+)/);
                                                    const completedItems = checklistInfo ? parseInt(checklistInfo[1]) : 0;
                                                    const totalItems = checklistInfo ? parseInt(checklistInfo[2]) : 0;
                                                    
                                                    // Categorías del control de calidad
                                                    const categories = [
                                                        {
                                                            id: 'exterior',
                                                            title: 'Exterior del vehículo limpio',
                                                            icon: 'car',
                                                            items: [
                                                                'No hay manchas de grasa en tapicería o latonería',
                                                                'Se retiraron plásticos protectores de asientos/volante',
                                                                'Los elementos personales del cliente están en su lugar'
                                                            ]
                                                        },
                                                        {
                                                            id: 'funcionalidad',
                                                            title: 'Funcionamiento y Pruebas',
                                                            icon: 'cog',
                                                            items: [
                                                                'El vehículo enciende correctamente',
                                                                'No hay luces de advertencia en el tablero',
                                                                'El motor funciona sin ruidos anormales',
                                                                'Se realizó prueba de ruta y el manejo es correcto',
                                                                'El sistema de A/C y calefacción funciona',
                                                                'Los frenos responden adecuadamente'
                                                            ]
                                                        },
                                                        {
                                                            id: 'verificacion',
                                                            title: 'Verificación de Tareas',
                                                            icon: 'check-circle',
                                                            items: [
                                                                'Se completaron todos los trabajos aprobados en la cotización',
                                                                'Los repuestos reemplazados están guardados para el cliente (si aplica)',
                                                                'Se verificaron los niveles de fluidos (aceite, refrigerante, frenos)',
                                                                'Se ajustó la presión de los neumáticos'
                                                            ]
                                                        },
                                                        {
                                                            id: 'documentacion',
                                                            title: 'Documentación y Entrega',
                                                            icon: 'document-text',
                                                            items: [
                                                                'La factura corresponde con los trabajos realizados',
                                                                'La orden de trabajo está completamente documentada',
                                                                'Se ha preparado la recomendación de próximo mantenimiento'
                                                            ]
                                                        }
                                                    ];
                                                    
                                                    return (
                                                        <div className="space-y-4">
                                                            {/* Resumen general */}
                                                            <div className="bg-gray-700 rounded-lg p-3">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-white font-semibold">Progreso General</span>
                                                                    <span className="text-blue-400 font-mono">{completedItems}/{totalItems}</span>
                                                                </div>
                                                                <div className="w-full bg-gray-600 rounded-full h-2">
                                                                    <div 
                                                                        className={`h-2 rounded-full transition-all duration-300 ${isApproved ? 'bg-green-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Categorías detalladas */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {categories.map(category => (
                                                                    <div key={category.id} className="bg-gray-700 rounded-lg p-4">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <Icon name={category.icon as any} className="w-5 h-5 text-blue-400" />
                                                                            <h5 className="font-semibold text-white text-sm">{category.title}</h5>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            {category.items.map((item, index) => (
                                                                                <div key={index} className="flex items-center gap-2">
                                                                                    <div className={`w-3 h-3 rounded-full ${isApproved ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                                    <span className="text-gray-300 text-xs">{item}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            
                                                            {/* Estado final */}
                                                            <div className="bg-gray-700 rounded-lg p-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-4 h-4 rounded-full ${isApproved ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                    <div>
                                                                        <p className="text-white font-semibold">
                                                                            {isApproved ? '✅ Control de Calidad APROBADO' : '❌ Control de Calidad RECHAZADO'}
                                                                        </p>
                                                                        <p className="text-gray-300 text-sm">
                                                                            {isApproved 
                                                                                ? 'El vehículo cumple con todos los estándares de calidad'
                                                                                : 'El vehículo requiere correcciones adicionales'
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            
                                            {/* Botón para versión imprimible */}
                                            <div className="flex justify-end pt-4 border-t border-gray-700">
                                                <button
                                                    onClick={() => setShowQualityControlModal(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                >
                                                    <Icon name="printer" className="w-4 h-4" />
                                                    Versión Imprimible
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        } else {
                            // Fallback: mostrar sección incluso si no encuentra la entrada específica
                            return (
                                <div className="bg-dark-light rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Icon name="check-circle" className="w-6 h-6" />
                                            Control de Calidad
                                        </h2>
                                        <div className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-600 text-white">
                                            🔍 DEBUGGING
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                                        <div className="text-gray-300">
                                            <strong className="text-white">Estado:</strong> La orden está en etapa "{workOrder.stage}" pero no se encontró entrada específica de control de calidad en el historial.
                                        </div>
                                        
                                        <div className="text-gray-300">
                                            <strong className="text-white">Historial disponible:</strong> {workOrder.history?.length || 0} entradas
                                        </div>
                                        
                                        {workOrder.history && workOrder.history.length > 0 && (
                                            <div className="text-gray-300">
                                                <strong className="text-white">Últimas entradas:</strong>
                                                <ul className="mt-2 space-y-1">
                                                    {workOrder.history.slice(-3).map((entry, index) => (
                                                        <li key={index} className="text-xs">
                                                            • {entry.stage}: {entry.notes?.substring(0, 50)}...
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                    })()}
                    
                    {galleryImages.length > 0 && <ImageGallery images={galleryImages} />}

                    {(workOrder.serviceTypeAdvanced || workOrder.diagnosticData) && (
                        <div className="bg-dark-light rounded-xl p-5">
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Detalles de Recepción</h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handlePrint('reception')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-600/50 rounded-lg hover:bg-gray-600 transition-colors">
                                        <Icon name="printer" className="w-4 h-4" />
                                        Imprimir Recepción
                                    </button>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-white mb-2">Estado del Vehículo</h3>
                                    <ul className="text-sm space-y-2 text-gray-300">
                                        <DetailItem label="Motivo de Ingreso" value={workOrder.serviceRequested} />
                                        <DetailItem label="Kilometraje" value={workOrder.mileage} />
                                        <li className="flex items-center gap-4">
                                            <strong className="text-gray-400">Nivel Combustible:</strong>
                                            <FuelGauge level={workOrder.fuelLevel || 'N/A'} />
                                        </li>
                                        <DetailItem label="Objetos de Valor" value={workOrder.reportedValuables} />
                                        {workOrder.comments && (
                                            <li className="mt-3">
                                                <strong className="text-gray-400 block mb-1">Comentarios y Evidencias:</strong>
                                                <p className="text-gray-300 text-sm italic">"{workOrder.comments}"</p>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-2">Checklist de Inventario</h3>
                                    <div className="grid grid-cols-2 gap-1 text-gray-300">
                                        <CheckItem label="Llanta repuesto" checked={workOrder.inventoryChecklist?.spareTire} />
                                        <CheckItem label="Kit de carretera" checked={workOrder.inventoryChecklist?.jackKit} />
                                        <CheckItem label="Herramientas" checked={workOrder.inventoryChecklist?.tools} />
                                        <CheckItem label="Extintor" checked={workOrder.inventoryChecklist?.fireExtinguisher} />
                                        <CheckItem label="Botiquín" checked={workOrder.inventoryChecklist?.firstAidKit} />
                                        <CheckItem label="Otros" checked={workOrder.inventoryChecklist?.other} />
                                    </div>
                                    {workOrder.inventoryChecklist?.other && workOrder.inventoryOtherText && (
                                        <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                                            <p className="text-sm text-gray-300">
                                                <strong className="text-gray-400">Especificación:</strong> {workOrder.inventoryOtherText}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <h3 className="font-semibold text-white mb-2">Checklist de Daños</h3>
                                    {workOrder.damageLocations && Object.keys(workOrder.damageLocations).length > 0 ? (
                                        <VehicleDiagram damageLocations={workOrder.damageLocations} readOnly={true} />
                                    ) : (
                                        <p className="text-sm text-gray-400">No se registraron daños en el diagrama.</p>
                                    )}
                                    {workOrder.otherDamages && (
                                        <li className="mt-3">
                                            <strong className="text-gray-400 block mb-1">Otros Daños:</strong>
                                            <p className="text-gray-300 text-sm italic">"{workOrder.otherDamages}"</p>
                                        </li>
                                    )}
                                </div>
                             </div>
                        </div>
                    )}
                    
                    <div className="bg-dark-light rounded-xl p-5">
                         <h2 className="text-xl font-bold text-white mb-4">Historial de la Orden</h2>
                         <div className="relative pl-4 border-l-2 border-gray-700">
                            {Array.isArray(workOrder.history) && workOrder.history.length > 0 ? (
                                workOrder.history.map((entry, index) => (
                                    <div key={index} className="mb-6">
                                        <div className="absolute -left-[11px] top-1 w-5 h-5 bg-brand-red rounded-full ring-4 ring-dark-light"></div>
                                        <p className="font-bold text-white">{entry.stage}</p>
                                        <p className="text-xs text-gray-400">{formatDateTime(entry.date)} por {entry.user}</p>
                                        {entry.notes && <p className="text-sm text-gray-300 mt-1 italic">"{entry.notes}"</p>}
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 text-sm italic">
                                    No hay historial disponible para esta orden de trabajo.
                                </div>
                            )}
                         </div>
                    </div>
                     {workOrder.diagnosticData && (
                        <DiagnosticDetailSection diagnosticData={workOrder.diagnosticData} />
                    )}
                    {workOrder.deliveryDate && (
                        <div className="bg-dark-light rounded-xl p-5">
                            <h2 className="text-xl font-bold text-white mb-4">Datos de Entrega</h2>
                            <div className="space-y-3 text-sm">
                                <DetailItem label="Fecha de Entrega" value={formatDateTime(workOrder.deliveryDate)} />
                                <div>
                                    <h4 className="font-semibold text-gray-300">Próximo Mantenimiento Sugerido</h4>
                                    <ul className="list-disc list-inside pl-2 text-gray-400">
                                        <DetailItem label="Fecha" value={workOrder.nextMaintenanceDate ? new Date(workOrder.nextMaintenanceDate).toLocaleDateString('es-CO') : 'N/A'} />
                                        <DetailItem label="Kilometraje" value={workOrder.nextMaintenanceMileage} />
                                        <DetailItem label="Notas" value={workOrder.nextMaintenanceNotes} />
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Client & Vehicle Info) */}
                <div className="space-y-6">
                     <div className="bg-dark-light rounded-xl p-5">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-3"><Icon name="wrench" className="w-5 h-5 text-brand-red"/> Solicitud del Cliente</h3>
                        <p className="text-sm text-gray-300">{workOrder.serviceRequested}</p>
                        
                        {workOrder.requiresInitialDiagnosis && (
                            <div className="mt-4 pt-4 border-t border-gray-700/50">
                                <label htmlFor="diagnosticType" className="block text-sm font-medium text-gray-400 mb-1">Tipo de Diagnóstico</label>
                                <select
                                    id="diagnosticType"
                                    value={workOrder.diagnosticType || 'Básico'}
                                    onChange={(e) => onUpdateDiagnosticType(workOrder.id, e.target.value as DiagnosticType)}
                                    disabled={!hasPermission('edit:work_order')}
                                    className="w-full text-sm px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-red text-white disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                                >
                                    <option value="Básico">Básico</option>
                                    <option value="Intermedio">Intermedio</option>
                                    <option value="Avanzado">Avanzado</option>
                                </select>
                                {!hasPermission('edit:work_order') && (
                                    <p className="text-xs text-gray-500 mt-1">Solo administradores o jefes de taller pueden cambiar el tipo.</p>
                                )}
                                
                                {!hasValidDiagnosticData && (
                                    <div className="mt-4">
                                        <button 
                                            onClick={() => onStartDiagnostic(workOrder.id)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Icon name="clipboard" className="w-4 h-4" />
                                            Iniciar Diagnóstico
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {canCreateQuote && (
                        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-5">
                             <h3 className="font-bold text-blue-200 flex items-center gap-2 mb-3"><Icon name="document-text" className="w-5 h-5"/> Acción Requerida</h3>
                             <p className="text-sm text-blue-300/80 mb-4">{hasValidDiagnosticData ? "El diagnóstico ha sido completado. Cree una cotización." : "Cree una cotización para este trabajo directo."}</p>
                             <button onClick={() => onCreateQuote(workOrder, false)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg hover:bg-red-700"><Icon name="document-text" className="w-4 h-4" />Crear Cotización</button>
                        </div>
                    )}

                    {canAddAdditionalQuote && (
                        <button onClick={() => onCreateQuote(workOrder, true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-500"><Icon name="plus" className="w-4 h-4" />Añadir Cotización Adicional</button>
                    )}

                    {hasApprovedQuotes && hasPermission('manage:inventory') && quotes.filter(q => q.status === QuoteStatus.APROBADO).map(quote => (
                        <CostManagementSection key={quote.id} quote={quote} suppliers={suppliers.filter(s => s.locationId === workOrder.locationId)} onSave={(costs) => onRegisterCosts(workOrder.id, costs)}/>
                    ))}

                    {quotes.length > 0 && (
                        <div className="bg-dark-light rounded-xl p-5">
                            <h3 className="font-bold text-white flex items-center gap-2 mb-3"><Icon name="document-text" className="w-5 h-5 text-brand-red"/> Cotizaciones ({quotes.length})</h3>
                            <div className="space-y-4">
                                {quotes
                                    .sort((a, b) => new Date((b as any).createdAt || b.issueDate).getTime() - new Date((a as any).createdAt || a.issueDate).getTime())
                                    .map((quote, index) => {
                                    // Usar función centralizada para generar ID consistente
                                    const displayId = getQuoteDisplayId(quote.id, quote.issueDate, true, quote.sequentialId);
                                    console.log('🔍 Quote status debug:', { id: quote.id, status: quote.status, hasConfig: !!QUOTE_STATUS_DISPLAY_CONFIG[quote.status] });
                                    
                                    return (
                                        <div key={quote.id} className="bg-black dark:bg-gray-900/20 p-3 rounded-md">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-mono text-white">{displayId}</p>
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${QUOTE_STATUS_DISPLAY_CONFIG[quote.status]?.bg || 'bg-gray-200 dark:bg-gray-700'} ${QUOTE_STATUS_DISPLAY_CONFIG[quote.status]?.text || 'text-gray-800 dark:text-gray-200'}`}>{quote.status}</span>
                                                </div>
                                                <button onClick={() => onViewQuote(quote.id)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 bg-gray-600/50 rounded-md px-2 py-1 hover:bg-gray-600"><Icon name="eye" className="w-3 h-3"/> Ver</button>
                                            </div>
                                            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-700 mt-2">
                                                <span className="text-white">Total:</span><span className="font-mono text-brand-red">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(quote.total)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {canCreateInvoice && (
                        <button onClick={() => onCreateInvoiceFromWorkOrder(workOrder.id)} className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"><Icon name="invoice" className="w-5 h-5"/>Crear Factura</button>
                    )}

                    <div className="bg-dark-light rounded-xl p-5">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-3"><Icon name="user" className="w-5 h-5 text-brand-red"/> Cliente</h3>
                        <ul className="text-sm space-y-2 text-gray-300">
                            <DetailItem label="Nombre" value={client?.name} /><DetailItem label="Email" value={client?.email} /><DetailItem label="Teléfono" value={client?.phone} />
                        </ul>
                    </div>
                    <div className="bg-dark-light rounded-xl p-5">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-3"><Icon name="car" className="w-5 h-5 text-brand-red"/> Vehículo</h3>
                        <ul className="text-sm space-y-2 text-gray-300">
                            <DetailItem label="Marca/Modelo" value={`${vehicle?.make} ${vehicle?.model}`} /><DetailItem label="Año" value={vehicle?.year} /><li><strong className="text-gray-400">Placa:</strong> <span className="font-mono">{vehicle?.plate}</span></li><DetailItem label="Tipo" value={vehicle?.vehicleType} />
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Modal para versión imprimible del Control de Calidad */}
        {showQualityControlModal && (() => {
            const qualityControlEntry = workOrder.history?.find(entry => 
                entry.notes?.includes('Control de Calidad APROBADO') || 
                entry.notes?.includes('Control de Calidad RECHAZADO') ||
                entry.stage === 'Control de Calidad' ||
                entry.notes?.includes('Control de Calidad')
            );
            
            if (!qualityControlEntry) return null;
            
            const isApproved = qualityControlEntry.notes?.includes('APROBADO') || 
                             qualityControlEntry.notes?.includes('Listo para Entrega') ||
                             workOrder.stage === 'Listo para Entrega';
            
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Reporte de Control de Calidad</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Icon name="printer" className="w-4 h-4 inline mr-2" />
                                    Imprimir
                                </button>
                                <button
                                    onClick={() => setShowQualityControlModal(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <Icon name="x" className="w-4 h-4 inline mr-2" />
                                    Cerrar
                                </button>
                            </div>
                        </div>
                        <div className="p-0">
                            <PrintableQualityControlReport
                                workOrder={workOrder}
                                client={client}
                                vehicle={vehicle}
                                inspector={qualityControlEntry.user || 'Sistema'}
                                inspectionDate={qualityControlEntry.date}
                                isApproved={isApproved}
                                notes={qualityControlEntry.notes || ''}
                                companyInfo={appSettings?.companyInfo}
                            />
                        </div>
                    </div>
                </div>
            );
        })()}
        </>
    );
};

export default WorkOrderDetailView;