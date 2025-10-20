

import React, { useState } from 'react';
import type { Location } from '../types';
import { Icon } from './Icon';

interface LocationsSettingsProps {
    locations: Location[];
    onAdd: () => void;
    onEdit: (location: Location) => void;
    onDelete: (locationId: string) => void;
    onUpdateHourlyRate?: (locationId: string, hourlyRate: number) => void;
}

const LocationsSettings: React.FC<LocationsSettingsProps> = ({ locations, onAdd, onEdit, onDelete, onUpdateHourlyRate }) => {
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    
    const handleDelete = (location: Location) => {
        if (window.window.confirm(`¿Está seguro de que desea eliminar la sede "${location.name}"? Esta acción no se puede deshacer.`)) {
            onDelete(location.id);
        }
    };

    const handleHourlyRateChange = (locationId: string, value: string) => {
        const hourlyRate = parseFloat(value) || 0;
        if (onUpdateHourlyRate) {
            onUpdateHourlyRate(locationId, hourlyRate);
        }
    };
    
    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Gestión de Sedes</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Añade o edita las sedes y su información de contacto.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-light"
                >
                    <Icon name="plus" className="w-5 h-5" />
                    Añadir Sede
                </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {locations && locations.length > 0 ? (
                    locations.map(location => (
                        <li key={location.id} className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Icon name="office-building" className="w-8 h-8 text-brand-red flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-light-text dark:text-dark-text">{location.name || 'Sin nombre'} - <span className="text-gray-500 dark:text-gray-400">{location.city || 'Sin ciudad'}</span></p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{location.address || 'Sin dirección'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{location.phone || 'Sin teléfono'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">Precio por hora:</span>
                                    <input
                                        type="number"
                                        value={editingLocation?.id === location.id ? editingLocation.hourlyRate || '' : location.hourlyRate || ''}
                                        onChange={(e) => {
                                            const hourlyRate = parseFloat(e.target.value) || 0;
                                            const updatedLocation = { ...location, hourlyRate };
                                            setEditingLocation(updatedLocation);
                                            handleHourlyRateChange(location.id, e.target.value);
                                        }}
                                        className="w-24 px-2 py-1 border border-gray-600 rounded-md bg-gray-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
                                        placeholder="0"
                                    />
                                    <span className="text-gray-400 text-sm">/hr</span>
                                </div>
                                <button onClick={() => onEdit(location)} className="p-2 text-gray-400 hover:text-brand-red transition-colors" title="Editar Sede">
                                    <Icon name="edit" className="w-5 h-5"/>
                                </button>
                                 <button onClick={() => handleDelete(location)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar Sede">
                                    <Icon name="trash" className="w-5 h-5"/>
                                </button>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No hay sedes registradas. Haz clic en "Añadir Sede" para crear la primera.
                    </li>
                )}
            </ul>
        </div>
    );
};

export default LocationsSettings;