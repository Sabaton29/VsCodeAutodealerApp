import React from 'react';
import type { Service } from '../types';
import { Icon } from './Icon';

interface ServiceDetailsModalProps {
    service: Service | null;
    isOpen: boolean;
    onClose: () => void;
    locations?: Array<{ id: string; name: string }>;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ service, isOpen, onClose, locations = [] }) => {
    if (!isOpen || !service) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-light dark:bg-dark-light rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                        Detalles del Servicio
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                            Información Básica
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Nombre del Servicio
                                </label>
                                <p className="text-light-text dark:text-dark-text font-medium">
                                    {service.name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Categoría
                                </label>
                                <p className="text-light-text dark:text-dark-text">
                                    {service.category}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Duración
                                </label>
                                <p className="text-light-text dark:text-dark-text font-mono">
                                    {service.durationHours} horas
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Precio
                                </label>
                                <p className="text-light-text dark:text-dark-text font-mono">
                                    {new Intl.NumberFormat('es-CO', { 
                                        style: 'currency', 
                                        currency: 'COP', 
                                        minimumFractionDigits: 0, 
                                    }).format(service.price || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {service.description && (
                        <div>
                            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                                Descripción
                            </h3>
                            <p className="text-light-text dark:text-dark-text leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    )}

                    {/* Additional Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                            Información Adicional
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    ID del Servicio
                                </label>
                                <p className="text-light-text dark:text-dark-text font-mono text-sm">
                                    {service.id.length > 10 ? `${service.id.substring(0, 8)}...` : service.id}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Ubicación
                                </label>
                                <p className="text-light-text dark:text-dark-text">
                                    {service.locationId 
                                        ? (locations.find(l => l.id === service.locationId)?.name || `Sede ${service.locationId.substring(0, 8)}...`)
                                        : 'Todas las sedes'
                                    }
                                </p>
                            </div>
                            {service.createdAt && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Fecha de Creación
                                    </label>
                                    <p className="text-light-text dark:text-dark-text">
                                        {new Date(service.createdAt).toLocaleDateString('es-CO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            )}
                            {service.updatedAt && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Última Actualización
                                    </label>
                                    <p className="text-light-text dark:text-dark-text">
                                        {new Date(service.updatedAt).toLocaleDateString('es-CO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsModal;
