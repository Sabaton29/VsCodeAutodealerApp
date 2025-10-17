import React, { useState, useContext, useEffect } from 'react';
import { WorkOrder, Quote, Client, Vehicle, Permission, KanbanStage, StaffMember, UserRole } from '../types';
import { Icon } from './Icon';
import { DataContext } from './DataContext';
import { UIContext } from './UIContext';
import PrintableQualityControlReport from './PrintableQualityControlReport';

interface QualityControlViewProps {
    workOrder: WorkOrder;
    quote: Quote;
    client?: Client;
    vehicle?: Vehicle;
    hasPermission: (permission: Permission) => boolean;
    onBack: () => void;
    onClose?: () => void; // Nueva prop para cerrar sin navegar
    staffMembers: StaffMember[];
}

interface QualityCheckItem {
    id: string;
    description: string;
    category: 'exterior' | 'funcionalidad' | 'verificacion' | 'documentacion';
    status: 'ok' | 'no-ok' | 'na' | 'unset';
    notes?: string;
}

interface QualityCategory {
    id: string;
    title: string;
    icon: string;
    items: QualityCheckItem[];
}

const QUALITY_CATEGORIES: QualityCategory[] = [
    {
        id: 'exterior',
        title: 'Exterior del vehículo limpio',
        icon: 'car',
        items: [
            { id: 'exterior-1', description: 'No hay manchas de grasa en tapicería o latonería', category: 'exterior', status: 'unset' },
            { id: 'exterior-2', description: 'Se retiraron plásticos protectores de asientos/volante', category: 'exterior', status: 'unset' },
            { id: 'exterior-3', description: 'Los elementos personales del cliente están en su lugar', category: 'exterior', status: 'unset' },
        ]
    },
    {
        id: 'funcionalidad',
        title: 'Funcionamiento y Pruebas',
        icon: 'cog',
        items: [
            { id: 'func-1', description: 'El vehículo enciende correctamente', category: 'funcionalidad', status: 'unset' },
            { id: 'func-2', description: 'No hay luces de advertencia en el tablero', category: 'funcionalidad', status: 'unset' },
            { id: 'func-3', description: 'El motor funciona sin ruidos anormales', category: 'funcionalidad', status: 'unset' },
            { id: 'func-4', description: 'Se realizó prueba de ruta y el manejo es correcto', category: 'funcionalidad', status: 'unset' },
            { id: 'func-5', description: 'El sistema de A/C y calefacción funciona', category: 'funcionalidad', status: 'unset' },
            { id: 'func-6', description: 'Los frenos responden adecuadamente', category: 'funcionalidad', status: 'unset' },
        ]
    },
    {
        id: 'verificacion',
        title: 'Verificación de Tareas',
        icon: 'check-circle',
        items: [
            { id: 'verif-1', description: 'Se completaron todos los trabajos aprobados en la cotización', category: 'verificacion', status: 'unset' },
            { id: 'verif-2', description: 'Los repuestos reemplazados están guardados para el cliente (si aplica)', category: 'verificacion', status: 'unset' },
            { id: 'verif-3', description: 'Se verificaron los niveles de fluidos (aceite, refrigerante, frenos)', category: 'verificacion', status: 'unset' },
            { id: 'verif-4', description: 'Se ajustó la presión de los neumáticos', category: 'verificacion', status: 'unset' },
        ]
    },
    {
        id: 'documentacion',
        title: 'Documentación y Entrega',
        icon: 'document-text',
        items: [
            { id: 'doc-1', description: 'La factura corresponde con los trabajos realizados', category: 'documentacion', status: 'unset' },
            { id: 'doc-2', description: 'La orden de trabajo está completamente documentada', category: 'documentacion', status: 'unset' },
            { id: 'doc-3', description: 'Se ha preparado la recomendación de próximo mantenimiento', category: 'documentacion', status: 'unset' },
        ]
    }
];

const QualityControlView: React.FC<QualityControlViewProps> = ({ 
    workOrder, 
    quote, 
    client, 
    vehicle, 
    hasPermission, 
    onBack,
    onClose,
    staffMembers 
}) => {
    const data = useContext(DataContext);
    const ui = useContext(UIContext);
    
    const [qualityChecks, setQualityChecks] = useState<QualityCheckItem[]>(() => 
        QUALITY_CATEGORIES.flatMap(category => category.items)
    );
    const [finalNotes, setFinalNotes] = useState('');
    const [selectedInspector, setSelectedInspector] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPrintableReport, setShowPrintableReport] = useState(false);
    const [finalResult, setFinalResult] = useState<{
        isApproved: boolean;
        inspectorName: string;
        inspectionDate: string;
    } | null>(null);

    // Inicializar inspector por defecto
    useEffect(() => {
        if (staffMembers.length > 0 && !selectedInspector) {
            const defaultInspector = staffMembers.find(member => 
                member.role === UserRole.ADMINISTRADOR || member.name.toLowerCase().includes('admin')
            ) || staffMembers[0];
            setSelectedInspector(defaultInspector.id);
        }
    }, [staffMembers, selectedInspector]);

    const handleStatusChange = (itemId: string, status: 'ok' | 'no-ok' | 'na') => {
        setQualityChecks(prev => 
            prev.map(item => 
                item.id === itemId ? { ...item, status } : item
            )
        );
    };

    const getStatusButtonClass = (itemId: string, status: 'ok' | 'no-ok' | 'na') => {
        const currentStatus = qualityChecks.find(item => item.id === itemId)?.status || 'unset';
        const isSelected = currentStatus === status;
        
        const baseClass = "px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer";
        
        if (!isSelected) {
            return `${baseClass} bg-gray-700 text-gray-300 hover:bg-gray-600`;
        }
        
        switch (status) {
            case 'ok':
                return `${baseClass} bg-green-600 text-white`;
            case 'no-ok':
                return `${baseClass} bg-red-600 text-white`;
            case 'na':
                return `${baseClass} bg-gray-600 text-white`;
            default:
                return baseClass;
        }
    };

    const getCategoryProgress = (categoryId: string) => {
        const categoryItems = qualityChecks.filter(item => item.category === categoryId);
        const completedItems = categoryItems.filter(item => item.status === 'ok' || item.status === 'no-ok' || item.status === 'na').length;
        return { completed: completedItems, total: categoryItems.length };
    };

    const getOverallProgress = () => {
        const totalItems = qualityChecks.length;
        const completedItems = qualityChecks.filter(item => item.status === 'ok' || item.status === 'no-ok' || item.status === 'na').length;
        return { completed: completedItems, total: totalItems };
    };

    const canApprove = () => {
        const overall = getOverallProgress();
        const hasNotes = finalNotes.trim().length > 0;
        const hasInspector = selectedInspector !== '';
        
        // Verificar que todas las categorías tengan al menos un item completado
        const categoriesCompleted = QUALITY_CATEGORIES.every(category => {
            const progress = getCategoryProgress(category.id);
            return progress.completed > 0;
        });
        
        return overall.completed === overall.total && hasNotes && hasInspector && categoriesCompleted;
    };

    const handleSubmit = async (approved: boolean) => {
        if (!canApprove() && approved) {
            (ui as any).showNotification?.('warning', 'Debes completar todas las verificaciones, seleccionar inspector y agregar observaciones');
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('🔍 QualityControlView - Iniciando control de calidad:', {
                workOrderId: workOrder.id,
                approved,
                selectedInspector,
                hasNotes: finalNotes.trim().length > 0,
                completedItems: getOverallProgress().completed,
                totalItems: getOverallProgress().total
            });
            
            const inspector = staffMembers.find(member => member.id === selectedInspector);
            const inspectorName = inspector?.name || 'Inspector de Calidad';

            // Crear entrada de historial con información detallada del checklist
            const qualityChecksData = qualityChecks.map(item => ({
                id: item.id,
                description: item.description,
                category: item.category,
                status: item.status,
                notes: item.notes
            }));
            
            const checklistSummary = qualityChecksData.map(item => 
                `${item.id}:${item.status}${item.notes ? `:${item.notes}` : ''}`
            ).join('|');
            
            const historyEntry = {
                stage: approved ? KanbanStage.LISTO_ENTREGA : KanbanStage.EN_REPARACION,
                date: new Date().toISOString(),
                user: inspectorName,
                notes: approved 
                    ? `Control de Calidad APROBADO por ${inspectorName}. Verificaciones completadas: ${getOverallProgress().completed}/${getOverallProgress().total}. Observaciones: ${finalNotes}`
                    : `Control de Calidad RECHAZADO por ${inspectorName}. Observaciones: ${finalNotes}`,
                imageUrls: [],
                staffMemberId: selectedInspector,
                // Guardar información detallada del checklist
                qualityChecksData: qualityChecksData,
                checklistSummary: checklistSummary
            };

            // Actualizar historial
            console.log('🔍 QualityControlView - Guardando control de calidad:', {
                workOrderId: workOrder.id,
                historyEntry,
                qualityChecks: qualityChecks.map(item => ({
                    id: item.id,
                    description: item.description,
                    status: item.status
                })),
                finalNotes,
                selectedInspector
            });
            await (data as any).handleUpdateWorkOrderHistory(workOrder.id, historyEntry);

            // Guardar resultado final
            setFinalResult({
                isApproved: approved,
                inspectorName,
                inspectionDate: new Date().toLocaleDateString('es-CO')
            });

            // Avanzar o retroceder según el resultado
            if (approved) {
                console.log('🔍 QualityControlView - Aprobando control de calidad, avanzando etapa');
                await data.handleAdvanceStage(workOrder.id, workOrder.stage);
                (ui as any).showNotification?.('success', 'Control de Calidad aprobado. Orden lista para entrega');
            } else {
                console.log('🔍 QualityControlView - Rechazando control de calidad, retrocediendo etapa');
                await data.handleRetreatStage(workOrder.id, workOrder.stage);
                (ui as any).showNotification?.('info', 'Control de Calidad rechazado. Orden regresada a reparación');
            }

            // Mostrar reporte imprimible
            setShowPrintableReport(true);
        } catch (error) {
            console.error('Error en control de calidad:', error);
            (ui as any).showNotification?.('error', 'Error al procesar control de calidad');
        } finally {
            setIsSubmitting(false);
        }
    };

    const overallProgress = getOverallProgress();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-light rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-dark-light border-b border-gray-700 p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Control de Calidad para OT #{workOrder.id}</h2>
                            <p className="text-gray-300 mt-1">
                                Realice la inspección final para garantizar la calidad del trabajo antes de la entrega al cliente.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                // Mostrar mensaje de confirmación antes de salir
                                if (confirm('¿Está seguro de que desea salir del control de calidad? Los cambios no guardados se perderán.')) {
                                    onBack();
                                }
                            }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Icon name="x" className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Inspector Selection */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Inspector de Calidad
                        </label>
                        <select
                            value={selectedInspector}
                            onChange={(e) => setSelectedInspector(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {staffMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name} - {member.role}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Progress Overview */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">Progreso General</span>
                            <span className="text-gray-300">{overallProgress.completed}/{overallProgress.total} verificaciones</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(overallProgress.completed / overallProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-6">
                        {QUALITY_CATEGORIES.map(category => {
                            const categoryItems = qualityChecks.filter(item => item.category === category.id);
                            const progress = getCategoryProgress(category.id);
                            
                            return (
                                <div key={category.id} className="bg-gray-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Icon name={category.icon as any} className="w-5 h-5" />
                                            {category.title}
                                        </h3>
                                        <span className="text-sm text-gray-400">
                                            {progress.completed}/{progress.total} completadas
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {categoryItems.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                                <span className="text-white text-sm font-medium flex-1">
                                                    {item.description}
                                                </span>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => handleStatusChange(item.id, 'ok')}
                                                        className={getStatusButtonClass(item.id, 'ok')}
                                                    >
                                                        OK
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(item.id, 'no-ok')}
                                                        className={getStatusButtonClass(item.id, 'no-ok')}
                                                    >
                                                        NO OK
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(item.id, 'na')}
                                                        className={getStatusButtonClass(item.id, 'na')}
                                                    >
                                                        N/A
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Final Observations */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Observaciones Finales</h3>
                        <div className="relative">
                            <textarea
                                value={finalNotes}
                                onChange={(e) => setFinalNotes(e.target.value)}
                                placeholder="Añadir comentarios sobre los puntos 'NO OK' o cualquier otra observación relevante..."
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                            />
                            <button
                                onClick={() => {
                                    // Aquí podrías agregar lógica adicional para guardar las observaciones
                                    console.log('Guardando observaciones:', finalNotes);
                                }}
                                className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                title="Guardar observaciones"
                            >
                                <Icon name="check-circle" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4 pt-4">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            <Icon name="x" className="w-5 h-5 mr-2" />
                            {isSubmitting ? 'Procesando...' : 'Rechazar'}
                        </button>
                        
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={!canApprove() || isSubmitting}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            <Icon name="check-circle" className="w-5 h-5 mr-2" />
                            {isSubmitting ? 'Procesando...' : 'Aprobar'}
                        </button>
                    </div>

                    {!canApprove() && (
                        <div className="text-center">
                            <p className="text-yellow-400 text-sm">
                                Para aprobar, debes completar todas las verificaciones, seleccionar inspector y agregar observaciones.
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal de Reporte Imprimible */}
                {showPrintableReport && finalResult && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-lg font-semibold">Reporte de Control de Calidad</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const printWindow = window.open('', '_blank');
                                            if (printWindow) {
                                                printWindow.document.write(`
                                                    <!DOCTYPE html>
                                                    <html lang="es">
                                                    <head>
                                                        <meta charset="UTF-8" />
                                                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                                        <title>Reporte de Control de Calidad - ${workOrder.id}</title>
                                                        <script src="https://cdn.tailwindcss.com"></script>
                                                    </head>
                                                    <body>
                                                        ${document.querySelector('.printable-quality-report')?.outerHTML || ''}
                                                    </body>
                                                    </html>
                                                `);
                                                printWindow.document.close();
                                                printWindow.print();
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Icon name="printer" className="w-4 h-4 mr-2" />
                                        Imprimir
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowPrintableReport(false);
                                            onBack();
                                        }}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="printable-quality-report">
                                    <PrintableQualityControlReport
                                        workOrder={workOrder}
                                        client={client || {} as Client}
                                        vehicle={vehicle || {} as Vehicle}
                                        inspector={finalResult.inspectorName}
                                        inspectionDate={new Date().toISOString()}
                                        isApproved={finalResult.isApproved}
                                        notes={`${finalNotes} checklistSummary: ${qualityChecks.map(item => 
                                            `${item.id}:${item.status}${item.notes ? `:${item.notes}` : ''}`
                                        ).join('|')}`}
                                        companyInfo={data.appSettings?.companyInfo || undefined}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QualityControlView;