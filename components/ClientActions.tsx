import React, { useState, useRef, useEffect } from 'react';
import type { Client, Permission } from '../types';
import { Icon } from './Icon';

interface ClientActionsProps {
    client: Client;
    onEdit: () => void;
    // onDelete: () => void; // For later
    hasPermission: (permission: Permission) => boolean;
}

const menuButtonClasses = "flex items-center w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-brand-red hover:text-white rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-300";

const ClientActions: React.FC<ClientActionsProps> = ({ client, onEdit, hasPermission }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="dots" className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 z-[9999] bg-dark-light border border-gray-700 rounded-lg shadow-xl p-2 space-y-1">
                    <button className={menuButtonClasses} disabled>
                        <Icon name="eye" className="w-4 h-4 mr-3" /> Ver Historial
                    </button>
                    
                    {hasPermission('manage:clients') && (
                        <>
                            <div className="border-t border-gray-700 my-1"></div>
                            <button onClick={() => handleAction(onEdit)} className={menuButtonClasses}>
                                <Icon name="edit" className="w-4 h-4 mr-3" /> Editar
                            </button>
                            <button className={`${menuButtonClasses} !text-red-400 hover:!bg-red-800/50 hover:!text-white`} disabled>
                                <Icon name="trash" className="w-4 h-4 mr-3" /> Eliminar
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientActions;