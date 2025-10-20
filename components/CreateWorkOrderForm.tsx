import React, { useState, useMemo, useEffect } from 'react';
import { Client, WorkOrder, Vehicle, KanbanStage, StaffMember, UserRole, Service, Location, DiagnosticType } from '../types';
import { Icon } from './Icon';
import FormSection from './FormSection';
import ToggleSwitch from './ToggleSwitch';

interface CreateWorkOrderFormProps {
    onSave: (data: Omit<WorkOrder, 'id' | 'status' | 'date' | 'history'>) => Promise<void>;
    onCancel: () => void;
    selectedLocationId: string;
    clients: Client[];
    vehicles: Vehicle[];
    staffMembers: StaffMember[];
    services: Service[];
    locations: Location[];
    onAddNewClient: () => void;
    onAddNewVehicle: (clientId: string) => void;
    initialData?: {
        clientId?: string;
        vehicleId?: string;
        serviceRequested?: string;
        advisorId?: string;
    };
}

const inputBaseClasses = "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const checkboxLabelClasses = "flex items-center text-sm text-gray-700 dark:text-gray-300";
const checkboxInputClasses = "h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-brand-red focus:ring-brand-red focus:ring-2";
const plusButtonClasses = "p-2 bg-brand-red rounded-lg text-white hover:bg-red-700 transition-colors";
const actionButtonClasses = "cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red";

const getInitialFormState = (initialData?: { clientId?: string; vehicleId?: string; serviceRequested?: string; advisorId?: string; }) => ({
    serviceTypeAdvanced: false,
    isWarranty: false,
    roadTestAuthorized: true,
    requiresInitialDiagnosis: true,
    diagnosticType: 'Básico' as DiagnosticType,
    clientId: initialData?.clientId || '',
    vehicleId: initialData?.vehicleId || '',
    serviceRequested: initialData?.serviceRequested || '',
    serviceDateTime: '',
    advisorId: initialData?.advisorId || '',
    mileage: '',
    fuelLevel: '1/2' as 'Vacío' | '1/4' | '1/2' | '3/4' | 'Lleno' | 'N/A',
    reportedValuables: '',
    inventoryChecklist: {
        spareTire: true, jackKit: true, tools: true,
        fireExtinguisher: true, firstAidKit: true, other: false,
    },
    inventoryOtherText: '',
    documents: '',
    // Added fields expected by handleSubmit and other call-sites
    entryEvidenceUrls: [] as string[],
    notes: '',
    observations: '',
    priority: '',
    estimatedHours: '',
    actualHours: '',
    comments: '',
    damages: {
        scratched: false, fogged: false, dented: false,
        chipped: false, noDamage: true,
    },
    otherDamages: '',
    entryEvidenceFiles: [] as File[],
});

const inventoryChecklistLabels: Record<string, string> = {
    spareTire: 'Llanta Repuesto', jackKit: 'Kit Gato', tools: 'Herramientas',
    fireExtinguisher: 'Extintor', firstAidKit: 'Botiquín',
};

const damageLabels: Record<keyof ReturnType<typeof getInitialFormState>['damages'], string> = {
    scratched: 'Rayado',
    fogged: 'Fogueado',
    dented: 'Sumido',
    chipped: 'Picado',
    noDamage: 'Sin Daños Visibles',
};

const CreateWorkOrderForm: React.FC<CreateWorkOrderFormProps> = ({
    onSave,
    onCancel,
    selectedLocationId,
    clients,
    vehicles,
    staffMembers,
    onAddNewClient,
    onAddNewVehicle,
    initialData,
}) => {
    console.warn('🔄 CreateWorkOrderForm - Component rendered with clients:', clients.length, 'initialData:', initialData);
    const [formState, setFormState] = useState(getInitialFormState(initialData));
    
    // Forzar re-render cuando cambien los datos
    useEffect(() => {
        console.warn('🔄 CreateWorkOrderForm - Data changed, forcing re-render');
    }, [clients.length, vehicles.length]);

    // Actualizar formulario cuando cambien los datos iniciales
    useEffect(() => {
        if (initialData) {
            console.warn('🔄 CreateWorkOrderForm - Initial data changed, updating form:', initialData);
            setFormState(prev => ({
                ...prev,
                clientId: initialData.clientId || prev.clientId,
                vehicleId: initialData.vehicleId || prev.vehicleId,
                serviceRequested: initialData.serviceRequested || prev.serviceRequested,
                advisorId: initialData.advisorId || prev.advisorId,
            }));
        }
    }, [initialData]);

    const clientsInLocation = useMemo(() => {
        console.warn('🔍 CreateWorkOrderForm - All clients:', clients);
        console.warn('🔍 CreateWorkOrderForm - selectedLocationId:', selectedLocationId);
        
        // Debug: mostrar locationId de cada cliente
        clients.forEach((client, index) => {
            console.warn(`🔍 CreateWorkOrderForm - Client ${index}: ${client.name}, locationId: "${client.locationId}"`);
        });
        
        // If selectedLocationId is 'ALL_LOCATIONS' or empty, show all clients
        if (!selectedLocationId || selectedLocationId === 'ALL_LOCATIONS') {
            console.warn('🔍 CreateWorkOrderForm - Showing all clients (no filter)');
            return clients;
        }
        
        const filtered = clients.filter(c => {
            console.warn(`🔍 CreateWorkOrderForm - Comparing: client.locationId="${c.locationId}" === selectedLocationId="${selectedLocationId}"`);
            // Incluir clientes que coincidan con la ubicación O que no tengan locationId asignado (undefined/null)
            return c.locationId === selectedLocationId || !c.locationId || c.locationId === 'undefined';
        });
        console.warn('🔍 CreateWorkOrderForm - Filtered clients:', filtered);
        return filtered;
    }, [clients, selectedLocationId]);
    const vehiclesForClient = useMemo(() => {
        console.warn('🔍 CreateWorkOrderForm - All vehicles:', vehicles);
        console.warn('🔍 CreateWorkOrderForm - formState.clientId:', formState.clientId);
        const filtered = vehicles.filter(v => v.clientId === formState.clientId);
        console.warn('🔍 CreateWorkOrderForm - Filtered vehicles for client:', filtered);
        return filtered;
    }, [vehicles, formState.clientId]);
    const serviceAdvisors = useMemo(() => staffMembers.filter(s => s.locationId === selectedLocationId && s.role === UserRole.ASESOR_SERVICIO), [staffMembers, selectedLocationId]);

    useEffect(() => {
        setFormState(prev => ({ ...prev, vehicleId: vehiclesForClient.length === 1 ? vehiclesForClient[0].id : '' }));
    }, [vehiclesForClient]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name: keyof typeof formState, value: boolean) => {
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (group: 'inventoryChecklist' | 'damages', key: string, isChecked: boolean) => {
        setFormState(prev => {
            const newGroupState = { ...prev[group], [key]: isChecked };
            if (group === 'damages') {
                const damages = newGroupState as typeof formState.damages;
                if (key === 'noDamage' && isChecked) {
                    Object.keys(damages).forEach(k => { if (k !== 'noDamage') (damages as any)[k] = false; });
                } else if (key !== 'noDamage' && isChecked) {
                    damages.noDamage = false;
                }
            }
            return { ...prev, [group]: newGroupState };
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setFormState(prev => ({ ...prev, entryEvidenceFiles: [...prev.entryEvidenceFiles, ...files] }));
        }
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        setFormState(prev => ({
            ...prev,
            entryEvidenceFiles: prev.entryEvidenceFiles.filter((_, index) => index !== indexToRemove),
        }));
    };
    
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.clientId || !formState.vehicleId || !formState.serviceRequested) {
            console.warn('Por favor, complete los campos de Cliente, Vehículo y Servicio Solicitado.');
            return;
        }
        const client = clients.find(c => c.id === formState.clientId);
        const vehicle = vehicles.find(v => v.id === formState.vehicleId);
        if (!client || !vehicle) return;
        
        const { 
            entryEvidenceFiles, 
            entryEvidenceUrls, 
            notes,
            observations,
            priority,
            estimatedHours,
            actualHours,
            serviceDateTime,
            documents,
            ...formStateWithoutFiles 
        } = formState;
        
        // Convert files to data URLs for storage
        const entryEvidenceImageUrls = await Promise.all(
            entryEvidenceFiles.map(file => new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            })),
        );
        
        const workOrderData: Omit<WorkOrder, 'id' | 'status' | 'date' | 'history'> = {
            ...formStateWithoutFiles,
            linkedQuoteIds: [],
            diagnosticType: formState.requiresInitialDiagnosis ? formState.diagnosticType : undefined,
            client: { id: client.id, name: client.name },
            vehicle: { id: vehicle.id, make: vehicle.make, model: vehicle.model, plate: vehicle.plate },
            stage: KanbanStage.RECEPCION,
            total: 0,
            locationId: selectedLocationId,
            timeInStage: '0d 0h 0m',
            services: [],
            entryEvidenceImageUrls, // Add the converted image URLs
        };
        onSave(workOrderData);
    };

    return (
        <form onSubmit={handleSubmit} className="relative space-y-6">
            <div className="flex justify-end -mt-2">
                <ToggleSwitch 
                    label="Recepción Avanzada" 
                    enabled={formState.serviceTypeAdvanced}
                    onChange={(val) => handleToggle('serviceTypeAdvanced', val)}
                    description="Activa para un registro de ingreso detallado del vehículo."
                />
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
                 <FormSection title="1. Cliente y Vehículo" icon={<Icon name="user" className="w-5 h-5 text-brand-red" />}>
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Cliente</label>
                            <div className="flex gap-2">
                                <select name="clientId" value={formState.clientId} onChange={handleChange} className={inputBaseClasses} required>
                                    <option value="">-- Seleccionar Cliente --</option>
                                    {clientsInLocation.map(c => <option key={c.id} value={c.id}>{c.name} - {c.idNumber}</option>)}
                                </select>
                                <button type="button" onClick={onAddNewClient} className={plusButtonClasses}><Icon name="plus" className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Vehículo</label>
                            <div className="flex gap-2">
                                <select name="vehicleId" value={formState.vehicleId} onChange={handleChange} className={inputBaseClasses} disabled={!formState.clientId} required>
                                    <option value="">-- Seleccionar Vehículo --</option>
                                    {vehiclesForClient.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make} {v.model}</option>)}
                                </select>
                                <button type="button" onClick={() => onAddNewVehicle(formState.clientId)} className={plusButtonClasses} disabled={!formState.clientId}><Icon name="plus" className="w-5 h-5"/></button>
                            </div>
                        </div>
                    </div>
                </FormSection>
                 <div className="relative">
                     <FormSection title="2. Información del Servicio" icon={<Icon name="clipboard" className="w-5 h-5 text-brand-red" />}>
                         <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Servicio Solicitado / Falla Reportada</label>
                            <textarea name="serviceRequested" value={formState.serviceRequested} onChange={handleChange} rows={3} className={inputBaseClasses} required></textarea>
                        </div>
                        <div className="space-y-3 bg-black/10 dark:bg-black dark:bg-gray-900/20 p-3 rounded-lg">
                            <ToggleSwitch
                                label="¿Requiere Diagnóstico Inicial?"
                                enabled={formState.requiresInitialDiagnosis}
                                onChange={(val) => handleToggle('requiresInitialDiagnosis', val)}
                                description="Desactivar si el cliente solicita un trabajo específico sin revisión."
                            />
                            {formState.requiresInitialDiagnosis && (
                                <div className="mt-3 pl-4 border-l-2 border-brand-red/50">
                                    <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Tipo de Diagnóstico Requerido</label>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {(['Básico', 'Intermedio', 'Avanzado'] as DiagnosticType[]).map(type => (
                                            <label key={type} className="flex items-center text-sm text-light-text dark:text-dark-text">
                                                <input
                                                    type="radio"
                                                    name="diagnosticType"
                                                    value={type}
                                                    checked={formState.diagnosticType === type}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 text-brand-red bg-gray-100 border-gray-300 focus:ring-brand-red dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <span className="ml-2">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <ToggleSwitch
                                label="¿Servicio por Garantía?"
                                enabled={formState.isWarranty}
                                onChange={(val) => handleToggle('isWarranty', val)}
                                description="Marcar si el trabajo a realizar corresponde a una garantía."
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Asesor de Servicio</label>
                            <select name="advisorId" value={formState.advisorId} onChange={handleChange} className={inputBaseClasses}>
                                <option value="">-- Asignar Asesor --</option>
                                {serviceAdvisors.map(sa => <option key={sa.id} value={sa.id}>{sa.name}</option>)}
                            </select>
                        </div>
                    </div>
                </FormSection>
                </div>
            </div>
            
            {formState.serviceTypeAdvanced && (
                <div className="space-y-6">
                    <FormSection title="3. Estado Detallado del Vehículo" icon={<Icon name="car" className="w-5 h-5 text-brand-red" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Kilometraje</label>
                                <input type="text" name="mileage" value={formState.mileage} onChange={handleChange} className={inputBaseClasses} placeholder="Ej: 85.400 km" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Nivel de Combustible</label>
                                <select name="fuelLevel" value={formState.fuelLevel} onChange={handleChange} className={inputBaseClasses}><option>Vacío</option><option>1/4</option><option>1/2</option><option>3/4</option><option>Lleno</option></select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Objetos de Valor Reportados</label>
                                <input type="text" name="reportedValuables" value={formState.reportedValuables} onChange={handleChange} className={inputBaseClasses} placeholder="Ej: Gafas de sol en guantera" />
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title="4. Checklist de Daños" icon={<Icon name="exclamation-triangle" className="w-5 h-5 text-brand-red" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-300">Marque los daños visibles:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.keys(formState.damages).map(key => (
                                        <label key={key} className={checkboxLabelClasses}>
                                            <input
                                                type="checkbox"
                                                checked={formState.damages[key as keyof typeof formState.damages]}
                                                onChange={(e) => handleCheckboxChange('damages', key, e.target.checked)}
                                                className={`${checkboxInputClasses} mr-2`}
                                            />
                                            {damageLabels[key as keyof typeof damageLabels]}
                                        </label>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Descripción de Daños / Observaciones</label>
                                <textarea
                                    name="otherDamages"
                                    value={formState.otherDamages}
                                    onChange={handleChange}
                                    rows={3}
                                    className={inputBaseClasses}
                                    placeholder="Ej: Rayón profundo en el parachoques trasero, lado derecho."
                                ></textarea>
                            </div>
                        </div>
                    </FormSection>
                    
                    <FormSection title="5. Checklist de Inventario" icon={<Icon name="list-bullet" className="w-5 h-5 text-brand-red" />}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                            {Object.keys(inventoryChecklistLabels).map(key => (
                                <label key={key} className={checkboxLabelClasses}>
                                    <input
                                        type="checkbox"
                                        checked={formState.inventoryChecklist[key as keyof typeof formState.inventoryChecklist]}
                                        onChange={(e) => handleCheckboxChange('inventoryChecklist', key, e.target.checked)}
                                        className={`${checkboxInputClasses} mr-2`}
                                    />
                                    {inventoryChecklistLabels[key]}
                                </label>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <label className={checkboxLabelClasses}>
                                <input
                                    type="checkbox"
                                    checked={formState.inventoryChecklist.other}
                                    onChange={(e) => handleCheckboxChange('inventoryChecklist', 'other', e.target.checked)}
                                    className={`${checkboxInputClasses} mr-2`}
                                />
                                Otro
                            </label>
                            <input type="text" name="inventoryOtherText" value={formState.inventoryOtherText} onChange={handleChange} disabled={!formState.inventoryChecklist.other} className={`${inputBaseClasses} flex-1`} placeholder="Especifique..."/>
                        </div>
                    </FormSection>
                    
                    <FormSection title="6. Comentarios y Evidencia" icon={<Icon name="document-text" className="w-5 h-5 text-brand-red" />}>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Comentarios Adicionales del Asesor</label>
                            <textarea name="comments" value={formState.comments} onChange={handleChange} rows={3} className={inputBaseClasses}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Evidencia Fotográfica de Ingreso</label>
                            <div className="flex items-center gap-4">
                                <label htmlFor="entry-evidence-upload" className={`${actionButtonClasses} bg-gray-600 hover:bg-gray-700`}>
                                    <Icon name="upload" className="w-5 h-5"/>
                                    <span>Adjuntar Fotos</span>
                                </label>
                                <input id="entry-evidence-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                <label htmlFor="camera-capture" className={`${actionButtonClasses} bg-blue-600 hover:bg-blue-700`}>
                                    <Icon name="camera" className="w-5 h-5"/>
                                    <span>Tomar Foto</span>
                                </label>
                                <input id="camera-capture" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                            </div>
                             {formState.entryEvidenceFiles.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-3">
                                    {formState.entryEvidenceFiles.map((file, index) => (
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
                    </FormSection>
                </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200/10 dark:border-gray-800/60">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                    Crear Orden de Trabajo
                </button>
            </div>
        </form>
    );
};

export default CreateWorkOrderForm;