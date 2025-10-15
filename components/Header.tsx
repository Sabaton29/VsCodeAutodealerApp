import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from './Icon';
import type { Location, StaffMember, TimeClockEntry, Notification } from '../types';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    setIsCreateWorkOrderModalOpen: (isOpen: boolean) => void;
    locations: Location[];
    selectedLocationId: string;
    setSelectedLocationId: (id: string) => void;
    staffMembers: StaffMember[];
    currentUser: StaffMember | null;
    setCurrentUser: (user: StaffMember) => void;
    hasPermission: (permission: any) => boolean;
    onMobileMenuClick: () => void;
    timeClockEntries: TimeClockEntry[];
    onClockIn: () => void;
    onClockOut: () => void;
    notifications: Notification[];
    onMarkAllAsRead: () => void;
    onNotificationClick: (notification: Notification) => void;
    onReloadData?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    isDarkMode, setIsDarkMode, setIsCreateWorkOrderModalOpen, 
    locations, selectedLocationId, setSelectedLocationId,
    staffMembers, currentUser, setCurrentUser, hasPermission,
    onMobileMenuClick, timeClockEntries, onClockIn, onClockOut,
    notifications, onMarkAllAsRead, onNotificationClick, onReloadData,
}) => {
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    const locationDropdownRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);

    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

    const lastClockEntry = useMemo(() => {
        if (!currentUser) return null;
        return timeClockEntries
            .filter(e => e.staffId === currentUser.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            [0];
    }, [timeClockEntries, currentUser]);

    const isClockedIn = lastClockEntry?.type === 'in';

    const userNotifications = useMemo(() => {
        if (!currentUser) return [];
        return notifications
            .filter(n => n.userId === currentUser.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [notifications, currentUser]);

    const unreadCount = useMemo(() => userNotifications.filter(n => !n.isRead).length, [userNotifications]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isClockedIn) {
            interval = setInterval(() => {
                const start = new Date(lastClockEntry.timestamp).getTime();
                const now = Date.now();
                const diff = now - start;
                const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
                const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
                const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
                setElapsedTime(`${hours}:${minutes}:${seconds}`);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isClockedIn, lastClockEntry]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
                setIsLocationDropdownOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
                setIsNotificationDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const ClockButton = () => {
        if (!currentUser?.requiresTimeClock) return null;
        
        const isDisabled = selectedLocationId === 'ALL_LOCATIONS';

        if (isClockedIn) {
            return (
                <button 
                    onClick={onClockOut}
                    className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold text-white bg-yellow-600 rounded-lg shadow-md hover:bg-yellow-700 transition-colors"
                    title="Fichar Salida"
                >
                    <Icon name="clock" className="w-5 h-5" />
                    <span className="hidden sm:inline font-mono">{elapsedTime}</span>
                    <span className="hidden sm:inline">Fichar Salida</span>
                </button>
            );
        }

        return (
            <button
                onClick={onClockIn}
                disabled={isDisabled}
                className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isDisabled ? "Seleccione una sede para fichar" : "Fichar Entrada"}
            >
                <Icon name="clock" className="w-5 h-5" />
                <span className="hidden sm:inline">Fichar Entrada</span>
            </button>
        );
    };

    return (
        <header className="flex-shrink-0 bg-light dark:bg-dark-light shadow-md dark:shadow-brand-black/50">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-4">
                    <button onClick={onMobileMenuClick} className="lg:hidden text-gray-400 hover:text-white">
                        <Icon name="menu" className="w-6 h-6" />
                    </button>

                    {hasPermission('create:work_order') && (
                        <button 
                            onClick={() => setIsCreateWorkOrderModalOpen(true)}
                            className="flex items-center justify-center sm:justify-start gap-2 h-10 w-10 sm:w-auto sm:px-4 text-sm font-semibold text-white bg-brand-red rounded-full sm:rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-light disabled:opacity-50 disabled:cursor-not-allowed"
                            title={selectedLocationId === 'ALL_LOCATIONS' ? 'Seleccione una sede para crear una orden' : "Crear Orden de Trabajo"}
                            disabled={selectedLocationId === 'ALL_LOCATIONS'}
                        >
                            <Icon name="plus" className="w-5 h-5 flex-shrink-0" />
                            <span className="hidden sm:inline whitespace-nowrap">Crear Orden de Trabajo</span>
                        </button>
                    )}
                    
                    {onReloadData && (
                        <button 
                            onClick={onReloadData}
                            className="flex items-center justify-center gap-2 h-10 w-10 text-sm font-semibold text-white bg-blue-600 rounded-full sm:rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark-light"
                            title="Recargar Datos"
                        >
                            <Icon name="refresh" className="w-5 h-5 flex-shrink-0" />
                            <span className="hidden sm:inline whitespace-nowrap">Recargar</span>
                        </button>
                    )}
                    
                    <ClockButton />
                </div>

                <div className="flex items-center space-x-4 md:space-x-6">
                    {/* Location Selector */}
                    <div className="relative" ref={locationDropdownRef}>
                        <button 
                            onClick={() => setIsLocationDropdownOpen(prev => !prev)}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                        >
                            <Icon name="office-building" className="w-5 h-5 text-brand-red" />
                            <span className="hidden sm:inline">{selectedLocationId === 'ALL_LOCATIONS' ? 'Todas las Sedes' : selectedLocation?.name || 'Seleccionar Sede'}</span>
                            <Icon name="chevron-down" className={`w-4 h-4 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isLocationDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-light rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedLocationId('ALL_LOCATIONS');
                                        setIsLocationDropdownOpen(false);
                                    }}
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                                >
                                    Todas las Sedes
                                </a>
                                <div className="border-t border-gray-200 dark:border-gray-700 mx-2 my-1"></div>
                                {locations.map(location => (
                                    <a
                                        key={location.id}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedLocationId(location.id);
                                            setIsLocationDropdownOpen(false);
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        {location.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Dark Mode Toggle */}
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                        {isDarkMode ? <Icon name="sun" className="w-6 h-6" /> : <Icon name="moon" className="w-6 h-6" />}
                    </button>
                    
                    {/* Notifications */}
                    <div className="relative" ref={notificationDropdownRef}>
                        <button onClick={() => setIsNotificationDropdownOpen(prev => !prev)} className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                            <Icon name="bell" className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1.5 block h-4 w-4 text-[10px] flex items-center justify-center rounded-full bg-brand-red ring-2 ring-white dark:ring-dark-light text-white font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {isNotificationDropdownOpen && (
                             <NotificationDropdown
                                notifications={userNotifications}
                                onNotificationClick={(notification) => {
                                    onNotificationClick(notification);
                                    setIsNotificationDropdownOpen(false);
                                }}
                                onMarkAllAsRead={onMarkAllAsRead}
                            />
                        )}
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={userDropdownRef}>
                        <button onClick={() => setIsUserDropdownOpen(prev => !prev)} className="flex items-center space-x-3">
                             <img className="h-9 w-9 rounded-full object-cover" src={currentUser?.avatarUrl} alt="User" />
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-light-text dark:text-dark-text">{currentUser?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role}</p>
                            </div>
                            <Icon name="chevron-down" className={`w-4 h-4 transition-transform text-gray-400 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-light rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                                <div className="px-4 py-2 text-xs text-gray-400">Cambiar de Usuario (Simulación)</div>
                                {staffMembers.map(staff => (
                                    <a
                                        key={staff.id}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentUser(staff);
                                            setIsUserDropdownOpen(false);
                                        }}
                                        className={`flex items-center gap-3 px-4 py-2 text-sm ${currentUser?.id === staff.id ? 'bg-brand-red/10 text-brand-red' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        <img src={staff.avatarUrl} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="font-semibold">{staff.name}</p>
                                            <p className="text-xs text-gray-500">{staff.role}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;