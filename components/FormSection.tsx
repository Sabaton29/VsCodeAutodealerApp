
import React from 'react';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    helpText?: string;
    icon?: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, helpText, icon }) => {
    return (
        <div className="bg-gray-50/5 dark:bg-black dark:bg-gray-900/20 rounded-xl p-4 md:p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200/10 dark:border-gray-800/60 pb-3 mb-4">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-base font-bold text-light-text dark:text-dark-text">{title}</h3>
                </div>
                {helpText && (
                    <span className="text-xs text-gray-400">{helpText}</span>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

export default FormSection;
