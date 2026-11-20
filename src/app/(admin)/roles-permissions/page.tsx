"use client";

import RolesPermissionsManagement from "@/components/rbac/roles-permissions-management";
import Can from "@/components/auth/can";

export default function RolesPermissionsPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-2 h-full">
        <div className="py-4 px-4 md:px-6">
          <Can
            permission={["rbac.view", "rbac.manage"]}
            fallback={
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                You do not have permission to view roles and permissions.
              </div>
            }
          >
            <RolesPermissionsManagement />
          </Can>
        </div>
      </div>
    </div>
  );
}
