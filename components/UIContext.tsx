import React, { createContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as db from '../services/db';
import { UIContextType, StaffMember, Location, ModalType, ModalState, CalendarView } from '../types';
import { STAFF_DATA, LOCATIONS_DATA } from '../constants';

// Debounce utility para optimizar escrituras a IndexedDB
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
}

export const UIContext = createContext<UIContextType | null>(null);

export const UIProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    // UI State
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [activeView, setActiveView] = useState('Dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    
    // Session/Selection State
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Modal State
    const [modalState, setModalState] = useState<ModalState>({ type: null, data: undefined });

    // New Calendar View State
    const [calendarView, setCalendarView] = useState<CalendarView>('month');

    // Detail View State
    const [viewingWorkOrderId, setViewingWorkOrderId] = useState<string | null>(null);
    const [viewingQuoteId, setViewingQuoteId] = useState<string | null>(null);
    const [viewingClientId, setViewingClientId] = useState<string | null>(null);
    const [viewingVehicleId, setViewingVehicleId] = useState<string | null>(null);
    const [viewingPurchaseOrderId, setViewingPurchaseOrderId] = useState<string | null>(null);
    const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);
    const [viewingStaffId, setViewingStaffId] = useState<string | null>(null);

    // This is a bit of a hack since staffMembers live in DataContext, but UI needs it for currentUser.
    // In a more complex app, auth/user state might get its own context.
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>(STAFF_DATA);
    useEffect(() => {
        db.get<StaffMember[]>('staffMembers').then(members => {
            if (members) setStaffMembers(members);
        });
    }, []);
    const currentUser = useMemo(() => staffMembers.find(s => s.id === currentUserId) || staffMembers[0] || null, [staffMembers, currentUserId]);
    
    // Load UI preferences from DB
    useEffect(() => {
        Promise.all([
            db.get<boolean>('isDarkMode'), db.get<string>('activeView'), db.get<boolean>('sidebarCollapsed'),
            db.get<string>('selectedLocationId'), db.get<string | null>('currentUserId'), db.get<CalendarView>('calendarView'),
        ]).then(([isDark, view, collapsed, locationId, userId, calView]) => {
            if (isDark !== undefined) setIsDarkMode(isDark);
            if (view) setActiveView(view);
            if (collapsed !== undefined) setIsSidebarCollapsed(collapsed);
            if (locationId) setSelectedLocationId(locationId);
            else setSelectedLocationId(LOCATIONS_DATA[0]?.id || '');
            if (userId) setCurrentUserId(userId);
            else setCurrentUserId(STAFF_DATA[0]?.id || null);
            if (calView) setCalendarView(calView);
        });
    }, []);

    // Debounce UI state changes to reduce IndexedDB writes
    const debouncedDarkMode = useDebounce(isDarkMode, 500);
    const debouncedActiveView = useDebounce(activeView, 300);
    const debouncedSidebarCollapsed = useDebounce(isSidebarCollapsed, 300);
    const debouncedSelectedLocationId = useDebounce(selectedLocationId, 500);
    const debouncedCurrentUserId = useDebounce(currentUserId, 500);
    const debouncedCalendarView = useDebounce(calendarView, 300);
    
    // Persist UI changes with debouncing to optimize performance
    useEffect(() => { db.set('isDarkMode', debouncedDarkMode); }, [debouncedDarkMode]);
    useEffect(() => { db.set('activeView', debouncedActiveView); }, [debouncedActiveView]);
    useEffect(() => { db.set('sidebarCollapsed', debouncedSidebarCollapsed); }, [debouncedSidebarCollapsed]);
    useEffect(() => { db.set('selectedLocationId', debouncedSelectedLocationId); }, [debouncedSelectedLocationId]);
    useEffect(() => { db.set('currentUserId', debouncedCurrentUserId); }, [debouncedCurrentUserId]);
    useEffect(() => { db.set('calendarView', debouncedCalendarView); }, [debouncedCalendarView]);

    // Dark mode effect
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) root.classList.add('dark');
        else root.classList.remove('dark');
    }, [isDarkMode]);

    const openModal = useCallback((type: ModalType, data?: any) => {
        setModalState({ type, data });
    }, []);
    
    const closeModal = useCallback(() => {
        setModalState({ type: null, data: undefined });
    }, []);

    const setView = useCallback((type: 'workOrder' | 'quote' | 'client' | 'vehicle' | 'purchaseOrder' | 'invoice' | 'staff' | null, id: string | null) => {
        setViewingWorkOrderId(type === 'workOrder' ? id : null);
        setViewingQuoteId(type === 'quote' ? id : null);
        setViewingClientId(type === 'client' ? id : null);
        setViewingVehicleId(type === 'vehicle' ? id : null);
        setViewingPurchaseOrderId(type === 'purchaseOrder' ? id : null);
        setViewingInvoiceId(type === 'invoice' ? id : null);
        setViewingStaffId(type === 'staff' ? id : null);
    }, []);


    const value = {
        isDarkMode, setIsDarkMode, activeView, setActiveView, isSidebarCollapsed, setIsSidebarCollapsed,
        isMobileSidebarOpen, setIsMobileSidebarOpen, selectedLocationId, setSelectedLocationId,
        currentUserId, setCurrentUserId, currentUser, modalState, openModal, closeModal,
        calendarView, setCalendarView,
        viewingWorkOrderId, viewingQuoteId, viewingClientId, viewingVehicleId, viewingPurchaseOrderId, viewingInvoiceId, viewingStaffId,
        setView,
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};