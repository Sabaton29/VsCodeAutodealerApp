import React, { useState, useEffect } from 'react';
import type { Vehicle, Client } from '../types';
import { COLOMBIAN_CAR_MAKES } from '../constants';

interface AddVehicleFormProps {
    onSave: (vehicleData: Vehicle | Omit<Vehicle, 'id'>) => void;
    onCancel: () => void;
    clients: Client[];
    preselectedClientId?: string;
    initialData?: Vehicle;
}

const inputClasses = "w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const AddVehicleForm: React.FC<AddVehicleFormProps> = ({ onSave, onCancel, clients, preselectedClientId, initialData }) => {
    const [formData, setFormData] = useState({
        clientId: preselectedClientId || '',
        plate: '',
        vehicleType: 'Automóvil',
        year: new Date().getFullYear(),
        color: '',
        engineDisplacement: undefined,
        fuelType: 'Gasolina',
        observations: '',
    });
    
    const [selectedMake, setSelectedMake] = useState('');
    const [otherMake, setOtherMake] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [otherModel, setOtherModel] = useState('');
    
    const [errors, setErrors] = useState({ plate: '' });

    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                clientId: initialData.clientId,
                plate: initialData.plate,
                vehicleType: initialData.vehicleType || 'Automóvil',
                year: initialData.year || new Date().getFullYear(),
                color: initialData.color || '',
                engineDisplacement: initialData.engineDisplacement,
                fuelType: initialData.fuelType || 'Gasolina',
                observations: initialData.observations || '',
            });
            const isKnownMake = !!COLOMBIAN_CAR_MAKES[initialData.make];
            setSelectedMake(isKnownMake ? initialData.make : 'Otros');
            if (!isKnownMake) {
                setOtherMake(initialData.make);
            }
            
            const isKnownModel = isKnownMake && COLOMBIAN_CAR_MAKES[initialData.make]?.includes(initialData.model);
            setSelectedModel(isKnownModel ? initialData.model : 'Otros');
            if (!isKnownModel) {
                setOtherModel(initialData.model);
            }
        }
    }, [initialData]);

    const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.toUpperCase();
        let formattedValue = rawValue.replace(/[^A-Z0-9]/g, '');
        
        if (formattedValue.length > 3) {
            formattedValue = `${formattedValue.slice(0, 3)}-${formattedValue.slice(3, 6)}`;
        }
        
        setFormData(prev => ({ ...prev, plate: formattedValue }));

        const plateRegex = /^[A-Z]{3}-\d{3}$/;
        setErrors({ plate: !plateRegex.test(formattedValue) && formattedValue.length > 0 ? 'La placa debe tener el formato ABC-123.' : '' });
    };

    const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMake = e.target.value;
        setSelectedMake(newMake);
        setSelectedModel('');
        setOtherMake('');
        setOtherModel('');
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const newModel = e.target.value;
        setSelectedModel(newModel);
        setOtherModel('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const plateRegex = /^[A-Z]{3}-\d{3}$/;
        if (!formData.plate || !plateRegex.test(formData.plate)) {
            setErrors({ plate: 'La placa debe tener el formato válido ABC-123.' });
            return;
        }
        
        const finalMake = selectedMake === 'Otros' ? otherMake : selectedMake;
        const finalModel = selectedModel === 'Otros' ? otherModel : selectedModel;

        if (!formData.clientId || !finalMake || !finalModel) {
            alert('Por favor complete todos los campos obligatorios.');
            return;
        }
        
        const dataToSave = { ...formData, make: finalMake, model: finalModel };

        if (isEditing) {
            onSave({ ...initialData, ...dataToSave } as Vehicle);
        } else {
            onSave(dataToSave as Omit<Vehicle, 'id'>);
        }
    };

    const isModelDropdown = selectedMake && selectedMake !== 'Otros' && COLOMBIAN_CAR_MAKES[selectedMake];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
                {isEditing ? 'Actualice los datos del vehículo.' : 'Complete los campos para registrar un nuevo vehículo en el sistema.'}
            </p>
            
            {!preselectedClientId && (
                 <div>
                    <label htmlFor="clientId" className={labelClasses}>Propietario del Vehículo</label>
                    <select id="clientId" name="clientId" value={formData.clientId} onChange={(e) => setFormData(p => ({ ...p, clientId: e.target.value }))} className={`${inputClasses} border-gray-300 dark:border-gray-700`} required>
                        <option value="">- Seleccione un Cliente -</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name} ({client.idNumber})</option>
                        ))}
                    </select>
                </div>
            )}
            
            <div>
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Identificación Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="plate" className={labelClasses}>Placa</label>
                        <input type="text" id="plate" name="plate" value={formData.plate} onChange={handlePlateChange} maxLength={7} className={`${inputClasses} uppercase ${errors.plate ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'}`} placeholder="ABC-123" required />
                         {errors.plate && <p className="text-red-500 text-xs mt-1">{errors.plate}</p>}
                    </div>
                    <div>
                        <label htmlFor="vehicleType" className={labelClasses}>Tipo de Vehículo</label>
                        <select id="vehicleType" name="vehicleType" value={formData.vehicleType} onChange={(e) => setFormData(p => ({ ...p, vehicleType: e.target.value }))} className={`${inputClasses} border-gray-300 dark:border-gray-700`}>
                            <option>Automóvil</option><option>Camioneta</option><option>SUV</option><option>Motocicleta</option><option>Camión</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="make" className={labelClasses}>Marca</label>
                            <select id="make" value={selectedMake} onChange={handleMakeChange} className={inputClasses} required>
                                <option value="">- Seleccione una Marca -</option>
                                {Object.keys(COLOMBIAN_CAR_MAKES).sort().map(make => <option key={make} value={make}>{make}</option>)}
                                <option value="Otros">Otros</option>
                            </select>
                        </div>
                        {selectedMake === 'Otros' && (
                             <div>
                                <label htmlFor="otherMake" className={labelClasses}>Especifique la Marca</label>
                                <input type="text" id="otherMake" value={otherMake} onChange={(e) => setOtherMake(e.target.value)} className={inputClasses} required autoFocus />
                            </div>
                        )}
                    </div>
                     <div className="md:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="model" className={labelClasses}>Línea / Modelo</label>
                            {isModelDropdown ? (
                                <select id="model" value={selectedModel} onChange={handleModelChange} className={inputClasses} required>
                                    <option value="">- Seleccione un Modelo -</option>
                                    {COLOMBIAN_CAR_MAKES[selectedMake]?.map(model => <option key={model} value={model}>{model}</option>)}
                                    <option value="Otros">Otros</option>
                                </select>
                            ) : (
                                 <input type="text" id="model" value={selectedModel} onChange={handleModelChange} className={inputClasses} required disabled={!selectedMake}/>
                            )}
                        </div>
                        {selectedModel === 'Otros' && (
                             <div>
                                <label htmlFor="otherModel" className={labelClasses}>Especifique el Modelo</label>
                                <input type="text" id="otherModel" value={otherModel} onChange={(e) => setOtherModel(e.target.value)} className={inputClasses} required autoFocus />
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="year" className={labelClasses}>Año del Modelo</label>
                        <input type="number" id="year" name="year" value={formData.year} onChange={(e) => setFormData(p => ({ ...p, year: e.target.value ? parseInt(e.target.value) : new Date().getFullYear() }))} className={`${inputClasses} border-gray-300 dark:border-gray-700`} />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Información Técnica</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label htmlFor="color" className={labelClasses}>Color</label><input type="text" id="color" name="color" value={formData.color} onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))} className={`${inputClasses} border-gray-300 dark:border-gray-700`} /></div>
                    <div><label htmlFor="engineDisplacement" className={labelClasses}>Cilindraje (cc)</label><input type="number" id="engineDisplacement" name="engineDisplacement" value={formData.engineDisplacement} onChange={(e) => setFormData(p => ({ ...p, engineDisplacement: e.target.value ? parseInt(e.target.value) : undefined }))} className={`${inputClasses} border-gray-300 dark:border-gray-700`} /></div>
                    <div><label htmlFor="fuelType" className={labelClasses}>Tipo de Combustible</label><select id="fuelType" name="fuelType" value={formData.fuelType} onChange={(e) => setFormData(p => ({ ...p, fuelType: e.target.value }))} className={`${inputClasses} border-gray-300 dark:border-gray-700`}><option>Gasolina</option><option>Diesel</option><option>Eléctrico</option><option>Híbrido</option><option>Gas</option></select></div>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Información Adicional</h3>
                <div><label htmlFor="observations" className={labelClasses}>Observaciones</label><textarea id="observations" name="observations" value={formData.observations || ''} onChange={(e) => setFormData(p => ({ ...p, observations: e.target.value }))} rows={3} className={`${inputClasses} border-gray-300 dark:border-gray-700`}></textarea></div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">{isEditing ? 'Guardar Cambios' : 'Guardar Vehículo'}</button>
            </div>
        </form>
    );
};

export default AddVehicleForm;