import React from 'react';
import { Icon } from './Icon';
import { DiagnosticType } from '../types';

interface SelectDiagnosticTypeModalProps {
    onSelect: (type: DiagnosticType) => void;
}

const SelectDiagnosticTypeModal: React.FC<SelectDiagnosticTypeModalProps> = ({ onSelect }) => {
    
    const diagnosticOptions: {
        type: DiagnosticType,
        title: string,
        description: string,
        icon: 'clipboard' | 'chart-line' | 'search'
    }[] = [
        {
            type: 'Básico',
            title: 'Diagnóstico Básico',
            description: 'Inspección visual rápida para servicios de mantenimiento preventivo y revisiones generales.',
            icon: 'clipboard',
        },
        {
            type: 'Intermedio',
            title: 'Diagnóstico Intermedio',
            description: 'Revisión detallada de sistemas principales como frenos, suspensión y motor. Ideal para quejas específicas.',
            icon: 'chart-line',
        },
        {
            type: 'Avanzado',
            title: 'Diagnóstico Avanzado',
            description: 'Inspección exhaustiva de todos los sistemas del vehículo, incluyendo escaneo electrónico y pruebas técnicas.',
            icon: 'search',
        },
    ];

    return (
        <div className="p-4">
            <p className="text-center text-gray-400 mb-6">Elige el nivel de detalle requerido para la inspección del vehículo.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {diagnosticOptions.map(option => (
                    <button
                        key={option.type}
                        onClick={() => onSelect(option.type)}
                        className="flex flex-col items-center text-center p-6 bg-gray-800/50 rounded-lg border-2 border-gray-700 hover:border-brand-red hover:bg-red-900/20 transition-all duration-200"
                    >
                        <Icon name={option.icon} className="w-12 h-12 mb-4 text-brand-red" />
                        <h3 className="font-bold text-lg text-white mb-2">{option.title}</h3>
                        <p className="text-sm text-gray-400">{option.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SelectDiagnosticTypeModal;