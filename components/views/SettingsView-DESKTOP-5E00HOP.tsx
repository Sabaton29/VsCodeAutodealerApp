

import React, { useState } from 'react';
import type { AppSettings, Location, StaffMember, UserRole, Permission, ServiceCategory, InventoryCategory, FinancialAccount, DiagnosticSettings } from '../../types';
import GeneralSettings from '../GeneralSettings';
import LocationsSettings from '../LocationsSettings';
import BillingSettings from '../BillingSettings';
import UsersSettings from '../UsersSettings';
import OperationsSettings from '../OperationsSettings';
import FinancialSettings from '../FinancialSettings';
import DiagnosticConfigView from './DiagnosticConfigView';
import SettingsErrorBoundary from '../SettingsErrorBoundary';

interface SettingsViewProps {
    appSettings: AppSettings | null;
    locations: Location[];
    staffMembers: StaffMember[];
    financialAccounts: FinancialAccount[];
    workOrders?: any[];
    quotes?: any[];
    onSaveAppSettings: (settings: AppSettings) => void;
    onSaveLocation: (locationData: Location | Omit<Location, 'id'>) => void;
    onDeleteLocation: (locationId: string) => void;
    onUpdateStaffRole: (staffId: string, newRole: UserRole) => void;
    onUpdateStaffPermissions: (staffId: string, permissions: Permission[]) => void;
    onSaveServiceCategory: (category: ServiceCategory | Omit<ServiceCategory, 'id'>) => void;
    onDeleteServiceCategory: (categoryId: string) => void;
    onSaveInventoryCategory: (category: InventoryCategory | Omit<InventoryCategory, 'id'>) => void;
    onDeleteInventoryCategory: (categoryId: string) => void;
    onSaveFinancialAccount: (account: FinancialAccount | Omit<FinancialAccount, 'id'>) => void;
    onDeleteFinancialAccount: (accountId: string) => void;
    onAssignAccountsToUser: (staffId: string, accountIds: string[]) => void;
    onAddLocation: () => void;
    onEditLocation: (location: Location) => void;
    onUpdateHourlyRate?: (locationId: string, hourlyRate: number) => void;
    onEditPermissions: (staffMember: StaffMember) => void;
    onAddServiceCategory: () => void;
    onEditServiceCategory: (category: ServiceCategory) => void;
    onAddInventoryCategory: () => void;
    onEditInventoryCategory: (category: InventoryCategory) => void;
    onAddFinancialAccount: () => void;
    onEditFinancialAccount: (account: FinancialAccount) => void;
    onAssignAccounts: (staffMember: StaffMember) => void;
    onUpdateAllWorkOrderStages?: () => Promise<{ updated: number; skipped: number; errors: string[] }>;
}

const SettingsView: React.FC<SettingsViewProps> = (props) => {
    const { 
        appSettings, locations, staffMembers, financialAccounts, workOrders, quotes,
        onSaveAppSettings, onSaveLocation, onDeleteLocation, onUpdateStaffRole,
        onUpdateStaffPermissions, onSaveServiceCategory, onDeleteServiceCategory,
        onSaveInventoryCategory, onDeleteInventoryCategory, onSaveFinancialAccount,
        onDeleteFinancialAccount,
        onAddLocation, onEditLocation, onUpdateHourlyRate, onEditPermissions,
        onAddServiceCategory, onEditServiceCategory, onAddInventoryCategory,
        onEditInventoryCategory, onAddFinancialAccount, onEditFinancialAccount,
        onAssignAccounts, onUpdateAllWorkOrderStages,
    } = props;

    const [activeTab, setActiveTab] = useState('General');
    const tabs = ['General', 'Sedes', 'Facturación', 'Usuarios', 'Operaciones', 'Diagnósticos', 'Finanzas'];

    const renderContent = () => {
        if (!appSettings) {
            return <div>Cargando configuración...</div>;
        }
        switch (activeTab) {
            case 'General':
                console.warn('🔧 SettingsView - Rendering GeneralSettings with appSettings:', appSettings);
                return <GeneralSettings 
                            settings={appSettings?.companyInfo || { name: '', nit: '', logoUrl: '' }} 
                            onSave={(info) => onSaveAppSettings(info)} 
                        />;
            case 'Sedes':
                return <LocationsSettings 
                            locations={locations} 
                            onAdd={onAddLocation} 
                            onEdit={onEditLocation} 
                            onDelete={onDeleteLocation}
                            onUpdateHourlyRate={onUpdateHourlyRate}
                        />;
            case 'Facturación':
                return <BillingSettings 
                            settings={appSettings.billingSettings} 
                            onSave={(billing) => {
                                const updatedSettings = {
                                    ...appSettings,
                                    billingSettings: billing,
                                };
                                onSaveAppSettings(updatedSettings);
                            }} 
                        />;
            case 'Usuarios':
                return <UsersSettings 
                            staffMembers={staffMembers}
                            onUpdateRole={onUpdateStaffRole}
                            onEditPermissions={onEditPermissions}
                            onAssignAccounts={onAssignAccounts}
                        />;
            case 'Operaciones':
                return <OperationsSettings
                            settings={appSettings?.operationsSettings || null}
                            onSaveServiceCategory={onSaveServiceCategory}
                            onDeleteServiceCategory={onDeleteServiceCategory}
                            onSaveInventoryCategory={onSaveInventoryCategory}
                            onDeleteInventoryCategory={onDeleteInventoryCategory}
                            onAddServiceCategory={onAddServiceCategory}
                            onEditServiceCategory={onEditServiceCategory}
                            onAddInventoryCategory={onAddInventoryCategory}
                            onEditInventoryCategory={onEditInventoryCategory}
                            onUpdateAllWorkOrderStages={onUpdateAllWorkOrderStages}
                            workOrders={workOrders}
                            quotes={quotes}
                        />;
            case 'Diagnósticos':
                return <DiagnosticConfigView
                            onSave={(config) => {
                                const updatedSettings = {
                                    ...appSettings,
                                    diagnosticSettings: config,
                                };
                                onSaveAppSettings(updatedSettings);
                            }}
                            initialConfig={appSettings?.diagnosticSettings}
                        />;
            case 'Finanzas':
                return <FinancialSettings
                            accounts={financialAccounts}
                            onAdd={onAddFinancialAccount}
                            onEdit={onEditFinancialAccount}
                            onDelete={onDeleteFinancialAccount}
                        />;
            default:
                return null;
        }
    };

    return (
        <SettingsErrorBoundary>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Ajustes del Sistema</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Configuración de la cuenta, sedes y preferencias.</p>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {tabs.map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 md:px-6 py-3 text-sm font-semibold transition-colors focus:outline-none whitespace-nowrap ${
                                activeTab === tab 
                                    ? 'border-b-2 border-brand-red text-brand-red' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-light-text dark:hover:text-dark-text'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {renderContent()}
                </div>
            </div>
        </SettingsErrorBoundary>
    );
};

export default SettingsView;