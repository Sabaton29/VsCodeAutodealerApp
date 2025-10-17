import React, { useState, useEffect } from 'react';
import { WorkOrder, Client, Vehicle } from '../types';
import { Icon } from './Icon';

interface RegisterDeliveryFormProps {
    workOrder: WorkOrder;
    client?: Client;
    vehicle?: Vehicle;
    onSave: (workOrderId: string, deliveryData: {
        deliveryEvidenceFiles: File[];
        nextMaintenanceDate: string;
        nextMaintenanceMileage: string;
        nextMaintenanceNotes: string;
        customerConfirmed: boolean;
    }) => void;
    onCancel: () => void;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-red text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 [&::-webkit-input-placeholder]:!text-gray-400 [&::-moz-placeholder]:!text-gray-400 [&:-ms-input-placeholder]:!text-gray-400 [&::placeholder]:!text-gray-400";
const labelClasses = "block text-sm font-medium text-gray-300 mb-1";
const actionButtonClasses = "cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500";


const RegisterDeliveryForm: React.FC<RegisterDeliveryFormProps> = ({ workOrder, client, vehicle, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        nextMaintenanceDate: '',
        nextMaintenanceMileage: '',
        nextMaintenanceNotes: '',
        customerConfirmed: false,
    });
    const [deliveryEvidenceFiles, setDeliveryEvidenceFiles] = useState<File[]>([]);

    useEffect(() => {
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 6);
        const nextDateString = nextDate.toISOString().split('T')[0];

        const currentMileage = parseInt(workOrder.mileage?.replace(/[^0-9]/g, '') || '0', 10);
        const nextMileage = currentMileage > 0 ? `${currentMileage + 5000} km` : '';

        setFormData(prev => ({
            ...prev,
            nextMaintenanceDate: nextDateString,
            nextMaintenanceMileage: nextMileage,
            nextMaintenanceNotes: 'Próximo cambio de aceite y filtro.',
        }));
    }, [workOrder.mileage]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, customerConfirmed: e.target.checked }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setDeliveryEvidenceFiles(prev => [...prev, ...files]);
        }
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        setDeliveryEvidenceFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerConfirmed) {
            alert('El cliente debe confirmar la recepción del vehículo.');
            return;
        }
        onSave(workOrder.id, { ...formData, deliveryEvidenceFiles });
    };

    return (
        <>
            <style>{`
                .delivery-form input,
                .delivery-form textarea {
                    color: white !important;
                }
                .delivery-form input::placeholder,
                .delivery-form textarea::placeholder {
                    color: #9CA3AF !important;
                }
            `}</style>
            <form onSubmit={handleSubmit} className="space-y-6 delivery-form" style={{color: 'white'}}>
            <div className="bg-blue-900/30 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-700/50">
                <p className="text-sm text-gray-300 dark:text-gray-300 font-medium">Cliente: <span className="font-bold text-white">{client?.name || 'Cliente no encontrado'}</span></p>
                <p className="text-sm text-gray-300 dark:text-gray-300 font-medium">Vehículo: <span className="font-bold text-white">{`${vehicle?.make || 'N/A'} ${vehicle?.model || 'N/A'} (${vehicle?.plate || 'N/A'})`}</span></p>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Evidencia Fotográfica de Salida</h3>
                <div className="flex items-center gap-4">
                    <label htmlFor="delivery-evidence-upload" className={`${actionButtonClasses} bg-gray-600 hover:bg-gray-700`}>
                        <Icon name="upload" className="w-5 h-5"/>
                        <span>Adjuntar Fotos</span>
                    </label>
                    <input id="delivery-evidence-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    <label htmlFor="delivery-camera-capture" className={`${actionButtonClasses} bg-blue-600 hover:bg-blue-700`}>
                        <Icon name="camera" className="w-5 h-5"/>
                        <span>Tomar Foto</span>
                    </label>
                    <input id="delivery-camera-capture" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                </div>
                 {deliveryEvidenceFiles.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-3">
                        {deliveryEvidenceFiles.map((file, index) => (
                            <div key={index} className="relative group">
                                <img src={URL.createObjectURL(file)} alt={`Evidencia ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                                <button type="button" onClick={() => handleRemoveFile(index)} className="absolute -top-1.5 -right-1.5 bg-brand-red text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Eliminar imagen">
                                    <Icon name="x" className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Próximo Mantenimiento Sugerido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="nextMaintenanceDate" className={labelClasses}>Fecha Sugerida</label>
                        <input type="date" id="nextMaintenanceDate" name="nextMaintenanceDate" value={formData.nextMaintenanceDate} onChange={handleChange} className={inputClasses} style={{color: 'white'}} />
                    </div>
                    <div>
                        <label htmlFor="nextMaintenanceMileage" className={labelClasses}>Kilometraje Sugerido</label>
                        <input type="text" id="nextMaintenanceMileage" name="nextMaintenanceMileage" value={formData.nextMaintenanceMileage} onChange={handleChange} className={inputClasses} placeholder="Ej: 95.000 km" style={{color: 'white'}} />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="nextMaintenanceNotes" className={labelClasses}>Notas / Servicios Sugeridos</label>
                        <textarea id="nextMaintenanceNotes" name="nextMaintenanceNotes" value={formData.nextMaintenanceNotes} onChange={handleChange} rows={2} className={inputClasses} placeholder="Ej: Próximo cambio de aceite y filtro. Revisar pastillas de freno." style={{color: 'white'}}></textarea>
                    </div>
                </div>
            </div>
            
            <div>
                 <label className="flex items-center text-sm font-medium text-white">
                    <input
                        type="checkbox"
                        checked={formData.customerConfirmed}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-brand-red focus:ring-brand-red focus:ring-2 mr-2"
                        required
                    />
                    El cliente confirma la recepción del vehículo a satisfacción.
                </label>
            </div>


            <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700">
                    Finalizar y Entregar
                </button>
            </div>
        </form>
        </>
    );
};

export default RegisterDeliveryForm;