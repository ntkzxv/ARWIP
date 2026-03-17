// src/config/permissions.ts
export const ROLE_PERMISSIONS = {
  admin: ['view_dashboard', 'manage_staff', 'view_analysis', 'edit_inventory'],
  accountant: ['view_dashboard', 'view_analysis'],
  warehouse: ['view_inventory', 'edit_inventory_pdi'],
  sales: ['view_inventory', 'create_contract'],
}

export type Role = keyof typeof ROLE_PERMISSIONS;