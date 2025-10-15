import React from 'react';
import { Icon, IconName } from './Icon';
import { SIDEBAR_LINKS } from '../constants';
import type { Permission } from '../types';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    hasPermission: (permission: Permission) => boolean;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    activeView, setActiveView, hasPermission,
    isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen,
}) => {
    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black dark:bg-gray-900/60 z-30 transition-opacity lg:hidden ${
                    isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMobileOpen(false)}
            />
            <div
                className={`
                    fixed lg:static inset-y-0 left-0
                    z-40 flex flex-col bg-dark-light text-gray-300
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                <div className={`flex flex-col items-center justify-center h-28 border-b border-gray-800 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    <Icon name="logo-car" className="w-16 h-auto text-white" />
                    {!isCollapsed && (
                        <h1 className="text-3xl font-heading tracking-wider mt-2">
                            <span className="text-brand-red">AUTO</span>
                            <span className="text-white">DEALER</span>
                        </h1>
                    )}
                </div>

                <nav className={`flex-1 py-6 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    <ul className="space-y-2">
                        {SIDEBAR_LINKS
                            .filter(link => !link.permission || hasPermission(link.permission))
                            .map((link) => (
                            <li key={link.name}>
                                <button
                                    onClick={() => {
                                        setActiveView(link.name);
                                        setIsMobileOpen(false);
                                    }}
                                    className={`flex items-center w-full py-3 rounded-md text-sm font-medium transition-colors text-left
                                        ${isCollapsed ? 'justify-center' : 'px-4'}
                                        ${link.name === activeView
                                            ? 'bg-brand-red text-white'
                                            : 'hover:bg-gray-700/50 hover:text-white'
                                    }`}
                                    title={isCollapsed ? link.name : ''}
                                >
                                    <Icon name={link.icon as IconName} className={`w-5 h-5 flex-shrink-0 ${!isCollapsed && 'mr-3'}`} />
                                    {!isCollapsed && <span>{link.name}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={`border-t border-gray-800 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'} py-4`}>
                    {!isCollapsed && (
                        <div className="flex items-center p-3 rounded-md bg-gray-700/30 mb-4">
                            <Icon name="help" className="w-8 h-8 mr-3 text-brand-red flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-white">Centro de Ayuda</p>
                                <p className="text-xs text-gray-400">Guías y soporte técnico.</p>
                            </div>
                        </div>
                    )}
                     <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center justify-center w-full p-3 rounded-md hover:bg-gray-700/50 transition-colors"
                        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                    >
                        <Icon name="chevron-double-left" className={`w-6 h-6 transition-transform duration-300 ${isCollapsed && 'rotate-180'}`} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;