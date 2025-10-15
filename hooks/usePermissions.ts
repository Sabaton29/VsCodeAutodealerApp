import { useMemo } from 'react';
import { ROLE_PERMISSIONS } from '../constants';
import type { StaffMember, Permission } from '../types';

// Create a set of all possible permissions for efficient lookup, calculated once.
const ALL_PERMISSIONS = new Set<Permission>(Object.values(ROLE_PERMISSIONS).flat());

export const usePermissions = (user: StaffMember | null) => {
    const permissions = useMemo(() => {
        if (!user) return new Set<Permission>();

        const rolePerms = ROLE_PERMISSIONS[user.role] || [];
        const customPerms = user.customPermissions || [];
        const combinedPerms = new Set([...rolePerms, ...customPerms]);
        
        // Implicitly grant 'view' permission if 'manage' permission exists
        const viewPermsToAdd: Permission[] = [];
        combinedPerms.forEach(p => {
            if (p.startsWith('manage:')) {
                const viewPerm = `view:${p.split(':')[1]}` as Permission;
                // Check if the corresponding view permission is a valid permission in our system
                if (ALL_PERMISSIONS.has(viewPerm)) {
                     viewPermsToAdd.push(viewPerm);
                }
            }
        });
        
        viewPermsToAdd.forEach(p => combinedPerms.add(p));

        return combinedPerms;
    }, [user]);

    const hasPermission = (permission: Permission) => {
        if (!user) return false;
        
        // Admins have all permissions implicitly
        if (user.role === 'Administrador') return true;

        // A mechanic with view:own_work_orders gets view:work_orders implicitly for the sidebar link
        if (permission === 'view:work_orders' && permissions.has('view:own_work_orders')) {
            return true;
        }
        
        return permissions.has(permission);
    };

    return { hasPermission };
};
