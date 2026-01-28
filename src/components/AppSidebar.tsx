import { useState } from "react";
import { Home, CreditCard, DollarSign, History, Users, Bell, LayoutDashboard, Cog, Wallet, User, Crown, LogOut, Tag } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
import { LoanOnboardingModal } from "@/components/LoanOnboardingModal";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Solicitar Préstamo", url: "loan-onboarding", icon: DollarSign, isOnboarding: true },
  { title: "Mis Préstamos", url: "/my-loans", icon: CreditCard },
  { title: "Membresías", url: "/memberships", icon: Crown },
  { title: "Historial", url: "/history", icon: History },
  { title: "Métodos de Pago", url: "/payment-methods", icon: Wallet },
];

const adminItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Gestión Préstamos", url: "/admin/loans", icon: CreditCard },
  { title: "Gestión Clientes", url: "/admin/clients", icon: Users },
  { title: "Gestión Membresías", url: "/admin/memberships", icon: Crown },
  { title: "Gestión Cupones", url: "/admin/coupons", icon: Tag },
  { title: "Configuración", url: "/admin/config", icon: Cog },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin/');
  const showAdminMenu = isAdmin && (isAdminRoute || location.pathname === '/mi-cuenta');
  const showClientMenu = !showAdminMenu;
  const [showLoanOnboarding, setShowLoanOnboarding] = useState(false);

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
      : "hover:bg-sidebar-accent/50";

  const handleLogout = async () => {
    try {
      // sign out via supabase and clear local storage
      // import lazily to avoid circular deps
      const { signOut } = await import('@/lib/session');
      await signOut();
    } catch (err) {
      console.error('Error during logout', err);
    }
    navigate('/auth');
  };

  const getUserInitial = () => {
    const name = currentUser?.name || 'Usuario';
    return name.charAt(0).toUpperCase();
  };

  const handleMenuClick = (item: typeof menuItems[0], e: React.MouseEvent) => {
    if ((item as any).isOnboarding) {
      e.preventDefault();
      setShowLoanOnboarding(true);
    }
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* User Profile - Top Section */}
        <div className="px-4 py-5 border-b border-sidebar-border/50">
          {!isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full group cursor-pointer focus:outline-none hover:bg-sidebar-accent/30 rounded-lg p-2 -m-2 transition-colors">
                  <Avatar className="h-12 w-12 ring-2 ring-success/40 ring-offset-2 ring-offset-sidebar-background transition-all group-hover:ring-success/60 group-hover:scale-105 flex-shrink-0">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback className="bg-success text-white text-lg font-bold">
                      {getUserInitial()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base font-semibold text-sidebar-foreground group-hover:text-success transition-colors truncate">
                    {currentUser?.name || 'Usuario'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="w-48 bg-popover border border-border shadow-lg z-50">
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/mi-cuenta')}>
                  <User className="mr-2 h-4 w-4" />
                  Mi Cuenta
                </DropdownMenuItem>
                {!isAdmin && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/memberships')}>
                    <Crown className="mr-2 h-4 w-4" />
                    Mi Membresía
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex justify-center w-full focus:outline-none">
                  <Avatar className="h-10 w-10 ring-2 ring-success/40 ring-offset-1 ring-offset-sidebar-background hover:ring-success/60 transition-all cursor-pointer">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback className="bg-success text-white text-sm font-bold">
                      {getUserInitial()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-48 bg-popover border border-border shadow-lg z-50">
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/mi-cuenta')}>
                  <User className="mr-2 h-4 w-4" />
                  Mi Cuenta
                </DropdownMenuItem>
                {!isAdmin && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/memberships')}>
                    <Crown className="mr-2 h-4 w-4" />
                    Mi Membresía
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Client Menu - visible en rutas cliente o cuando no aplique menú admin */}
        {showClientMenu && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        {(item as any).isOnboarding ? (
                          <button
                            onClick={(e) => handleMenuClick(item, e)}
                            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-sidebar-accent/50`}
                          >
                            <item.icon className="h-5 w-5" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </button>
                        ) : (
                          <NavLink to={item.url} end className={getNavClass}>
                            <item.icon className="h-5 w-5" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </NavLink>
                        )}
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

        {/* Admin Section - visible para admins en rutas /admin y en /mi-cuenta */}
        {showAdminMenu && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
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

        {/* Logo - Bottom Section */}
        <div className="mt-auto px-4 py-6 border-t border-sidebar-border/30">
          {!isCollapsed && (
            <div className="flex flex-col items-center gap-3">
              <img
                src={logoSidebar}
                alt="Increscendo Fintech"
                className="h-14 w-auto brightness-0 invert"
              />
              <p className="text-xs font-medium text-white/80 tracking-wider uppercase">
                Fintech
              </p>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center">
              <img
                src={logoIcon}
                alt="Increscendo"
                className="h-8 w-8 rounded-full object-cover brightness-0 invert"
              />
            </div>
          )}
        </div>
      </SidebarContent>

      <LoanOnboardingModal
        open={showLoanOnboarding}
        onOpenChange={setShowLoanOnboarding}
      />
    </Sidebar>
  );
}
