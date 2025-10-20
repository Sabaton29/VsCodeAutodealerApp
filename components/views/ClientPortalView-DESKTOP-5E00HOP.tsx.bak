import React, { useContext, useEffect, useState, useMemo } from 'react';
import { renderToString } from 'react-dom/server.browser';
import { DataContext } from '../DataContext';
import { WorkOrder, Quote, QuoteStatus, KanbanStage, Client, Vehicle, AppSettings, ChecklistStatus, Invoice, WorkOrderStatus } from '../../types';
import { Icon } from '../Icon';
import { KANBAN_STAGES_ORDER, QUOTE_STATUS_DISPLAY_CONFIG } from '../../constants';
import ImageGallery from '../ImageGallery';
import PrintableInvoice from '../PrintableInvoice';

interface ClientPortalViewProps {
    workOrderId: string;
    token: string | null;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const StatusBar: React.FC<{ currentStage: KanbanStage }> = ({ currentStage }) => {
    const activeIndex = KANBAN_STAGES_ORDER.indexOf(currentStage);

    return (
        <div className="flex items-center justify-between space-x-2 overflow-x-auto p-2">
            {KANBAN_STAGES_ORDER.map((stage, index) => {
                const isActive = index === activeIndex;
                const isCompleted = index < activeIndex;
                return (
                    <div key={stage} className="flex-1 text-center">
                        <div className={`text-xs font-bold ${isActive ? 'text-brand-red' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                            {stage}
                        </div>
                        <div className={`mt-2 h-1 rounded-full ${isActive || isCompleted ? 'bg-brand-red' : 'bg-gray-700'}`}></div>
                    </div>
                );
            })}
        </div>
    );
};


const ClientPortalView: React.FC<ClientPortalViewProps> = ({ workOrderId, token }) => {
    const dataContext = useContext(DataContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
    const [actionTaken, setActionTaken] = useState<'approved' | 'rejected' | null>(null);

    useEffect(() => {
        if (!dataContext || dataContext.isLoading) return;

        setIsLoading(true);
        setError(null);
        setAppSettings(dataContext.appSettings);

        if (!token) {
            setError('Token de acceso no proporcionado.');
            setIsLoading(false);
            return;
        }

        const foundWO = dataContext.workOrders.find(wo => wo.id === workOrderId);

        if (!foundWO) {
            setError('Orden de trabajo no encontrada o el enlace no es válido.');
            setIsLoading(false);
            return;
        }
        
        if (foundWO.publicAccessToken !== token) {
            setError('Token de acceso inválido. Por favor, utilice el enlace correcto proporcionado por su asesor.');
            setIsLoading(false);
            return;
        }

        setWorkOrder(foundWO);
        setClient(dataContext.clients.find(c => c.id === foundWO.client_id) || null);
        setVehicle(dataContext.vehicles.find(v => v.id === foundWO.vehicle_id) || null);
        
        const primaryQuote = dataContext.quotes.find(q => (foundWO.linkedQuoteIds || []).includes(q.id));
        setQuote(primaryQuote || null);
        
        const foundInvoice = dataContext.invoices.find(i => i.workOrderId === foundWO.id);
        setInvoice(foundInvoice || null);

        setIsLoading(false);
    }, [workOrderId, token, dataContext]);

    const attentionPoints = useMemo(() => {
        if (!workOrder?.diagnosticData) return [];
        const points = [];
        for (const sectionTitle in workOrder.diagnosticData) {
            const section = workOrder.diagnosticData[sectionTitle];
            for (const item in section.items) {
                const status = section.items[item];
                if ([ChecklistStatus.MAL, ChecklistStatus.MANTEN, ChecklistStatus.CAMBIO].includes(status)) {
                    points.push({ item, section: sectionTitle, status });
                }
            }
            if (section.customItems) {
                for (const customItem of section.customItems) {
                     if ([ChecklistStatus.MAL, ChecklistStatus.MANTEN, ChecklistStatus.CAMBIO].includes(customItem.status) && customItem.name) {
                        points.push({ item: customItem.name, section: sectionTitle, status: customItem.status });
                    }
                }
            }
        }
        return points;
    }, [workOrder?.diagnosticData]);
    
    const galleryImages = useMemo(() => {
        if (!workOrder) return [];
        const allImages: { src: string; type: 'Ingreso' | 'Avance' | 'Entrega' | 'Diagnóstico'; timestamp: string; notes?: string }[] = [];

        (workOrder.entryEvidenceImageUrls || []).forEach(url => {
            allImages.push({ src: url, type: 'Ingreso', timestamp: workOrder.createdAt, notes: 'Evidencia de Ingreso' });
        });
        
        if (workOrder.diagnosticData) {
            const diagnosticDate = (workOrder.history || []).find(h => h.stage === 'Pendiente Cotización')?.date || workOrder.createdAt;
            Object.entries(workOrder.diagnosticData).forEach(([sectionTitle, sectionData]) => {
                (sectionData.imageUrls || []).forEach(url => {
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

        return allImages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [workOrder]);

    const handleApprove = async() => {
        if (!quote || !dataContext) return;
        await dataContext.handleSaveQuote({ ...quote, status: QuoteStatus.APROBADO }, 'Cliente (Portal)');
        setActionTaken('approved');
    };

    const handleReject = async() => {
        if (!quote || !dataContext) return;
        await dataContext.handleRejectQuote(quote.id, 'Cliente (Portal)');
        setActionTaken('rejected');
    };
    
    const handlePrintInvoice = () => {
        if (!invoice || !client || !vehicle) {
            alert('Faltan datos para generar la factura.');
            return;
        }

        const reportHtml = renderToString(<PrintableInvoice invoice={invoice} client={client} vehicle={vehicle} workOrder={workOrder || undefined} appSettings={appSettings} />);
        const fullHtml = `
            <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8" /><title>Factura ${invoice.id}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Impact&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style> body { font-family: 'Inter', sans-serif; } </style>
            <script>tailwind.config = { theme: { extend: { fontFamily: { heading: ['Impact', 'sans-serif'], sans: ['Inter', 'sans-serif'] }, colors: { brand: { red: '#C8102E' } } } } }</script>
            </head><body>${reportHtml}</body></html>`;

        const printWindow = window.open('', '_blank');
        printWindow?.document.write(fullHtml);
        printWindow?.document.close();
    };

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-dark text-white"><p>Cargando portal del cliente...</p></div>;
    }
    
    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-dark text-white p-4">
                <div className="text-center bg-dark-light p-8 rounded-lg shadow-lg max-w-md">
                    <Icon name="exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-red-400">Acceso Denegado</h1>
                    <p className="mt-2 text-gray-300">{error}</p>
                </div>
            </div>
        );
    }
    
    if (!workOrder || !client || !vehicle) {
        return <div className="flex h-screen w-full items-center justify-center bg-dark text-white"><p>No se pudo cargar la información completa.</p></div>;
    }

    const showQuoteActions = quote && quote.status === QuoteStatus.ENVIADO && !actionTaken;
    const isQuoteApproved = quote && (quote.status === QuoteStatus.APROBADO || quote.status === QuoteStatus.FACTURADO);
    const showInvoice = invoice && (workOrder.status === WorkOrderStatus.FACTURADO || workOrder.stage === KanbanStage.ENTREGADO);


    return (
        <div className="min-h-screen bg-dark text-white p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center gap-4">
                    <img src={appSettings?.companyInfo.logoUrl} alt="Logo" className="h-16 w-auto" />
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-heading tracking-wider"><span className="text-brand-red">AUTO</span><span className="text-white">DEALER</span></h1>
                        <p className="text-gray-400">Portal de Seguimiento para Clientes</p>
                    </div>
                </header>
                
                <div className="bg-dark-light rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h2 className="text-2xl font-semibold">Orden de Trabajo: #{workOrder.id}</h2>
                            <p className="text-gray-400">{vehicle?.make || 'N/A'} {vehicle?.model || 'N/A'} ({vehicle?.plate || 'N/A'})</p>
                        </div>
                        <div className={`px-3 py-1.5 text-sm font-bold rounded-md mt-2 sm:mt-0 ${QUOTE_STATUS_DISPLAY_CONFIG[quote?.status || QuoteStatus.BORRADOR].bg} ${QUOTE_STATUS_DISPLAY_CONFIG[quote?.status || QuoteStatus.BORRADOR].text}`}>
                            {workOrder.stage}
                        </div>
                    </div>
                    <div className="mt-4">
                        <StatusBar currentStage={workOrder.stage} />
                    </div>
                </div>

                {quote?.status === QuoteStatus.ENVIADO && attentionPoints.length > 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
                        <h3 className="font-bold text-yellow-200 text-lg flex items-center gap-2 mb-3">
                            <Icon name="exclamation-triangle" className="w-5 h-5" /> Puntos de Atención del Diagnóstico
                        </h3>
                         <ul className="space-y-2">
                            {attentionPoints.map((point, index) => (
                                <li key={index} className="flex justify-between items-center p-2 bg-black dark:bg-gray-900/20 rounded">
                                    <span className="text-sm text-gray-300">{point.item}</span>
                                    <span className="text-xs font-bold text-yellow-300">{point.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {galleryImages.length > 0 && <ImageGallery images={galleryImages} />}

                {showInvoice ? (
                    <div className="bg-dark-light rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
                             <h3 className="text-xl font-bold text-white">Factura #{invoice.id}</h3>
                             <button onClick={handlePrintInvoice} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700">
                                <Icon name="printer" className="w-5 h-5" /> Descargar Factura (PDF)
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-400 uppercase bg-black dark:bg-gray-900/20">
                                    <tr><th className="px-4 py-2 text-left">Descripción</th><th className="px-4 py-2 text-center w-20">Cant.</th><th className="px-4 py-2 text-right w-32">Vlr. Unit.</th><th className="px-4 py-2 text-right w-32">Total</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-dark-text">
                                    {invoice.items.map(item => (
                                        <tr key={item.id}><td className="px-4 py-3 font-medium">{item.description}{item.suppliedByClient && <span className="text-xs text-blue-400 block">(Suministrado por Cliente)</span>}</td><td className="px-4 py-3 text-center">{item.quantity}</td><td className="px-4 py-3 text-right font-mono">{formatCurrency(item.suppliedByClient ? 0 : item.unitPrice)}</td><td className="px-4 py-3 text-right font-mono text-gray-300">{formatCurrency(item.suppliedByClient ? 0 : (item.quantity * item.unitPrice))}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end mt-4"><div className="w-full max-w-sm space-y-2"><div className="flex justify-between items-center text-gray-300"><span>Subtotal:</span> <span className="font-mono">{formatCurrency(invoice.subtotal)}</span></div><div className="flex justify-between items-center text-gray-300"><span>IVA:</span> <span className="font-mono">{formatCurrency(invoice.taxAmount)}</span></div><div className="flex justify-between items-center text-white text-xl font-bold border-t border-gray-700 pt-2 mt-2"><span>Total a Pagar:</span> <span className="font-mono text-brand-red">{formatCurrency(invoice.total)}</span></div></div></div>
                    </div>
                ) : quote && (
                    <div className="bg-dark-light rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Cotización #{quote.id}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-400 uppercase bg-black dark:bg-gray-900/20">
                                    <tr><th className="px-4 py-2 text-left">Descripción</th><th className="px-4 py-2 text-center w-20">Cant.</th><th className="px-4 py-2 text-right w-32">Vlr. Unit.</th><th className="px-4 py-2 text-right w-32">Total</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-dark-text">
                                    {(quote.items || []).map(item => (<tr key={item.id}><td className="px-4 py-3 font-medium">{item.description}{item.suppliedByClient && <span className="text-xs text-blue-400 block">(Suministrado por Cliente)</span>}</td><td className="px-4 py-3 text-center">{item.quantity}</td><td className="px-4 py-3 text-right font-mono">{formatCurrency(item.suppliedByClient ? 0 : item.unitPrice)}</td><td className="px-4 py-3 text-right font-mono text-gray-300">{formatCurrency(item.suppliedByClient ? 0 : item.quantity * item.unitPrice)}</td></tr>))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end mt-4"><div className="w-full max-w-sm space-y-2"><div className="flex justify-between items-center text-gray-300"><span>Subtotal:</span> <span className="font-mono">{formatCurrency(quote.subtotal)}</span></div><div className="flex justify-between items-center text-gray-300"><span>IVA:</span> <span className="font-mono">{formatCurrency(quote.taxAmount || 0)}</span></div><div className="flex justify-between items-center text-white text-xl font-bold border-t border-gray-700 pt-2 mt-2"><span>Total:</span> <span className="font-mono text-brand-red">{formatCurrency(quote.total)}</span></div></div></div>
                    </div>
                )}

                {showQuoteActions && (
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 text-center">
                        <h3 className="font-bold text-blue-200 text-lg">¿Deseas aprobar esta cotización?</h3>
                        <p className="text-sm text-blue-300/80 mt-1 mb-4">Al aprobar, autorizas el inicio de los trabajos descritos.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleReject} className="px-8 py-3 font-semibold text-white bg-red-700 hover:bg-red-600 rounded-lg transition-colors">Rechazar</button>
                            <button onClick={handleApprove} className="px-8 py-3 font-semibold text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors">Aprobar Cotización</button>
                        </div>
                    </div>
                )}
                
                {actionTaken === 'approved' && (
                    <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-6 text-center">
                        <Icon name="check-circle" className="w-10 h-10 text-green-400 mx-auto mb-2" />
                        <h3 className="font-bold text-green-200 text-lg">¡Cotización Aprobada!</h3>
                        <p className="text-sm text-green-300/80 mt-1">Hemos recibido tu aprobación. Nuestro equipo comenzará con las reparaciones pronto.</p>
                    </div>
                )}
                
                {actionTaken === 'rejected' && (
                     <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-6 text-center">
                        <Icon name="x-circle" className="w-10 h-10 text-red-400 mx-auto mb-2" />
                        <h3 className="font-bold text-red-200 text-lg">Cotización Rechazada</h3>
                        <p className="text-sm text-red-300/80 mt-1">Hemos registrado tu decisión. Un asesor se pondrá en contacto contigo a la brevedad.</p>
                    </div>
                )}

                {isQuoteApproved && workOrder.progressLog && workOrder.progressLog.length > 0 && (
                    <div className="bg-dark-light rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-4"><Icon name="chart-line" className="w-6 h-6 text-brand-red"/> Progreso de la Reparación</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {workOrder.progressLog.slice().reverse().map(entry => (
                                <div key={entry.id} className="flex items-start gap-3">
                                    <div className="flex-1 bg-black dark:bg-gray-900/20 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-bold text-white">{entry.userName}</span>
                                            <span className="text-gray-400">{entry.userRole}</span>
                                            <span className="text-gray-500">· {new Date(entry.timestamp).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{entry.notes}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ClientPortalView;