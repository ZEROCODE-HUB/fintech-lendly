import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, AlertCircle, ArrowRight, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoanOnboardingModal } from "@/components/LoanOnboardingModal";
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showLoanOnboarding, setShowLoanOnboarding] = useState(false);
  const [clientName, setClientName] = useState<string>("Usuario");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [nextPaymentInfo, setNextPaymentInfo] = useState<{date: string; amount: number; loanId?: string} | null>(null);
  
  // Cargar nombre del usuario logueado desde el perfil local
  useEffect(() => {
    try {
      const stored = localStorage.getItem('increscendo_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.name) {
          setClientName(u.name);
        } else if (u?.email) {
          setClientName(u.email);
        }
      }
    } catch (e) {
      console.warn('[Dashboard] failed to parse increscendo_user', e);
    }
    // load admin metrics
    (async () => {
      setIsLoading(true);
      try {
        const { data: loans } = await supabase.from('loans').select('id,amount,status,approved_at,applied_at,created_at,installments,metadata');
        if (!loans) return;

        const now = new Date();
        let aCount = 0;
        let oCount = 0;
        let totalOut = 0;
        let nextDue: {date: Date; amount: number; loanId?: string} | null = null;

        for (const l of loans as any[]) {
          const status = l.status;
          const paid = Number(l.metadata?.paid_amount ?? 0);
          const amt = Number(l.amount ?? 0);
          const installments = Number(l.installments ?? l.metadata?.installments ?? 12);

          // compute next payment date
          let nextDate: Date | null = null;
          if (l.metadata?.next_payment_date) {
            try { nextDate = new Date(l.metadata.next_payment_date); } catch { nextDate = null; }
          } else {
            const approved = l.approved_at ? new Date(l.approved_at) : (l.applied_at ? new Date(l.applied_at) : (l.created_at ? new Date(l.created_at) : null));
            if (approved) {
              const installmentAmount = installments > 0 ? Math.round(amt / installments) : amt;
              const paidInst = installmentAmount > 0 ? Math.floor(paid / installmentAmount) : 0;
              const nextInst = paidInst + 1;
              const d = new Date(approved);
              d.setMonth(d.getMonth() + nextInst);
              nextDate = d;
            }
          }

          if (status === 'active') {
            aCount += 1;
            const remaining = Math.max(0, amt - paid);
            totalOut += remaining;
            const isOverdue = nextDate && nextDate < now && paid < amt;
            if (isOverdue) oCount += 1;

            if (nextDate) {
              const installmentAmount = installments > 0 ? Math.round(amt / installments) : amt;
              if (!nextDue || nextDate < nextDue.date) nextDue = { date: nextDate, amount: installmentAmount, loanId: l.id };
            }
          }
        }

        setActiveCount(aCount);
        setOverdueCount(oCount);
        setTotalOutstanding(totalOut);
        if (nextDue) setNextPaymentInfo({ date: nextDue.date.toISOString().slice(0,10), amount: nextDue.amount, loanId: nextDue.loanId });
      } catch (e) {
        console.error('Failed loading dashboard metrics', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
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
        
        <main className="flex-1 overflow-x-hidden">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold truncate">Bienvenido {clientName}</h1>
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

          <div className="p-4 sm:p-6 md:px-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-soft md:min-h-[140px] lg:min-h-[160px]">
                <div className="flex flex-col h-full p-3 sm:p-4 md:p-5 lg:p-6 justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Préstamo Activo</span>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">{isLoading ? 'Cargando...' : `${activeCount} préstamos`}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Préstamos en estado activo
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="shadow-soft md:min-h-[140px] lg:min-h-[160px]">
                <div className="flex flex-col h-full p-3 sm:p-4 md:p-5 lg:p-6 justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Próximo Pago</span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">{isLoading ? 'Cargando...' : nextPaymentInfo ? `$${nextPaymentInfo.amount.toLocaleString()}` : '—'}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {isLoading ? '' : nextPaymentInfo ? `Vence el ${nextPaymentInfo.date}` : 'No hay pagos programados'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="shadow-soft md:min-h-[140px] lg:min-h-[160px] sm:col-span-2 md:col-span-2 lg:col-span-1">
                <div className="flex flex-col h-full p-3 sm:p-4 md:p-5 lg:p-6 justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Estado</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">{isLoading ? 'Cargando...' : `$${totalOutstanding.toLocaleString()}`}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Total pendiente de préstamos activos
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-medium">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg">Acciones Rápidas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Gestiona tus préstamos fácilmente</CardDescription>
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
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg">Estado del Préstamo Actual</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Préstamo #LP-2024-001</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6 pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Monto Original:</span>
                  <span className="text-sm sm:text-base font-semibold">$20,000.00 MXN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Saldo Restante:</span>
                  <span className="text-sm sm:text-base font-semibold text-primary">$15,000.00 MXN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Pagos Realizados:</span>
                  <span className="text-sm sm:text-base font-semibold">5 de 12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Estado:</span>
                  <Badge className="bg-success text-success-foreground text-xs sm:text-sm">Al Corriente</Badge>
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
