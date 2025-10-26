import { Home, CreditCard, DollarSign, History, Users, Settings, Bell, HelpCircle, LogOut, LayoutDashboard, Cog } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { authService } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Solicitar Préstamo", url: "/loan-request", icon: DollarSign },
  { title: "Mis Préstamos", url: "/my-loans", icon: CreditCard },
  { title: "Historial", url: "/history", icon: History },
];

const adminItems = [
  { title: "Dashboard Admin", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Gestión de Préstamos", url: "/admin/loans", icon: CreditCard },
  { title: "Gestión de Clientes", url: "/admin/clients", icon: Users },
  { title: "Configuración", url: "/admin/config", icon: Cog },
];

const supportItems = [
  { title: "Notificaciones", url: "/notifications", icon: Bell },
  { title: "Soporte", url: "/support", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
      : "hover:bg-sidebar-accent/50";

  const handleLogout = () => {
    authService.logout();
    navigate("/auth");
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <div className="px-6 py-6 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-sidebar-foreground">
                INCRESCENDO
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentUser?.name || 'Usuario'}
              </p>
            </div>
          )}
          {isCollapsed && (
            <div className="text-xl font-bold text-sidebar-foreground text-center">
              I
            </div>
          )}
        </div>

        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - conditional based on user role */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass}>
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Support */}
        <SidebarGroup>
          <SidebarGroupLabel>Ayuda</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start hover:bg-sidebar-accent/50"
                  >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
