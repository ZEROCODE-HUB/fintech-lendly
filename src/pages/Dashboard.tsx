import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, AlertCircle, ArrowRight, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoanOnboardingModal } from "@/components/LoanOnboardingModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showLoanOnboarding, setShowLoanOnboarding] = useState(false);
  
  // Datos dinámicos (en una implementación real vendrían de la API/estado)
  const clientName = "Hector";
  const loanStatus = "Al día"; // Opciones: "Al día", "Cuota Pendiente", "Atrasado"

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Al día":
        return "bg-success text-success-foreground";
      case "Cuota Pendiente":
        return "bg-warning text-warning-foreground";
      case "Atrasado":
        return "bg-danger text-danger-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Bienvenido {clientName}</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/service-selection')}
              className="gap-1 sm:gap-2 text-xs sm:text-sm shrink-0"
              size="sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Volver a Servicios</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </header>

          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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
                  <CardTitle className="text-sm font-medium">Estado</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge className={`text-base px-3 py-1 ${getStatusBadgeVariant(loanStatus)}`}>
                    {loanStatus}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    Estado de tu préstamo
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
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => setShowLoanOnboarding(true)}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Solicitar Préstamo
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => navigate('/payment-methods')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Método de Pago
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => navigate('/my-loans')}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Ver Membresía
                  </Button>
                </div>
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
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Recordatorio de Pago</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tu próximo pago vence en 5 días. Asegúrate de tener fondos disponibles.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm shrink-0">Ver Detalles</Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Chatbot />

        <LoanOnboardingModal 
          open={showLoanOnboarding} 
          onOpenChange={setShowLoanOnboarding} 
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
