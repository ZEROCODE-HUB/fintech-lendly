import { Home, CreditCard, DollarSign, History, Users, Bell, LayoutDashboard, Cog, Wallet, User, Crown, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { authService } from "@/utils/auth";
import logoIcon from "@/assets/logo-icon.jpeg";
import logoSidebar from "@/assets/logo-sidebar.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  { title: "Métodos de Pago", url: "/payment-methods", icon: Wallet },
];

const adminItems = [
  { title: "Dashboard Admin", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Gestión de Préstamos", url: "/admin/loans", icon: CreditCard },
  { title: "Gestión de Clientes", url: "/admin/clients", icon: Users },
  { title: "Configuración", url: "/admin/config", icon: Cog },
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

  const getUserInitial = () => {
    const name = currentUser?.name || 'Usuario';
    return name.charAt(0).toUpperCase();
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Brand - Premium Fintech Style */}
        <div className="px-5 py-8 border-b border-sidebar-border/50 bg-gradient-to-b from-sidebar-background to-sidebar-background/80">
          {!isCollapsed && (
            <div className="space-y-6">
              {/* Logo Premium */}
              <div className="flex items-center justify-center">
                <img 
                  src={logoSidebar} 
                  alt="Increscendo Fintech" 
                  className="h-16 w-auto drop-shadow-lg" 
                />
              </div>
              
              {/* User Avatar with Dropdown */}
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none">
                      <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-sidebar-background transition-all group-hover:ring-primary/40 group-hover:scale-105">
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                          {getUserInitial()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-sidebar-foreground/80 group-hover:text-sidebar-foreground transition-colors">
                        {currentUser?.name || 'Usuario'}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48 bg-popover border border-border shadow-lg z-50">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/my-account')}>
                      <User className="mr-2 h-4 w-4" />
                      Mi Cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/membership')}>
                      <Crown className="mr-2 h-4 w-4" />
                      Mi Membresía
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex flex-col items-center gap-4">
              <img 
                src={logoIcon} 
                alt="Increscendo" 
                className="h-10 w-10 rounded-full object-cover brightness-0 invert drop-shadow-md" 
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-1 ring-offset-sidebar-background hover:ring-primary/40 transition-all cursor-pointer">
                      <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {getUserInitial()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-48 bg-popover border border-border shadow-lg z-50">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/my-account')}>
                    <User className="mr-2 h-4 w-4" />
                    Mi Cuenta
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/membership')}>
                    <Crown className="mr-2 h-4 w-4" />
                    Mi Membresía
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Client Menu - Only visible for client users */}
        {currentUser?.role === 'client' && (
          <>
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

            <SidebarGroup>
              <SidebarGroupLabel>Notificaciones</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/notifications" className={getNavClass}>
                        <Bell className="h-5 w-5" />
                        {!isCollapsed && <span>Notificaciones</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Admin Section - Only visible for admin users */}
        {isAdmin && (
          <>
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

            <SidebarGroup>
              <SidebarGroupLabel>Notificaciones</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/notifications" className={getNavClass}>
                        <Bell className="h-5 w-5" />
                        {!isCollapsed && <span>Notificaciones</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

      </SidebarContent>
    </Sidebar>
  );
}
