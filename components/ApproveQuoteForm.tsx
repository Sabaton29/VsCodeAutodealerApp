import React, { useState, useMemo, useEffect } from 'react';
import { Quote, QuoteItem, QuoteStatus, Service, InventoryItem, Location } from '../types';
import { Icon } from './Icon';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

type SearchableItem = {
    id: string;
    type: 'service' | 'inventory';
    name: string;
    price: number;
    taxRate: number;
    category: string;
}

interface ApproveQuoteFormProps {
    quote: Quote;
    onSave: (finalQuoteData: Quote) => void;
    onCancel: () => void;
    services: Service[];
    inventoryItems: InventoryItem[];
    locations: Location[];
    onQuickAddItem: (name: string, placeholderId: string | undefined, currentItems: QuoteItem[]) => void;
    justAddedQuoteItem: QuoteItem | null;
    itemToReplaceId?: string | null;
    onClearJustAddedItem: () => void;
}

const ApproveQuoteForm: React.FC<ApproveQuoteFormProps> = ({ quote, onSave, onCancel, services, inventoryItems, locations, onQuickAddItem, justAddedQuoteItem, itemToReplaceId, onClearJustAddedItem }) => {
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [originalPrices, setOriginalPrices] = useState<Record<string, number>>({});
    const [approvedItemIds, setApprovedItemIds] = useState<Set<string>>(new Set((quote.items || []).map(i => i.id)));
    const [notes, setNotes] = useState(quote.notes || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [totalDiscount, setTotalDiscount] = useState(0); // Descuento general en porcentaje
    const [fullQuoteData, setFullQuoteData] = useState<Quote | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Usar directamente los datos de la cotización
    const currentQuote = quote;
    
    // 🚨 DEBUG CRÍTICO: Verificar qué datos llegan al componente
    console.log('🚨 ApproveQuoteForm - DATOS RECIBIDOS:', {
        quote: currentQuote,
        quoteItems: currentQuote?.items,
        quoteItemsLength: currentQuote?.items?.length,
        quoteItemsDetails: currentQuote?.items?.map(item => ({
            id: item.id,
            description: item.description,
            unitPrice: item.unitPrice,
            unitPriceType: typeof item.unitPrice,
            quantity: item.quantity,
            type: item.type,
        })),
    });

    useEffect(() => {
        console.log('🔍 ApproveQuoteForm - useEffect - currentQuote.items:', currentQuote.items);
        
        // 🚨 SOLUCIÓN SIMPLE: USAR LOS ITEMS EXACTAMENTE COMO ESTÁN GUARDADOS
        const initialItems = (currentQuote.items || []).map(item => {
            console.log(`🚨 ApproveQuoteForm - USANDO precio guardado para ${item.description}:`, {
                originalUnitPrice: item.unitPrice,
                originalQuantity: item.quantity,
                originalType: item.type,
                preserved: true,
            });
            
            // DEVOLVER EL ITEM EXACTAMENTE COMO ESTÁ GUARDADO - NO MODIFICAR NADA
            return {
                ...item,
                unitPrice: item.unitPrice || 0,
                quantity: item.quantity || 1,
                taxRate: item.taxRate || 19,
                discount: item.discount || 0,
                suppliedByClient: item.suppliedByClient || false,
            };
        });
        
        console.log('🔍 ApproveQuoteForm - useEffect - initialItems after processing:', initialItems);
        setItems(initialItems);
        
        const prices: Record<string, number> = {};
        initialItems.forEach(item => {
            if (item.type === 'inventory') {
                if (item.suppliedByClient) {
                     const originalItem = inventoryItems.find(inv => inv.id === item.id);
                     if (originalItem) prices[item.id] = originalItem.salePrice;
                } else {
                    prices[item.id] = item.unitPrice;
                }
            }
        });
        setOriginalPrices(prices);
    }, [currentQuote.items]);

    useEffect(() => {
        if (justAddedQuoteItem) {
            const updatedItems = itemToReplaceId
                ? items.map(item => (item.id === itemToReplaceId ? justAddedQuoteItem : item))
                : [...items, justAddedQuoteItem];
            
            setItems(updatedItems);

            if (!approvedItemIds.has(justAddedQuoteItem.id)) {
                setApprovedItemIds(prev => new Set(prev).add(justAddedQuoteItem.id));
            }
            
            onClearJustAddedItem();
        }
    }, [justAddedQuoteItem, itemToReplaceId, onClearJustAddedItem, items, approvedItemIds]);

    const handleItemChange = (itemId: string, field: 'quantity' | 'unitPrice' | 'discount', value: number) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, [field]: value } : i));
    };

    const handleToggleApproved = (itemId: string) => {
        setApprovedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
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

    const searchableItems = useMemo<SearchableItem[]>(() => {
        // Find the location to get the correct hourly rate
        const location = locations.find(l => l.id === quote.locationId);
        const hourlyRate = location?.hourlyRate || 95000; // Default to Cali rate
        
        const serviceItems: SearchableItem[] = services.map(s => ({
            id: s.id, type: 'service', name: s.name, 
            price: hourlyRate * s.durationHours,
            taxRate: 19, category: s.category,
        }));
        const inventoryItemsTyped: SearchableItem[] = inventoryItems.map(i => ({
            id: i.id, type: 'inventory', name: i.name,
            price: i.salePrice, taxRate: i.taxRate, category: i.category,
        }));
        return [...serviceItems, ...inventoryItemsTyped];
    }, [services, inventoryItems, quote.locationId, locations]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return searchableItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, searchableItems]);

    // Show loading state if data is not ready
    if (!locations || locations.length === 0 || !services || services.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto mb-4"></div>
                    <p className="text-light-text dark:text-dark-text">Cargando datos de servicios y ubicaciones...</p>
                </div>
            </div>
        );
    }

    const handleAddItem = (item: SearchableItem) => {
        if (items.some(i => i.id === item.id)) return;
        
        if (item.type === 'inventory') {
            setOriginalPrices(prev => ({ ...prev, [item.id]: item.price }));
        }
        
        const newItem: QuoteItem = {
            id: item.id, type: item.type, description: item.name,
            quantity: 1, unitPrice: item.price, taxRate: item.taxRate, discount: 0,
        };

        setItems(prev => [...prev, newItem]);
        setApprovedItemIds(prev => new Set(prev).add(newItem.id));
        setSearchTerm('');
    };

    const totals = useMemo(() => {
        const approvedItems = items.filter(i => approvedItemIds.has(i.id));
        
        // Calcular subtotal CON descuentos por ítem aplicados
        const subtotal = approvedItems.reduce((acc, item) => {
            const itemSubtotal = (item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100);
            return acc + itemSubtotal;
        }, 0);
        
        // Aplicar descuento general al subtotal (después de descuentos por ítem)
        const subtotalWithDiscount = subtotal * (1 - totalDiscount / 100);
        const discountAmount = subtotal - subtotalWithDiscount;
        
        // Calcular IVA sobre el subtotal CON descuentos por ítem aplicados
        const taxAmount = approvedItems.reduce((acc, item) => {
            const itemSubtotal = (item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100);
            const taxRate = item.taxRate || 19; // Default to 19% if not specified
            return acc + (itemSubtotal * (taxRate / 100));
        }, 0);
        
        // Aplicar descuento general también al IVA
        const taxAmountWithDiscount = taxAmount * (1 - totalDiscount / 100);
        const taxDiscountAmount = taxAmount - taxAmountWithDiscount;
        
        const total = subtotalWithDiscount + taxAmountWithDiscount;
        
        return { 
            subtotal, 
            discountAmount, 
            subtotalWithDiscount,
            taxAmount, 
            taxDiscountAmount,
            taxAmountWithDiscount,
            total 
        };
    }, [items, approvedItemIds, totalDiscount]);

    const handleSave = () => {
        console.log('🚨 ApproveQuoteForm - handleSave INICIADO');
        const finalItems = items.filter(i => approvedItemIds.has(i.id));
        
        // Asegurar que todos los items tengan unitPrice como número válido
        const sanitizedItems = finalItems.map(item => ({
            ...item,
            unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(String(item.unitPrice || '0')) || 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity || '1')) || 1,
            taxRate: typeof item.taxRate === 'number' ? item.taxRate : parseFloat(String(item.taxRate || '19')) || 19,
            discount: typeof item.discount === 'number' ? item.discount : parseFloat(String(item.discount || '0')) || 0,
            costPrice: typeof item.costPrice === 'number' ? item.costPrice : parseFloat(String(item.costPrice || '0')) || 0,
        }));
        
        const finalQuoteData: Quote = {
            ...quote,
            items: sanitizedItems,
            notes: notes,
            subtotal: totals.subtotal,
            totalDiscount: totalDiscount, // Descuento general en porcentaje
            discountAmount: totals.discountAmount, // Monto del descuento
            taxAmount: totals.taxAmount,
            total: totals.total,
            status: QuoteStatus.APROBADO,
        };
        
        console.log('🔍 ApproveQuoteForm - handleSave - finalQuoteData:', finalQuoteData);
        console.log('🔍 ApproveQuoteForm - handleSave - totals:', totals);
        console.log('🔍 ApproveQuoteForm - handleSave - sanitizedItems:', sanitizedItems);
        
        console.log('🚨 ApproveQuoteForm - Llamando a onSave...');
        onSave(finalQuoteData);
        console.log('🚨 ApproveQuoteForm - onSave completado');
    };
    
    const inputClasses = "w-full text-right bg-gray-100 dark:bg-gray-800 rounded p-1 font-mono border border-gray-300 dark:border-gray-700 text-light-text dark:text-dark-text disabled:opacity-50";
    const quantityInputClasses = "w-full text-center bg-gray-100 dark:bg-gray-800 rounded p-1 border border-gray-300 dark:border-gray-700 text-light-text dark:text-dark-text disabled:opacity-50";

    // Ya no necesitamos estado de carga - los datos llegan directamente

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg">
            {/* Instrucciones compactas */}
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                    <Icon name="help" className="w-4 h-4 mr-2" />
                    Seleccione los ítems que el cliente aprueba. Puede ajustar precios y descuentos.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 p-4">
                {/* Panel izquierdo - Ítems */}
                <div className="flex-1">
                    {/* Barra de búsqueda compacta */}
                    <div className="mb-4">
                        <div className="relative">
                            <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar servicio o repuesto para añadir..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                            />
                            {isSearchFocused && searchTerm && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg z-20 max-h-60 overflow-y-auto shadow-xl">
                                    {searchResults.map(item => (
                                        <button key={`${item.type}-${item.id}`} onClick={() => handleAddItem(item)} className="w-full text-left flex justify-between items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.category}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-2">
                                                <p className="font-mono text-sm font-semibold">{formatCurrency(item.price)}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'service' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'}`}>
                                                    {item.type === 'service' ? 'Servicio' : 'Repuesto'}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                    {searchResults.length === 0 && (
                                        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No se encontraron resultados.</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onQuickAddItem(searchTerm, undefined, items)}
                                        className="w-full text-left flex items-center px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 border-t border-gray-200 dark:border-gray-700"
                                    >
                                        <Icon name="plus" className="w-4 h-4 mr-2" />
                                        <span className="text-sm">Crear ítem rápido: "{searchTerm}"</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabla de ítems compacta */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-700 dark:text-gray-300 uppercase">
                                <tr>
                                    <th className="p-3 w-12 text-center">
                                        <Icon name="check-circle" className="w-4 h-4 mx-auto" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">Descripción</th>
                                    <th className="px-2 py-3 text-center w-16 font-semibold">Cant.</th>
                                    <th className="px-2 py-3 text-right w-24 font-semibold">Precio Unit.</th>
                                    <th className="px-2 py-3 text-right w-20 font-semibold">Descuento</th>
                                    <th className="px-2 py-3 text-center w-20 font-semibold">Cliente Suministra</th>
                                    <th className="px-4 py-3 text-right w-24 font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {items.map(item => (
                                    <tr key={item.id} className={`${approvedItemIds.has(item.id) ? 'bg-white dark:bg-gray-800' : 'opacity-50 bg-gray-50 dark:bg-gray-900/30'} ${item.suppliedByClient ? 'bg-blue-50 dark:bg-blue-900/20' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
                                        <td className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={approvedItemIds.has(item.id)}
                                                onChange={() => handleToggleApproved(item.id)}
                                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white text-sm">{item.description}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {item.type === 'service' ? 'Servicio' : 'Repuesto'}
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            <input 
                                                type="number" 
                                                value={item.quantity} 
                                                onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} 
                                                className="w-full text-center bg-gray-100 dark:bg-gray-800 rounded p-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50 text-sm"
                                                min="0"
                                                step="1"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input 
                                                type="number" 
                                                value={item.unitPrice} 
                                                disabled={!!item.suppliedByClient} 
                                                onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} 
                                                className="w-full text-right bg-gray-100 dark:bg-gray-800 rounded p-1 font-mono border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50 text-sm"
                                                min="0"
                                                step="100"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center">
                                                <input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    disabled={!!item.suppliedByClient} 
                                                    value={item.discount} 
                                                    onChange={(e) => handleItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)} 
                                                    className="w-full text-right bg-gray-100 dark:bg-gray-800 rounded p-1 font-mono border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50 text-sm"
                                                    min="0" 
                                                    max="100" 
                                                    step="0.1" 
                                                />
                                                <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs">%</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            {item.type === 'inventory' && (
                                                <input
                                                    type="checkbox"
                                                    checked={!!item.suppliedByClient}
                                                    onChange={(e) => handleSuppliedByClientToggle(item.id, e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-mono font-semibold text-gray-900 dark:text-white text-sm">
                                                {formatCurrency((item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Panel derecho - Resumen y notas */}
                <div className="w-full lg:w-80 space-y-4">
                    {/* Notas */}
                    <div>
                        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center text-sm">
                            <Icon name="clipboard" className="w-4 h-4 mr-2" />
                            Notas Adicionales
                        </h3>
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            rows={3} 
                            className="w-full text-sm p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                            placeholder="Añadir notas, condiciones o términos de validez..."
                        />
                    </div>
                    
                    {/* Resumen compacto */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center text-sm">
                            <Icon name="chart" className="w-4 h-4 mr-2" />
                            Resumen de Aprobación
                        </h3>
                        
                        {/* Campo de descuento general compacto */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descuento General (%)
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    value={totalDiscount}
                                    onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-full text-right bg-white dark:bg-gray-800 rounded p-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                                <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">%</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 text-sm">
                                <span>Subtotal:</span> 
                                <span className="font-mono font-semibold">{formatCurrency(totals.subtotal)}</span>
                            </div>
                            
                            {totalDiscount > 0 && (
                                <div className="flex justify-between items-center text-red-600 dark:text-red-400 text-sm">
                                    <span>Descuento ({totalDiscount}%):</span> 
                                    <span className="font-mono font-semibold">-{formatCurrency(totals.discountAmount)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 text-sm">
                                <span>IVA (19%):</span> 
                                <span className="font-mono font-semibold">{formatCurrency(totals.taxAmount)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-gray-900 dark:text-white text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-3">
                                <span>Total:</span> 
                                <span className="font-mono text-red-600 dark:text-red-400">{formatCurrency(totals.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="px-4 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onCancel} 
                        className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={approvedItemIds.size === 0}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Icon name="check-circle" className="w-4 h-4" />
                        Confirmar Aprobación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveQuoteForm;