"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSidebarToggle } from "@/components/providers/sidebar-toggle-provider";
import { PanelLeft, PanelRight } from "lucide-react";

export function SidebarToggleButton() {
  const { activeSidebar, toggleSidebar } = useSidebarToggle();

  return (
    <div className="flex items-center space-x-2 px-4 py-2 border-b">
      <PanelLeft className="h-4 w-4" />
      <Switch
        checked={activeSidebar === "secondary"}
        onCheckedChange={toggleSidebar}
        id="sidebar-toggle"
      />
      <PanelRight className="h-4 w-4" />
      <Label htmlFor="sidebar-toggle" className="text-sm font-medium">
        {activeSidebar === "main" ? "Main" : "Secondary"} Sidebar
      </Label>
    </div>
  );
}