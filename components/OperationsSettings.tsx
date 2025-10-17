
import React, { useState } from 'react';
import type { OperationsSettings, ServiceCategory, InventoryCategory } from '../types';
import { Icon } from './Icon';
import CategoryForm from './CategoryForm';

interface OperationsSettingsProps {
    settings: OperationsSettings | null;
    onSaveServiceCategory: (category: ServiceCategory | Omit<ServiceCategory, 'id'>) => void;
    onDeleteServiceCategory: (categoryId: string) => void;
    onSaveInventoryCategory: (category: InventoryCategory | Omit<InventoryCategory, 'id'>) => void;
    onDeleteInventoryCategory: (categoryId: string) => void;
    onAddServiceCategory: () => void;
    onEditServiceCategory: (category: ServiceCategory) => void;
    onAddInventoryCategory: () => void;
    onEditInventoryCategory: (category: InventoryCategory) => void;
}

const CatalogManager: React.FC<{
    title: string;
    items: { id: string; name: string }[] | undefined;
    onAdd: () => void;
    onEdit: (item: { id: string; name: string }) => void;
    onDelete: (itemId: string) => void;
}> = ({ title, items = [], onAdd, onEdit, onDelete }) => (
    <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text">{title}</h3>
            <button onClick={onAdd} className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">
                <Icon name="plus" className="w-4 h-4" />
                Añadir
            </button>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {items && items.length > 0 ? (
                items.map(item => (
                    <li key={item.id} className="px-6 py-3 flex items-center justify-between">
                        <span className="text-sm text-light-text dark:text-dark-text">{item.name}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-brand-red transition-colors" title="Editar">
                                <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                                <Icon name="trash" className="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                ))
            ) : (
                <li className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay categorías disponibles. Haz clic en "Añadir" para crear la primera.
                </li>
            )}
        </ul>
    </div>
);

const OperationsSettings: React.FC<OperationsSettingsProps> = ({
    settings,
    onSaveServiceCategory,
    onDeleteServiceCategory,
    onSaveInventoryCategory,
    onDeleteInventoryCategory,
    onAddServiceCategory,
    onEditServiceCategory,
    onAddInventoryCategory,
    onEditInventoryCategory,
}) => {
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [showInventoryForm, setShowInventoryForm] = useState(false);
    const [editingServiceCategory, setEditingServiceCategory] = useState<ServiceCategory | null>(null);
    const [editingInventoryCategory, setEditingInventoryCategory] = useState<InventoryCategory | null>(null);

    const handleSaveServiceCategory = (category: ServiceCategory | Omit<ServiceCategory, 'id'>) => {
        onSaveServiceCategory(category);
        setShowServiceForm(false);
        setEditingServiceCategory(null);
    };

    const handleSaveInventoryCategory = (category: InventoryCategory | Omit<InventoryCategory, 'id'>) => {
        onSaveInventoryCategory(category);
        setShowInventoryForm(false);
        setEditingInventoryCategory(null);
    };

    const handleEditServiceCategory = (category: ServiceCategory) => {
        setEditingServiceCategory(category);
        setShowServiceForm(true);
    };

    const handleEditInventoryCategory = (category: InventoryCategory) => {
        setEditingInventoryCategory(category);
        setShowInventoryForm(true);
    };

    const handleAddServiceCategory = () => {
        setEditingServiceCategory(null);
        setShowServiceForm(true);
    };

    const handleAddInventoryCategory = () => {
        setEditingInventoryCategory(null);
        setShowInventoryForm(true);
    };





    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Personaliza los catálogos y flujos de trabajo del taller para adaptarlos a tus necesidades.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CatalogManager
                    title="Categorías de Servicios"
                    items={settings?.serviceCategories || []}
                    onAdd={handleAddServiceCategory}
                    onEdit={handleEditServiceCategory}
                    onDelete={onDeleteServiceCategory}
                />
                <CatalogManager
                    title="Categorías de Inventario"
                    items={settings?.inventoryCategories || []}
                    onAdd={handleAddInventoryCategory}
                    onEdit={handleEditInventoryCategory}
                    onDelete={onDeleteInventoryCategory}
                />
            </div>

            {/* Service Category Form */}
            <CategoryForm
                isOpen={showServiceForm}
                onClose={() => {
                    setShowServiceForm(false);
                    setEditingServiceCategory(null);
                }}
                onSave={handleSaveServiceCategory}
                category={editingServiceCategory}
                type="service"
            />

            {/* Inventory Category Form */}
            <CategoryForm
                isOpen={showInventoryForm}
                onClose={() => {
                    setShowInventoryForm(false);
                    setEditingInventoryCategory(null);
                }}
                onSave={handleSaveInventoryCategory}
                category={editingInventoryCategory}
                type="inventory"
            />

        </div>
    );
};

export default OperationsSettings;
