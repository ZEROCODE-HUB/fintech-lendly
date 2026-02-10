import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, MessageSquare, Settings, CreditCard, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SystemConfig = () => {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [loanApprovals, setLoanApprovals] = useState(true);

  const handleSaveNotifications = () => {
    toast({
      title: "Configuración Guardada",
      description: "Las preferencias de notificaciones han sido actualizadas.",
    });
  };

  const handleSaveIntegrations = () => {
    toast({
      title: "Integraciones Actualizadas",
      description: "La configuración de integraciones ha sido guardada exitosamente.",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
            </div>
          </header>

          <div className="p-6 space-y-6">
            <Tabs defaultValue="notifications" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                <TabsTrigger value="integrations">Integraciones</TabsTrigger>
              </TabsList>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="mt-6 space-y-6">
                {/* Email Notifications */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>Notificaciones por Email</CardTitle>
                        <CardDescription>
                          Configura alertas automáticas por correo electrónico
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-enabled">Habilitar Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Enviar notificaciones por correo electrónico
                        </p>
                      </div>
                      <Switch
                        id="email-enabled"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    {emailNotifications && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="email-from">Email Remitente</Label>
                          <Input 
                            id="email-from" 
                            type="email" 
                            placeholder="noreply@increscendo.com"
                            defaultValue="noreply@increscendo.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email-template-approval">Plantilla: Aprobación de Préstamo</Label>
                          <Textarea 
                            id="email-template-approval"
                            placeholder="Estimado {nombre}, su préstamo ha sido aprobado..."
                            rows={4}
                            defaultValue="Estimado {nombre},&#10;&#10;Su préstamo por ${monto} ha sido aprobado. Los fondos serán depositados en las próximas 24 horas.&#10;&#10;Saludos,&#10;Increscendo Fintech"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email-template-payment">Plantilla: Recordatorio de Pago</Label>
                          <Textarea 
                            id="email-template-payment"
                            placeholder="Estimado {nombre}, le recordamos que su pago vence el..."
                            rows={4}
                            defaultValue="Estimado {nombre},&#10;&#10;Le recordamos que su pago de ${monto} vence el {fecha}.&#10;&#10;Saludos,&#10;Increscendo Fintech"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* SMS Notifications */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>Notificaciones por SMS</CardTitle>
                        <CardDescription>
                          Configura alertas automáticas por mensaje de texto
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-enabled">Habilitar SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Enviar notificaciones por mensaje de texto
                        </p>
                      </div>
                      <Switch
                        id="sms-enabled"
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>

                    {smsNotifications && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="sms-sender">ID del Remitente</Label>
                          <Input 
                            id="sms-sender" 
                            placeholder="INCRESCEN"
                            defaultValue="INCRESCEN"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sms-template">Plantilla de SMS</Label>
                          <Textarea 
                            id="sms-template"
                            placeholder="INCRESCENDO: Tu pago de ${monto} vence el {fecha}..."
                            rows={3}
                            defaultValue="INCRESCENDO: Tu pago de ${monto} vence el {fecha}. Paga a tiempo para evitar cargos adicionales."
                          />
                          <p className="text-xs text-muted-foreground">
                            Máximo 160 caracteres
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Automated Alerts */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>Alertas Automáticas</CardTitle>
                        <CardDescription>
                          Configura cuándo enviar notificaciones automáticas
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="payment-reminders">Recordatorios de Pago</Label>
                        <p className="text-sm text-muted-foreground">
                          Enviar antes de la fecha de vencimiento
                        </p>
                      </div>
                      <Switch
                        id="payment-reminders"
                        checked={paymentReminders}
                        onCheckedChange={setPaymentReminders}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="loan-approvals">Aprobaciones de Préstamo</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificar cuando un préstamo es aprobado
                        </p>
                      </div>
                      <Switch
                        id="loan-approvals"
                        checked={loanApprovals}
                        onCheckedChange={setLoanApprovals}
                      />
                    </div>

                    {paymentReminders && (
                      <div className="space-y-2 pl-6 border-l-2">
                        <Label htmlFor="reminder-days">Días de Anticipación</Label>
                        <Input 
                          id="reminder-days" 
                          type="number" 
                          placeholder="3"
                          defaultValue="3"
                        />
                        <p className="text-xs text-muted-foreground">
                          Días antes del vencimiento para enviar recordatorio
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>
                    <Settings className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </Button>
                </div>
              </TabsContent>

              {/* Integrations Tab */}
              <TabsContent value="integrations" className="mt-6 space-y-6">
                {/* Velvo Integration */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>API Velvo</CardTitle>
                        <CardDescription>
                          Configuración de validación bancaria
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="velvo-api-key">API Key</Label>
                      <Input 
                        id="velvo-api-key" 
                        type="password" 
                        placeholder="••••••••••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="velvo-endpoint">Endpoint</Label>
                      <Input 
                        id="velvo-endpoint" 
                        placeholder="https://api.velvo.com/v1"
                        defaultValue="https://api.velvo.com/v1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Gateway */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>Pasarela de Pagos</CardTitle>
                        <CardDescription>
                          Configuración de Stripe/STP
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-key">Stripe API Key</Label>
                      <Input 
                        id="stripe-key" 
                        type="password" 
                        placeholder="••••••••••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stp-key">STP API Key</Label>
                      <Input 
                        id="stp-key" 
                        type="password" 
                        placeholder="••••••••••••••••"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* White Label Integration */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>Integración White Label</CardTitle>
                        <CardDescription>
                          Servicios de pago y recargas
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="whitelabel-url">URL de Integración</Label>
                      <Input 
                        id="whitelabel-url" 
                        placeholder="https://services.provider.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whitelabel-token">Token de Acceso</Label>
                      <Input 
                        id="whitelabel-token" 
                        type="password" 
                        placeholder="••••••••••••••••"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSaveIntegrations}>
                    <Settings className="h-4 w-4 mr-2" />
                    Guardar Integraciones
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SystemConfig;
