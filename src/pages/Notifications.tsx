import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";

const Notifications = () => {
  // Check if user is admin
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.role === 'admin';

  const adminNotifications = [
    {
      id: 1,
      type: "warning",
      title: "Nueva Solicitud de Préstamo",
      message: "María González ha solicitado un préstamo de $15,000 MXN (SOL-001).",
      time: "Hace 10 minutos",
      read: false
    },
    {
      id: 2,
      type: "warning",
      title: "Pago Atrasado",
      message: "El cliente Roberto García (PREST-043) tiene un pago atrasado de $2,100 MXN.",
      time: "Hace 1 hora",
      read: false
    },
    {
      id: 3,
      type: "success",
      title: "Cobro Exitoso",
      message: "Cobro automático de $2,500 MXN procesado para Juan Pérez (PREST-045).",
      time: "Hace 3 horas",
      read: false
    },
    {
      id: 4,
      type: "info",
      title: "Nueva Membresía",
      message: "Sofía Martínez ha activado una membresía Premium por $500 MXN.",
      time: "Hace 1 día",
      read: true
    },
    {
      id: 5,
      type: "warning",
      title: "Fallo en Cobro Automático",
      message: "El cobro automático de Laura Sánchez (PREST-044) falló. Revisar método de pago.",
      time: "Hace 2 días",
      read: true
    }
  ];

  const clientNotifications = [
    {
      id: 1,
      type: "success",
      title: "Pago Confirmado",
      message: "Tu pago de $2,500 MXN ha sido procesado exitosamente.",
      time: "Hace 5 minutos",
      read: false
    },
    {
      id: 2,
      type: "warning",
      title: "Próximo Vencimiento",
      message: "Tu pago de $1,800 MXN vence el 20 de Noviembre.",
      time: "Hace 2 horas",
      read: false
    },
    {
      id: 3,
      type: "info",
      title: "Préstamo Aprobado",
      message: "Tu solicitud de préstamo por $15,000 MXN ha sido aprobada.",
      time: "Hace 1 día",
      read: true
    },
    {
      id: 4,
      type: "success",
      title: "Membresía Renovada",
      message: "Tu membresía Premium ha sido renovada exitosamente.",
      time: "Hace 3 días",
      read: true
    },
    {
      id: 5,
      type: "info",
      title: "Nueva Función Disponible",
      message: "Ahora puedes gestionar tus métodos de pago desde el menú.",
      time: "Hace 5 días",
      read: true
    }
  ];

  const notifications = isAdmin ? adminNotifications : clientNotifications;

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "info":
        return <Info className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Notificaciones</h1>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="outline" className="border-primary text-primary text-xs sm:text-sm">
                  {unreadCount} {window.innerWidth < 640 ? '' : 'nuevas'}
                </Badge>
              )}
              <Button variant="outline" size="sm" className="text-xs sm:text-sm hidden sm:flex">
                Marcar todo como leído
              </Button>
            </div>
          </header>

          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pt-16 sm:pt-20 md:pt-0">
            <Card className="shadow-soft">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">Todas las Notificaciones</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Mantente al día con las actualizaciones de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-3 sm:space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-colors ${
                        !notification.read 
                          ? 'bg-accent/50 border-primary/20' 
                          : 'bg-background border-border hover:bg-accent/30'
                      }`}
                    >
                      <div className="mt-0.5 sm:mt-1 flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm sm:text-base">{notification.title}</h4>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {notifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes notificaciones</h3>
                <p className="text-muted-foreground">
                  Cuando tengas nuevas notificaciones, aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Notifications;
