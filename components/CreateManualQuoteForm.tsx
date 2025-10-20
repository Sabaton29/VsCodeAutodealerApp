import React, { useState, useMemo, useEffect } from 'react';
import { Client, Vehicle, Service, InventoryItem, QuoteItem, Quote, QuoteStatus, Location } from '../types';
import { Icon } from './Icon';

interface CreateManualQuoteFormProps {
    clients: Client[];
    vehicles: Vehicle[];
    services: Service[];
    inventoryItems: InventoryItem[];
    locations: Location[];
    appSettings: any;
    onSave: (quoteData: Omit<Quote, 'id'>) => void;
    onCancel: () => void;
    onAddNewClient: () => void;
    onAddNewVehicle: (clientId: string) => void;
    onQuickAddItem: (name: string, placeholderId: string | undefined, currentItems: QuoteItem[]) => void;
    justAddedQuoteItem: QuoteItem | null;
    itemToReplaceId?: string | null;
    onClearJustAddedItem: () => void;
    selectedLocationId: string;
}

type SearchableItem = {
    id: string;
    type: 'service' | 'inventory';
    name: string;
    price: number;
    taxRate: number;
    category: string;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
const inputBaseClasses = "w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const plusButtonClasses = "p-2 bg-brand-red rounded-lg text-white hover:bg-red-700 transition-colors";

const CreateManualQuoteForm: React.FC<CreateManualQuoteFormProps> = ({ clients, vehicles, services, inventoryItems, locations, appSettings, onSave, onCancel, onAddNewClient, onAddNewVehicle, onQuickAddItem, justAddedQuoteItem, itemToReplaceId, onClearJustAddedItem, selectedLocationId }) => {
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [originalPrices, setOriginalPrices] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        if (justAddedQuoteItem) {
            if (itemToReplaceId) {
                setItems(prev => prev.map(item => item.id === itemToReplaceId ? justAddedQuoteItem : item));
            } else if (!items.some(i => i.id === justAddedQuoteItem.id)) {
                setItems(prev => [...prev, justAddedQuoteItem]);
            }
            onClearJustAddedItem();
        }
    }, [justAddedQuoteItem, itemToReplaceId, onClearJustAddedItem, items]);

    const clientsInLocation = useMemo(() => clients.filter(c => c.locationId === selectedLocationId), [clients, selectedLocationId]);
    const vehiclesForClient = useMemo(() => vehicles.filter(v => v.clientId === selectedClientId), [vehicles, selectedClientId]);

    const searchableItems = useMemo<SearchableItem[]>(() => {
        // Find the location to get the correct hourly rate
        const location = locations.find(l => l.id === selectedLocationId);
        const hourlyRate = location?.hourlyRate || 95000; // Default to Cali rate
        
        const serviceItems: SearchableItem[] = services.map(s => ({
            id: s.id, type: 'service', name: s.name, 
            price: hourlyRate * s.durationHours,
            taxRate: appSettings?.billingSettings?.vatRate || 19, category: s.category,
        }));
        const inventoryItemsTyped: SearchableItem[] = inventoryItems.map(i => ({
            id: i.id, type: 'inventory', name: i.name,
            price: i.salePrice, taxRate: i.taxRate, category: i.category,
        }));
        return [...serviceItems, ...inventoryItemsTyped];
    }, [services, inventoryItems, selectedLocationId, locations, appSettings]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return searchableItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, searchableItems]);

    const totals = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const taxAmount = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * ((item.taxRate || appSettings?.billingSettings?.vatRate || 19) / 100)), 0);
        return { subtotal, taxAmount, total: subtotal + taxAmount };
    }, [items, appSettings]);
    
    const handleAddItem = (item: SearchableItem) => {
        if (items.some(i => i.id === item.id)) return;

        if (item.type === 'inventory') {
            setOriginalPrices(prev => ({ ...prev, [item.id]: item.price }));
        }
        
        setItems(prev => [...prev, {
            id: item.id, type: item.type, description: item.name,
            quantity: 1, unitPrice: item.price, taxRate: item.taxRate,
        }]);
        setSearchTerm('');
    };
    
    const handleRemoveItem = (itemId: string) => {
        setItems(prev => prev.filter(i => i.id !== itemId));
    };
    
    const handleItemChange = (itemId: string, field: 'quantity' | 'unitPrice', value: number) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, [field]: value } : i));
    };

    const handleSuppliedByClientToggle = (itemId: string, isChecked: boolean) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId && item.type === 'inventory') {
                if (isChecked) {
                    return { ...item, suppliedByClient: true, unitPrice: 0, discount: 0 };
                } else {
                    const originalPrice = originalPrices[itemId] || 0;
                    return { ...item, suppliedByClient: false, unitPrice: originalPrice };
                }
            }
            return item;
        }));
    };

    const handleSave = (status: QuoteStatus) => {
        const client = clients.find(c => c.id === selectedClientId);
        const vehicle = vehicles.find(v => v.id === selectedVehicleId);
        if (!client || !vehicle) {
            console.warn("Por favor seleccione un cliente y un vehículo.");
            return;
        }

        // Asegurar que todos los items tengan unitPrice como número válido
        const sanitizedItems = items.map(item => ({
            ...item,
            unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice?.toString() || '0') || 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity?.toString() || '1') || 1,
            taxRate: typeof item.taxRate === 'number' ? item.taxRate : parseFloat(item.taxRate?.toString() || (appSettings?.billingSettings?.vatRate || 19).toString()) || (appSettings?.billingSettings?.vatRate || 19),
            discount: typeof item.discount === 'number' ? item.discount : parseFloat(item.discount?.toString() || '0') || 0,
            costPrice: typeof item.costPrice === 'number' ? item.costPrice : parseFloat(item.costPrice?.toString() || '0') || 0,
        }));

        // Recalculate totals with sanitized items
        const sanitizedSubtotal = sanitizedItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const sanitizedTaxAmount = sanitizedItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice * ((item.taxRate || appSettings?.billingSettings?.vatRate || 19) / 100)), 0);
        const sanitizedTotal = sanitizedSubtotal + sanitizedTaxAmount;

        const quotePayload = {
            clientId: client.id,
            clientName: client.name,
            vehicleSummary: `${vehicle.make} ${vehicle.model} (${vehicle.plate})`,
            issueDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
            subtotal: sanitizedSubtotal,
            taxAmount: sanitizedTaxAmount,
            total: sanitizedTotal,
            locationId: selectedLocationId,
            items: sanitizedItems,
            notes: notes,
            status: status,
        };
        
        onSave(quotePayload);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-black dark:bg-gray-900/20 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Cliente</label>
                        <div className="flex gap-2">
                            <select value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setSelectedVehicleId(''); }} className={inputBaseClasses} required>
                                <option value="">-- Seleccionar --</option>
                                {clientsInLocation.map(c => <option key={c.id} value={c.id}>{c.name} - {c.idNumber}</option>)}
                            </select>
                            <button type="button" onClick={onAddNewClient} className={plusButtonClasses}><Icon name="plus" className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text">Vehículo</label>
                        <div className="flex gap-2">
                            <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className={inputBaseClasses} disabled={!selectedClientId} required>
                                <option value="">-- Seleccionar --</option>
                                {vehiclesForClient.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.make} {v.model}</option>)}
                            </select>
                            <button type="button" onClick={() => onAddNewVehicle(selectedClientId)} className={plusButtonClasses} disabled={!selectedClientId}><Icon name="plus" className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
                 
                <div className="relative">
                    <Icon name="search" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Buscar servicio o repuesto para añadir..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text"/>
                     {isSearchFocused && searchTerm && (
                        <div className="absolute top-full mt-1 w-full bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-700 rounded-lg z-10 max-h-60 overflow-y-auto shadow-lg">
                           {searchResults.map(item => (<button key={`${item.type}-${item.id}`} onClick={() => handleAddItem(item)} className="w-full text-left flex justify-between items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-brand-red/20 text-light-text dark:text-dark-text"><div><p>{item.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p></div><div className="text-right"><p className="font-mono text-sm">{formatCurrency(item.price)}</p><span className={`text-xs px-1.5 py-0.5 rounded ${item.type === 'service' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-200'}`}>{item.type === 'service' ? 'Servicio' : 'Repuesto'}</span></div></button>))}
                           <button type="button" onClick={() => onQuickAddItem(searchTerm, undefined, items)} className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-brand-red/20 text-green-600 dark:text-green-400 border-t border-gray-200 dark:border-gray-700"><Icon name="plus" className="w-4 h-4 mr-2" /><span>Crear nuevo: "{searchTerm}"</span></button>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg"><table className="w-full text-sm text-light-text dark:text-dark-text"><thead className="bg-gray-50 dark:bg-black dark:bg-gray-900/20 text-xs text-gray-700 dark:text-gray-400 uppercase"><tr><th className="px-4 py-2 text-left">Descripción</th><th className="px-2 py-2 text-center w-24">Cant.</th><th className="px-4 py-2 text-right w-36">Precio Unit.</th><th className="px-2 py-2 text-center w-28">Cliente Suministra</th><th className="px-4 py-2 text-right w-36">Total</th><th className="p-2 w-10"></th></tr></thead><tbody className="divide-y divide-gray-200 dark:divide-gray-800">{items.length > 0 ? items.map(item => item.type === 'placeholder' ? (<tr key={item.id} className="bg-yellow-100 dark:bg-yellow-900/20"><td className="px-4 py-2 font-medium italic text-yellow-800 dark:text-yellow-300 flex items-center gap-2"><Icon name="exclamation-triangle" className="w-4 h-4" />{item.description}</td><td colSpan={4} className="px-4 py-2"><button type="button" onClick={() => onQuickAddItem(item.description, item.id, items)} className="w-full text-center py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs font-bold">Definir Ítem</button></td><td className="p-2 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-400"><Icon name="trash" className="w-4 h-4" /></button></td></tr>) : (<tr key={item.id} className={item.suppliedByClient ? 'bg-blue-100/10 dark:bg-blue-900/10' : ''}><td className="px-4 py-2 font-medium">{item.description}</td><td className="px-2 py-1"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full text-center bg-gray-100 dark:bg-gray-800 rounded p-1 border border-gray-300 dark:border-gray-700" /></td><td className="px-2 py-1"><input type="number" value={item.unitPrice} disabled={!!item.suppliedByClient} onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full text-right bg-gray-100 dark:bg-gray-800 rounded p-1 font-mono border border-gray-300 dark:border-gray-700 disabled:opacity-50" /></td><td className="px-2 py-2 text-center">{item.type === 'inventory' && (<input type="checkbox" checked={!!item.suppliedByClient} onChange={(e) => handleSuppliedByClientToggle(item.id, e.target.checked)} className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-brand-red focus:ring-brand-red focus:ring-2"/>)}</td><td className="px-4 py-2 text-right font-mono text-gray-600 dark:text-gray-300">{formatCurrency(item.quantity * item.unitPrice)}</td><td className="p-2 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-400"><Icon name="trash" className="w-4 h-4" /></button></td></tr>)) : (<tr><td colSpan={6} className="text-center py-8 text-gray-500">Añade ítems a la cotización.</td></tr>)}</tbody></table></div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-100 dark:bg-black dark:bg-gray-900/20 p-4 rounded-lg"><h3 className="font-bold flex items-center gap-2 mb-2 text-light-text dark:text-dark-text"><Icon name="document-text" className="w-5 h-5 text-brand-red"/> Notas Adicionales</h3><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full text-sm p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-brand-red focus:border-brand-red text-light-text dark:text-dark-text" placeholder="Añadir notas, condiciones o términos de validez..."></textarea></div>
                <div className="bg-gray-100 dark:bg-black dark:bg-gray-900/20 p-4 rounded-lg space-y-2"><div className="flex justify-between items-center text-gray-600 dark:text-gray-300"><span>Subtotal:</span> <span className="font-mono">{formatCurrency(totals.subtotal)}</span></div><div className="flex justify-between items-center text-gray-600 dark:text-gray-300"><span>IVA ({items[0]?.taxRate || 19}%):</span> <span className="font-mono">{formatCurrency(totals.taxAmount)}</span></div><div className="flex justify-between items-center text-light-text dark:text-white text-xl font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2"><span>Total:</span> <span className="font-mono text-brand-red">{formatCurrency(totals.total)}</span></div></div>
                <div className="flex justify-end gap-3 pt-2"><button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button><button onClick={() => handleSave(QuoteStatus.BORRADOR)} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500" disabled={items.some(i => i.type === 'placeholder') || items.length === 0 || !selectedVehicleId}>Guardar Borrador</button><button onClick={() => handleSave(QuoteStatus.ENVIADO)} className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700" disabled={items.some(i => i.type === 'placeholder') || items.length === 0 || !selectedVehicleId}>Guardar y Enviar</button></div>
                 {(items.some(i => i.type === 'placeholder') || !selectedVehicleId || items.length === 0) && (<p className="text-xs text-yellow-500 dark:text-yellow-400 text-right mt-2">Complete todos los campos (cliente, vehículo, ítems definidos) para guardar.</p>)}
            </div>
        </div>
    );
};

export default CreateManualQuoteForm;