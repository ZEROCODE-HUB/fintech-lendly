import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, AlertCircle, ArrowRight, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoanOnboardingModal } from "@/components/LoanOnboardingModal";
import { supabase } from '@/lib/supabase';
import { authService } from '@/utils/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showLoanOnboarding, setShowLoanOnboarding] = useState(false);
  const [clientName, setClientName] = useState<string>("Usuario");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [nextPaymentInfo, setNextPaymentInfo] = useState<{date: string; amount: number; loanId?: string} | null>(null);
  const [currentLoan, setCurrentLoan] = useState<{
    id: string;
    originalAmount: number;
    paidAmount: number;
    status: string;
    installments: number;
  } | null>(null);
  
  // Cargar nombre del usuario logueado desde Supabase
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser?.id) return;

        const { data: userData, error } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (error) {
          console.warn('[Dashboard] failed to fetch user name', error);
          return;
        }

        if (userData) {
          const firstName = userData.first_name?.trim() || '';
          const lastName = userData.last_name?.trim() || '';
          if (firstName || lastName) {
            setClientName(`${firstName} ${lastName}`.trim());
          } else if (currentUser.name) {
            setClientName(currentUser.name);
          }
        }
      } catch (e) {
        console.warn('[Dashboard] failed to load user name', e);
      }
    };

    loadUserName();
    // load dashboard metrics for logged in user
    (async () => {
      setIsLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser?.id) {
          setIsLoading(false);
          return;
        }

        const { data: loans } = await supabase
          .from('loans')
          .select('id,amount,status,approved_at,applied_at,created_at,installments,metadata')
          .eq('user_id', currentUser.id);
        if (!loans) return;

        const now = new Date();
        let aCount = 0;
        let oCount = 0;
        let totalOut = 0;
        let nextDue: {date: Date; amount: number; loanId?: string} | null = null;
        let firstActiveLoan: any = null;

        for (const l of loans as any[]) {
          const status = l.status;
          const paid = Number(l.metadata?.paid_amount ?? 0);
          const amt = Number(l.amount ?? 0);
          const installments = Number(l.installments ?? l.metadata?.installments ?? 12);

          // Guardar el primer préstamo activo
          if (status === 'active' && !firstActiveLoan) {
            firstActiveLoan = l;
          }

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
        
        // Set current loan info
        if (firstActiveLoan) {
          const paid = Number(firstActiveLoan.metadata?.paid_amount ?? 0);
          const amt = Number(firstActiveLoan.amount ?? 0);
          const installments = Number(firstActiveLoan.installments ?? firstActiveLoan.metadata?.installments ?? 12);
          setCurrentLoan({
            id: firstActiveLoan.id,
            originalAmount: amt,
            paidAmount: paid,
            status: firstActiveLoan.status,
            installments: installments,
          });
        } else {
          setCurrentLoan(null);
        }
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
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
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

          <div className="p-4 sm:p-6 md:px-6 lg:p-8 space-y-4 sm:space-y-6 pt-16 sm:pt-20 md:pt-0">
            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-soft md:min-h-[140px] lg:min-h-[160px]">
                <div className="flex flex-col h-full p-3 sm:p-4 md:p-5 lg:p-6 justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Préstamo Activo</span>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">
                      <AnimatedNumber value={activeCount} duration={800} delay={0} />
                    </div>
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
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">{nextPaymentInfo ? <AnimatedNumber value={nextPaymentInfo.amount} duration={800} delay={50} formatter={(val) => `$${val.toLocaleString()}`} /> : '—'}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {nextPaymentInfo ? `Vence el ${nextPaymentInfo.date}` : 'No hay pagos programados'}
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
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">
                      <AnimatedNumber value={totalOutstanding} duration={800} delay={100} formatter={(val) => `$${val.toLocaleString()}`} />
                    </div>
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
            {currentLoan ? (
              <Card className="shadow-medium">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-base sm:text-lg">Estado del Préstamo Actual</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Préstamo #{currentLoan.id.slice(0, 8).toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6 pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Monto Original:</span>
                    <span className="text-sm sm:text-base font-semibold">${currentLoan.originalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Saldo Restante:</span>
                    <span className="text-sm sm:text-base font-semibold text-primary">${Math.max(0, currentLoan.originalAmount - currentLoan.paidAmount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Pagos Realizados:</span>
                    <span className="text-sm sm:text-base font-semibold">{Math.floor(currentLoan.paidAmount / (currentLoan.originalAmount / currentLoan.installments))} de {currentLoan.installments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Estado:</span>
                    <Badge className="bg-success text-success-foreground text-xs sm:text-sm">Al Corriente</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 mt-4">
                    <div className="bg-success h-3 rounded-full" style={{ width: `${Math.min(100, (currentLoan.paidAmount / currentLoan.originalAmount) * 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{Math.min(100, Math.round((currentLoan.paidAmount / currentLoan.originalAmount) * 100))}% completado</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-medium">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-base sm:text-lg">Estado del Préstamo Actual</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">No tienes préstamos activos</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                  <p className="text-sm text-muted-foreground">Solicita un préstamo para ver el estado aquí.</p>
                </CardContent>
              </Card>
            )}

            {/* Alert */}
            {nextPaymentInfo ? (
              <Card className="border-primary bg-accent">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
                  <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base">Recordatorio de Pago</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Tu próximo pago de ${nextPaymentInfo.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} vence el {nextPaymentInfo.date}. Asegúrate de tener fondos disponibles.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm shrink-0" onClick={() => navigate('/my-loans')}>Ver Detalles</Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
                  <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-green-900">Sin Pagos Pendientes</p>
                    <p className="text-xs sm:text-sm text-green-700">
                      No tienes pagos programados en este momento.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
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
