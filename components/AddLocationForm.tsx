

import React, { useState, useEffect } from 'react';
import type { Location } from '../types';

interface AddLocationFormProps {
    onSave: (locationData: Location | Omit<Location, 'id'>) => void;
    onCancel: () => void;
    initialData?: Location;
}

const AddLocationForm: React.FC<AddLocationFormProps> = ({ onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        address: '',
        phone: '',
        hourlyRate: '',
    });
    
    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                city: initialData.city || '',
                address: initialData.address || '',
                phone: initialData.phone || '',
                hourlyRate: initialData.hourlyRate?.toString() || '0',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, city, address, phone, hourlyRate } = formData;
        if (!name || !city || !address || !phone || !hourlyRate) {
            console.warn('Por favor complete todos los campos.');
            return;
        }
        
        const dataToSave = {
            name: name.trim(),
            city: city.trim(),
            address: address.trim(),
            phone: phone.trim(),
            hourlyRate: parseFloat(hourlyRate) || 0,
        };

        if (isEditing && initialData) {
            onSave({ ...initialData, ...dataToSave });
        } else {
            onSave(dataToSave);
        }
    };

    const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label htmlFor="name" className={labelClasses}>Nombre de la Sede</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Ej: Sede Principal" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="city" className={labelClasses}>Ciudad</label>
                    <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className={inputClasses} placeholder="Ej: Medellín" required />
                </div>
                 <div>
                    <label htmlFor="address" className={labelClasses}>Dirección</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className={inputClasses} placeholder="Ej: Calle 10 # 43A-22" required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="phone" className={labelClasses}>Teléfono</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="Ej: (604) 555-1234" required />
                </div>
                <div>
                    <label htmlFor="hourlyRate" className={labelClasses}>Tarifa por Hora (COP)</label>
                    <input type="number" id="hourlyRate" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className={inputClasses} placeholder="Ej: 100000" min="0" required />
                </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                    {isEditing ? 'Guardar Cambios' : 'Guardar Sede'}
                </button>
            </div>
        </form>
    );
};

export default AddLocationForm;