import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import ToggleSwitch from './ToggleSwitch';

interface AddSupplierFormProps {
    onSave: (supplierData: Supplier | Omit<Supplier, 'id'>) => void;
    onCancel: () => void;
    initialData?: Supplier;
    selectedLocationId: string;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const AddSupplierForm: React.FC<AddSupplierFormProps> = ({ onSave, onCancel, initialData, selectedLocationId }) => {
    const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
        name: '',
        nit: '',
        contactPerson: '',
        phone: '',
        email: '',
        category: 'Repuestos y Motor',
        locationId: selectedLocationId,
        hasCredit: false,
    });
    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '', nit: '', contactPerson: '', phone: '', email: '',
                category: 'Repuestos y Motor', locationId: selectedLocationId, hasCredit: false,
            });
        }
    }, [initialData, selectedLocationId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleChange = (enabled: boolean) => {
        setFormData(prev => ({ ...prev, hasCredit: enabled }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.nit || !formData.contactPerson) {
            console.warn('Por favor complete todos los campos obligatorios.');
            return;
        }
        if (isEditing) {
            onSave({ ...formData, id: initialData.id });
        } else {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
                {isEditing ? 'Actualice los campos del proveedor.' : 'Complete los campos para registrar un nuevo proveedor.'}
             </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="name" className={labelClasses}>Razón Social</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                </div>

                <div>
                    <label htmlFor="nit" className={labelClasses}>NIT</label>
                    <input type="text" id="nit" name="nit" value={formData.nit} onChange={handleChange} className={inputClasses} required />
                </div>
                
                <div>
                    <label htmlFor="category" className={labelClasses}>Categoría Principal</label>
                     <select id="category" name="category" value={formData.category} onChange={handleChange} className={inputClasses} required>
                        <option>Repuestos y Motor</option>
                        <option>Llantas</option>
                        <option>Aceites y Filtros</option>
                        <option>Eléctrico</option>
                        <option>Seguros</option>
                        <option>Servicios Externos</option>
                        <option>Otro</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="contactPerson" className={labelClasses}>Persona de Contacto</label>
                    <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className={inputClasses} required />
                </div>
                 <div>
                    <label htmlFor="phone" className={labelClasses}>Teléfono</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} />
                </div>

                 <div className="md:col-span-2">
                    <label htmlFor="email" className={labelClasses}>Correo Electrónico</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} />
                </div>
                <div className="md:col-span-2">
                     <ToggleSwitch label="¿Ofrece Crédito?" enabled={formData.hasCredit} onChange={handleToggleChange} />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                    {isEditing ? 'Guardar Cambios' : 'Guardar Proveedor'}
                </button>
            </div>
        </form>
    );
};

export default AddSupplierForm;