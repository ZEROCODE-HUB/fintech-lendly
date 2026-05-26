import { useState, useMemo } from 'react';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LoanOnboardingModal } from '@/components/LoanOnboardingModal';
import { useAuth, useLoans, useLoanStats } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: loans = [], isLoading: isLoadingLoans } = useLoans(user?.id);
  const { stats, isLoading: isLoadingStats } = useLoanStats(user?.id);
  const [showLoanOnboarding, setShowLoanOnboarding] = useState(false);

  const isLoading = isLoadingLoans || isLoadingStats;

  const currentLoan = useMemo(() => {
    const activeLoan = loans.find(l => l.status === 'active');
    if (!activeLoan) return null;
    const paid = Number(activeLoan.metadata?.paid_amount ?? 0);
    const amount = Number(activeLoan.amount ?? 0);
    const installments = Number(activeLoan.installments ?? 12);
    return {
      id: activeLoan.id,
      originalAmount: amount,
      paidAmount: paid,
      status: activeLoan.status,
      installments,
    };
  }, [loans]);

  const nextPaymentInfo = useMemo(() => {
    const activeLoan = loans.find(l => l.status === 'active');
    if (!activeLoan) return null;

    const amount = Number(activeLoan.amount ?? 0);
    const installments = Number(activeLoan.installments ?? 12);
    const paidAmount = Number(activeLoan.metadata?.paid_amount ?? 0);
    const monthlyPayment = installments > 0 ? amount / installments : 0;
    const paidInstallments = monthlyPayment > 0 ? Math.floor(paidAmount / monthlyPayment) : 0;

    const approvedDate = activeLoan.approved_at
      ? new Date(activeLoan.approved_at)
      : activeLoan.applied_at
        ? new Date(activeLoan.applied_at)
        : new Date();

    const nextInstallmentNumber = paidInstallments + 1;
    if (nextInstallmentNumber > installments) return null;

    const nextDueDate = new Date(approvedDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + nextInstallmentNumber);

    const nextPaymentDate = nextDueDate.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return {
      date: nextPaymentDate,
      amount: Math.round(monthlyPayment),
      loanId: activeLoan.id,
    };
  }, [loans]);

  const clientName = useMemo(() => {
    if (!user) return 'Usuario';
    return user.email?.split('@')[0] || 'Usuario';
  }, [user]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-soft md:min-h-[140px] lg:min-h-[160px]">
          <div className="flex flex-col h-full p-4 sm:p-6 justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Préstamo Activo</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl sm:text-3xl font-bold">
                  <AnimatedNumber value={stats.activeCount} duration={800} delay={0} />
                </div>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Préstamos en estado activo
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-soft md:min-h-[140px] lg:min-h-[160px]">
          <div className="flex flex-col h-full p-4 sm:p-6 justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Próximo Pago</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : nextPaymentInfo ? (
                <div className="text-2xl sm:text-3xl font-bold">
                  <AnimatedNumber value={nextPaymentInfo.amount} duration={800} delay={50} formatter={(val) => `$${val.toLocaleString()}`} />
                </div>
              ) : (
                <span className="text-xl font-bold">—</span>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {nextPaymentInfo ? `Vence el ${nextPaymentInfo.date}` : 'No hay pagos programados'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-soft md:min-h-[140px] lg:min-h-[160px] sm:col-span-2 md:col-span-2 lg:col-span-1">
          <div className="flex flex-col h-full p-4 sm:p-6 justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Estado</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl sm:text-3xl font-bold">
                  <AnimatedNumber value={stats.totalOutstanding} duration={800} delay={100} formatter={(val) => `$${val.toLocaleString()}`} />
                </div>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Total pendiente de préstamos activos
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-soft">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Acciones Rápidas</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Gestiona tus préstamos fácilmente</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
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
      {isLoading ? (
        <Card className="shadow-soft">
          <CardHeader className="p-4 sm:p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ) : currentLoan ? (
        <Card className="shadow-soft">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Estado del Préstamo Actual</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Préstamo #{currentLoan.id.slice(0, 8).toUpperCase()}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
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
        <Card className="shadow-soft">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Estado del Préstamo Actual</CardTitle>
            <CardDescription className="text-xs sm:text-sm">No tienes préstamos activos</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
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

      <LoanOnboardingModal 
        open={showLoanOnboarding} 
        onOpenChange={setShowLoanOnboarding} 
      />
    </div>
  );
};

export default Dashboard;