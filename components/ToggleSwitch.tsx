

import React from 'react';

interface ToggleSwitchProps {
    label: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    description?: string;
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange, description, disabled = false }) => {
    return (
        <div className={`flex items-center justify-between ${disabled ? 'opacity-60' : ''}`}>
            <div>
                <span className="text-sm font-medium text-light-text dark:text-dark-text">{label}</span>
                {description && <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs">{description}</p>}
            </div>
            <button
                type="button"
                onClick={() => !disabled && onChange(!enabled)}
                className={`${
                    enabled ? 'bg-brand-red' : 'bg-gray-300 dark:bg-gray-600'
                } relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 dark:focus:ring-offset-dark-light ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={enabled}
                disabled={disabled}
            >
                <span
                    aria-hidden="true"
                    className={`${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
};

export default ToggleSwitch;