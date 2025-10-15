import React, { useState, useContext } from 'react';
import { Icon } from './Icon';
import AddInventoryItemForm from './AddInventoryItemForm';
import AddServiceForm from './AddServiceForm';
import { DataContext } from './DataContext';
import { UIContext } from './UIContext';
import { QuoteItem, Service, InventoryItem } from '../types';

interface QuickAddItemFlowProps {
    itemName: string;
    onSave: (newItem: QuoteItem) => void;
    onCancel: () => void;
}

const QuickAddItemFlow: React.FC<QuickAddItemFlowProps> = ({ itemName, onSave, onCancel }) => {
    const [itemType, setItemType] = useState<'inventory' | 'service' | null>(null);
    const dataContext = useContext(DataContext);
    const uiContext = useContext(UIContext);

    if (!dataContext || !uiContext) return null;

    const { handleSaveInventoryItem, handleSaveService, suppliers, locations, appSettings } = dataContext;
    const { selectedLocationId } = uiContext;

    const handleSaveInventory = async(itemData: InventoryItem | Omit<InventoryItem, 'id'>) => {
        const savedItem = await handleSaveInventoryItem(itemData);
        if (savedItem) {
            onSave({
                id: savedItem.id,
                type: 'inventory',
                description: savedItem.name,
                quantity: 1,
                unitPrice: savedItem.salePrice,
                taxRate: savedItem.taxRate,
            });
        }
    };

    const handleSaveServiceForm = async(serviceData: Service | Omit<Service, 'id'>) => {
        const savedService = await handleSaveService(serviceData);
        if (savedService) {
            const location = locations.find(l => l.id === savedService.locationId);
            const hourlyRate = location?.hourlyRate || 95000;
            onSave({
                id: savedService.id,
                type: 'service',
                description: savedService.name,
                quantity: 1,
                unitPrice: hourlyRate * savedService.durationHours,
                taxRate: 19,
            });
        }
    };

    if (!itemType) {
        return (
            <div className="text-center p-4">
                <h3 className="text-xl font-semibold mb-6 text-light-text dark:text-dark-text">¿Qué tipo de ítem es "<span className="text-brand-red">{itemName}</span>"?</h3>
                <div className="flex justify-center gap-6">
                    <button onClick={() => setItemType('inventory')} className="flex flex-col items-center justify-center gap-3 p-8 bg-light dark:bg-dark-light rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-48 h-40 border dark:border-gray-700">
                        <Icon name="inventory" className="w-10 h-10 text-brand-red" />
                        <span className="font-semibold text-light-text dark:text-dark-text">Repuesto / Inventario</span>
                    </button>
                    <button onClick={() => setItemType('service')} className="flex flex-col items-center justify-center gap-3 p-8 bg-light dark:bg-dark-light rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-48 h-40 border dark:border-gray-700">
                        <Icon name="services" className="w-10 h-10 text-brand-red" />
                        <span className="font-semibold text-light-text dark:text-dark-text">Servicio</span>
                    </button>
                </div>
            </div>
        );
    }

    if (itemType === 'inventory') {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4 text-center text-light-text dark:text-dark-text">Crear Nuevo Artículo de Inventario</h2>
                <AddInventoryItemForm
                    onSave={handleSaveInventory}
                    onCancel={onCancel}
                    initialData={{ name: itemName }}
                    selectedLocationId={selectedLocationId}
                    suppliers={suppliers.filter(s => s.locationId === selectedLocationId)}
                    categories={appSettings?.operationsSettings.inventoryCategories || []}
                />
            </div>
        );
    }
    
    if (itemType === 'service') {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4 text-center text-light-text dark:text-dark-text">Crear Nuevo Servicio</h2>
                <AddServiceForm
                    onSave={handleSaveServiceForm}
                    onCancel={onCancel}
                    initialData={{ name: itemName }}
                    selectedLocationId={selectedLocationId}
                    locations={locations}
                    categories={appSettings?.operationsSettings.serviceCategories || []}
                />
            </div>
        );
    }

    return null;
};

export default QuickAddItemFlow;