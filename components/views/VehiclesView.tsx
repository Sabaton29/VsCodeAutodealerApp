import React, { useState, useMemo } from 'react';
import type { Vehicle, Client } from '../../types';
import { Icon } from '../Icon';

interface VehiclesViewProps {
    selectedLocationId: string;
    vehicles: Vehicle[];
    clients: Client[];
    setEditingVehicle: (vehicle: Vehicle | 'new' | null) => void;
    onViewVehicleDetails: (vehicleId: string) => void;
    hasPermission: (permission: 'manage:vehicles') => boolean;
}

const VehiclesView: React.FC<VehiclesViewProps> = ({ selectedLocationId, vehicles, clients, setEditingVehicle, onViewVehicleDetails, hasPermission }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const clientMap = useMemo(() => new Map(clients.map(client => [client.id, client])), [clients]);

    const filteredVehicles = useMemo(() => {
        if (!searchTerm) {
            return vehicles;
        }
        
        return vehicles.filter(vehicle =>
            vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (vehicle.clientId && clientMap.get(vehicle.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase())),
        );
    }, [searchTerm, vehicles, clientMap]);

    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Gestión de Vehículos</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Administra y consulta la flota de vehículos de tus clientes.</p>
            </div>

            <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
                {/* Toolbar */}
                <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative w-full sm:max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por placa, marca, modelo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                        />
                    </div>
                    {hasPermission('manage:vehicles') && (
                        <button
                            onClick={() => setEditingVehicle('new')}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-light disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isGlobalView}
                            title={isGlobalView ? 'Seleccione una sede para añadir un vehículo' : 'Añadir Nuevo Vehículo'}
                        >
                            <Icon name="plus" className="w-5 h-5" />
                            Añadir Vehículo
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Placa</th>
                                <th scope="col" className="px-6 py-3">Marca / Modelo</th>
                                <th scope="col" className="px-6 py-3">Año</th>
                                <th scope="col" className="px-6 py-3">Propietario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.length > 0 ? (
                                filteredVehicles.map((vehicle: Vehicle) => (
                                    <tr 
                                      key={vehicle.id} 
                                      className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                      onClick={() => onViewVehicleDetails(vehicle.id)}
                                    >
                                        <th scope="row" className="px-6 py-4 font-mono text-base text-gray-900 dark:text-white whitespace-nowrap">
                                            {vehicle.plate}
                                        </th>
                                        <td className="px-6 py-4">{`${vehicle.make} ${vehicle.model}`}</td>
                                        <td className="px-6 py-4">{vehicle.year}</td>
                                        <td className="px-6 py-4">{vehicle.clientId ? (clientMap.get(vehicle.clientId)?.name || 'Cliente no encontrado') : 'Sin propietario'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        No se encontraron vehículos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VehiclesView;