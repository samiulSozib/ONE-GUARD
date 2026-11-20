export interface RbacPermission {
  id: number;
  key: string;
  module: string | null;
  action: string | null;
  description: string | null;
}

export interface RbacPermissionCatalog {
  items: RbacPermission[];
  grouped: {
    module: string;
    items: RbacPermission[];
  }[];
}

export interface RbacRole {
  id: number;
  name: string;
  description: string | null;
  users_count: number;
  is_system: boolean;
  permission_keys: string[];
  permissions: RbacPermission[];
}

export interface RbacUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  roles: { id: number; name: string; description: string | null }[];
  permissions: string[];
}
