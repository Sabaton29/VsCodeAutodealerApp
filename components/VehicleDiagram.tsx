
import React from 'react';

interface VehicleDiagramProps {
    damageLocations: { [key: string]: string[] };
    activeDamageType?: string | null;
    onToggleDamage?: (part: string) => void;
    readOnly: boolean;
}

const vehicleParts = [
    { id: 'hood', d: "M70 40 L 75 25 L 125 25 L 130 40 Z" },
    { id: 'roof', d: "M75 25 L 70 10 L 130 10 L 125 25 Z" },
    { id: 'trunk', d: "M30 40 L 35 25 L 70 25 L 70 40 Z" },
    { id: 'front-bumper', d: "M130 40 L 125 25 L 150 25 L 150 40 Z" },
    { id: 'rear-bumper', d: "M10 40 L 10 25 L 30 25 L 30 40 Z" },
    { id: 'front-left-door', d: "M70 50 L 70 40 L 100 40 L 100 50 Z" },
    { id: 'front-right-door', d: "M100 50 L 100 40 L 130 40 L 130 50 Z" },
    { id: 'rear-left-door', d: "M40 50 L 40 40 L 70 40 L 70 50 Z" },
    { id: 'rear-right-door', d: "M30 50 L 30 40 L 40 40 L 40 50 Z" },
    // Simplified representation of other parts
    { id: 'front-windshield', d: "M75 24 L 72 12 L 128 12 L 125 24 Z" },
    { id: 'rear-windshield', d: "M35 24 L 32 12 L 68 12 L 65 24 Z" },
];

const damageSymbols: { [key: string]: { symbol: string, color: string, name: string } } = {
    scratched: { symbol: 'X', color: 'text-yellow-400', name: 'Rayado' },
    dented: { symbol: 'O', color: 'text-blue-400', name: 'Sumido' },
    chipped: { symbol: '•', color: 'text-green-400', name: 'Picado' },
    fogged: { symbol: '~', color: 'text-purple-400', name: 'Fogueado' },
};

const getPartCenter = (d: string): [number, number] => {
    const points = d.replace(/[M,L,Z]/g, '').trim().split(' ').filter(p => p !== '').reduce((acc, _, i, arr) => {
        if (i % 2 === 0) acc.push([parseFloat(arr[i]), parseFloat(arr[i + 1])]);
        return acc;
    }, [] as [number, number][]);
    
    const x = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const y = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    return [x, y];
};

const VehicleDiagram: React.FC<VehicleDiagramProps> = ({ damageLocations, activeDamageType, onToggleDamage, readOnly }) => {
    
    const allDamagesOnParts = Object.entries(damageLocations).reduce((acc, [type, parts]) => {
        parts.forEach(part => {
            if (!acc[part]) acc[part] = [];
            acc[part].push(type);
        });
        return acc;
    }, {} as { [key: string]: string[] });

    return (
        <div className="p-2 bg-gray-700/50 rounded-lg">
            <svg viewBox="0 0 160 60" className="w-full max-w-sm mx-auto">
                {vehicleParts.map(part => (
                    <path
                        key={part.id}
                        d={part.d}
                        stroke="gray"
                        fill={!readOnly && activeDamageType ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}
                        className={!readOnly && onToggleDamage ? "cursor-pointer hover:fill-brand-red/50" : ""}
                        onClick={() => !readOnly && onToggleDamage && onToggleDamage(part.id)}
                    />
                ))}
                
                {Object.entries(allDamagesOnParts).map(([partId, damageTypes]) => {
                    const part = vehicleParts.find(p => p.id === partId);
                    if (!part) return null;
                    const [cx, cy] = getPartCenter(part.d);
                    const isMultiple = damageTypes.length > 1;

                    return (
                        <text
                            key={partId}
                            x={cx}
                            y={cy}
                            fontSize={isMultiple ? "8" : "12"}
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            className={`${isMultiple ? damageSymbols.scratched.color : damageSymbols[damageTypes[0]]?.color || ''} pointer-events-none`}
                            fill="currentColor"
                        >
                            {isMultiple ? '*' : damageSymbols[damageTypes[0]]?.symbol || '?'}
                        </text>
                    );
                })}
            </svg>
             <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-300">
                {Object.entries(damageSymbols).map(([key, { symbol, color, name }]) => (
                    <div key={key} className="flex items-center gap-1">
                        <span className={`font-bold text-lg ${color}`}>{symbol}</span>
                        <span>{name}</span>
                    </div>
                ))}
                <div className="flex items-center gap-1">
                    <span className={`font-bold text-lg ${damageSymbols.scratched.color}`}>*</span>
                    <span>Múltiples</span>
                </div>
            </div>
        </div>
    );
};

export default VehicleDiagram;
