


import React, { useState, useEffect } from 'react';
import { StaffMember, Location, UserRole, SalaryType } from '../types';
import ToggleSwitch from './ToggleSwitch';
import FormSection from './FormSection';
import { Icon } from './Icon';

interface AddStaffFormProps {
    onSave: (staffData: StaffMember | Omit<StaffMember, 'id' | 'avatarUrl'>) => void;
    onCancel: () => void;
    locations: Location[];
    selectedLocationId: string;
    initialData?: StaffMember;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const salaryTypes: SalaryType[] = ['Mensual', 'Quincenal', 'Por Hora', 'Mixto (Base + Comisión)', 'Comisión Pura'];

const AddStaffForm: React.FC<AddStaffFormProps> = ({ onSave, onCancel, locations, selectedLocationId, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: UserRole.MECANICO,
        locationId: selectedLocationId,
        specialty: '',
        documentType: 'Cédula de Ciudadanía',
        documentNumber: '',
        salaryType: 'Mensual' as SalaryType,
        salaryAmount: 0,
        commissionRate: 0,
        isProLabore: false,
        requiresTimeClock: false,
    });

    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                role: initialData.role,
                locationId: initialData.locationId,
                specialty: initialData.specialty || '',
                documentType: initialData.documentType,
                documentNumber: initialData.documentNumber,
                salaryType: initialData.salaryType || 'Mensual',
                salaryAmount: initialData.salaryAmount || 0,
                commissionRate: initialData.commissionRate || 0,
                isProLabore: initialData.isProLabore || false,
                requiresTimeClock: initialData.requiresTimeClock || false,
            });
        } else {
            setFormData(prev => ({ ...prev, locationId: selectedLocationId }));
        }
    }, [initialData, selectedLocationId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleToggle = (name: 'isProLabore' | 'requiresTimeClock', value: boolean) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.role || !formData.documentNumber) {
            alert('Por favor complete todos los campos obligatorios.');
            return;
        }
        if (isEditing) {
            onSave({ ...initialData, ...formData } as StaffMember);
        } else {
            onSave(formData);
        }
    };

    const getSalaryLabel = () => {
        switch (formData.salaryType) {
            case 'Por Hora': return 'Valor Hora (COP)';
            case 'Quincenal': return 'Salario Quincenal (COP)';
            case 'Mensual': return 'Salario Mensual (COP)';
            case 'Mixto (Base + Comisión)': return 'Salario Base (COP)';
            case 'Comisión Pura': return 'Salario Base (Opcional)';
            default: return 'Monto Salario (COP)';
        }
    };
    
    const showCommissionRate = formData.salaryType === 'Mixto (Base + Comisión)' || formData.salaryType === 'Comisión Pura';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Información Básica" icon={<Icon name="user" className="w-5 h-5 text-brand-red"/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="name" className={labelClasses}>Nombre Completo</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="documentType" className={labelClasses}>Tipo de Documento</label>
                        <select id="documentType" name="documentType" value={formData.documentType} onChange={handleChange} className={inputClasses} required>
                            <option>Cédula de Ciudadanía</option>
                            <option>Cédula de Extranjería</option>
                            <option>Pasaporte</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="documentNumber" className={labelClasses}>Número de Documento</label>
                        <input type="text" id="documentNumber" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className={inputClasses} required />
                    </div>
                </div>
            </FormSection>

            <FormSection title="Rol y Acceso" icon={<Icon name="staff" className="w-5 h-5 text-brand-red"/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="role" className={labelClasses}>Rol en el Sistema</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className={inputClasses} required>
                            {Object.values(UserRole).map(role => (<option key={role} value={role}>{role}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClasses}>Correo Electrónico (Login)</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} required />
                    </div>
                     {formData.role === UserRole.MECANICO && (
                        <div>
                            <label htmlFor="specialty" className={labelClasses}>Especialidad</label>
                            <input type="text" id="specialty" name="specialty" value={formData.specialty} onChange={handleChange} className={inputClasses} placeholder="Ej: Frenos y Suspensión" />
                        </div>
                    )}
                    <div>
                        <label htmlFor="locationId" className={labelClasses}>Asignar a Sede</label>
                        <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className={inputClasses} required>
                            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </div>
                </div>
            </FormSection>

             <FormSection title="Información de Nómina" icon={<Icon name="wallet" className="w-5 h-5 text-brand-red"/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="salaryType" className={labelClasses}>Tipo de Salario</label>
                        <select id="salaryType" name="salaryType" value={formData.salaryType} onChange={handleChange} className={inputClasses}>
                            {salaryTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="salaryAmount" className={labelClasses}>{getSalaryLabel()}</label>
                        <input type="number" id="salaryAmount" name="salaryAmount" value={formData.salaryAmount} onChange={handleChange} className={inputClasses} min="0" />
                    </div>
                    {showCommissionRate && (
                         <div>
                            <label htmlFor="commissionRate" className={labelClasses}>Porcentaje de Comisión sobre Utilidad (%)</label>
                            <input type="number" id="commissionRate" name="commissionRate" value={formData.commissionRate} onChange={handleChange} className={inputClasses} min="0" step="0.1" placeholder="Ej: 10"/>
                        </div>
                    )}
                </div>
                <div className="space-y-4 pt-4">
                    <ToggleSwitch 
                        label="¿Es Pró-labore (Salario del Dueño)?"
                        enabled={formData.isProLabore}
                        onChange={(val) => handleToggle('isProLabore', val)}
                        description="Marca esta opción si el salario corresponde al del propietario."
                    />
                    <ToggleSwitch 
                        label="Habilitar registro horario (Fichar)"
                        enabled={formData.requiresTimeClock}
                        onChange={(val) => handleToggle('requiresTimeClock', val)}
                        description="El empleado deberá registrar sus horas de entrada y salida."
                    />
                </div>
             </FormSection>


            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                    {isEditing ? 'Guardar Cambios' : 'Guardar Personal'}
                </button>
            </div>
        </form>
    );
};

export default AddStaffForm;