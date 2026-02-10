import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, CheckCircle2, AlertTriangle, ArrowRight, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authService } from "@/utils/auth";

const MIN_INSTALLMENTS = 3;

const LoanRequest = () => {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState("");
  const [installments, setInstallments] = useState("12");
  const [estimatedPayment, setEstimatedPayment] = useState(0);
  const [simulationDialogOpen, setSimulationDialogOpen] = useState(false);
  const [paymentSchedule, setPaymentSchedule] = useState<any[]>([]);
  const [userMembership, setUserMembership] = useState<any | null>(null);
  const [membershipTitle, setMembershipTitle] = useState<string | null>(null);
  const [interestRate, setInterestRate] = useState(0.42); // Default 42% anual

  // Limpiar resume_loan_id del localStorage cuando se monta el componente
  useEffect(() => {
    try {
      localStorage.removeItem('resume_loan_id');
    } catch (e) {
      console.warn('Failed to clear resume_loan_id from localStorage', e);
    }
  }, []);

  const handleStartLoanProcess = () => {
    navigate("/loan-process", {
      state: {
        amount: parseFloat(loanAmount) || 0,
        installments: parseInt(installments),
        monthlyPayment: estimatedPayment,
        interestRate: interestRate * 100,
        totalToPay: estimatedPayment * parseInt(installments),
      },
    });
  };

  const calculatePayment = (amount: string, months: number) => {
    const principal = parseFloat(amount) || 0;
    const monthlyRate = interestRate / 12;
    const payment = principal > 0 ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1) : 0;
    setEstimatedPayment(payment);
  };

  const handleAmountChange = (value: string) => {
    setLoanAmount(value);
    calculatePayment(value, parseInt(installments));
  };

  const handleInstallmentsChange = (value: string) => {
    setInstallments(value);
    calculatePayment(loanAmount, parseInt(value));
  };

  const generatePaymentSchedule = () => {
    const principal = parseFloat(loanAmount) || 0;
    const monthlyRate = interestRate / 12;
    const months = parseInt(installments);
    const monthlyPayment = estimatedPayment;
    
    const schedule = [];
    let remainingBalance = principal;
    
    for (let i = 1; i <= months; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      const today = new Date();
      const paymentDate = new Date(today.setMonth(today.getMonth() + i));
      
      schedule.push({
        month: i,
        date: paymentDate.toLocaleDateString('es-MX'),
        principal: principalPayment,
        interest: interestPayment,
        total: monthlyPayment,
        balance: Math.max(0, remainingBalance)
      });
    }
    
    setPaymentSchedule(schedule);
    setSimulationDialogOpen(true);
  };

  const totalToPay = estimatedPayment * parseInt(installments);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  useEffect(() => {
    const loadUserMembership = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user?.id) return;

        const { data: umRow, error } = await supabase
          .from('user_memberships')
          .select('id, membership_plan_id, status, started_at, expires_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (!umRow) return;

        setUserMembership(umRow);

        // Fetch plan title and interest rate
        const { data: plan } = await supabase
          .from('membership_plans')
          .select('name, features')
          .eq('id', umRow.membership_plan_id)
          .maybeSingle();

        if (plan?.name) setMembershipTitle(plan.name);
        
        // Extract interest rate from features JSON
        if (plan?.features) {
          try {
            const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
            const rate = features?.interestRate;
            if (rate) {
              // Convertir el porcentaje a decimal (si es 4 significa 4%, entonces 0.04)
              setInterestRate(rate / 100);
            }
          } catch (parseErr) {
            console.warn('Failed to parse membership features', parseErr);
          }
        }
      } catch (err) {
        // ignore unauthenticated/demo
      }
    };

    loadUserMembership();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Solicitar Préstamo</h1>
            </div>
          </header>

          <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6 pt-16 sm:pt-20 md:pt-0">
            {/* Membership Status Alert (shows only if user has an active membership) */}
            {userMembership && (
              <Card className="border-success bg-accent">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-success flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base sm:text-lg">{membershipTitle ?? 'Membresía Activa'}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Tienes acceso a tasas preferenciales y montos más altos</p>
                    {userMembership.expires_at && (
                      <p className="text-xs sm:text-sm text-success mt-1">Expira {formatDate(userMembership.expires_at)}</p>
                    )}
                  </div>
                  <Badge className="bg-success text-success-foreground text-xs sm:text-sm shrink-0">Verificado</Badge>
                </CardContent>
              </Card>
            )}

            {/* Loan Calculator */}
            <Card className="shadow-medium">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                  Simulador de Préstamo
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Ingresa el monto deseado y visualiza tus pagos mensuales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto del Préstamo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="10000"
                      value={loanAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pl-7 text-lg font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:flex gap-2 mt-2">
                    {[5000, 10000, 15000, 20000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmountChange(amount.toString())}
                        className="text-xs sm:text-sm"
                      >
                        ${amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Cuotas</Label>
                  <Select value={installments} onValueChange={handleInstallmentsChange}>
                    <SelectTrigger id="installments">
                      <SelectValue placeholder="Selecciona el número de cuotas" />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 6, 9, 12, 18, 24].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} cuotas
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Mínimo {MIN_INSTALLMENTS} cuotas</p>
                </div>

                {loanAmount && (
                  <div className="bg-gradient-accent rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-sm sm:text-base text-muted-foreground">Pago Mensual Estimado</span>
                      <span className="text-2xl sm:text-3xl font-bold text-primary">
                        ${estimatedPayment.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Plazo</p>
                        <p className="font-semibold text-sm sm:text-base">{installments} meses</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tasa Anual</p>
                        <p className="font-semibold text-sm sm:text-base">{(interestRate * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total a Pagar</p>
                        <p className="font-semibold text-sm sm:text-base">${totalToPay.toFixed(2)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-3 sm:mt-4 text-xs sm:text-sm"
                      onClick={generatePaymentSchedule}
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Ver Simulación del Cronograma
                    </Button>
                  </div>
                )}

                {/* Información Importante */}
                <div className="bg-muted rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Información Importante</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Tu solicitud será revisada en un plazo de 24-48 horas</li>
                      <li>• Debes tener una membresía activa para solicitar préstamos</li>
                      <li>• Los términos finales pueden variar según tu historial crediticio</li>
                    </ul>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  disabled={!loanAmount}
                  size="lg"
                  onClick={handleStartLoanProcess}
                >
                  Solicita el préstamo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Chatbot />

        {/* Payment Schedule Simulation Dialog */}
        <Dialog open={simulationDialogOpen} onOpenChange={setSimulationDialogOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-4xl p-3 sm:p-6 flex flex-col max-h-[95vh]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">Simulación del Cronograma de Pagos</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Visualiza cómo se distribuirán tus pagos mensuales
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-accent rounded-lg p-3 sm:p-4 flex-shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Monto Total</p>
                  <p className="text-base sm:text-lg font-bold">${parseFloat(loanAmount).toLocaleString()} MXN</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pago Mensual</p>
                  <p className="text-base sm:text-lg font-bold">${estimatedPayment.toFixed(2)} MXN</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total a Pagar</p>
                  <p className="text-base sm:text-lg font-bold">${totalToPay.toFixed(2)} MXN</p>
                </div>
              </div>
            </div>
              
            <div className="overflow-x-auto overflow-y-auto -mx-3 sm:mx-0 px-3 sm:px-0 mt-3 sm:mt-4 flex-1">
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Cuota</TableHead>
                    <TableHead className="text-xs sm:text-sm">Fecha</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Capital</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Interés</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Total</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentSchedule.map((payment) => (
                    <TableRow key={payment.month}>
                      <TableCell className="font-medium text-xs sm:text-sm">#{payment.month}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{payment.date}</TableCell>
                      <TableCell className="text-xs sm:text-sm text-right">${payment.principal.toFixed(2)}</TableCell>
                      <TableCell className="text-xs sm:text-sm text-right">${payment.interest.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm text-right">${payment.total.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm text-right">${payment.balance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default LoanRequest;
