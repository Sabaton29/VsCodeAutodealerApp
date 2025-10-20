import React, { useState, useEffect } from 'react';
import { InventoryItem, Supplier, InventoryCategory } from '../types';
import { Icon } from './Icon';

interface InventoryItemFormProps {
    onSave: (itemData: InventoryItem | Omit<InventoryItem, 'id'>) => void;
    onCancel: () => void;
    initialData?: Partial<InventoryItem>;
    selectedLocationId: string;
    suppliers: Supplier[];
    categories: InventoryCategory[];
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);


const AddInventoryItemForm: React.FC<InventoryItemFormProps> = ({ onSave, onCancel, initialData, selectedLocationId, suppliers, categories }) => {
    
    const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
        name: '', sku: '', brand: '', supplierId: undefined, category: categories[0]?.name || '', stock: 0,
        costPrice: 0, salePrice: 0, margin: 0, taxRate: 19, locationId: selectedLocationId,
    });
    
    useEffect(() => {
        const defaults = {
            name: '', sku: '', brand: '', supplierId: undefined, category: categories[0]?.name || '', stock: 0,
            costPrice: 0, salePrice: 0, margin: 0, taxRate: 19, locationId: selectedLocationId,
        };
        setFormData({ ...defaults, ...initialData });
    }, [initialData, selectedLocationId, categories]);

    const [lastEdited, setLastEdited] = useState<'margin' | 'salePrice' | 'finalSalePrice'>('margin');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = parseFloat(value) || 0;
        
        if (['margin', 'salePrice'].includes(name)) {
            setLastEdited(name as 'margin' | 'salePrice');
        }

        setFormData(prev => ({ 
            ...prev, 
            [name]: e.target.type === 'number' ? numValue : (value === '' ? undefined : value),
        }));
    };
    
    const handleFinalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const finalPrice = parseFloat(e.target.value.replace(/[^0-9]/g, '')) || 0;
        setLastEdited('finalSalePrice');
        const salePriceBeforeTax = finalPrice / (1 + (formData.taxRate / 100));
        setFormData(prev => ({ ...prev, salePrice: salePriceBeforeTax }));
    };

    // Recalculates salePrice when costPrice or margin change
    useEffect(() => {
        if (lastEdited !== 'margin') return;
        const newSalePrice = formData.costPrice * (1 + formData.margin / 100);
        if (Math.abs(newSalePrice - formData.salePrice) > 0.01) {
             setFormData(prev => ({ ...prev, salePrice: newSalePrice }));
        }
    }, [formData.costPrice, formData.margin, lastEdited]);

    // Recalculates margin when salePrice changes (from direct edit or final price edit)
    useEffect(() => {
        if (lastEdited !== 'salePrice' && lastEdited !== 'finalSalePrice') return;
        
        let newMargin = 0;
        if (formData.costPrice > 0) {
            newMargin = ((formData.salePrice / formData.costPrice) - 1) * 100;
        }

        if (Math.abs(newMargin - formData.margin) > 0.01) {
            setFormData(prev => ({ ...prev, margin: newMargin }));
        }
    }, [formData.salePrice, formData.costPrice, lastEdited]);

    const isEditing = !!initialData?.id;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.sku) {
            alert('Por favor complete el nombre y el SKU del artículo.');
            return;
        }
        // Clean up data before saving
        const dataToSave = {
            ...formData,
            margin: parseFloat(formData.margin.toFixed(2)),
            salePrice: parseFloat(formData.salePrice.toFixed(2)),
        };

        if (isEditing) {
            onSave({ ...initialData, ...dataToSave } as InventoryItem);
        } else {
            onSave(dataToSave);
        }
    };
    
    const utility = formData.salePrice - formData.costPrice;
    const finalSalePrice = formData.salePrice * (1 + formData.taxRate / 100);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
                {isEditing ? 'Actualice los campos del artículo.' : 'Complete los campos para registrar un nuevo artículo en el inventario.'}
            </p>
            
            {/* Basic Info */}
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-lg">Información Básica</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="name" className={labelClasses}>Nombre del Artículo</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="sku" className={labelClasses}>SKU (Código de Referencia)</label>
                        <div className="flex gap-2">
                           <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} className={inputClasses} required />
                           <button type="button" className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600" disabled title="Próximamente">
                                <Icon name="barcode" className="w-5 h-5" />
                           </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="category" className={labelClasses}>Categoría</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} className={inputClasses} required>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="brand" className={labelClasses}>Marca</label>
                        <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} className={inputClasses} placeholder="Ej: ACDelco" required />
                    </div>
                    <div>
                        <label htmlFor="supplierId" className={labelClasses}>Proveedor</label>
                        <select id="supplierId" name="supplierId" value={formData.supplierId || ''} onChange={handleChange} className={inputClasses}>
                            <option value="">- Seleccione un Proveedor -</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                 </div>
            </div>

            {/* Pricing */}
             <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                 <h3 className="font-semibold text-lg">Precios y Costos</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    {/* Cost Price */}
                    <div>
                        <label htmlFor="costPrice" className={labelClasses}>Precio de Costo (COP)</label>
                        <input type="number" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleChange} className={inputClasses} min="0" />
                    </div>
                    {/* Utility */}
                    <div className="flex flex-col justify-end">
                         <label className={labelClasses}>Utilidad Bruta</label>
                         <div className={`px-3 py-2 rounded-lg ${utility >= 0 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
                            {formatCurrency(utility)}
                         </div>
                    </div>
                    {/* Margin */}
                    <div>
                        <label htmlFor="margin" className={labelClasses}>Margen de Utilidad</label>
                         <div className="relative">
                            <input type="number" id="margin" name="margin" value={formData.margin.toFixed(2)} onChange={handleChange} className={inputClasses} />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                               <Icon name="percentage" className="w-5 h-5 text-gray-400"/>
                            </div>
                        </div>
                    </div>
                     {/* Sale Price */}
                    <div>
                        <label htmlFor="salePrice" className={labelClasses}>Precio de Venta (Sin IVA)</label>
                        <input type="number" id="salePrice" name="salePrice" value={Math.round(formData.salePrice)} onChange={handleChange} className={inputClasses} min="0" />
                    </div>
                     {/* Tax Rate */}
                    <div>
                        <label htmlFor="taxRate" className={labelClasses}>Impuesto (IVA)</label>
                         <div className="relative">
                            <input type="number" id="taxRate" name="taxRate" value={formData.taxRate} onChange={handleChange} className={inputClasses} min="0" />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                               <Icon name="percentage" className="w-5 h-5 text-gray-400"/>
                            </div>
                        </div>
                    </div>
                     {/* Final Price */}
                    <div>
                         <label htmlFor="finalSalePrice" className={labelClasses}>Precio Final de Venta</label>
                         <input
                            type="text"
                            id="finalSalePrice"
                            name="finalSalePrice"
                            value={Math.round(finalSalePrice).toLocaleString('es-CO')}
                            onChange={handleFinalPriceChange}
                            className={`${inputClasses} font-bold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/50`}
                         />
                    </div>
                 </div>
            </div>

             {/* Stock */}
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-lg">Stock</h3>
                <div>
                    <label htmlFor="stock" className={labelClasses}>Stock Inicial</label>
                    <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} className={inputClasses} min="0" />
                </div>
            </div>


            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                    {isEditing ? 'Guardar Cambios' : 'Guardar Artículo'}
                </button>
            </div>
        </form>
    );
};

export default AddInventoryItemForm;