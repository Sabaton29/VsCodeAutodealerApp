import React, { useState, useMemo } from 'react';
import type { Supplier, Permission, PettyCashTransaction } from '../../types';
import { Icon } from '../Icon';
import SupplierActions from '../SupplierActions';

interface SuppliersViewProps {
    selectedLocationId: string;
    suppliers: Supplier[];
    pettyCashTransactions: PettyCashTransaction[];
    setEditingSupplier: (supplier: Supplier | 'new' | null) => void;
    onDeleteSupplier: (supplierId: string) => void;
    hasPermission: (permission: Permission) => boolean;
}

const SuppliersView: React.FC<SuppliersViewProps> = ({ selectedLocationId, suppliers, pettyCashTransactions, setEditingSupplier, onDeleteSupplier, hasPermission }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const debtBySupplier = useMemo(() => {
        const debtMap = new Map<string, number>();
        pettyCashTransactions
            .filter(t => t.paymentMethod === 'Crédito' && t.supplierId)
            .forEach(t => {
                debtMap.set(t.supplierId!, (debtMap.get(t.supplierId!) || 0) + t.amount);
            });
        return debtMap;
    }, [pettyCashTransactions]);

    const filteredSuppliers = useMemo(() => {
        if (!searchTerm) {
            return suppliers;
        }
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [searchTerm, suppliers]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Gestión de Proveedores</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Administra y consulta los proveedores de tu taller.</p>
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
                            placeholder="Buscar por nombre, NIT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                        />
                    </div>
                    {hasPermission('manage:suppliers') && (
                        <button
                            onClick={() => setEditingSupplier('new')}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-light disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isGlobalView}
                            title={isGlobalView ? 'Seleccione una sede para añadir un proveedor' : 'Añadir Proveedor'}
                        >
                            <Icon name="plus" className="w-5 h-5" />
                            Añadir Proveedor
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Razón Social</th>
                                <th scope="col" className="px-6 py-3">NIT</th>
                                <th scope="col" className="px-6 py-3">Contacto</th>
                                <th scope="col" className="px-6 py-3">Crédito</th>
                                <th scope="col" className="px-6 py-3 text-right">Deuda Actual</th>
                                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.length > 0 ? (
                                filteredSuppliers.map((supplier: Supplier) => (
                                    <tr key={supplier.id} className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {supplier.name}
                                        </th>
                                        <td className="px-6 py-4 font-mono">{supplier.nit}</td>
                                        <td className="px-6 py-4">
                                            <p>{supplier.contactPerson}</p>
                                            <p className="text-xs text-gray-500">{supplier.phone} / {supplier.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${supplier.hasCredit ? 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {supplier.hasCredit ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-semibold text-red-400">
                                            {formatCurrency(debtBySupplier.get(supplier.id) || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <SupplierActions
                                                supplier={supplier}
                                                onEdit={() => setEditingSupplier(supplier)}
                                                onDelete={() => onDeleteSupplier(supplier.id)}
                                                hasPermission={hasPermission}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No se encontraron proveedores.
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

export default SuppliersView;