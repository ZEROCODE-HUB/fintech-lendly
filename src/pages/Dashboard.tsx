import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoanOnboardingModal } from "@/components/LoanOnboardingModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showLoanOnboarding, setShowLoanOnboarding] = useState(false);
  
  // Datos dinámicos (en una implementación real vendrían de la API/estado)
  const clientName = "Hector";
  const loanStatus = "Al día"; // Opciones: "Al día", "Cuota Pendiente", "Atrasado"

  const getStatusBadgeVariant = (status: string): "success" | "warning" | "danger" | "secondary" => {
    switch (status) {
      case "Al día":
        return "success";
      case "Cuota Pendiente":
        return "warning";
      case "Atrasado":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 sticky top-0 z-10">
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
              <Card variant="elevated" className="animate-fade-in-up [animation-delay:0ms] group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Préstamo Activo</CardTitle>
                  <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$15,000.00</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saldo actual de tu préstamo
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="animate-fade-in-up [animation-delay:100ms] group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Próximo Pago</CardTitle>
                  <div className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$1,450.00</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vence el 15 de Diciembre
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="animate-fade-in-up [animation-delay:200ms] group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Estado</CardTitle>
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant={getStatusBadgeVariant(loanStatus)} className="text-sm px-4 py-1.5">
                    {loanStatus}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    Estado de tu préstamo
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card variant="elevated" className="animate-fade-in-up [animation-delay:300ms]">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Gestiona tus préstamos fácilmente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="premium"
                    size="lg"
                    className="flex-1"
                    onClick={() => setShowLoanOnboarding(true)}
                  >
                    <DollarSign className="mr-2 h-5 w-5" />
                    Solicitar Préstamo
                  </Button>
                  <Button 
                    variant="outline-premium"
                    size="lg"
                    className="flex-1"
                    onClick={() => navigate('/payment-methods')}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Método de Pago
                  </Button>
                  <Button 
                    variant="outline-premium"
                    size="lg"
                    className="flex-1"
                    onClick={() => navigate('/my-loans')}
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Ver Membresía
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Loan Status */}
            <Card variant="elevated" className="animate-fade-in-up [animation-delay:400ms]">
              <CardHeader>
                <CardTitle>Estado del Préstamo Actual</CardTitle>
                <CardDescription>Préstamo #LP-2024-001</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Monto Original:</span>
                  <span className="font-semibold">$20,000.00 MXN</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Saldo Restante:</span>
                  <span className="font-semibold text-primary">$15,000.00 MXN</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Pagos Realizados:</span>
                  <span className="font-semibold">5 de 12</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge variant="success-glow" className="px-4 py-1">Al Corriente</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mt-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-success to-success/80 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_hsl(var(--success)/0.5)]" 
                    style={{ width: '42%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">42% completado</p>
              </CardContent>
            </Card>

            {/* Alert */}
            <Card className="border-primary/30 bg-gradient-to-r from-accent/50 to-accent/30 animate-fade-in-up [animation-delay:500ms] hover:shadow-medium transition-all duration-300">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-4 sm:py-5">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center animate-float">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Recordatorio de Pago</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tu próximo pago vence en 5 días. Asegúrate de tener fondos disponibles.
                  </p>
                </div>
                <Button variant="glow" size="sm" className="w-full sm:w-auto text-xs sm:text-sm shrink-0">
                  Ver Detalles
                </Button>
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
