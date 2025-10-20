import React, { useState } from 'react';
import { WorkOrder, Client } from '../types';
import { Icon } from './Icon';

interface ShareClientPortalModalProps {
    workOrder: WorkOrder;
    client: Client;
    onClose: () => void;
}

const ShareClientPortalModal: React.FC<ShareClientPortalModalProps> = ({ workOrder, client, onClose }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    if (!workOrder.publicAccessToken) {
        return (
            <div className="text-center p-4">
                <Icon name="exclamation-triangle" className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-yellow-300">Error</h2>
                <p className="text-gray-400 mt-2">Esta orden de trabajo no tiene un enlace público para compartir.</p>
                 <div className="flex justify-end pt-4 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    const portalLink = `${window.location.origin}/portal/${workOrder.id}?token=${workOrder.publicAccessToken}`;

    const whatsAppMessage = `Hola ${client.name.split(' ')[0]}, aquí tienes el enlace para seguir el estado de tu vehículo (${vehicle?.plate || 'N/A'}) en nuestro taller:\n\n${portalLink}\n\n¡Gracias!`;
    const encodedWhatsAppMessage = encodeURIComponent(whatsAppMessage);
    const whatsappUrl = `https://wa.me/${client.phone.replace(/\s/g, '')}?text=${encodedWhatsAppMessage}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(portalLink).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            console.warn('No se pudo copiar el enlace.');
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-gray-400">Comparte este enlace único y seguro con el cliente para que pueda ver el progreso de su orden de trabajo, revisar y aprobar cotizaciones en línea.</p>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Enlace Público Seguro</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        readOnly
                        value={portalLink}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-900/50 border-gray-700 text-gray-300 focus:outline-none"
                    />
                    <button
                        onClick={handleCopyLink}
                        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        <Icon name="paperclip" className="w-4 h-4" />
                        {copyStatus === 'idle' ? 'Copiar' : '¡Copiado!'}
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
                    disabled={!client.phone}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    <Icon name="share" className="w-5 h-5" />
                    Enviar por WhatsApp
                </button>
                {!client.phone && <p className="text-xs text-center text-yellow-400">El cliente no tiene un número de teléfono registrado.</p>}
            </div>

            <div className="flex justify-end pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default ShareClientPortalModal;