import React, { useState, useMemo } from 'react';
import type { Service, Permission } from '../../types';
import { Icon } from '../Icon';
import ServiceActions from '../ServiceActions';
import ServiceDetailsModal from '../ServiceDetailsModal';

interface ServicesCatalogViewProps {
    selectedLocationId: string;
    services: Service[];
    setEditingService: (service: Service | 'new' | null) => void;
    onDeleteService: (serviceId: string) => void;
    hasPermission: (permission: Permission) => boolean;
    locations?: Array<{ id: string; name: string }>;
}

const ServicesCatalogView: React.FC<ServicesCatalogViewProps> = ({ selectedLocationId, services, setEditingService, onDeleteService, hasPermission, locations = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingService, setViewingService] = useState<Service | null>(null);

    const filteredServices = useMemo(() => {
        if (!searchTerm) {
            return services;
        }
        return services.filter(service =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.category.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [searchTerm, services]);
    
    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Catálogo de Servicios</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Administra los servicios estandarizados de tu taller.</p>
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
                            placeholder="Buscar por nombre o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                        />
                    </div>
                    {hasPermission('manage:services') && (
                        <button
                            onClick={() => setEditingService('new')}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-light disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isGlobalView}
                            title={isGlobalView ? 'Seleccione una sede para añadir un servicio' : 'Añadir Servicio'}
                        >
                            <Icon name="plus" className="w-5 h-5" />
                            Añadir Servicio
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre del Servicio</th>
                                <th scope="col" className="px-6 py-3">Categoría</th>
                                <th scope="col" className="px-6 py-3 text-center">Duración (Horas)</th>
                                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.length > 0 ? (
                                filteredServices.map((service: Service) => (
                                    <tr key={service.id} className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {service.name}
                                        </th>
                                        <td className="px-6 py-4">{service.category}</td>
                                        <td className="px-6 py-4 text-center font-mono">{service.durationHours} h</td>
                                        <td className="px-6 py-4 text-right">
                                            <ServiceActions
                                                service={service}
                                                onEdit={() => setEditingService(service)}
                                                onDelete={() => onDeleteService(service.id)}
                                                onViewDetails={() => setViewingService(service)}
                                                hasPermission={hasPermission}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        No se encontraron servicios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Service Details Modal */}
            <ServiceDetailsModal
                service={viewingService}
                isOpen={viewingService !== null}
                onClose={() => setViewingService(null)}
                locations={locations}
            />
        </div>
    );
};

export default ServicesCatalogView;