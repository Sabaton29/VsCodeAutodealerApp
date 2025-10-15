import React, { useState, useMemo, memo } from 'react';
import type { Client } from '../../types';
import { Icon } from '../Icon';

interface ClientsViewProps {
    selectedLocationId: string;
    clients: Client[];
    setEditingClient: (client: Client | 'new' | null) => void;
    onViewClientDetails: (clientId: string) => void;
    hasPermission: (permission: 'manage:clients') => boolean;
}

const ClientsView: React.FC<ClientsViewProps> = memo(({ selectedLocationId, clients, setEditingClient, onViewClientDetails, hasPermission }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchTerm) {
      return clients;
    }
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm),
    );
  }, [searchTerm, clients]);

  const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Gestión de Clientes</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Administra y consulta la información de tus clientes.</p>
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
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            {hasPermission('manage:clients') && (
              <button
                onClick={() => setEditingClient('new')} 
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-light disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isGlobalView}
                title={isGlobalView ? 'Seleccione una sede para añadir un cliente' : 'Añadir Nuevo Cliente'}
              >
                <Icon name="plus" className="w-5 h-5" />
                Añadir Cliente
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Cliente</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Teléfono</th>
                  <th scope="col" className="px-6 py-3 text-center">Vehículos</th>
                  <th scope="col" className="px-6 py-3">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client: Client) => (
                    <tr 
                      key={client.id} 
                      className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => onViewClientDetails(client.id)}
                    >
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {client.name}
                      </th>
                      <td className="px-6 py-4">{client.email}</td>
                      <td className="px-6 py-4">{client.phone}</td>
                      <td className="px-6 py-4 text-center">{client.vehicleCount}</td>
                      <td className="px-6 py-4">{new Date(client.registrationDate).toLocaleDateString('es-CO')}</td>
                    </tr>
                  ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                            No se encontraron clientes.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
});

ClientsView.displayName = 'ClientsView';

export default ClientsView;