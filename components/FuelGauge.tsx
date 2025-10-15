
import React from 'react';

interface FuelGaugeProps {
    level: string;
}

const FuelGauge: React.FC<FuelGaugeProps> = ({ level }) => {
    const levelToRotation: { [key: string]: number } = {
        'Vacío': -45,
        '1/4': -22.5,
        '1/2': 0,
        '3/4': 22.5,
        'Lleno': 45,
        'N/A': 0,
    };

    const rotation = levelToRotation[level] ?? 0;

    return (
        <div className="relative w-24 h-16">
            <svg viewBox="0 0 100 50" className="w-full h-full">
                {/* Gauge Background Arc */}
                <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    stroke="currentColor"
                    className="text-gray-600"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Gauge Foreground Arc based on level */}
                <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    stroke="currentColor"
                    className="text-brand-red"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: 125.6, // Circumference of half circle with r=40 is pi*40 = 125.6
                        strokeDashoffset: 125.6 * (1 - ((rotation + 45) / 90)),
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                    }}
                />
                
                {/* Needle */}
                <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 45px', transition: 'transform 0.5s ease-in-out' }}>
                    <path d="M 50 45 L 50 15" stroke="currentColor" className="text-white" strokeWidth="2" strokeLinecap="round" />
                </g>
                
                {/* Needle pivot */}
                <circle cx="50" cy="45" r="4" fill="currentColor" className="text-white" />
                
                {/* Labels */}
                <text x="12" y="38" fontSize="10" fill="currentColor" className="text-gray-400">E</text>
                <text x="83" y="38" fontSize="10" fill="currentColor" className="text-gray-400">F</text>
            </svg>
             <div className="absolute bottom-0 w-full text-center text-xs font-bold text-gray-300">
                {level}
            </div>
        </div>
    );
};

export default FuelGauge;