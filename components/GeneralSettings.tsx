

import React, { useState, useEffect } from 'react';
import type { CompanyInfo } from '../types';
import { Icon } from './Icon';
import { uploadFileToStorage } from '../services/supabase';

interface GeneralSettingsProps {
    settings: CompanyInfo;
    onSave: (info: CompanyInfo) => void;
}

const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red text-light-text dark:text-dark-text";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onSave }) => {
    const [formData, setFormData] = useState<CompanyInfo>(settings || {
        name: '',
        nit: '',
        logoUrl: '',
    });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (settings) {
            console.log('🔧 GeneralSettings - Received settings:', settings);
            setFormData({
                name: settings.name || '',
                nit: settings.nit || '',
                logoUrl: settings.logoUrl || '',
            });
        }
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('saving');
        
        try {
            let logoUrl = formData?.logoUrl || '';
            
            // Si hay un archivo de logo, subirlo a Supabase Storage
            if (logoFile) {
                const fileName = `company-logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
                const path = fileName;
                const uploadedUrl = await uploadFileToStorage(logoFile, 'company-logos', path);
                if (uploadedUrl) {
                    logoUrl = uploadedUrl;
                }
            }
            
            const updatedData = { 
                name: formData?.name || '',
                nit: formData?.nit || '',
                logoUrl: logoUrl,
            };
            await onSave(updatedData);
            setSaveStatus('saved');
            setLogoFile(null);
            setLogoPreview(null);
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Error saving company info:', error);
            setSaveStatus('idle');
        }
    };

    return (
        <div className="bg-light dark:bg-dark-light rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Información Global de la Empresa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className={labelClasses}>Razón Social</label>
                        <input type="text" id="name" name="name" value={formData?.name || ''} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="nit" className={labelClasses}>NIT</label>
                        <input type="text" id="nit" name="nit" value={formData?.nit || ''} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Logo de la Empresa</label>
                        <div className="space-y-3">
                            {/* Logo actual */}
                            {formData?.logoUrl && (
                                <div className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <img 
                                        src={formData.logoUrl} 
                                        alt="Logo actual" 
                                        className="h-12 w-auto max-w-32 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Logo actual
                                    </div>
                                </div>
                            )}
                            
                            {/* Preview del nuevo logo */}
                            {logoPreview && (
                                <div className="flex items-center gap-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <img 
                                        src={logoPreview} 
                                        alt="Nuevo logo" 
                                        className="h-12 w-auto max-w-32 object-contain"
                                    />
                                    <div className="text-sm text-green-600 dark:text-green-400">
                                        Nuevo logo (se guardará al hacer clic en "Guardar Cambios")
                                    </div>
                                </div>
                            )}
                            
                            {/* Input para subir archivo */}
                            <div>
                                <input 
                                    type="file" 
                                    id="logoFile" 
                                    accept="image/*" 
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="logoFile"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-brand-red hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <Icon name="upload" className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {logoFile ? 'Cambiar logo' : 'Subir nuevo logo'}
                                    </span>
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Formatos soportados: PNG, JPG, SVG. Tamaño máximo: 5MB
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={saveStatus === 'saving'}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon 
                            name={saveStatus === 'saved' ? 'check-circle' : saveStatus === 'saving' ? 'loading' : 'upload'} 
                            className={`w-5 h-5 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} 
                        />
                        {saveStatus === 'saved' ? 'Guardado' : saveStatus === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GeneralSettings;