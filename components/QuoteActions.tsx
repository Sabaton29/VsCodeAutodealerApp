

import React, { useState, useRef, useEffect } from 'react';
import { Quote, Permission, QuoteStatus } from '../types';
import { Icon } from './Icon';

interface QuoteActionsProps {
    quote: Quote;
    onViewDetails: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onCreateInvoiceFromQuote: (workOrderId: string) => void;
    hasPermission: (permission: Permission) => boolean;
}

const menuButtonClasses = "flex items-center w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-brand-red hover:text-white rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-300";

const QuoteActions: React.FC<QuoteActionsProps> = ({ quote, onViewDetails, onEdit, onDelete, onCreateInvoiceFromQuote, hasPermission }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; right?: number }>({});
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
            const menuHeight = 180; // Estimated menu height

            const pos: { top?: number; bottom?: number; right?: number } = {
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

    const canEditOrDelete = quote.status === QuoteStatus.BORRADOR;
    const canCreateInvoice = quote.status === QuoteStatus.APROBADO && !!quote.workOrderId;

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
                    className="fixed z-[9999] w-56 bg-dark-light border border-gray-700 rounded-lg shadow-xl p-2 space-y-1 animate-fade-in-scale"
                >
                    <button onClick={() => handleAction(onViewDetails)} className={menuButtonClasses}>
                        <Icon name="eye" className="w-4 h-4 mr-3" /> Ver Detalles
                    </button>
                    
                    {hasPermission('manage:billing') && (
                         <button
                            onClick={() => handleAction(() => {
                                if (quote.workOrderId) {
                                    onCreateInvoiceFromQuote(quote.workOrderId);
                                }
                            })}
                            className={menuButtonClasses}
                            disabled={!canCreateInvoice}
                            title={!canCreateInvoice ? "Solo se pueden facturar cotizaciones aprobadas y asociadas a una OT." : "Crear factura a partir de esta cotización"}
                        >
                            <Icon name="invoice" className="w-4 h-4 mr-3" /> Crear Factura
                        </button>
                    )}
                    
                    {hasPermission('manage:quotes') && (
                        <>
                            <div className="border-t border-gray-700 my-1"></div>
                            <button
                                onClick={() => handleAction(onEdit)}
                                className={menuButtonClasses}
                                disabled={!canEditOrDelete}
                                title={!canEditOrDelete ? "Solo se pueden editar cotizaciones en estado 'Borrador'." : "Editar cotización"}
                            >
                                <Icon name="edit" className="w-4 h-4 mr-3" /> Editar
                            </button>
                            <button
                                onClick={() => handleAction(onDelete)}
                                className={`${menuButtonClasses} !text-red-400 hover:!bg-red-800/50 hover:!text-white`}
                                disabled={!canEditOrDelete}
                                title={!canEditOrDelete ? "Solo se pueden eliminar cotizaciones en estado 'Borrador'." : "Eliminar cotización"}
                            >
                                <Icon name="trash" className="w-4 h-4 mr-3" /> Eliminar
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuoteActions;
