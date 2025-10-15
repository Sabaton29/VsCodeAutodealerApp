import React, { useState, useMemo } from 'react';
import type { InventoryItem, Supplier, Permission } from '../../types';
import { Icon } from '../Icon';
import InventoryActions from '../InventoryActions';

interface InventoryViewProps {
    selectedLocationId: string;
    inventoryItems: InventoryItem[];
    suppliers: Supplier[];
    setEditingInventoryItem: (item: InventoryItem | 'new' | null) => void;
    onDeleteInventoryItem: (itemId: string) => void;
    hasPermission: (permission: Permission) => boolean;
}

const InventoryView: React.FC<InventoryViewProps> = ({ selectedLocationId, inventoryItems, setEditingInventoryItem, onDeleteInventoryItem, hasPermission }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchTerm) {
            return inventoryItems;
        }
        return inventoryItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.brand.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [searchTerm, inventoryItems]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

    const getStockBadge = (stock: number) => {
        if (stock > 10) return 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200';
        if (stock > 0) return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-200';
        return 'bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-200';
    };

    const isGlobalView = selectedLocationId === 'ALL_LOCATIONS';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Gestión de Inventario</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Controla las piezas, repuestos y consumibles de tu taller.</p>
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
                            placeholder="Buscar por nombre, SKU, marca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                        />
                    </div>
                    {hasPermission('manage:inventory') && (
                        <button
                            onClick={() => setEditingInventoryItem('new')}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-light disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isGlobalView}
                            title={isGlobalView ? 'Seleccione una sede para añadir un artículo' : 'Añadir Artículo'}
                        >
                            <Icon name="plus" className="w-5 h-5" />
                            Añadir Artículo
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Artículo</th>
                                <th scope="col" className="px-6 py-3">Marca</th>
                                <th scope="col" className="px-6 py-3">Categoría</th>
                                <th scope="col" className="px-6 py-3 text-center">Stock</th>
                                <th scope="col" className="px-6 py-3 text-right">Costo</th>
                                <th scope="col" className="px-6 py-3 text-right">Precio Venta (IVA Incl.)</th>
                                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item: InventoryItem) => {
                                    const finalPrice = item.salePrice * (1 + (item.taxRate || 0) / 100);
                                    return (
                                        <tr key={item.id} className="bg-light dark:bg-dark-light border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                <p>{item.name}</p>
                                                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                                            </th>
                                            <td className="px-6 py-4">{item.brand}</td>
                                            <td className="px-6 py-4">{item.category}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStockBadge(item.stock)}`}>
                                                    {item.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono">{formatCurrency(item.costPrice)}</td>
                                            <td className="px-6 py-4 text-right font-mono">{formatCurrency(finalPrice)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <InventoryActions 
                                                    item={item}
                                                    onEdit={() => setEditingInventoryItem(item)}
                                                    onDelete={() => onDeleteInventoryItem(item.id)}
                                                    hasPermission={hasPermission}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        No se encontraron artículos.
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

export default InventoryView;