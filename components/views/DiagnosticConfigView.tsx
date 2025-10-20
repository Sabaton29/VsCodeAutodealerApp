import React, { useState, useEffect } from 'react';
import { Icon } from '../Icon';
import type { DiagnosticSettings, DiagnosticItem, DiagnosticComponent } from '../../types';

interface DiagnosticConfigViewProps {
    onSave: (config: DiagnosticSettings) => void;
    initialConfig?: DiagnosticSettings;
}

const DiagnosticConfigView: React.FC<DiagnosticConfigViewProps> = ({ onSave, initialConfig }) => {
    const [config, setConfig] = useState<DiagnosticSettings>({
        basic: [],
        intermediate: [],
        advanced: [],
    });
    
    const [activeTab, setActiveTab] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
    const [editingItem, setEditingItem] = useState<DiagnosticItem | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (initialConfig) {
            setConfig(initialConfig);
        } else {
            // Configuración por defecto más realista
            setConfig({
                basic: [
                    {
                        id: '1',
                        name: 'Inspección Visual General',
                        description: 'Revisión visual completa del estado exterior del vehículo',
                        category: 'General',
                        required: true,
                        components: [
                            { id: '1-1', name: 'Carrocería', required: true },
                            { id: '1-2', name: 'Pintura', required: false },
                            { id: '1-3', name: 'Cristales', required: true },
                            { id: '1-4', name: 'Espejos', required: true },
                        ],
                    },
                    {
                        id: '2',
                        name: 'Niveles de Fluidos',
                        description: 'Verificación de niveles y estado de fluidos principales',
                        category: 'Fluidos',
                        required: true,
                        components: [
                            { id: '2-1', name: 'Aceite Motor', required: true },
                            { id: '2-2', name: 'Refrigerante', required: true },
                            { id: '2-3', name: 'Líquido Frenos', required: true },
                            { id: '2-4', name: 'Líquido Dirección', required: false },
                        ],
                    },
                    {
                        id: '3',
                        name: 'Sistema de Luces',
                        description: 'Verificación del funcionamiento de todas las luces',
                        category: 'Eléctrico',
                        required: true,
                        components: [
                            { id: '3-1', name: 'Luces Altas', required: true },
                            { id: '3-2', name: 'Luces Bajas', required: true },
                            { id: '3-3', name: 'Direccionales', required: true },
                            { id: '3-4', name: 'Luces de Reversa', required: false },
                        ],
                    },
                ],
                intermediate: [
                    {
                        id: '4',
                        name: 'Sistema de Frenos',
                        description: 'Revisión completa del sistema de frenado',
                        category: 'Frenos',
                        required: true,
                        components: [
                            { id: '4-1', name: 'Pastillas Delanteras', required: true },
                            { id: '4-2', name: 'Discos Delanteros', required: true },
                            { id: '4-3', name: 'Pastillas Traseras', required: true },
                            { id: '4-4', name: 'Discos/Tambores Traseros', required: true },
                            { id: '4-5', name: 'Líquido de Frenos', required: true },
                            { id: '4-6', name: 'Mangueras', required: false },
                        ],
                    },
                    {
                        id: '5',
                        name: 'Suspensión y Dirección',
                        description: 'Verificación de componentes de suspensión y dirección',
                        category: 'Suspensión',
                        required: true,
                        components: [
                            { id: '5-1', name: 'Amortiguadores', required: true },
                            { id: '5-2', name: 'Muelles/Espirales', required: true },
                            { id: '5-3', name: 'Terminales de Dirección', required: true },
                            { id: '5-4', name: 'Bujes', required: false },
                            { id: '5-5', name: 'Barra Estabilizadora', required: false },
                        ],
                    },
                    {
                        id: '6',
                        name: 'Sistema Eléctrico Básico',
                        description: 'Revisión de componentes eléctricos principales',
                        category: 'Eléctrico',
                        required: true,
                        components: [
                            { id: '6-1', name: 'Batería', required: true },
                            { id: '6-2', name: 'Alternador', required: true },
                            { id: '6-3', name: 'Motor de Arranque', required: true },
                            { id: '6-4', name: 'Fusibles', required: false },
                        ],
                    },
                ],
                advanced: [
                    {
                        id: '7',
                        name: 'Motor y Transmisión',
                        description: 'Análisis profundo del motor y sistema de transmisión',
                        category: 'Motor',
                        required: true,
                        components: [
                            { id: '7-1', name: 'Compresión de Motor', required: true },
                            { id: '7-2', name: 'Análisis de Aceite', required: true },
                            { id: '7-3', name: 'Sistema de Combustible', required: true },
                            { id: '7-4', name: 'Transmisión', required: true },
                            { id: '7-5', name: 'Embrague', required: true },
                            { id: '7-6', name: 'Filtros', required: false },
                        ],
                    },
                    {
                        id: '8',
                        name: 'Diagnóstico Computarizado',
                        description: 'Escaneo completo con equipo de diagnóstico',
                        category: 'Electrónico',
                        required: true,
                        components: [
                            { id: '8-1', name: 'Códigos de Error', required: true },
                            { id: '8-2', name: 'Datos en Tiempo Real', required: true },
                            { id: '8-3', name: 'Sensores', required: true },
                            { id: '8-4', name: 'Actuadores', required: true },
                            { id: '8-5', name: 'Calibraciones', required: false },
                        ],
                    },
                    {
                        id: '9',
                        name: 'Sistema de Refrigeración',
                        description: 'Verificación completa del sistema de enfriamiento',
                        category: 'Refrigeración',
                        required: true,
                        components: [
                            { id: '9-1', name: 'Radiador', required: true },
                            { id: '9-2', name: 'Termostato', required: true },
                            { id: '9-3', name: 'Bomba de Agua', required: true },
                            { id: '9-4', name: 'Mangueras', required: true },
                            { id: '9-5', name: 'Electroventiladores', required: false },
                        ],
                    },
                ],
            });
        }
    }, [initialConfig]);

    const handleSaveConfig = () => {
        // Validar que no haya componentes con nombres vacíos
        let hasEmptyComponents = false;
        const emptyComponents: string[] = [];
        
        Object.keys(config).forEach(level => {
            const levelConfig = config[level as keyof DiagnosticSettings];
            levelConfig.forEach(item => {
                item.components.forEach(comp => {
                    if (comp.name.trim() === '') {
                        hasEmptyComponents = true;
                        emptyComponents.push(`Item: ${item.name}, Component ID: ${comp.id}`);
                    }
                });
            });
        });
        
        if (hasEmptyComponents) {
            console.warn(`No se puede guardar la configuración. Hay componentes con nombres vacíos:\n\n${emptyComponents.join('\n')}\n\nPor favor completa todos los campos o elimina los componentes vacíos.`);
            return;
        }
        
        onSave(config);
    };

    const addNewItem = (level: 'basic' | 'intermediate' | 'advanced') => {
        const newItem: DiagnosticItem = {
            id: Date.now().toString(),
            name: '',
            description: '',
            category: '',
            required: false,
            components: [],
        };
        setEditingItem(newItem);
        setIsAddingNew(true);
    };

    const saveItem = () => {
        if (!editingItem) return;

        // Validar que el elemento tenga nombre y descripción
        if (!editingItem.name.trim() || !editingItem.description.trim() || !editingItem.category.trim()) {
            console.warn('Por favor completa todos los campos requeridos (nombre, descripción y categoría).');
            return;
        }

        const updatedConfig = { ...config };
        if (isAddingNew) {
            updatedConfig[activeTab] = [...updatedConfig[activeTab], editingItem];
        } else {
            updatedConfig[activeTab] = updatedConfig[activeTab].map(item => 
                item.id === editingItem.id ? editingItem : item,
            );
        }

        setConfig(updatedConfig);
        setEditingItem(null);
        setIsAddingNew(false);
    };

    const deleteItem = (itemId: string) => {
        const updatedConfig = { ...config };
        updatedConfig[activeTab] = updatedConfig[activeTab].filter(item => item.id !== itemId);
        setConfig(updatedConfig);
    };

    const editItem = (item: DiagnosticItem) => {
        setEditingItem(item);
        setIsAddingNew(false);
    };

    const toggleItemExpansion = (itemId: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const addComponent = (itemId: string) => {
        const updatedConfig = { ...config };
        updatedConfig[activeTab] = updatedConfig[activeTab].map(item => 
            item.id === itemId 
                ? { ...item, components: [...item.components, { id: Date.now().toString(), name: '', required: false }] }
                : item,
        );
        setConfig(updatedConfig);
    };

    const updateComponent = (itemId: string, componentId: string, field: string, value: any) => {
        const updatedConfig = { ...config };
        updatedConfig[activeTab] = updatedConfig[activeTab].map(item => 
            item.id === itemId 
                ? {
                    ...item,
                    components: item.components.map(comp => 
                        comp.id === componentId ? { ...comp, [field]: value } : comp,
                    ),
                }
                : item,
        );
        setConfig(updatedConfig);
        
        // Si se está actualizando el nombre y queda vacío, eliminar el componente automáticamente
        if (field === 'name' && value.trim() === '') {
            setTimeout(() => {
                deleteComponent(itemId, componentId);
            }, 100);
        }
    };

    const deleteComponent = (itemId: string, componentId: string) => {
        const updatedConfig = { ...config };
        updatedConfig[activeTab] = updatedConfig[activeTab].map(item => 
            item.id === itemId 
                ? { ...item, components: item.components.filter(comp => comp.id !== componentId) }
                : item,
        );
        setConfig(updatedConfig);
    };

    const tabClasses = "px-4 py-2 text-sm font-medium rounded-lg transition-colors";
    const activeTabClasses = "bg-brand-red text-white";
    const inactiveTabClasses = "text-gray-400 hover:text-white hover:bg-gray-700";

    // Verificar si hay componentes vacíos en toda la configuración
    const hasEmptyComponents = Object.keys(config).some(level => 
        config[level as keyof DiagnosticSettings].some(item => 
            item.components.some(comp => comp.name.trim() === ''),
        ),
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Configuración de Diagnósticos</h2>
                    <p className="text-gray-400 mt-1">Gestiona los elementos de diagnóstico para cada nivel con sus componentes específicos</p>
                </div>
                <button
                    onClick={handleSaveConfig}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        hasEmptyComponents 
                            ? 'bg-red-600 text-white hover:bg-red-700 cursor-not-allowed opacity-75' 
                            : 'bg-brand-red text-white hover:bg-red-700'
                    }`}
                    disabled={hasEmptyComponents}
                    title={hasEmptyComponents ? 'Hay componentes vacíos que deben completarse antes de guardar' : 'Guardar configuración'}
                >
                    <Icon name="save" className="w-4 h-4" />
                    {hasEmptyComponents ? '⚠️ Hay Errores' : 'Guardar Configuración'}
                </button>
            </div>
            
            {hasEmptyComponents && (
                <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Icon name="exclamation-triangle" className="w-6 h-6 text-red-400" />
                        <div>
                            <h3 className="text-red-300 font-semibold text-lg">⚠️ No se puede guardar la configuración</h3>
                            <p className="text-red-400 text-sm mt-1">
                                Hay componentes con nombres vacíos. Por favor completa todos los campos o elimina los componentes vacíos antes de guardar.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('basic')}
                    className={`${tabClasses} ${activeTab === 'basic' ? activeTabClasses : inactiveTabClasses}`}
                >
                    <Icon name="clipboard" className="w-4 h-4 inline mr-2" />
                    Diagnóstico Básico
                </button>
                <button
                    onClick={() => setActiveTab('intermediate')}
                    className={`${tabClasses} ${activeTab === 'intermediate' ? activeTabClasses : inactiveTabClasses}`}
                >
                    <Icon name="settings" className="w-4 h-4 inline mr-2" />
                    Diagnóstico Intermedio
                </button>
                <button
                    onClick={() => setActiveTab('advanced')}
                    className={`${tabClasses} ${activeTab === 'advanced' ? activeTabClasses : inactiveTabClasses}`}
                >
                    <Icon name="wrench" className="w-4 h-4 inline mr-2" />
                    Diagnóstico Avanzado
                </button>
            </div>

            {/* Content */}
            <div className="bg-dark-light rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                        {activeTab === 'basic' && 'Diagnóstico Básico'}
                        {activeTab === 'intermediate' && 'Diagnóstico Intermedio'}
                        {activeTab === 'advanced' && 'Diagnóstico Avanzado'}
                    </h3>
                    <button
                        onClick={() => addNewItem(activeTab)}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Icon name="plus" className="w-4 h-4" />
                        Agregar Elemento
                    </button>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    {config[activeTab].map((item) => (
                        <div key={item.id} className="bg-gray-800 rounded-lg border border-gray-700">
                            {/* Item Header */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleItemExpansion(item.id)}
                                            className="text-white hover:text-gray-300 transition-colors"
                                        >
                                            <Icon name={expandedItems.has(item.id) ? "chevron-down" : "chevron-right"} className="w-4 h-4" />
                                        </button>
                                        <h4 className="font-medium text-white">{item.name}</h4>
                                        {item.required && (
                                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                                Requerido
                                            </span>
                                        )}
                                        <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                                            {item.category}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1 ml-7">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => addComponent(item.id)}
                                        className="text-green-400 hover:text-green-300 transition-colors"
                                        title="Agregar componente"
                                    >
                                        <Icon name="plus" className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => editItem(item)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <Icon name="edit" className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Icon name="trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Components */}
                            {expandedItems.has(item.id) && (
                                <div className="border-t border-gray-700 bg-gray-900">
                                    <div className="p-4">
                                        <h5 className="text-sm font-medium text-gray-300 mb-3">Componentes:</h5>
                                        <div className="space-y-2">
                                            {item.components.map((component) => (
                                                <div key={component.id} className="flex items-center gap-3 bg-gray-800 p-3 rounded border border-gray-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={component.required}
                                                        onChange={(e) => updateComponent(item.id, component.id, 'required', e.target.checked)}
                                                        className="w-4 h-4 text-brand-red bg-gray-700 border-gray-600 rounded focus:ring-brand-red"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={component.name}
                                                        onChange={(e) => updateComponent(item.id, component.id, 'name', e.target.value)}
                                                        className={`flex-1 bg-gray-700 border rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-brand-red ${
                                                            component.name.trim() === '' ? 'border-red-500' : 'border-gray-600'
                                                        }`}
                                                        placeholder="Nombre del componente (requerido)"
                                                        required
                                                    />
                                                    <button
                                                        onClick={() => deleteComponent(item.id, component.id)}
                                                        className="text-red-400 hover:text-red-300 transition-colors"
                                                    >
                                                        <Icon name="trash" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {item.components.length === 0 && (
                                                <p className="text-gray-500 text-sm text-center py-2">
                                                    No hay componentes configurados. Haz clic en el botón + para agregar.
                                                </p>
                                            )}
                                            {item.components.some(comp => comp.name.trim() === '') && (
                                                <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-3 mt-2">
                                                    <div className="flex items-center gap-2 text-red-300 text-sm font-semibold">
                                                        <Icon name="exclamation-triangle" className="w-5 h-5" />
                                                        <span>⚠️ COMPONENTES VACÍOS DETECTADOS</span>
                                                    </div>
                                                    <p className="text-red-400 text-xs mt-1 ml-7">
                                                        Completa los nombres de los componentes o elimínalos antes de guardar la configuración.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {config[activeTab].length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Icon name="clipboard" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay elementos configurados para este nivel de diagnóstico</p>
                        <p className="text-sm">Haz clic en "Agregar Elemento" para comenzar</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black dark:bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-dark-light rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {isAddingNew ? 'Agregar Elemento' : 'Editar Elemento'}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nombre del Elemento
                                </label>
                                <input
                                    type="text"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-brand-red"
                                    placeholder="Ej: Inspección Visual General"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-brand-red"
                                    rows={3}
                                    placeholder="Descripción detallada del elemento..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Categoría
                                </label>
                                <input
                                    type="text"
                                    value={editingItem.category}
                                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-brand-red"
                                    placeholder="Ej: General, Eléctrico, Motor"
                                />
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="required"
                                    checked={editingItem.required}
                                    onChange={(e) => setEditingItem({ ...editingItem, required: e.target.checked })}
                                    className="w-4 h-4 text-brand-red bg-gray-700 border-gray-600 rounded focus:ring-brand-red"
                                />
                                <label htmlFor="required" className="ml-2 text-sm text-gray-300">
                                    Elemento requerido
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={saveItem}
                                className="flex-1 bg-brand-red text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={() => {setEditingItem(null); setIsAddingNew(false);}}
                                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiagnosticConfigView;