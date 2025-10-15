

import React, { useState, useRef, useEffect } from 'react';
import type { WorkOrder, StaffMember, Permission, Quote } from '../types';
import { Icon } from './Icon';
import { KANBAN_STAGES_ORDER } from '../constants';
import { WorkOrderStatus, KanbanStage } from '../types';

interface WorkOrderActionsProps {
    workOrder: WorkOrder;
    quote?: Quote;
    technicians: StaffMember[]; // Now receives StaffMember[] filtered to mechanics
    onAssignTechnician: (technicianId: string) => void;
    onAdvanceStage: () => void;
    onRetreatStage?: () => void;
    onCancelOrder: () => void;
    onStartDiagnostic: () => void;
    onViewDetails: () => void;
    onEdit: () => void;
    onRegisterDelivery: () => void;
    hasPermission: (permission: Permission) => boolean;
}

const menuButtonClasses = "flex items-center justify-between w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-brand-red hover:text-white rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-300";

const WorkOrderActions: React.FC<WorkOrderActionsProps> = ({ workOrder, quote, technicians, onAssignTechnician, onAdvanceStage, onRetreatStage, onCancelOrder, onStartDiagnostic, onViewDetails, onEdit, onRegisterDelivery, hasPermission }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
    const [subMenuPositionClass, setSubMenuPositionClass] = useState('left-full ml-2');
    const [assignMenuTimeout, setAssignMenuTimeout] = useState<number | null>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const assignMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                menuRef.current && !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setIsSubMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuHeight = 280; // Estimated menu height

            const pos: { top?: number, bottom?: number, right?: number } = {
                right: window.innerWidth - rect.right,
            };

            if (spaceBelow < menuHeight && rect.top > menuHeight) {
                pos.bottom = window.innerHeight - rect.top;
            } else {
                pos.top = rect.bottom;
            }
            setMenuPosition(pos);
        }
        setIsOpen(!isOpen);
        if (isOpen) setIsSubMenuOpen(false); // Close sub-menu if main menu is closing
    };

    const handleAction = (action: () => void) => {
        if (assignMenuTimeout) {
            clearTimeout(assignMenuTimeout);
            setAssignMenuTimeout(null);
        }
        action();
        setIsOpen(false);
        setIsSubMenuOpen(false);
    };

    const handleAssignMenuEnter = () => {
        if (assignMenuTimeout) {
            clearTimeout(assignMenuTimeout);
            setAssignMenuTimeout(null);
        }
        if (assignMenuRef.current) {
            const rect = assignMenuRef.current.getBoundingClientRect();
            const subMenuWidth = 192; // w-48 is 12rem = 192px
            if ((window.innerWidth - rect.right) < subMenuWidth && rect.left > subMenuWidth) {
                setSubMenuPositionClass('right-full mr-2');
            } else {
                setSubMenuPositionClass('left-full ml-2');
            }
        }
        setIsSubMenuOpen(true);
    };

    const handleAssignMenuLeave = () => {
        const timeout = window.setTimeout(() => {
            setIsSubMenuOpen(false);
        }, 200); // Delay to allow moving mouse to submenu
        setAssignMenuTimeout(timeout);
    };

    const isReadyForDelivery = workOrder.stage === KanbanStage.LISTO_ENTREGA;

    // Permisos para administradores
    const isAdmin = hasPermission('advance:work_order_stage');
    
    // Etapas donde se puede avanzar manualmente (solo para no-admins)
    const manuallyAdvanceableStages: KanbanStage[] = [
        KanbanStage.EN_REPARACION,
        KanbanStage.CONTROL_CALIDAD,
    ];
    
    const canManuallyAdvance = isAdmin || (hasPermission('advance:work_order_stage') && manuallyAdvanceableStages.includes(workOrder.stage));
    const canManuallyRetreat = isAdmin && workOrder.stage !== KanbanStage.RECEPCION;

    const nextStage = !isReadyForDelivery && KANBAN_STAGES_ORDER.indexOf(workOrder.stage) < KANBAN_STAGES_ORDER.length - 1
        ? KANBAN_STAGES_ORDER[KANBAN_STAGES_ORDER.indexOf(workOrder.stage) + 1] 
        : null;

    const previousStage = KANBAN_STAGES_ORDER.indexOf(workOrder.stage) > 0
        ? KANBAN_STAGES_ORDER[KANBAN_STAGES_ORDER.indexOf(workOrder.stage) - 1] 
        : null;


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
                    className="fixed z-20 w-64 bg-dark-light border border-gray-700 rounded-lg shadow-xl p-2 space-y-1 animate-fade-in-scale"
                >
                    <h4 className="px-4 pt-1 pb-2 text-xs font-bold text-gray-500 uppercase">Acciones Rápidas</h4>
                    <button onClick={() => handleAction(onViewDetails)} className={menuButtonClasses}><Icon name="eye" className="w-4 h-4 mr-3" /> Ver Detalles</button>
                    
                    {hasPermission('start:diagnostic') && workOrder.stage === KanbanStage.RECEPCION && workOrder.requiresInitialDiagnosis && (
                        <button 
                            onClick={() => handleAction(onStartDiagnostic)} 
                            className={menuButtonClasses}
                        >
                            <Icon name="clipboard" className="w-4 h-4 mr-3" /> Iniciar Diagnóstico
                        </button>
                    )}
                    
                    {(hasPermission('assign:technician') || canManuallyAdvance || isReadyForDelivery) && (
                       <div className="border-t border-gray-700 my-1"></div>
                    )}

                    {hasPermission('assign:technician') && (
                        <div 
                            className="relative"
                            ref={assignMenuRef}
                            onMouseEnter={handleAssignMenuEnter}
                            onMouseLeave={handleAssignMenuLeave}
                        >
                            <button className={menuButtonClasses}>
                                <div className="flex items-center"><Icon name="user-plus" className="w-4 h-4 mr-3" /> Asignar Técnico</div>
                                <Icon name="chevron-right" className="w-4 h-4" />
                            </button>
                            {isSubMenuOpen && (
                                <div 
                                    className={`absolute -top-2 w-48 bg-dark-light border border-gray-700 rounded-lg shadow-xl ${subMenuPositionClass}`}
                                    onMouseEnter={handleAssignMenuEnter}
                                    onMouseLeave={handleAssignMenuLeave}
                                >
                                    <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                                        {technicians.map(tech => (
                                            <button key={tech.id} onClick={() => handleAction(() => onAssignTechnician(tech.id))} className={menuButtonClasses}>
                                                {tech.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {canManuallyAdvance && (
                         <button 
                            onClick={() => handleAction(onAdvanceStage)} 
                            className={`${menuButtonClasses} bg-brand-red/80 text-white font-bold hover:bg-brand-red`} 
                            disabled={!nextStage}
                        >
                            <span><Icon name="chevron-right" className="w-4 h-4 mr-3" /> Avanzar a "{nextStage}"</span>
                        </button>
                    )}
                    {canManuallyRetreat && onRetreatStage && (
                         <button 
                            onClick={() => handleAction(onRetreatStage)} 
                            className={`${menuButtonClasses} bg-orange-600/80 text-white font-bold hover:bg-orange-600`} 
                            disabled={!previousStage}
                        >
                            <span><Icon name="chevron-left" className="w-4 h-4 mr-3" /> Retroceder a "{previousStage}"</span>
                        </button>
                    )}
                    {hasPermission('advance:work_order_stage') && isReadyForDelivery && (
                         <button 
                            onClick={() => handleAction(onRegisterDelivery)} 
                            className={`${menuButtonClasses} bg-green-600/80 text-white font-bold hover:bg-green-600`}
                        >
                            <Icon name="check-circle" className="w-4 h-4 mr-3" /> Registrar Entrega de Vehículo
                        </button>
                    )}
                    
                    {(hasPermission('edit:work_order') || hasPermission('cancel:work_order')) && (
                        <div className="border-t border-gray-700 my-1"></div>
                    )}
                    
                    {hasPermission('edit:work_order') && (
                        <button onClick={() => handleAction(onEdit)} className={menuButtonClasses}><Icon name="edit" className="w-4 h-4 mr-3" /> Editar</button>
                    )}
                    {hasPermission('cancel:work_order') && (
                        <button onClick={() => handleAction(onCancelOrder)} className={`${menuButtonClasses} !text-red-400 hover:!bg-red-800/50 hover:!text-white`}>
                            <Icon name="trash" className="w-4 h-4 mr-3" /> Cancelar Orden
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkOrderActions;