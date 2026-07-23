// สิทธิ์ทั้งหมดที่มีในระบบ ARWIP
export type Permission = 
  | 'view_analysis' 
  | 'view_inventory' 
  | 'manage_warehouse' 
  | 'manage_staff' 
  | 'view_accounting'
  | 'edit_settings';

// กำหนดว่า Role ไหนทำอะไรได้บ้าง
export const ROLE_CONFIG: Record<string, Permission[]> = {
  admin: [
    'view_analysis', 
    'view_inventory', 
    'manage_warehouse', 
    'manage_staff', 
    'view_accounting', 
    'edit_settings'
  ], // Admin ทำได้ทุกอย่าง
  warehouse_staff: ['view_inventory', 'manage_warehouse'],
  sales_staff: ['view_inventory'],
  accounting: ['view_analysis', 'view_accounting'],
};

// Helper function สำหรับเช็คสิทธิ์ (ใช้ได้ทั้งหน้าเว็บและ Sidebar)
export const hasPermission = (userRole: string, permission: Permission) => {
  return ROLE_CONFIG[userRole]?.includes(permission) || userRole === 'admin';
};