import React, { useState, useEffect } from 'react';
import type { Client, Location, PaymentTerms, DayOfWeek } from '../types';
import ToggleSwitch from './ToggleSwitch';
import { Icon } from './Icon';

interface AddClientFormProps {
    onSave: (clientData: Client | Omit<Client, 'id' | 'vehicleCount' | 'registrationDate'>) => void;
    onCancel: () => void;
    locations: Location[];
    selectedLocationId: string;
    initialData?: Client;
}

const inputClasses = "w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const DAYS_OF_WEEK: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const AddClientForm: React.FC<AddClientFormProps> = ({ onSave, onCancel, locations, selectedLocationId, initialData }) => {
    const [formData, setFormData] = useState({
        locationId: selectedLocationId,
        personType: 'Persona Natural' as 'Persona Natural' | 'Persona Jurídica',
        idType: 'Cédula de Ciudadanía',
        idNumber: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        observations: '',
        isB2B: false,
        commissionRate: 0,
        paymentTerms: { type: 'ON_DELIVERY', days: 30, day: 'Miércoles' } as { type: PaymentTerms['type'], days?: number, day?: DayOfWeek },
    });
    const [errors, setErrors] = useState({ idNumber: '', phone: '' });

    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            const initialTerms = initialData.paymentTerms || { type: 'ON_DELIVERY' };
            setFormData({
                locationId: initialData.locationId,
                personType: initialData.personType,
                idType: initialData.idType,
                idNumber: initialData.idNumber,
                name: initialData.name,
                email: initialData.email,
                phone: initialData.phone,
                address: initialData.address || '',
                city: initialData.city || '',
                observations: initialData.observations || '',
                isB2B: initialData.isB2B || false,
                commissionRate: initialData.commissionRate || 0,
                paymentTerms: {
                    type: initialTerms.type,
                    days: 'days' in initialTerms ? initialTerms.days : 30,
                    day: 'day' in initialTerms ? initialTerms.day : 'Miércoles',
                },
            });
        } else {
            setFormData(prev => ({ ...prev, locationId: selectedLocationId, personType: 'Persona Natural', idType: 'Cédula de Ciudadanía' }));
        }
    }, [initialData, selectedLocationId]);
    
    useEffect(() => {
        if (formData.personType === 'Persona Jurídica') {
            if (formData.idType !== 'NIT') {
                setFormData(prev => ({ ...prev, idType: 'NIT' }));
            }
        } else { // Persona Natural
            if (formData.idType === 'NIT') {
                setFormData(prev => ({ ...prev, idType: 'Cédula de Ciudadanía' }));
            }
        }
        setErrors(prev => ({ ...prev, idNumber: '' }));
    }, [formData.personType]);

    const validateNIT = (nit: string) => {
        const nitRegex = /^\d{9}-\d{1}$/;
        return nitRegex.test(nit) ? '' : 'El NIT debe tener el formato 123456789-0.';
    };
    
    const validatePhone = (phone: string) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone) ? '' : 'El teléfono debe tener 10 dígitos.';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (name.startsWith('paymentTerms.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                paymentTerms: { ...prev.paymentTerms, [field]: type === 'number' ? parseInt(value, 10) || 0 : value },
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));

            if (name === 'idNumber') {
                if (formData.personType === 'Persona Jurídica' || formData.idType === 'NIT') {
                    setErrors(prev => ({ ...prev, idNumber: validateNIT(value) }));
                } else {
                    setErrors(prev => ({ ...prev, idNumber: '' }));
                }
            } else if (name === 'phone') {
                setErrors(prev => ({ ...prev, phone: validatePhone(value.replace(/\s/g, '')) }));
            }
        }
    };
    
    const handleToggle = (name: 'isB2B', value: boolean) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const idNumberError = (formData.personType === 'Persona Jurídica' || formData.idType === 'NIT') ? validateNIT(formData.idNumber) : '';
        const phoneError = validatePhone(formData.phone.replace(/\s/g, ''));
        
        if (idNumberError || phoneError) {
            setErrors({ idNumber: idNumberError, phone: phoneError });
            return;
        }

        if (!formData.name || !formData.email || !formData.phone || !formData.idNumber) {
            console.warn('Por favor complete todos los campos obligatorios.');
            return;
        }
        
        let finalPaymentTerms: PaymentTerms;
        switch (formData.paymentTerms.type) {
            case 'NET_DAYS':
                finalPaymentTerms = { type: 'NET_DAYS', days: formData.paymentTerms.days || 30 };
                break;
            case 'DAY_OF_WEEK':
                finalPaymentTerms = { type: 'DAY_OF_WEEK', day: formData.paymentTerms.day || 'Miércoles' };
                break;
            default:
                finalPaymentTerms = { type: 'ON_DELIVERY' };
        }

        const dataToSave = { 
            ...formData,
            commissionRate: formData.isB2B ? formData.commissionRate : 0,
            paymentTerms: finalPaymentTerms,
        };

        if (isEditing) {
            onSave({ ...initialData, ...dataToSave } as Client);
        } else {
            onSave(dataToSave);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
                {isEditing ? 'Actualice los datos del cliente.' : 'Complete los campos para registrar un nuevo cliente en el sistema.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="locationId" className={labelClasses}>Sede de Registro</label>
                    <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`} required>
                        {(locations || []).map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="personType" className={labelClasses}>Tipo de Persona</label>
                    <select id="personType" name="personType" value={formData.personType} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`} required>
                        <option>Persona Natural</option>
                        <option>Persona Jurídica</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="idType" className={labelClasses}>Tipo de Identificación</label>
                    <select id="idType" name="idType" value={formData.idType} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`} required disabled={formData.personType === 'Persona Jurídica'}>
                        {formData.personType === 'Persona Jurídica' 
                            ? <option value="NIT">NIT</option>
                            : <>
                                <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                                <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                                <option value="Pasaporte">Pasaporte</option>
                              </>
                        }
                    </select>
                </div>
                <div>
                    <label htmlFor="idNumber" className={labelClasses}>Nº Identificación</label>
                    <input type="text" id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleChange} className={`${inputClasses} ${errors.idNumber ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'}`} required />
                    {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="name" className={labelClasses}>Nombres y Apellidos / Razón Social</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`} required />
                </div>
                <div>
                    <label htmlFor="email" className={labelClasses}>Correo Electrónico</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`} required />
                </div>
                 <div>
                    <label htmlFor="phone" className={labelClasses}>Teléfono Móvil</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={`${inputClasses} ${errors.phone ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'}`} required />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                    <label htmlFor="address" className={labelClasses}>Dirección (Opcional)</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`} />
                </div>
                 <div>
                    <label htmlFor="city" className={labelClasses}>Ciudad (Opcional)</label>
                    <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`} />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="observations" className={labelClasses}>Observaciones (Opcional)</label>
                    <textarea id="observations" name="observations" value={formData.observations} onChange={handleChange} rows={3} className={`${inputClasses} border-gray-300 dark:border-gray-700`}></textarea>
                </div>
                <div className="md:col-span-2 bg-gray-50 dark:bg-black dark:bg-gray-900/20 p-4 rounded-lg space-y-4">
                    <ToggleSwitch 
                        label="Es cliente B2B con comisión?"
                        enabled={formData.isB2B}
                        onChange={(val) => handleToggle('isB2B', val)}
                        description="Activa para gestionar comisiones en las facturas de este cliente."
                    />
                    {formData.isB2B && (
                        <div>
                            <label htmlFor="commissionRate" className={labelClasses}>Tasa de Comisión (%)</label>
                             <div className="relative">
                                <input 
                                    type="number" 
                                    id="commissionRate" 
                                    name="commissionRate" 
                                    value={formData.commissionRate} 
                                    onChange={handleChange} 
                                    className={`${inputClasses} border-gray-300 dark:border-gray-700`} 
                                    placeholder="Ej: 20"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Icon name="percentage" className="w-5 h-5 text-gray-400"/>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="md:col-span-2 bg-gray-50 dark:bg-black dark:bg-gray-900/20 p-4 rounded-lg space-y-4">
                     <h3 className="text-base font-semibold text-light-text dark:text-dark-text">Condiciones de Pago</h3>
                     <div>
                        <label htmlFor="paymentTerms.type" className={labelClasses}>Tipo de Condición</label>
                        <select id="paymentTerms.type" name="paymentTerms.type" value={formData.paymentTerms.type} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`}>
                            <option value="ON_DELIVERY">Pago contra entrega</option>
                            <option value="NET_DAYS">Neto Días</option>
                            <option value="DAY_OF_WEEK">Día de la Semana Específico</option>
                        </select>
                     </div>
                     {formData.paymentTerms.type === 'NET_DAYS' && (
                        <div>
                            <label htmlFor="paymentTerms.days" className={labelClasses}>Días de Crédito</label>
                            <input type="number" id="paymentTerms.days" name="paymentTerms.days" value={formData.paymentTerms.days} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`} placeholder="Ej: 30" />
                        </div>
                     )}
                     {formData.paymentTerms.type === 'DAY_OF_WEEK' && (
                        <div>
                            <label htmlFor="paymentTerms.day" className={labelClasses}>Día de Pago</label>
                            <select id="paymentTerms.day" name="paymentTerms.day" value={formData.paymentTerms.day} onChange={handleChange} className={`${inputClasses} border-gray-300 dark:border-gray-700`}>
                                {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                            </select>
                        </div>
                     )}
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                    {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
            </div>
        </form>
    );
};

export default AddClientForm;