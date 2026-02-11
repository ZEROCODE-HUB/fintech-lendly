import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authService } from "@/utils/auth";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  url?: string;
  channels: string[];
  read: boolean;
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // Load notifications from database
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (!currentUser?.id) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Notifications] Error loading notifications:', error);
          return;
        }

        setNotifications(data ?? []);
      } catch (err) {
        console.error('[Notifications] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-MX');
  };

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

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-3 w-3" />;
      case "sms":
        return <MessageSquare className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getChannelLabel = (channel: string): string => {
    switch (channel) {
      case "email":
        return "Email";
      case "sms":
        return "SMS";
      default:
        return channel;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('[Notifications] Error marking as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('[Notifications] Error deleting notification:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('[Notifications] Error marking all as read:', err);
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
              <Button variant="outline" size="sm" className="text-xs sm:text-sm hidden sm:flex" onClick={markAllAsRead} disabled={unreadCount === 0}>
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
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Cargando notificaciones...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes notificaciones</h3>
                    <p className="text-muted-foreground">
                      Cuando tengas nuevas notificaciones, aparecerán aquí
                    </p>
                  </div>
                ) : (
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
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <p className="text-xs text-muted-foreground">
                              {formatTime(notification.created_at)}
                            </p>
                            {notification.channels && notification.channels.length > 0 && (
                              <div className="flex gap-1 items-center">
                                {notification.channels.map((channel) => (
                                  <Badge 
                                    key={channel}
                                    variant="secondary" 
                                    className="text-[10px] sm:text-xs h-5 gap-1 flex items-center"
                                  >
                                    {getChannelIcon(channel)}
                                    {getChannelLabel(channel)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {notification.url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(notification.url!)}
                              title="Abrir"
                              className="h-8 px-2 text-xs"
                            >
                              Abrir
                            </Button>
                          )}
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              title="Marcar como leído"
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            title="Eliminar notificación"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Notifications;
