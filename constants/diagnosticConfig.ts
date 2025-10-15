export interface DiagnosticComponent {
    id: string;
    name: string;
    required: boolean;
}

export interface DiagnosticItem {
    id: string;
    name: string;
    description: string;
    category: string;
    required: boolean;
    components: DiagnosticComponent[];
}

export interface DiagnosticConfig {
    basic: DiagnosticItem[];
    intermediate: DiagnosticItem[];
    advanced: DiagnosticItem[];
}

// Configuración realista de diagnósticos por nivel
export const REALISTIC_DIAGNOSTIC_CONFIG: DiagnosticConfig = {
    basic: [
        {
            id: 'basic-1',
            name: 'Inspección Visual General',
            description: 'Revisión visual completa del estado exterior del vehículo',
            category: 'General',
            required: true,
            components: [
                { id: 'basic-1-1', name: 'Carrocería (abolladuras, rayones)', required: true },
                { id: 'basic-1-2', name: 'Pintura (estado general)', required: false },
                { id: 'basic-1-3', name: 'Cristales (grietas, rayones)', required: true },
                { id: 'basic-1-4', name: 'Espejos (funcionamiento, estado)', required: true },
            ],
        },
        {
            id: 'basic-2',
            name: 'Niveles de Fluidos',
            description: 'Verificación de niveles y estado de fluidos principales',
            category: 'Fluidos',
            required: true,
            components: [
                { id: 'basic-2-1', name: 'Aceite Motor (nivel y color)', required: true },
                { id: 'basic-2-2', name: 'Refrigerante (nivel y color)', required: true },
                { id: 'basic-2-3', name: 'Líquido de Frenos (nivel y color)', required: true },
                { id: 'basic-2-4', name: 'Líquido Dirección (nivel)', required: false },
            ],
        },
        {
            id: 'basic-3',
            name: 'Sistema de Luces',
            description: 'Verificación del funcionamiento de todas las luces',
            category: 'Eléctrico',
            required: true,
            components: [
                { id: 'basic-3-1', name: 'Luces Altas (funcionamiento)', required: true },
                { id: 'basic-3-2', name: 'Luces Bajas (funcionamiento)', required: true },
                { id: 'basic-3-3', name: 'Direccionales (funcionamiento)', required: true },
                { id: 'basic-3-4', name: 'Luces de Reversa (funcionamiento)', required: false },
            ],
        },
    ],
    intermediate: [
        {
            id: 'intermediate-1',
            name: 'Sistema de Frenos',
            description: 'Revisión completa del sistema de frenado',
            category: 'Frenos',
            required: true,
            components: [
                { id: 'intermediate-1-1', name: 'Pastillas Delanteras (espesor mínimo 3mm)', required: true },
                { id: 'intermediate-1-2', name: 'Discos Delanteros (rayas, deformación)', required: true },
                { id: 'intermediate-1-3', name: 'Pastillas Traseras (espesor mínimo 2mm)', required: true },
                { id: 'intermediate-1-4', name: 'Discos/Tambores Traseros (estado)', required: true },
                { id: 'intermediate-1-5', name: 'Líquido de Frenos (contaminación, punto ebullición)', required: true },
                { id: 'intermediate-1-6', name: 'Mangueras (fugas, flexibilidad)', required: false },
            ],
        },
        {
            id: 'intermediate-2',
            name: 'Suspensión y Dirección',
            description: 'Verificación de componentes de suspensión y dirección',
            category: 'Suspensión',
            required: true,
            components: [
                { id: 'intermediate-2-1', name: 'Amortiguadores (fugas, funcionamiento)', required: true },
                { id: 'intermediate-2-2', name: 'Muelles/Espirales (altura, deformación)', required: true },
                { id: 'intermediate-2-3', name: 'Terminales de Dirección (holgura, desgaste)', required: true },
                { id: 'intermediate-2-4', name: 'Bujes (desgaste, grietas)', required: false },
                { id: 'intermediate-2-5', name: 'Barra Estabilizadora (montajes, enlaces)', required: false },
            ],
        },
        {
            id: 'intermediate-3',
            name: 'Sistema Eléctrico Básico',
            description: 'Revisión de componentes eléctricos principales',
            category: 'Eléctrico',
            required: true,
            components: [
                { id: 'intermediate-3-1', name: 'Batería (voltaje 12.6V mínimo)', required: true },
                { id: 'intermediate-3-2', name: 'Alternador (voltaje carga 13.8-14.4V)', required: true },
                { id: 'intermediate-3-3', name: 'Motor de Arranque (funcionamiento, consumo)', required: true },
                { id: 'intermediate-3-4', name: 'Fusibles (estado, valores correctos)', required: false },
            ],
        },
    ],
    advanced: [
        {
            id: 'advanced-1',
            name: 'Motor y Transmisión',
            description: 'Análisis profundo del motor y sistema de transmisión',
            category: 'Motor',
            required: true,
            components: [
                { id: 'advanced-1-1', name: 'Compresión de Motor (variación máxima 15%)', required: true },
                { id: 'advanced-1-2', name: 'Análisis de Aceite (contaminación, viscosidad)', required: true },
                { id: 'advanced-1-3', name: 'Sistema de Combustible (presión, filtros)', required: true },
                { id: 'advanced-1-4', name: 'Transmisión (funcionamiento, nivel aceite)', required: true },
                { id: 'advanced-1-5', name: 'Embrague (desgaste, funcionamiento)', required: true },
                { id: 'advanced-1-6', name: 'Filtros (aire, combustible, aceite)', required: false },
            ],
        },
        {
            id: 'advanced-2',
            name: 'Diagnóstico Computarizado',
            description: 'Escaneo completo con equipo de diagnóstico',
            category: 'Electrónico',
            required: true,
            components: [
                { id: 'advanced-2-1', name: 'Códigos de Error (lectura y análisis)', required: true },
                { id: 'advanced-2-2', name: 'Datos en Tiempo Real (sensores activos)', required: true },
                { id: 'advanced-2-3', name: 'Sensores (funcionamiento, calibración)', required: true },
                { id: 'advanced-2-4', name: 'Actuadores (respuesta, funcionamiento)', required: true },
                { id: 'advanced-2-5', name: 'Calibraciones (reprogramación si necesario)', required: false },
            ],
        },
        {
            id: 'advanced-3',
            name: 'Sistema de Refrigeración',
            description: 'Verificación completa del sistema de enfriamiento',
            category: 'Refrigeración',
            required: true,
            components: [
                { id: 'advanced-3-1', name: 'Radiador (obstrucción, fugas)', required: true },
                { id: 'advanced-3-2', name: 'Termostato (apertura 88-92°C)', required: true },
                { id: 'advanced-3-3', name: 'Bomba de Agua (funcionamiento, fugas)', required: true },
                { id: 'advanced-3-4', name: 'Mangueras (estado, presión)', required: true },
                { id: 'advanced-3-5', name: 'Electroventiladores (funcionamiento, temperatura activación)', required: false },
            ],
        },
    ],
};

// Función para obtener configuración por tipo de diagnóstico
export function getDiagnosticConfigByType(type: 'Básico' | 'Intermedio' | 'Avanzado'): DiagnosticItem[] {
    switch (type) {
        case 'Básico':
            return REALISTIC_DIAGNOSTIC_CONFIG.basic;
        case 'Intermedio':
            return REALISTIC_DIAGNOSTIC_CONFIG.intermediate;
        case 'Avanzado':
            return REALISTIC_DIAGNOSTIC_CONFIG.advanced;
        default:
            return REALISTIC_DIAGNOSTIC_CONFIG.advanced;
    }
}

