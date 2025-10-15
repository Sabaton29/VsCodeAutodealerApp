import React, { useState, useContext, useEffect } from 'react';
import { WorkOrder, Quote, Client, Vehicle, Permission, KanbanStage } from '../types';
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
}

interface QualityCheckItem {
    id: string;
    description: string;
    category: 'safety' | 'functionality' | 'appearance' | 'documentation';
    isChecked: boolean;
    notes?: string;
    images?: string[];
}

const QUALITY_CHECK_ITEMS: QualityCheckItem[] = [
    // Seguridad
    { id: 'safety-1', description: 'Verificar que no hay fugas de fluidos', category: 'safety', isChecked: false },
    { id: 'safety-2', description: 'Comprobar funcionamiento de frenos', category: 'safety', isChecked: false },
    { id: 'safety-3', description: 'Verificar luces y señalización', category: 'safety', isChecked: false },
    { id: 'safety-4', description: 'Comprobar dirección y suspensión', category: 'safety', isChecked: false },
    
    // Funcionalidad
    { id: 'func-1', description: 'Motor arranca correctamente', category: 'functionality', isChecked: false },
    { id: 'func-2', description: 'Transmisión funciona sin problemas', category: 'functionality', isChecked: false },
    { id: 'func-3', description: 'Sistema eléctrico operativo', category: 'functionality', isChecked: false },
    { id: 'func-4', description: 'Aire acondicionado/calefacción funciona', category: 'functionality', isChecked: false },
    
    // Apariencia
    { id: 'app-1', description: 'Limpieza general del vehículo', category: 'appearance', isChecked: false },
    { id: 'app-2', description: 'Pintura sin daños adicionales', category: 'appearance', isChecked: false },
    { id: 'app-3', description: 'Interior limpio y ordenado', category: 'appearance', isChecked: false },
    
    // Documentación
    { id: 'doc-1', description: 'Reporte de reparación completo', category: 'documentation', isChecked: false },
    { id: 'doc-2', description: 'Fotografías de evidencia', category: 'documentation', isChecked: false },
    { id: 'doc-3', description: 'Garantía documentada', category: 'documentation', isChecked: false },
];

const QualityControlView: React.FC<QualityControlViewProps> = ({ 
    workOrder, 
    quote, 
    client, 
    vehicle, 
    hasPermission, 
    onBack 
}) => {
    const data = useContext(DataContext);
    const ui = useContext(UIContext);
    
    const [qualityChecks, setQualityChecks] = useState<QualityCheckItem[]>(QUALITY_CHECK_ITEMS);
    const [overallNotes, setOverallNotes] = useState('');
    const [isApproved, setIsApproved] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [showPrintableReport, setShowPrintableReport] = useState(false);
    const [finalResult, setFinalResult] = useState<{
        isApproved: boolean;
        inspectorName: string;
        inspectionDate: string;
    } | null>(null);

    const handleCheckItem = (itemId: string, checked: boolean) => {
        setQualityChecks(prev => 
            prev.map(item => 
                item.id === itemId ? { ...item, isChecked: checked } : item
            )
        );
    };

    const handleItemNotes = (itemId: string, notes: string) => {
        setQualityChecks(prev => 
            prev.map(item => 
                item.id === itemId ? { ...item, notes } : item
            )
        );
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            setSelectedImages(prev => [...prev, ...files]);
            
            // Crear previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'safety': return 'shield-check';
            case 'functionality': return 'cog';
            case 'appearance': return 'eye';
            case 'documentation': return 'document-text';
            default: return 'check-circle';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'safety': return 'text-red-500';
            case 'functionality': return 'text-blue-500';
            case 'appearance': return 'text-green-500';
            case 'documentation': return 'text-purple-500';
            default: return 'text-gray-500';
        }
    };

    const getCategoryTitle = (category: string) => {
        switch (category) {
            case 'safety': return 'Seguridad';
            case 'functionality': return 'Funcionalidad';
            case 'appearance': return 'Apariencia';
            case 'documentation': return 'Documentación';
            default: return 'General';
        }
    };

    const completedChecks = qualityChecks.filter(item => item.isChecked).length;
    const totalChecks = qualityChecks.length;
    const completionPercentage = (completedChecks / totalChecks) * 100;

    const canApprove = completedChecks === totalChecks && overallNotes.trim().length > 0;

    const handleSubmit = async (approved: boolean) => {
        if (!canApprove && approved) {
            ui.showNotification?.('warning', 'Debes completar todas las verificaciones y agregar notas para aprobar');
            return;
        }

        setIsSubmitting(true);
        try {
            // Subir imágenes si las hay
            let uploadedImageUrls: string[] = [];
            if (selectedImages.length > 0) {
                const uploadPromises = selectedImages.map(async (file, index) => {
                    const fileName = `quality_control_${workOrder.id}_${Date.now()}_${index}.${file.name.split('.').pop()}`;
                    const path = `quality-control/${workOrder.id}/${fileName}`;
                    return await data.supabaseService.uploadFileToStorage(file, 'progress-updates', path);
                });
                uploadedImageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];
            }

            // Crear entrada de historial
            const historyEntry = {
                stage: approved ? KanbanStage.LISTO_ENTREGA : KanbanStage.EN_REPARACION,
                timestamp: new Date().toISOString(),
                notes: approved 
                    ? `Control de Calidad APROBADO. Verificaciones completadas: ${completedChecks}/${totalChecks}. Notas: ${overallNotes}`
                    : `Control de Calidad RECHAZADO. Verificaciones completadas: ${completedChecks}/${totalChecks}. Notas: ${overallNotes}`,
                imageUrls: uploadedImageUrls,
                staffMemberId: data.currentUser?.id || 'system',
            };

            // Actualizar historial
            await data.handleUpdateWorkOrderHistory(workOrder.id, historyEntry);

            // Guardar resultado final
            setFinalResult({
                isApproved: approved,
                inspectorName: data.currentUser?.name || 'Inspector de Calidad',
                inspectionDate: new Date().toLocaleDateString('es-CO')
            });

            // Avanzar o retroceder según el resultado
            if (approved) {
                await data.handleAdvanceStage(workOrder.id, workOrder.stage);
                ui.showNotification?.('success', 'Control de Calidad aprobado. Orden lista para entrega');
            } else {
                await data.handleRetreatStage(workOrder.id, workOrder.stage);
                ui.showNotification?.('info', 'Control de Calidad rechazado. Orden regresada a reparación');
            }

            // Mostrar reporte imprimible
            setShowPrintableReport(true);
        } catch (error) {
            console.error('Error en control de calidad:', error);
            ui.showNotification?.('error', 'Error al procesar control de calidad');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = ['safety', 'functionality', 'appearance', 'documentation'];

    return (
        <div className="bg-dark-light rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Control de Calidad</h2>
                    <p className="text-gray-300">
                        Orden: {workOrder.id} | Cliente: {client?.name || 'N/A'} | Vehículo: {vehicle?.make} {vehicle?.model}
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <Icon name="arrow-left" className="w-4 h-4 mr-2" />
                    Volver
                </button>
            </div>

            {/* Progreso general */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Progreso de Verificación</span>
                    <span className="text-gray-300">{completedChecks}/{totalChecks} completadas</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    {completionPercentage.toFixed(0)}% completado
                </p>
            </div>

            {/* Lista de verificaciones por categoría */}
            <div className="space-y-6">
                {categories.map(category => {
                    const categoryItems = qualityChecks.filter(item => item.category === category);
                    const completedInCategory = categoryItems.filter(item => item.isChecked).length;
                    
                    return (
                        <div key={category} className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center mb-4">
                                <Icon 
                                    name={getCategoryIcon(category)} 
                                    className={`w-6 h-6 mr-3 ${getCategoryColor(category)}`}
                                />
                                <h3 className="text-lg font-semibold text-white">
                                    {getCategoryTitle(category)}
                                </h3>
                                <span className="ml-auto text-sm text-gray-400">
                                    {completedInCategory}/{categoryItems.length}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                {categoryItems.map(item => (
                                    <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                                        <input
                                            type="checkbox"
                                            checked={item.isChecked}
                                            onChange={(e) => handleCheckItem(item.id, e.target.checked)}
                                            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded"
                                        />
                                        <div className="flex-1">
                                            <label className="text-white text-sm font-medium">
                                                {item.description}
                                            </label>
                                            <textarea
                                                placeholder="Notas adicionales (opcional)"
                                                value={item.notes || ''}
                                                onChange={(e) => handleItemNotes(item.id, e.target.value)}
                                                className="mt-2 w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Notas generales */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Notas Generales del Control de Calidad</h3>
                <textarea
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    placeholder="Describe el estado general del vehículo después de la reparación..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                />
            </div>

            {/* Subida de imágenes */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Evidencia Fotográfica</h3>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-4 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                />
                
                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            <div className="mt-8 flex justify-center space-x-4">
                <button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                    <Icon name="x-mark" className="w-5 h-5 mr-2" />
                    {isSubmitting ? 'Procesando...' : 'Rechazar'}
                </button>
                
                <button
                    onClick={() => handleSubmit(true)}
                    disabled={!canApprove || isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                    <Icon name="check-circle" className="w-5 h-5 mr-2" />
                    {isSubmitting ? 'Procesando...' : 'Aprobar'}
                </button>
            </div>

            {!canApprove && (
                <p className="text-center text-yellow-400 text-sm mt-4">
                    Completa todas las verificaciones y agrega notas para poder aprobar
                </p>
            )}

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
                                    companyInfo={data.appSettings?.companyInfo || null}
                                    qualityChecks={qualityChecks}
                                    overallNotes={overallNotes}
                                    isApproved={finalResult.isApproved}
                                    inspectorName={finalResult.inspectorName}
                                    inspectionDate={finalResult.inspectionDate}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QualityControlView;
