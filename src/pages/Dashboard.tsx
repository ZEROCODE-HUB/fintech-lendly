import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, AlertCircle, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Dashboard de Préstamos</h1>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Préstamo Activo</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$15,000.00</div>
                  <p className="text-xs text-muted-foreground">
                    Saldo actual de tu préstamo
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Próximo Pago</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,450.00</div>
                  <p className="text-xs text-muted-foreground">
                    Vence el 15 de Diciembre
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Historial</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">95%</div>
                  <p className="text-xs text-muted-foreground">
                    Tasa de pagos a tiempo
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Gestiona tus préstamos fácilmente</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Button 
                  className="h-24 text-lg"
                  onClick={() => navigate('/loan-request')}
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Solicitar Nuevo Préstamo
                  <ArrowRight className="ml-auto h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 text-lg"
                  onClick={() => navigate('/my-loans')}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Ver Mis Préstamos
                  <ArrowRight className="ml-auto h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Current Loan Status */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Estado del Préstamo Actual</CardTitle>
                <CardDescription>Préstamo #LP-2024-001</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monto Original:</span>
                  <span className="font-semibold">$20,000.00 MXN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Saldo Restante:</span>
                  <span className="font-semibold text-primary">$15,000.00 MXN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pagos Realizados:</span>
                  <span className="font-semibold">5 de 12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge className="bg-success text-success-foreground">Al Corriente</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mt-4">
                  <div className="bg-success h-3 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">42% completado</p>
              </CardContent>
            </Card>

            {/* Alert */}
            <Card className="border-primary bg-accent">
              <CardContent className="flex items-center gap-4 py-4">
                <AlertCircle className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Recordatorio de Pago</p>
                  <p className="text-sm text-muted-foreground">
                    Tu próximo pago vence en 5 días. Asegúrate de tener fondos disponibles.
                  </p>
                </div>
                <Button variant="outline">Ver Detalles</Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Chatbot />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
