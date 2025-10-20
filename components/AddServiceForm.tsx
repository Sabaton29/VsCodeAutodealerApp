import React, { useState, useMemo, useEffect } from 'react';
import { Service, Location, ServiceCategory } from '../types';
import { Icon } from './Icon';

interface AddServiceFormProps {
    onSave: (serviceData: Service | Omit<Service, 'id'>) => void;
    onCancel: () => void;
    initialData?: Partial<Service>;
    selectedLocationId: string;
    locations: Location[];
    categories: ServiceCategory[];
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text text-center";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const AddServiceForm: React.FC<AddServiceFormProps> = ({ onSave, onCancel, initialData, selectedLocationId, locations, categories }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: categories[0]?.name || '',
        durationHours: 1,
        locationId: selectedLocationId,
    });
    
    const [hours, setHours] = useState('1');
    const [price, setPrice] = useState('');
    const isEditing = !!initialData?.id;

    useEffect(() => {
        const defaults = {
            name: '',
            category: categories[0]?.name || '',
            durationHours: 1,
            locationId: selectedLocationId,
        };
        const data = { ...defaults, ...initialData };
        setFormData(data);
        setHours(data.durationHours.toString());
    }, [initialData, selectedLocationId, categories]);

    const selectedLocation = useMemo(() => {
        return locations.find(loc => loc.id === formData.locationId);
    }, [locations, formData.locationId]);

    useEffect(() => {
        if (selectedLocation) {
            const calculatedPrice = parseFloat(hours) * selectedLocation.hourlyRate;
            setPrice(isNaN(calculatedPrice) ? '' : Math.round(calculatedPrice).toString());
        }
    }, [hours, selectedLocation]);

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHours = e.target.value;
        // Convertir comas a puntos para decimales
        const normalizedHours = newHours.replace(/,/g, '.');
        setHours(normalizedHours);
        const duration = parseFloat(normalizedHours);
        if (!isNaN(duration) && duration > 0) {
            setFormData(prev => ({ ...prev, durationHours: duration }));
        }
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Limpiar todo excepto números, comas y puntos
        const cleanValue = inputValue.replace(/[^0-9,.]/g, '');
        
        // Si está vacío, limpiar
        if (cleanValue === '') {
            setPrice('');
            return;
        }
        
        // Quitar comas y puntos para obtener número puro
        const numberStr = cleanValue.replace(/[,.]/g, '');
        
        // Solo procesar si hay al menos un dígito
        if (numberStr.length > 0) {
            setPrice(numberStr);
            
            const numValue = parseInt(numberStr, 10);
            if (selectedLocation && numValue > 0 && selectedLocation.hourlyRate > 0) {
                const hours = numValue / selectedLocation.hourlyRate;
                const roundedHours = Math.round(hours * 1000) / 1000;
                setHours(roundedHours.toString());
                setFormData(prev => ({ ...prev, durationHours: roundedHours }));
            }
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category || formData.durationHours <= 0) {
            console.warn('Por favor complete todos los campos correctamente.');
            return;
        }
        if (isEditing) {
            onSave({ ...initialData, ...formData } as Service);
        } else {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
                {isEditing ? 'Actualice los campos del servicio.' : 'Complete los campos para registrar un nuevo servicio estandarizado en el catálogo.'}
             </p>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className={labelClasses}>Nombre del Servicio</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text" placeholder="Ej: Cambio de Aceite y Filtro" required />
                </div>
                 <div>
                    <label htmlFor="category" className={labelClasses}>Categoría</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text" required>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="locationId" className={labelClasses}>Sede para Cálculo de Precio</label>
                     <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text" required>
                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name} ({formatCurrency(loc.hourlyRate)}/hr)</option>)}
                    </select>
                </div>
                
                <div>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={labelClasses}>Duración (Horas)</label>
                        <label className={labelClasses}>Precio Final (COP)</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" value={hours} onChange={handleHoursChange} className={inputClasses} step="0.1" min="0.1" required inputMode="decimal" />
                        <Icon name="arrows-right-left" className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input 
                            type="text" 
                            value={price ? (isNaN(parseInt(price, 10)) ? price : parseInt(price, 10).toLocaleString('es-CO')) : ''} 
                            onChange={handlePriceChange} 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text text-center" 
                            placeholder="Ej: 285650" 
                            maxLength={50}
                            inputMode="numeric"
                            pattern="[0-9.]*"
                            style={{ fontSize: '16px' }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">Modifique un campo y el otro se calculará automáticamente.</p>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                    {isEditing ? 'Guardar Cambios' : 'Guardar Servicio'}
                </button>
            </div>
        </form>
    );
};

export default AddServiceForm;