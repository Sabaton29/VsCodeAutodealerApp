
import React, { useState, useMemo, useEffect } from 'react';
import { Supplier, InventoryItem, PurchaseOrderItem, PurchaseOrder, PurchaseOrderStatus } from '../types';
import { Icon } from './Icon';

interface CreatePurchaseOrderFormProps {
    onSave: (poData: Omit<PurchaseOrder, 'id'>) => void;
    onCancel: () => void;
    suppliers: Supplier[];
    inventoryItems: InventoryItem[];
    selectedLocationId: string;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const CreatePurchaseOrderForm: React.FC<CreatePurchaseOrderFormProps> = ({ onSave, onCancel, suppliers, inventoryItems, selectedLocationId }) => {
    const [supplierId, setSupplierId] = useState('');
    const [expectedDate, setExpectedDate] = useState('');
    const [items, setItems] = useState<PurchaseOrderItem[]>([]);
    const [notes, setNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const inventoryMap = useMemo(() => new Map(inventoryItems.map(i => [i.id, i])), [inventoryItems]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return inventoryItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [searchTerm, inventoryItems]);
    
    const totals = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
        // Assuming a standard 19% tax for all items for now.
        const taxAmount = subtotal * 0.19;
        return { subtotal, taxAmount, total: subtotal + taxAmount };
    }, [items]);

    const handleAddItem = (item: InventoryItem) => {
        if (items.some(i => i.inventoryItemId === item.id)) return;
        
        setItems(prev => [...prev, {
            inventoryItemId: item.id,
            description: item.name,
            quantity: 1,
            cost: item.costPrice,
        }]);
        setSearchTerm('');
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(prev => prev.filter(i => i.inventoryItemId !== itemId));
    };

    const handleItemChange = (itemId: string, field: 'quantity' | 'cost', value: number) => {
        setItems(prev => prev.map(i => i.inventoryItemId === itemId ? { ...i, [field]: value } : i));
    };

    const handleSave = () => {
        const supplier = suppliers.find(s => s.id === supplierId);
        if (!supplier) {
            alert('Por favor, seleccione un proveedor.');
            return;
        }

        const poData: Omit<PurchaseOrder, 'id'> = {
            supplierId,
            supplierName: supplier.name,
            issueDate: new Date().toISOString().split('T')[0],
            expectedDeliveryDate: expectedDate,
            items,
            subtotal: totals.subtotal,
            taxAmount: totals.taxAmount,
            total: totals.total,
            status: PurchaseOrderStatus.PEDIDO,
            locationId: selectedLocationId,
            notes,
        };
        onSave(poData);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column (Items) */}
            <div className="lg:col-span-3 space-y-4">
                <div className="relative">
                    <Icon name="search" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar artículo por nombre o SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-dark-text"
                    />
                     {isSearchFocused && searchResults.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-dark-light border border-gray-700 rounded-lg z-10 max-h-60 overflow-y-auto shadow-lg">
                           {searchResults.map(item => (
                                <button key={item.id} onClick={() => handleAddItem(item)} className="w-full text-left flex justify-between items-center px-4 py-2 hover:bg-brand-red/20">
                                    <div>
                                        <p>{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.sku}</p>
                                    </div>
                                    <p className="font-mono text-sm">{formatCurrency(item.costPrice)}</p>
                                </button>
                           ))}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto border border-gray-800 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-black dark:bg-gray-900/20 text-xs text-gray-400 uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left">Artículo</th>
                                <th className="px-2 py-2 text-center w-24">Cant.</th>
                                <th className="px-4 py-2 text-right w-36">Costo Unit.</th>
                                <th className="px-4 py-2 text-right w-36">Total</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                             {items.length > 0 ? items.map(item => (
                                <tr key={item.inventoryItemId}>
                                    <td className="px-4 py-2 font-medium">{item.description}</td>
                                    <td className="px-2 py-1"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.inventoryItemId, 'quantity', parseFloat(e.target.value) || 0)} className="w-full text-center bg-gray-800 rounded p-1" /></td>
                                    <td className="px-2 py-1"><input type="number" value={item.cost} onChange={(e) => handleItemChange(item.inventoryItemId, 'cost', parseFloat(e.target.value) || 0)} className="w-full text-right bg-gray-800 rounded p-1 font-mono" /></td>
                                    <td className="px-4 py-2 text-right font-mono text-gray-300">{formatCurrency(item.quantity * item.cost)}</td>
                                    <td className="p-2 text-center"><button onClick={() => handleRemoveItem(item.inventoryItemId)} className="text-red-500 hover:text-red-400"><Icon name="trash" className="w-4 h-4" /></button></td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Añade artículos a la orden de compra.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Column (Info & Totals) */}
            <div className="lg:col-span-2 space-y-4">
                 <div className="bg-black dark:bg-gray-900/20 p-4 rounded-lg space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Proveedor</label>
                        <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full p-2 border border-gray-700 rounded-lg bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-dark-text" required>
                            <option value="">- Seleccione Proveedor -</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de Entrega Estimada</label>
                        <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className="w-full p-2 border border-gray-700 rounded-lg bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-dark-text" />
                    </div>
                </div>

                <div className="bg-black dark:bg-gray-900/20 p-4 rounded-lg">
                     <h3 className="font-bold mb-2">Notas Adicionales</h3>
                     <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full text-sm p-2 bg-gray-800 border border-gray-700 rounded-md" placeholder="Añadir notas, condiciones o dirección de entrega..."></textarea>
                </div>
                
                <div className="bg-black dark:bg-gray-900/20 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-gray-300"><span>Subtotal:</span> <span className="font-mono">{formatCurrency(totals.subtotal)}</span></div>
                    <div className="flex justify-between items-center text-gray-300"><span>IVA (19%):</span> <span className="font-mono">{formatCurrency(totals.taxAmount)}</span></div>
                    <div className="flex justify-between items-center text-white text-xl font-bold border-t border-gray-700 pt-2 mt-2"><span>Total:</span> <span className="font-mono text-brand-red">{formatCurrency(totals.total)}</span></div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700" disabled={items.length === 0 || !supplierId}>Crear Orden</button>
                </div>
            </div>
        </div>
    );
};

export default CreatePurchaseOrderForm;
