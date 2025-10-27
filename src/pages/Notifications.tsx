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
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Notificaciones</h1>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="outline" className="border-primary text-primary">
                  {unreadCount} nuevas
                </Badge>
              )}
              <Button variant="outline" size="sm">
                Marcar todo como leído
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Todas las Notificaciones</CardTitle>
                <CardDescription>
                  Mantente al día con las actualizaciones de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                        !notification.read 
                          ? 'bg-accent/50 border-primary/20' 
                          : 'bg-background border-border hover:bg-accent/30'
                      }`}
                    >
                      <div className="mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
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
