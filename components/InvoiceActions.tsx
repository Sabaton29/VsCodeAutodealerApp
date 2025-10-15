
import React, { useState, useRef, useEffect } from 'react';
import { type Invoice, type Permission, InvoiceStatus } from '../types';
import { Icon } from './Icon';

interface InvoiceActionsProps {
    invoice: Invoice;
    onViewDetails: () => void;
    onRegisterPayment: () => void;
    onCancel: () => void;
    hasPermission: (permission: Permission) => boolean;
}

const menuButtonClasses = "flex items-center w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-brand-red hover:text-white rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-300";

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ invoice, onViewDetails, onRegisterPayment, onCancel, hasPermission }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                menuRef.current && !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const menuHeight = 220; // Estimated menu height

            const pos: { top?: number, bottom?: number, right?: number } = {
                right: window.innerWidth - rect.right,
            };

            if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
                pos.bottom = window.innerHeight - rect.top;
            } else {
                pos.top = rect.bottom;
            }
            setMenuPosition(pos);
        }
        setIsOpen(!isOpen);
    };

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    const canRegisterPayment = invoice.status === InvoiceStatus.PENDIENTE || invoice.status === InvoiceStatus.VENCIDA;
    const canCancel = invoice.status === InvoiceStatus.PENDIENTE || invoice.status === InvoiceStatus.VENCIDA;

    return (
        <div>
            <button ref={buttonRef} onClick={toggleMenu} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="dots" className="w-5 h-5" />
            </button>
            {isOpen && (
                <div
                    ref={menuRef}
                    style={{
                        top: menuPosition.top !== undefined ? `${menuPosition.top + 8}px` : 'auto',
                        bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom + 8}px` : 'auto',
                        right: menuPosition.right !== undefined ? `${menuPosition.right}px` : 'auto',
                    }}
                    className="fixed z-20 w-56 bg-dark-light border border-gray-700 rounded-lg shadow-xl p-2 space-y-1 animate-fade-in-scale"
                >
                    <button onClick={() => handleAction(onViewDetails)} className={menuButtonClasses}>
                        <Icon name="eye" className="w-4 h-4 mr-3" /> Ver Detalles
                    </button>
                     <button className={menuButtonClasses} disabled>
                        <Icon name="invoice" className="w-4 h-4 mr-3" /> Enviar por Email
                    </button>
                    
                    {hasPermission('manage:billing') && (
                        <>
                            <div className="border-t border-gray-700 my-1"></div>
                            <button onClick={() => handleAction(onRegisterPayment)} className={menuButtonClasses} disabled={!canRegisterPayment}>
                                <Icon name="wallet" className="w-4 h-4 mr-3" /> Registrar Pago
                            </button>
                            <button onClick={() => handleAction(onCancel)} className={`${menuButtonClasses} !text-red-400 hover:!bg-red-800/50 hover:!text-white`} disabled={!canCancel}>
                                <Icon name="trash" className="w-4 h-4 mr-3" /> Cancelar Factura
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default InvoiceActions;
