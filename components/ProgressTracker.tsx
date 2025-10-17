import React, { useState, useContext, useEffect } from 'react';
import { WorkOrder, Quote, QuoteItem, Permission, KanbanStage, Client, Vehicle, QuoteStatus } from '../types';
import { Icon } from './Icon';
import { DataContext } from './DataContext';
import { UIContext } from './UIContext';
import PrintableRepairReport from './PrintableRepairReport';

interface ProgressTrackerProps {
    workOrder: WorkOrder;
    quote: Quote;
    quotes?: Quote[]; // Agregar todas las cotizaciones aprobadas
    client?: Client;
    vehicle?: Vehicle;
    hasPermission: (permission: Permission) => boolean;
    onReportUnforeseenIssue: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Componente para manejar imágenes con fallback a base64
const ImageWithFallback: React.FC<{ url: string; alt: string; className: string }> = ({ url, alt, className }) => {
    const [imageSrc, setImageSrc] = useState<string>(url);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Intentar cargar la imagen directamente primero
        const img = new Image();
        img.onload = () => {
            setImageSrc(url);
            setIsLoading(false);
            setHasError(false);
        };
        img.onerror = async () => {
            console.log('🔄 Imagen falló, verificando URL...');
            try {
                // Verificar qué está devolviendo la URL
                const response = await fetch(url);
                console.log('🔍 Response status:', response.status);
                console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
                
                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    console.log('🔍 Content-Type:', contentType);
                    
                    if (contentType && contentType.startsWith('image/')) {
                        // Es una imagen válida, convertir a base64
                        const blob = await response.blob();
                        const reader = new FileReader();
                        reader.onload = () => {
                            setImageSrc(reader.result as string);
                            setIsLoading(false);
                            setHasError(false);
                            console.log('✅ Imagen convertida a base64 exitosamente');
                        };
                        reader.onerror = () => {
                            setHasError(true);
                            setIsLoading(false);
                            console.error('❌ Error convirtiendo a base64');
                        };
                        reader.readAsDataURL(blob);
                    } else {
                        // No es una imagen, mostrar error
                        setHasError(true);
                        setIsLoading(false);
                        console.error('❌ URL no devuelve una imagen, Content-Type:', contentType);
                        console.error('❌ URL problemática:', url);
                    }
                } else {
                    setHasError(true);
                    setIsLoading(false);
                    console.error('❌ Error en fetch:', response.status, response.statusText);
                    console.error('❌ URL problemática:', url);
                }
            } catch (error) {
                setHasError(true);
                setIsLoading(false);
                console.error('❌ Error en verificación:', error);
                console.error('❌ URL problemática:', url);
            }
        };
        img.src = url;
    }, [url]);

    if (isLoading) {
        return (
            <div className={`${className} bg-gray-700 flex items-center justify-center`}>
                <span className="text-xs text-gray-400">Cargando...</span>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className={`${className} bg-red-900/20 border border-red-600 flex items-center justify-center`}>
                <span className="text-xs text-red-400">Error</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <img 
                src={imageSrc} 
                alt={alt} 
                className={className}
            />
            <button
                onClick={() => {
                    console.log('🔍 URL original:', url);
                    console.log('🔍 URL actual:', imageSrc);
                    window.open(imageSrc, '_blank');
                }}
                className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-blue-700"
                title="Abrir imagen original"
            >
                ?
            </button>
        </div>
    );
};

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ workOrder, quote, quotes = [], client, vehicle, hasPermission, onReportUnforeseenIssue }) => {
    const data = useContext(DataContext);
    const ui = useContext(UIContext);

    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [itemPhotos, setItemPhotos] = useState<{[itemId: string]: File[]}>({});
    const [itemPhotoPreviews, setItemPhotoPreviews] = useState<{[itemId: string]: string[]}>({});
    const [showQualityControlModal, setShowQualityControlModal] = useState(false);
    const [showPrintableReport, setShowPrintableReport] = useState(false);
    
    if (!data || !ui) return null;

    // Early return if no quote
    if (!quote) {
        return (
            <div className="bg-dark-light rounded-xl p-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Icon name="chart-line" className="w-6 h-6 text-brand-red"/>
                    Progreso de la Reparación
                </h2>
                <div className="mt-4 text-gray-400">
                    No hay cotización asociada a esta orden de trabajo.
                </div>
            </div>
        );
    }

    const { handlePostProgressUpdate, handleToggleTaskCompleted, staffMembers } = data;
    const { currentUser } = ui;

    // Obtener todas las cotizaciones aprobadas
    const approvedQuotes = quotes.filter(q => q.status === QuoteStatus.APROBADO);
    
    // Combinar todos los items de todas las cotizaciones aprobadas, evitando duplicados
    const allApprovedItems = approvedQuotes.reduce((acc, q) => {
        const items = (q.items || []).map(item => ({
            ...item,
            // Crear un ID único combinando el ID del item con el ID de la cotización
            uniqueId: `${q.id}-${item.id}`
        }));
        return [...acc, ...items];
    }, [] as (QuoteItem & { uniqueId: string })[]);
    
    // Calcular totales de todas las cotizaciones aprobadas
    const totalSubtotal = approvedQuotes.reduce((sum, q) => sum + (q.subtotal || 0), 0);
    const totalTaxAmount = approvedQuotes.reduce((sum, q) => sum + (q.taxAmount || 0), 0);
    const totalAmount = approvedQuotes.reduce((sum, q) => sum + (q.total || 0), 0);
    
    // Debug: verificar cotizaciones aprobadas
    console.log('🔍 ProgressTracker - approvedQuotes:', approvedQuotes.map(q => ({ id: q.id, status: q.status, itemsCount: q.items?.length || 0, subtotal: q.subtotal, total: q.total })));
    console.log('🔍 ProgressTracker - allApprovedItems:', allApprovedItems.length, 'items total');
    console.log('🔍 ProgressTracker - totalSubtotal:', totalSubtotal, 'totalTaxAmount:', totalTaxAmount, 'totalAmount:', totalAmount);
    
    // Debug: verificar datos de imprevistos y fotos
    console.log('🔍 ProgressTracker - workOrder.unforeseenIssues:', workOrder.unforeseenIssues);
    console.log('🔍 ProgressTracker - workOrder.unforeseenIssues length:', workOrder.unforeseenIssues?.length || 0);
    
    // Debug: verificar URLs de fotos en imprevistos
    if (workOrder.unforeseenIssues && workOrder.unforeseenIssues.length > 0) {
        workOrder.unforeseenIssues.forEach((issue, index) => {
            console.log(`🔍 ProgressTracker - Imprevisto ${index + 1}:`, issue.description);
            console.log(`🔍 ProgressTracker - Imprevisto ${index + 1} imageUrls:`, issue.imageUrls);
            if (issue.imageUrls && issue.imageUrls.length > 0) {
                issue.imageUrls.forEach((url, urlIndex) => {
                    console.log(`🔍 ProgressTracker - Imprevisto ${index + 1} URL ${urlIndex + 1}:`, url);
                    console.log(`🔍 ProgressTracker - Imprevisto ${index + 1} URL ${urlIndex + 1} length:`, url.length);
                    console.log(`🔍 ProgressTracker - Imprevisto ${index + 1} URL ${urlIndex + 1} starts with https:`, url.startsWith('https://'));
                });
            } else {
                console.log(`🔍 ProgressTracker - Imprevisto ${index + 1} NO TIENE FOTOS`);
            }
        });
    }
    
    // Debug: verificar fotos en items
    const itemsWithPhotos = allApprovedItems.filter(item => item.imageUrls && item.imageUrls.length > 0);
    console.log('🔍 ProgressTracker - itemsWithPhotos:', itemsWithPhotos.length, 'items with photos');
    console.log('🔍 ProgressTracker - itemsWithPhotos details:', itemsWithPhotos.map(item => ({ 
        id: item.id, 
        description: item.description, 
        imageUrls: item.imageUrls 
    })));
    
    // Debug: verificar URLs completas
    itemsWithPhotos.forEach(item => {
        console.log('🔍 ProgressTracker - Item:', item.description);
        console.log('🔍 ProgressTracker - imageUrls:', item.imageUrls);
        item.imageUrls.forEach((url, index) => {
            console.log(`🔍 ProgressTracker - URL ${index + 1}:`, url);
            console.log(`🔍 ProgressTracker - URL ${index + 1} length:`, url.length);
            console.log(`🔍 ProgressTracker - URL ${index + 1} starts with https:`, url.startsWith('https://'));
        });
    });
    
    // Verificar si todas las tareas están completas
    const allTasksCompleted = allApprovedItems.every(item => item.isCompleted);
    const hasQuote = approvedQuotes.length > 0;

    // Detectar cuando todas las tareas están completas - SOLO mostrar notificación, NO abrir modal automáticamente
    useEffect(() => {
        if (hasQuote && allTasksCompleted) {
            // Solo mostrar notificación, no abrir modal automáticamente
            const hasShownNotification = sessionStorage.getItem(`quality-control-notification-${workOrder.id}`);
            if (!hasShownNotification) {
                console.log('✅ Todas las tareas completadas. El usuario puede iniciar control de calidad manualmente.');
                sessionStorage.setItem(`quality-control-notification-${workOrder.id}`, 'true');
            }
        }
    }, [allTasksCompleted, hasQuote, workOrder.id]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setFilePreviews(prev => [...prev, ...newPreviews]);
        }
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, i) => i !== indexToRemove));
        setFilePreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[indexToRemove]);
            newPreviews.splice(indexToRemove, 1);
            return newPreviews;
        });
    };

    const handleItemPhotoChange = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            console.log('🔍 handleItemPhotoChange - itemId:', itemId, 'files:', newFiles.length);
            console.log('🔍 handleItemPhotoChange - file details:', newFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
            
            setItemPhotos(prev => {
                const updated = {
                    ...prev,
                    [itemId]: [...(prev[itemId] || []), ...newFiles]
                };
                console.log('🔍 handleItemPhotoChange - updated itemPhotos:', updated);
                return updated;
            });
            
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setItemPhotoPreviews(prev => ({
                ...prev,
                [itemId]: [...(prev[itemId] || []), ...newPreviews]
            }));
        }
    };

    const removeItemPhoto = (itemId: string, photoIndex: number) => {
        setItemPhotos(prev => ({
            ...prev,
            [itemId]: prev[itemId]?.filter((_, index) => index !== photoIndex) || []
        }));
        setItemPhotoPreviews(prev => {
            const newPreviews = { ...prev };
            if (newPreviews[itemId]) {
                URL.revokeObjectURL(newPreviews[itemId][photoIndex]);
                newPreviews[itemId] = newPreviews[itemId].filter((_, index) => index !== photoIndex);
            }
            return newPreviews;
        });
    };

    const handlePostUpdate = async() => {
        if (!notes.trim() && files.length === 0) return;
        
        // Combinar todas las fotos (generales + por item)
        const allFiles = [...files];
        Object.values(itemPhotos).forEach(itemFiles => {
            allFiles.push(...itemFiles);
        });
        
        console.log('🔍 ProgressTracker - handlePostUpdate - allFiles:', allFiles.length, 'files');
        console.log('🔍 ProgressTracker - handlePostUpdate - files details:', allFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
        
        await handlePostProgressUpdate(workOrder.id, notes, allFiles);

        setNotes('');
        setFiles([]);
        setFilePreviews([]);
        filePreviews.forEach(url => URL.revokeObjectURL(url));
        
        // Limpiar fotos de items
        setItemPhotos({});
        Object.values(itemPhotoPreviews).forEach(urls => {
            urls.forEach(url => URL.revokeObjectURL(url));
        });
        setItemPhotoPreviews({});
    };

    const staffMap = new Map(staffMembers.map(s => [s.id, s]));

    return (
        <div className="bg-dark-light rounded-xl p-5 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3"><Icon name="chart-line" className="w-6 h-6 text-brand-red"/> Progreso de la Reparación</h2>
            
            {/* Unforeseen Issues Section */}
            {workOrder.unforeseenIssues && workOrder.unforeseenIssues.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Icon name="exclamation-triangle" className="w-5 h-5 text-orange-400"/>
                        Constancia del Imprevisto ({workOrder.unforeseenIssues.length})
                    </h3>
                    <div className="space-y-3">
                        {workOrder.unforeseenIssues.map((issue, index) => (
                            <div key={index} className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-orange-300">{issue.description}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-orange-400 bg-orange-800/30 px-2 py-1 rounded">
                                            {new Date(issue.timestamp).toLocaleDateString('es-CO')}
                                        </span>
                                        <button
                                            onClick={() => {
                                                // Crear ventana modal para ver detalles del imprevisto
                                                const modal = document.createElement('div');
                                                modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                                modal.innerHTML = `
                                                    <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                                        <div class="flex justify-between items-center p-4 border-b">
                                                            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Detalle del Imprevisto</h3>
                                                            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                                                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div class="p-4 space-y-4">
                                                            <div>
                                                                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">Descripción</h4>
                                                                <p class="text-gray-600 dark:text-gray-300">${issue.description}</p>
                                                            </div>
                                                            <div class="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 class="font-semibold text-gray-800 dark:text-white mb-1">Reportado por</h4>
                                                                    <p class="text-gray-600 dark:text-gray-300">${issue.reportedById || 'Sistema'}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 class="font-semibold text-gray-800 dark:text-white mb-1">Fecha</h4>
                                                                    <p class="text-gray-600 dark:text-gray-300">${new Date(issue.timestamp).toLocaleString('es-CO')}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 class="font-semibold text-gray-800 dark:text-white mb-1">Prioridad</h4>
                                                                    <p class="text-gray-600 dark:text-gray-300">${issue.priority || 'No especificado'}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 class="font-semibold text-gray-800 dark:text-white mb-1">Estado</h4>
                                                                    <p class="text-gray-600 dark:text-gray-300">${issue.notes || 'Pendiente'}</p>
                                                                </div>
                                                            </div>
                                                            ${issue.imageUrls && issue.imageUrls.length > 0 ? `
                                                                <div>
                                                                    <h4 class="font-semibold text-gray-800 dark:text-white mb-2">Evidencia Fotográfica</h4>
                                                                    <div class="grid grid-cols-2 gap-2">
                                                                        ${issue.imageUrls.map((url, imgIndex) => `
                                                                            <div class="text-center">
                                                                                <img src="${url}" alt="Evidencia ${imgIndex + 1}" class="w-full h-32 object-cover rounded border border-gray-300" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"/>
                                                                                <div class="w-full h-32 border border-gray-300 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500" style="display: none;">
                                                                                    Error al cargar imagen
                                                                                </div>
                                                                                <p class="text-xs mt-1">Evidencia ${imgIndex + 1}</p>
                                                                                <button onclick="window.open('${url}', '_blank')" class="text-xs text-blue-600 hover:text-blue-800 mt-1">Abrir imagen</button>
                                                                            </div>
                                                                        `).join('')}
                                                                    </div>
                                                                </div>
                                                            ` : ''}
                                                        </div>
                                                    </div>
                                                `;
                                                document.body.appendChild(modal);
                                            }}
                                            className="text-xs text-orange-400 hover:text-orange-300 bg-orange-800/30 px-2 py-1 rounded hover:bg-orange-800/50 transition-colors"
                                        >
                                            Ver Detalle
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-300 space-y-1">
                                    <p><strong>Reportado por:</strong> {issue.reportedById || 'Sistema'}</p>
                                    <p><strong>Prioridad:</strong> {issue.priority || 'No especificado'}</p>
                                    <p><strong>Estado:</strong> {issue.notes || 'Pendiente'}</p>
                                </div>
                                {issue.imageUrls && issue.imageUrls.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-orange-400 mb-2">Evidencia Fotográfica ({issue.imageUrls.length} foto(s)):</p>
                                        <div className="flex gap-2">
                                            {issue.imageUrls.map((url, imgIndex) => (
                                                <ImageWithFallback 
                                                    key={imgIndex}
                                                    url={url}
                                                    alt={`Evidencia ${imgIndex + 1}`}
                                                    className="w-16 h-16 object-cover rounded border border-orange-600"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Task Checklist */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">Tareas Pendientes</h3>
                    {hasQuote && allTasksCompleted && (
                        <button
                            onClick={() => setShowQualityControlModal(true)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                            <Icon name="check-circle" className="w-3 h-3" />
                            Control de Calidad
                        </button>
                    )}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {allApprovedItems.map(item => (
                        <div key={item.uniqueId} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${item.isCompleted ? 'bg-green-900/20 border-green-700' : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'} ${hasPermission('toggle:task_completed') ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                            {/* Checkbox */}
                            <div className="flex-shrink-0 pt-0.5">
                                <input
                                    type="checkbox"
                                    checked={!!item.isCompleted}
                                    onChange={async (e) => {
                                        const files = itemPhotos[item.id] || [];
                                        console.log('🔍 Checkbox onChange - itemId:', item.id, 'uniqueId:', item.uniqueId, 'isCompleted:', e.target.checked, 'files to upload:', files.length);
                                        console.log('🔍 Checkbox onChange - files details:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
                                        
                                        // Subir fotos ANTES de marcar como completada
                                        if (files.length > 0) {
                                            console.log('🔍 Checkbox onChange - Subiendo fotos antes de marcar como completada');
                                            await handleToggleTaskCompleted(workOrder.id, item.id, e.target.checked, files);
                                            
                                            // NO limpiar las fotos - mantenerlas visibles para que el usuario vea que se subieron
                                            console.log('🔍 Checkbox onChange - Fotos subidas exitosamente, manteniendo preview');
                                        } else {
                                            // Si no hay fotos, solo marcar como completada
                                            await handleToggleTaskCompleted(workOrder.id, item.id, e.target.checked);
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-red focus:ring-brand-red focus:ring-2"
                                    disabled={!hasPermission('toggle:task_completed')}
                                />
                            </div>
                            
                            {/* Contenido principal */}
                            <div className="flex-1 min-w-0">
                                {/* Descripción y badge */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${item.isCompleted ? 'line-through text-green-300' : 'text-white'}`}>
                                            {item.description}
                                        </span>
                                        {item.suppliedByClient && (
                                            <span className="text-xs font-semibold bg-blue-800/50 text-blue-200 px-2 py-1 rounded-full flex-shrink-0">
                                                Cliente Suministra
                                            </span>
                                        )}
                                        {/* Etiqueta de Imprevisto si el item está relacionado con imprevistos */}
                                        {workOrder.unforeseenIssues && workOrder.unforeseenIssues.some(issue => 
                                            (issue.description && item.description && 
                                             issue.description.toLowerCase().includes(item.description.toLowerCase())) ||
                                            (issue.description && item.description && 
                                             item.description.toLowerCase().includes(issue.description.toLowerCase()))
                                        ) && (
                                            <span className="text-xs font-semibold bg-orange-800/50 text-orange-200 px-2 py-1 rounded-full flex-shrink-0 flex items-center gap-1">
                                                <Icon name="exclamation-triangle" className="w-3 h-3"/>
                                                Imprevisto
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Detalles del item */}
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                                    <span>Cantidad: {item.quantity}</span>
                                    <span>Precio: ${item.unitPrice.toLocaleString()}</span>
                                    {item.discount > 0 && (
                                        <span className="text-orange-400">Descuento: {item.discount}%</span>
                                    )}
                                </div>
                                
                                {/* Fotos del item */}
                                <div className="item-photos">
                                    {/* Mostrar botón de adjuntar foto solo si la tarea NO está completada */}
                                    {!item.isCompleted && (
                                        <label 
                                            htmlFor={`item-photo-${item.id}`} 
                                            className="text-xs text-gray-300 hover:text-white cursor-pointer flex items-center gap-1 no-print"
                                            onClick={() => console.log('🔍 Click en Adjuntar foto para item:', item.id, item.description)}
                                        >
                                            <Icon name="camera" className="w-3 h-3" />
                                            Adjuntar foto
                                        </label>
                                    )}
                                    
                                    <input 
                                        id={`item-photo-${item.id}`} 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => handleItemPhotoChange(item.id, e)} 
                                    />
                                    
                                    {/* Preview de fotos del item - mostrar siempre si hay fotos */}
                                    {(itemPhotoPreviews[item.id] && itemPhotoPreviews[item.id].length > 0) && (
                                        <div className="flex gap-2 mt-2">
                                            {itemPhotoPreviews[item.id].map((preview, photoIndex) => (
                                                <div key={photoIndex} className="relative">
                                                    <img 
                                                        src={preview} 
                                                        alt={`Foto ${photoIndex + 1}`} 
                                                        className="w-12 h-12 object-cover rounded border border-gray-600"
                                                    />
                                                    {/* Solo mostrar botón de eliminar si la tarea NO está completada */}
                                                    {!item.isCompleted && (
                                                        <button
                                                            onClick={() => removeItemPhoto(item.id, photoIndex)}
                                                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-700 no-print"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Mostrar fotos guardadas de la base de datos si existen */}
                                    {item.imageUrls && item.imageUrls.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-xs text-green-400">✅ Fotos guardadas:</span>
                                            {item.imageUrls.map((url, photoIndex) => (
                                                <ImageWithFallback 
                                                    key={photoIndex}
                                                    url={url}
                                                    alt={`Foto guardada ${photoIndex + 1}`}
                                                    className="w-12 h-12 object-cover rounded border border-green-600"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Log */}
            <div>
                <h3 className="font-bold text-white mb-3">Registro de Actividad</h3>
                <div className="space-y-4">
                     {/* Post Update Form */}
                    {hasPermission('post:progress_update') && (
                        <div className="flex items-start gap-3">
                            <img src={currentUser?.avatarUrl} alt={currentUser?.name} className="w-8 h-8 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Escribe un avance... ¿Falta un repuesto? ¿Terminaste una tarea importante?"
                                    className="w-full text-sm p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-brand-red focus:border-brand-red text-white"
                                ></textarea>
                                {filePreviews.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {filePreviews.map((url, index) => (
                                            <div key={url} className="relative group">
                                                <img src={url} alt={`Preview ${index}`} className="w-full h-16 object-cover rounded" />
                                                <button onClick={() => handleRemoveFile(index)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="x" className="w-3 h-3"/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <label htmlFor="progress-file-upload" className="flex items-center gap-2 text-xs text-gray-300 hover:text-white cursor-pointer">
                                        <Icon name="paperclip" className="w-4 h-4"/> Adjuntar Foto
                                    </label>
                                    <input id="progress-file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                    <div className="flex items-center gap-2">
                                        {hasPermission('report:unforeseen_issue') && workOrder.stage === KanbanStage.EN_REPARACION && (
                                            <button onClick={onReportUnforeseenIssue} className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-500">
                                                <Icon name="exclamation-triangle" className="w-4 h-4 inline-block -mt-0.5 mr-1" />
                                                Reportar Imprevisto
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Feed */}
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {workOrder.progressLog?.slice().reverse().map(entry => {
                            const user = staffMap.get(entry.userId);
                            return (
                                <div key={entry.id} className="flex items-start gap-3">
                                    <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full" />
                                    <div className="flex-1 bg-black dark:bg-gray-900/20 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-bold text-white">{entry.userName}</span>
                                            <span className="text-gray-400">{entry.userRole}</span>
                                            <span className="text-gray-500">· {new Date(entry.timestamp).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{entry.notes}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Botón de imprimir reporte */}
                    <div className="flex justify-center pt-4 border-t border-gray-700">
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
                                            <title>Reporte de Reparación - ${workOrder.id}</title>
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
                                            <div class="bg-white text-black p-8 font-sans shadow-lg mx-auto my-8" style="font-family: 'sans-serif'; width: 210mm; min-height: 297mm;">
                                                <!-- Header IDÉNTICO al diagnóstico -->
                                                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 15px;">
                                                    <!-- Sección izquierda: Logotipo ampliado -->
                                                    <div style="flex: 1; text-align: left; max-width: 50%;">
                                                        <img 
                                                            src="${data.appSettings?.companyInfo?.logoUrl || '/images/company/logo.png'}" 
                                                            alt="AUTO DEALER" 
                                                            style="height: 150px; width: auto; display: block; max-width: 100%; object-fit: contain;"
                                                            onerror="console.log('Error loading logo:', this.src); this.src='/images/company/logo.png';"
                                                        />
                                                    </div>
                                                    
                                                    <!-- Sección derecha: Título y detalles -->
                                                    <div style="flex: 1; text-align: right; max-width: 50%;">
                                                        <h1 style="margin: 0; font-size: 20px; font-weight: bold;">Reporte de Reparación</h1>
                                                        <p style="margin: 5px 0 0 0; font-size: 14px;">Orden de Trabajo: <span style="font-weight: bold">${workOrder.id}</span></p>
                                                        <p style="margin: 0; font-size: 14px;">Fecha: <span style="font-weight: bold">${new Date().toLocaleDateString('es-CO')}</span></p>
                                                    </div>
                                                </div>
                                                <hr style="border: 1px solid #000; margin: 15px 0;" />

                                                <!-- Client & Vehicle Info IDÉNTICO al diagnóstico -->
                                                <div class="grid grid-cols-2 gap-x-8 mt-6 border-b border-black pb-4">
                                                    <div>
                                                        <h3 class="font-bold text-lg mb-2">Datos del Cliente</h3>
                                                        <div>
                                                            <span class="text-xs font-semibold text-gray-600">Nombre:</span>
                                                            <p class="text-sm text-black">${client?.name || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span class="text-xs font-semibold text-gray-600">Identificación:</span>
                                                            <p class="text-sm text-black">${client ? `${client.idType || ''} ${client.idNumber || ''}`.trim() : 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span class="text-xs font-semibold text-gray-600">Teléfono:</span>
                                                            <p class="text-sm text-black">${client?.phone || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span class="text-xs font-semibold text-gray-600">Email:</span>
                                                            <p class="text-sm text-black">${client?.email || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 class="font-bold text-lg mb-2">Datos del Vehículo</h3>
                                                        <div>
                                                            <span class="text-xs font-semibold text-gray-600">Marca/Modelo:</span>
                                                            <p class="text-sm text-black">${vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim() : 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span class="text-xs font-semibold text-gray-600">Placa:</span>
                                                            <p class="text-sm text-black">${vehicle?.plate || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span class="text-xs font-semibold text-gray-600">Año:</span>
                                                            <p class="text-sm text-black">${vehicle?.year || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span class="text-xs font-semibold text-gray-600">Kilometraje:</span>
                                                            <p class="text-sm text-black">${workOrder.mileage || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- TAREAS DE REPARACIÓN con estilo IDÉNTICO al diagnóstico -->
                                                <div class="mt-6 space-y-4 text-[10px]">
                                                    <div class="break-inside-avoid">
                                                        <h3 class="font-bold text-sm mb-1 bg-gray-200 p-1">TAREAS DE REPARACIÓN</h3>
                                                        <table class="w-full border-collapse">
                                                            <thead class="text-[10px] uppercase bg-gray-200">
                                                                <tr>
                                                                    <th class="p-1 border border-gray-300 w-[40%]">Descripción</th>
                                                                    <th class="p-1 border border-gray-300 text-center">Cant.</th>
                                                                    <th class="p-1 border border-gray-300 text-center">Precio Unit.</th>
                                                                    <th class="p-1 border border-gray-300 text-center">Descuento</th>
                                                                    <th class="p-1 border border-gray-300 text-center">Total</th>
                                                                    <th class="p-1 border border-gray-300 text-center">Estado</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                ${allApprovedItems.map(item => `
                                                                    <tr>
                                                                        <td class="p-1 border border-gray-300 font-medium">
                                                                            ${item.description}
                                                                            ${item.suppliedByClient ? '<br><small style="color: #2563eb; font-size: 9px;">Cliente Suministra</small>' : ''}
                                                                            ${item.imageUrls && item.imageUrls.length > 0 ? `
                                                                                <br><small style="color: #059669; font-weight: bold; font-size: 9px;">📷 ${item.imageUrls.length} foto(s)</small>
                                                                            ` : ''}
                                                                        </td>
                                                                        <td class="p-1 border border-gray-300 text-center">${item.quantity}</td>
                                                                        <td class="p-1 border border-gray-300 text-center">$${item.unitPrice.toLocaleString()}</td>
                                                                        <td class="p-1 border border-gray-300 text-center">${item.discount || 0}%</td>
                                                                        <td class="p-1 border border-gray-300 text-center font-bold">$${((item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100)).toLocaleString()}</td>
                                                                        <td class="p-1 border border-gray-300 text-center">${item.isCompleted ? '✓' : '☐'}</td>
                                                                    </tr>
                                                                `).join('')}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <!-- Resumen Financiero -->
                                                <div class="mt-6 border border-gray-300 p-2">
                                                    <h3 class="font-bold text-sm mb-2">RESUMEN FINANCIERO</h3>
                                                    <div class="grid grid-cols-2 gap-x-4 text-xs">
                                                        <div>
                                                            <div class="flex justify-between mb-1">
                                                                <span>Subtotal:</span>
                                                                <span class="font-bold">$${totalSubtotal.toLocaleString()}</span>
                                                            </div>
                                                            <div class="flex justify-between mb-1">
                                                                <span>IVA:</span>
                                                                <span class="font-bold">$${totalTaxAmount.toLocaleString()}</span>
                                                            </div>
                                                            <div class="flex justify-between font-bold text-sm border-t border-gray-300 pt-1">
                                                                <span>TOTAL:</span>
                                                                <span style="color: #dc2626;">$${totalAmount.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div class="text-xs">
                                                                <span class="font-semibold">Notas:</span>
                                                                <p class="italic mt-1">${(workOrder as any).notes || 'No se añadieron notas adicionales.'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                ${workOrder.unforeseenIssues && workOrder.unforeseenIssues.length > 0 ? `
                                                <!-- Constancia del Imprevisto -->
                                                <div class="mt-6 border border-orange-300 p-3 bg-orange-50">
                                                    <h3 class="font-bold text-sm mb-3 text-orange-800">CONSTANCIA DEL IMPREVISTO</h3>
                                                    ${workOrder.unforeseenIssues.map(issue => `
                                                        <div class="mb-3 p-2 bg-orange-100 rounded border border-orange-200">
                                                            <div class="text-xs">
                                                                <div class="font-semibold text-orange-900">${issue.description}</div>
                                                                <div class="text-orange-700 mt-1">
                                                                    <strong>Reportado por:</strong> ${issue.reportedById || 'Sistema'}<br>
                                                                    <strong>Fecha:</strong> ${new Date(issue.timestamp).toLocaleDateString('es-CO')}<br>
                                                                    <strong>Impacto:</strong> ${issue.priority || 'No especificado'}<br>
                                                                    <strong>Acción tomada:</strong> ${issue.notes || 'Pendiente'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                                ` : ''}

                                                ${(() => {
                                                    // Recopilar todas las fotos de las tareas
                                                    const allTaskPhotos = [];
                                                    allApprovedItems.forEach(item => {
                                                        if (item.imageUrls && item.imageUrls.length > 0) {
                                                            item.imageUrls.forEach(url => {
                                                                allTaskPhotos.push({
                                                                    url: url,
                                                                    description: item.description,
                                                                    completed: item.isCompleted
                                                                });
                                                            });
                                                        }
                                                    });
                                                    
                                                    if (allTaskPhotos.length > 0) {
                                                        return `
                                                            <div class="mt-4 border border-gray-300 p-2">
                                                                <p class="font-bold text-sm">Evidencia Fotográfica:</p>
                                                                <div class="grid grid-cols-4 gap-2 mt-1">
                                                                    ${allTaskPhotos.map(photo => `
                                                                        <div class="text-center">
                                                                            <img src="${photo.url}" alt="${photo.description}" class="w-full h-auto border border-gray-300" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"/>
                                                                            <div class="w-full h-20 border border-gray-300 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500" style="display: none;">
                                                                                Error al cargar imagen
                                                                            </div>
                                                                            <p class="text-xs mt-1">${photo.description}</p>
                                                                            <p class="text-xs ${photo.completed ? 'text-green-600' : 'text-gray-600'}">
                                                                                ${photo.completed ? '✅ Completada' : '⏳ Pendiente'}
                                                                            </p>
                                                                        </div>
                                                                    `).join('')}
                                                                </div>
                                                            </div>
                                                        `;
                                                    }
                                                    return '<div class="mt-4 border border-gray-300 p-2"><p class="font-bold text-sm text-gray-500">Evidencia Fotográfica: No hay fotos disponibles</p></div>';
                                                })()}

                                                <!-- Signatures IDÉNTICAS al diagnóstico -->
                                                <div class="mt-20 grid grid-cols-2 gap-x-12 pt-8">
                                                    <div class="border-t border-black pt-2 text-center">
                                                        <p class="text-sm font-semibold">Firma del Técnico</p>
                                                        <p class="text-xs text-gray-600">Autodealer Taller</p>
                                                    </div>
                                                    <div class="border-t border-black pt-2 text-center">
                                                        <p class="text-sm font-semibold">Firma Asesor de Servicio</p>
                                                        <p class="text-xs text-gray-600">Autodealer Taller</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </body>
                                        </html>
                                    `);
                                    
                                    // Imprimir después de cargar
                                    printWindow.onload = () => {
                                        printWindow.print();
                                    };
                                }
                            }}
                            className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Icon name="printer" className="w-4 h-4" />
                            Imprimir Reporte de Reparación
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Modal de Control de Calidad */}
            {showQualityControlModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
                        <div className="text-center">
                            <Icon name="check-circle" className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                ¡Todas las tareas completadas!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                ¿Deseas enviar la orden de trabajo a Control de Calidad para revisión final?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowQualityControlModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    No, continuar trabajando
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            console.log('🔍 Enviando a control de calidad...');
                                            await data.handleAdvanceStage(workOrder.id, workOrder.stage);
                                            console.log('✅ Orden enviada a Control de Calidad exitosamente');
                                            setShowQualityControlModal(false);
                                            
                                            // Mostrar notificación de éxito
                                            console.log('✅ Orden enviada a Control de Calidad exitosamente');
                                        } catch (error) {
                                            console.error('❌ Error enviando a control de calidad:', error);
                                        }
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Sí, enviar a Control de Calidad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Reporte Imprimible */}
            {showPrintableReport && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-800">Reporte de Reparación - {workOrder.id}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Icon name="printer" className="w-4 h-4" />
                                    Imprimir
                                </button>
                                <button
                                    onClick={() => setShowPrintableReport(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <PrintableRepairReport
                                workOrder={workOrder}
                                quote={quote}
                                client={client || {} as any}
                                vehicle={vehicle || {} as any}
                                companyInfo={data.appSettings?.companyInfo || null}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressTracker;