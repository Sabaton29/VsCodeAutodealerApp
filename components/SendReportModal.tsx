
import React, { useState, useMemo } from 'react';
import { Icon } from './Icon';
import { WorkOrder, Client } from '../types';

interface SendReportModalProps {
    workOrder: WorkOrder;
    client?: Client;
    onClose: () => void;
    reportType: 'diagnostic' | 'reception';
}

const SendReportModal: React.FC<SendReportModalProps> = ({ workOrder, client, onClose, reportType }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    const reportTitle = useMemo(() => reportType === 'diagnostic' ? 'diagnóstico' : 'recepción', [reportType]);

    const simulatedPublicLink = useMemo(() => {
        // In a real app, this would be a unique, secure URL.
        const origin = 'https://autodealer.cloud/report';
        const params = new URLSearchParams({
            ot: workOrder.id,
            type: reportType,
            v: vehicle?.plate || 'N/A',
            ts: Date.now().toString(36),
        });
        return `${origin}?${params.toString()}`;
    }, [workOrder, reportType]);

    const whatsAppMessage = useMemo(() => {
        const clientName = client?.name || 'Estimado Cliente';
        const vehicleSummary = `${vehicle?.make || 'N/A'} ${vehicle?.model || 'N/A'}`;
        const message = `Hola ${clientName}, aquí está el reporte de ${reportTitle} para tu vehículo ${vehicleSummary} (Placa: ${vehicle?.plate || 'N/A'}):\n\n${simulatedPublicLink}\n\nPor favor, revísalo y contáctanos para los siguientes pasos. ¡Gracias!`;
        return encodeURIComponent(message);
    }, [client, workOrder, simulatedPublicLink, reportTitle]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(simulatedPublicLink).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000); // Reset after 2 seconds
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            alert('No se pudo copiar el enlace.');
        });
    };
    
    const handleSendWhatsApp = () => {
        const whatsappUrl = `https://wa.me/${client?.phone}?text=${whatsAppMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        onClose();
    };

    return (
        <div className="space-y-6">
            <div>
                 <p className="text-sm text-gray-400">Selecciona un método para compartir el reporte de <strong className="text-gray-200">{reportTitle}</strong> con <strong className="text-gray-200">{client?.name || 'el cliente'}</strong>.</p>
            </div>

            <div className="bg-black dark:bg-gray-900/20 p-4 rounded-lg">
                <p className="text-xs font-semibold text-gray-400 mb-2">VISTA PREVIA DEL MENSAJE:</p>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {`Hola ${client?.name || 'Estimado Cliente'},\n\nAquí está el reporte de ${reportTitle} para tu vehículo ${vehicle?.make || 'N/A'} ${vehicle?.model || 'N/A'} (Placa: ${vehicle?.plate || 'N/A'}):\n\n${simulatedPublicLink}\n\nPor favor, revísalo y contáctanos.`}
                </p>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                >
                    <Icon name="paperclip" className="w-5 h-5" />
                    {copyStatus === 'idle' ? 'Copiar Enlace Público' : '¡Enlace Copiado!'}
                </button>
                 <button 
                    onClick={handleSendWhatsApp}
                    disabled={!client?.phone}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    <Icon name="share" className="w-5 h-5" />
                    Enviar por WhatsApp
                </button>
                {!client?.phone && <p className="text-xs text-center text-yellow-400">El cliente no tiene un número de teléfono registrado para enviar por WhatsApp.</p>}
            </div>

             <div className="flex justify-end pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default SendReportModal;