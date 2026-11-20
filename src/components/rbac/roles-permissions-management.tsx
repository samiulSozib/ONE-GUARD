"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, Plus, Save, Shield, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Can from "@/components/auth/can";
import { useHasPermission } from "@/hooks/usePermission";
import { rbacService } from "@/service/rbac.service";
import type {
  RbacPermissionCatalog,
  RbacRole,
  RbacUser,
} from "@/app/types/rbac.types";
import SweetAlertService from "@/lib/sweetAlert";

export default function RolesPermissionsManagement() {
  const canManage = useHasPermission("rbac.manage");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState<RbacPermissionCatalog | null>(null);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [users, setUsers] = useState<RbacUser[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [draftKeys, setDraftKeys] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role_ids: [] as number[],
  });

  const assignableRoles = useMemo(
    () => roles.filter((r) => r.name !== "super_admin"),
    [roles]
  );

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const load = async () => {
    try {
      setLoading(true);
      const [perms, rolesRes, usersRes] = await Promise.all([
        rbacService.getPermissions(),
        rbacService.getRoles(),
        rbacService.getUsers(),
      ]);
      setCatalog(perms);
      setRoles(rolesRes.items);
      setUsers(usersRes.items);
      const firstId = rolesRes.items[0]?.id ?? null;
      setSelectedRoleId((prev) => prev ?? firstId);
      const selected =
        rolesRes.items.find((r) => r.id === (selectedRoleId ?? firstId)) ||
        rolesRes.items[0];
      setDraftKeys(selected?.permission_keys || []);
    } catch (e: any) {
      SweetAlertService.error(
        "Failed to load RBAC",
        e?.message || "Could not load roles and permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    setDraftKeys(selectedRole.permission_keys || []);
  }, [selectedRole]);

  const toggleKey = (key: string) => {
    if (!canManage) return;
    setDraftKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleModule = (moduleKeys: string[], checked: boolean) => {
    if (!canManage) return;
    setDraftKeys((prev) => {
      const without = prev.filter((k) => !moduleKeys.includes(k));
      return checked ? [...without, ...moduleKeys] : without;
    });
  };

  const saveRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      const updated = await rbacService.updateRole(selectedRole.id, {
        description: selectedRole.description || undefined,
        permission_keys: draftKeys,
      });
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      SweetAlertService.success("Saved", `Permissions updated for ${updated.name}.`);
      const usersRes = await rbacService.getUsers();
      setUsers(usersRes.items);
    } catch (e: any) {
      SweetAlertService.error("Save failed", e?.message || "Could not update role.");
    } finally {
      setSaving(false);
    }
  };

  const createRole = async () => {
    const name = newName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!/^[a-z0-9_]+$/.test(name)) {
      SweetAlertService.error(
        "Invalid name",
        "Use lowercase letters, numbers, and underscores only."
      );
      return;
    }
    try {
      setSaving(true);
      const created = await rbacService.createRole({
        name,
        description: newDescription.trim() || undefined,
        permission_keys: [],
      });
      setRoles((prev) => [...prev, created]);
      setSelectedRoleId(created.id);
      setCreateOpen(false);
      setNewName("");
      setNewDescription("");
      SweetAlertService.success("Role created", created.name);
    } catch (e: any) {
      SweetAlertService.error("Create failed", e?.message || "Could not create role.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (role: RbacRole) => {
    if (role.is_system) return;
    const result = await SweetAlertService.confirm(
      "Delete role?",
      `Delete ${role.name}? This cannot be undone.`
    );
    if (!result.isConfirmed) return;
    try {
      await rbacService.deleteRole(role.id);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      if (selectedRoleId === role.id) {
        setSelectedRoleId(roles.find((r) => r.id !== role.id)?.id ?? null);
      }
      SweetAlertService.success("Deleted", "Role removed.");
    } catch (e: any) {
      SweetAlertService.error("Delete failed", e?.message || "Could not delete role.");
    }
  };

  const toggleUserRole = async (user: RbacUser, roleId: number, checked: boolean) => {
    if (!canManage) return;
    const next = checked
      ? [...new Set([...user.roles.map((r) => r.id), roleId])]
      : user.roles.map((r) => r.id).filter((id) => id !== roleId);
    try {
      await rbacService.syncUserRoles(user.id, next);
      const usersRes = await rbacService.getUsers();
      setUsers(usersRes.items);
      SweetAlertService.success("Updated", "User roles saved.");
    } catch (e: any) {
      SweetAlertService.error("Update failed", e?.message || "Could not assign roles.");
    }
  };

  const toggleCreateUserRole = (roleId: number, checked: boolean) => {
    setUserForm((prev) => ({
      ...prev,
      role_ids: checked
        ? [...new Set([...prev.role_ids, roleId])]
        : prev.role_ids.filter((id) => id !== roleId),
    }));
  };

  const createAdminUser = async () => {
    if (!userForm.first_name.trim() || !userForm.last_name.trim()) {
      SweetAlertService.error("Missing name", "First and last name are required.");
      return;
    }
    if (!userForm.email.trim()) {
      SweetAlertService.error("Missing email", "Email is required.");
      return;
    }
    if (userForm.password.length < 8) {
      SweetAlertService.error("Weak password", "Password must be at least 8 characters.");
      return;
    }
    if (userForm.role_ids.length === 0) {
      SweetAlertService.error(
        "Select a role",
        "Pick at least one role, e.g. live_tracking_manager."
      );
      return;
    }

    try {
      setSaving(true);
      const result = await rbacService.createUser({
        first_name: userForm.first_name.trim(),
        last_name: userForm.last_name.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        role_ids: userForm.role_ids,
      });
      setUsers((prev) => [...prev, result.user]);
      setCreateUserOpen(false);
      setUserForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role_ids: [],
      });
      SweetAlertService.success(
        "Admin created",
        `${result.user.email} can now log in with the selected role(s).`
      );
      const rolesRes = await rbacService.getRoles();
      setRoles(rolesRes.items);
    } catch (e: any) {
      SweetAlertService.error(
        "Create failed",
        e?.message || "Could not create admin user."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: RbacUser, active: boolean) => {
    if (!canManage) return;
    try {
      const result = await rbacService.updateUser(user.id, { is_active: active });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? result.user : u)));
      SweetAlertService.success(
        active ? "Activated" : "Deactivated",
        `${user.email} is now ${active ? "active" : "inactive"}.`
      );
    } catch (e: any) {
      SweetAlertService.error("Update failed", e?.message || "Could not update user.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading roles & permissions…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-muted-foreground">
            Control what each admin role can see and do in the panel.
          </p>
        </div>
        <Can permission="rbac.manage">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New role
          </Button>
        </Can>
      </div>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Admin users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-4 p-3 space-y-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    selectedRoleId === role.id
                      ? "border-green-600 bg-green-50"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{role.name}</span>
                    <div className="flex items-center gap-1">
                      {role.is_system && (
                        <Badge variant="secondary" className="text-[10px]">
                          system
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {role.users_count} users
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {role.description || "No description"}
                  </p>
                </button>
              ))}
            </Card>

            <Card className="lg:col-span-8 p-4 space-y-4">
              {!selectedRole ? (
                <p className="text-sm text-muted-foreground">Select a role.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{selectedRole.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {selectedRole.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {draftKeys.length} permissions selected
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!selectedRole.is_system && (
                        <Can permission="rbac.manage">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteRole(selectedRole)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Can>
                      )}
                      <Can permission="rbac.manage">
                        <Button size="sm" disabled={saving} onClick={saveRolePermissions}>
                          {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save permissions
                        </Button>
                      </Can>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {(catalog?.grouped || []).map((group) => {
                      const keys = group.items.map((i) => i.key);
                      const allOn = keys.every((k) => draftKeys.includes(k));
                      const someOn = keys.some((k) => draftKeys.includes(k));
                      return (
                        <div key={group.module} className="rounded-lg border">
                          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={allOn ? true : someOn ? "indeterminate" : false}
                                disabled={!canManage}
                                onCheckedChange={(v) =>
                                  toggleModule(keys, v === true)
                                }
                              />
                              <span className="text-sm font-medium capitalize">
                                {group.module.replaceAll("_", " ")}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-[10px]">
                              {keys.filter((k) => draftKeys.includes(k)).length}/
                              {keys.length}
                            </Badge>
                          </div>
                          <div className="divide-y">
                            {group.items.map((perm) => (
                              <label
                                key={perm.key}
                                className="flex items-start gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-muted/30"
                              >
                                <Checkbox
                                  className="mt-0.5"
                                  checked={draftKeys.includes(perm.key)}
                                  disabled={!canManage}
                                  onCheckedChange={() => toggleKey(perm.key)}
                                />
                                <span>
                                  <span className="font-mono text-xs">{perm.key}</span>
                                  {perm.description && (
                                    <span className="block text-[11px] text-muted-foreground">
                                      {perm.description}
                                    </span>
                                  )}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Create limited admins (e.g. live tracking only) and assign roles.
            </p>
            <Can permission={["rbac.manage", "users.manage"]}>
              <Button
                onClick={() => {
                  setUserForm({
                    first_name: "",
                    last_name: "",
                    email: "",
                    password: "",
                    role_ids: [],
                  });
                  setCreateUserOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add admin user
              </Button>
            </Can>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Assigned roles</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          portal: {user.role}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              user.is_active
                                ? "border-green-200 bg-green-50 text-green-800"
                                : "border-amber-200 bg-amber-50 text-amber-800"
                            }
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {canManage && user.role !== "super_admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => toggleActive(user, !user.is_active)}
                            >
                              {user.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-3">
                          {assignableRoles.map((role) => {
                            const checked = user.roles.some((r) => r.id === role.id);
                            return (
                              <label
                                key={role.id}
                                className="flex items-center gap-2 text-xs"
                              >
                                <Checkbox
                                  checked={checked}
                                  disabled={!canManage}
                                  onCheckedChange={(v) =>
                                    toggleUserRole(user, role.id, v === true)
                                  }
                                />
                                {role.name}
                              </label>
                            );
                          })}
                          {user.role === "super_admin" && (
                            <Badge variant="secondary" className="text-[10px]">
                              super_admin (system)
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder="live_tracking_manager"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Lowercase snake_case only.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={createRole}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add admin user</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input
                  value={userForm.first_name}
                  onChange={(e) =>
                    setUserForm((p) => ({ ...p, first_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input
                  value={userForm.last_name}
                  onChange={(e) =>
                    setUserForm((p) => ({ ...p, last_name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email (login)</Label>
              <Input
                type="email"
                placeholder="tracker@company.com"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Temporary password</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((p) => ({ ...p, password: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">Min 8 characters.</p>
            </div>
            <div className="space-y-2 rounded-md border p-3">
              <Label>Assign role(s)</Label>
              <p className="text-[11px] text-muted-foreground">
                Example: choose <span className="font-mono">live_tracking_manager</span> for
                live map only.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                {assignableRoles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={userForm.role_ids.includes(role.id)}
                      onCheckedChange={(v) =>
                        toggleCreateUserRole(role.id, v === true)
                      }
                    />
                    <span>
                      <span className="font-medium">{role.name}</span>
                      {role.description && (
                        <span className="block text-[10px] text-muted-foreground max-w-[180px]">
                          {role.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={createAdminUser}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
