import React, { useState } from 'react';
import { WorkOrder } from '../types';
import { Icon } from './Icon';

interface ReportUnforeseenIssueModalProps {
    workOrder: WorkOrder;
    onSave: (workOrderId: string, description: string) => void;
    onCancel: () => void;
}

const ReportUnforeseenIssueModal: React.FC<ReportUnforeseenIssueModalProps> = ({ workOrder, onSave, onCancel }) => {
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            alert('Por favor, describa el imprevisto encontrado.');
            return;
        }
        onSave(workOrder.id, description);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-400 -mt-2">
                Describe detalladamente el problema o la necesidad adicional que encontraste durante la reparación. Esto notificará al asesor de servicio.
            </p>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Descripción del Imprevisto</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-dark-text"
                    required
                    autoFocus
                    placeholder="Ej: Se detectó una fuga en la bomba de agua al probar el sistema de refrigeración. Se requiere reemplazar la bomba y el refrigerante."
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">
                    Cancelar
                </button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700">
                    <Icon name="exclamation-triangle" className="w-5 h-5" />
                    Enviar Reporte
                </button>
            </div>
        </form>
    );
};

export default ReportUnforeseenIssueModal;