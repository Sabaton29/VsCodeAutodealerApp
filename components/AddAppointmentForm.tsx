import React, { useState, useEffect, useMemo } from 'react';
import { Client, Vehicle, StaffMember, UserRole, Appointment, AppointmentStatus, Location } from '../types';
import { Icon } from './Icon';

interface AddAppointmentFormProps {
    onSave: (appointmentData: Appointment | Omit<Appointment, 'id'>) => void;
    onCancel: () => void;
    clients: Client[];
    vehicles: Vehicle[];
    staffMembers: StaffMember[];
    locations: Location[];
    selectedLocationId: string;
    initialData?: Appointment;
    onAddNewClient: () => void;
    onAddNewVehicle: (clientId: string) => void;
}

const inputBaseClasses = "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium mb-1 text-gray-300";
const plusButtonClasses = "p-2 bg-brand-red rounded-lg text-white hover:bg-red-700 transition-colors";

const AddAppointmentForm: React.FC<AddAppointmentFormProps> = (props) => {
    const { onSave, onCancel, clients, vehicles, staffMembers, locations, selectedLocationId, initialData, onAddNewClient, onAddNewVehicle } = props;

    const [formData, setFormData] = useState({
        clientId: '',
        vehicleId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        serviceRequested: '',
        advisorId: '',
        notes: '',
        locationId: selectedLocationId,
    });
    
    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            const dt = new Date(initialData.appointmentDateTime);
            setFormData({
                clientId: initialData.clientId,
                vehicleId: initialData.vehicleId,
                date: dt.toISOString().split('T')[0],
                time: dt.toTimeString().substring(0, 5),
                serviceRequested: initialData.serviceRequested,
                advisorId: initialData.advisorId || '',
                notes: initialData.notes || '',
                locationId: initialData.locationId,
            });
        }
    }, [initialData]);

    const clientsInLocation = useMemo(() => clients.filter(c => c.locationId === formData.locationId), [clients, formData.locationId]);
    const vehiclesForClient = useMemo(() => vehicles.filter(v => v.clientId === formData.clientId), [vehicles, formData.clientId]);
    const serviceAdvisors = useMemo(() => staffMembers.filter(s => s.locationId === formData.locationId && s.role === UserRole.ASESOR_SERVICIO), [staffMembers, formData.locationId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { clientId, vehicleId, date, time, serviceRequested, locationId } = formData;
        if (!clientId || !vehicleId || !date || !time || !serviceRequested) {
            alert('Por favor, complete todos los campos requeridos.');
            return;
        }

        const client = clients.find(c => c.id === clientId);
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!client || !vehicle) return;

        const appointmentDateTime = new Date(`${date}T${time}`).toISOString();

        const appointmentData: Omit<Appointment, 'id'> = {
            clientId,
            clientName: client.name,
            vehicleId,
            vehicleSummary: `${vehicle.make} ${vehicle.model} (${vehicle.plate})`,
            appointmentDateTime,
            serviceRequested,
            status: isEditing && initialData ? initialData.status : AppointmentStatus.PROGRAMADA,
            locationId,
            advisorId: formData.advisorId || undefined,
            notes: formData.notes || undefined,
            linkedWorkOrderId: isEditing && initialData ? initialData.linkedWorkOrderId : undefined,
        };
        
        if (isEditing && initialData) {
            onSave({ ...initialData, ...appointmentData });
        } else {
            onSave(appointmentData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className={labelClasses}>Cliente</label>
                    <div className="flex gap-2">
                        <select name="clientId" value={formData.clientId} onChange={(e) => { setFormData(p => ({ ...p, clientId: e.target.value, vehicleId: '' }));}} className={inputBaseClasses} required>
                            <option value="">-- Seleccionar --</option>
                            {clientsInLocation.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button type="button" onClick={onAddNewClient} className={plusButtonClasses}><Icon name="plus" className="w-5 h-5"/></button>
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Vehículo</label>
                    <div className="flex gap-2">
                        <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} className={inputBaseClasses} disabled={!formData.clientId} required>
                            <option value="">-- Seleccionar --</option>
                            {vehiclesForClient.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make} {v.model}</option>)}
                        </select>
                        <button type="button" onClick={() => onAddNewVehicle(formData.clientId)} className={plusButtonClasses} disabled={!formData.clientId}><Icon name="plus" className="w-5 h-5"/></button>
                    </div>
                </div>
                 <div>
                    <label className={labelClasses}>Fecha</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputBaseClasses} required />
                </div>
                 <div>
                    <label className={labelClasses}>Hora</label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} className={inputBaseClasses} required />
                </div>
                <div className="md:col-span-2">
                    <label className={labelClasses}>Servicio Solicitado</label>
                    <textarea name="serviceRequested" value={formData.serviceRequested} onChange={handleChange} rows={3} className={inputBaseClasses} required></textarea>
                </div>
                <div>
                    <label className={labelClasses}>Asesor</label>
                    <select name="advisorId" value={formData.advisorId} onChange={handleChange} className={inputBaseClasses}>
                        <option value="">-- Opcional --</option>
                        {serviceAdvisors.map(sa => <option key={sa.id} value={sa.id}>{sa.name}</option>)}
                    </select>
                </div>
                 <div className="md:col-span-2">
                    <label className={labelClasses}>Notas Adicionales</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className={inputBaseClasses}></textarea>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg">{isEditing ? 'Guardar Cambios' : 'Agendar Cita'}</button>
            </div>
        </form>
    );
};

export default AddAppointmentForm;