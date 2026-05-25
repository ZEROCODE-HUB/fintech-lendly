import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { Chatbot } from "@/components/Chatbot";

const MIN_INSTALLMENTS = 3;

const LoanRequest = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
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
        interestRate: interestRate * 100, // Convert decimal to percentage (0.42 -> 42)
        totalToPay: estimatedPayment * parseInt(installments),
        hasMembership: !!userMembership,
        membershipTitle: membershipTitle,
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
    
    // Obtener la fecha actual y comenzar desde el próximo mes
    const today = new Date();
    const firstPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    for (let i = 1; i <= months; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      // Calcular la fecha de pago
      const paymentDate = new Date(firstPaymentDate);
      paymentDate.setMonth(paymentDate.getMonth() + (i - 1));
      
      // Formatear fecha como DD/MM/YYYY
      const day = String(paymentDate.getDate()).padStart(2, '0');
      const month = String(paymentDate.getMonth() + 1).padStart(2, '0');
      const year = paymentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      
      schedule.push({
        month: i,
        date: formattedDate,
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
        if (!userId) return;

        const { data: umRow, error } = await supabase
          .from('user_memberships')
          .select('id, membership_plan_id, status, started_at, expires_at')
          .eq('user_id', userId)
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
    <>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {userMembership && (
              <Card className="border-success bg-success/5">
                <CardContent className="flex flex-row items-center gap-3 sm:gap-4 p-4">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-success flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base">{membershipTitle ?? 'Membresía Activa'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tienes acceso a tasas preferenciales y montos más altos</p>
                    {userMembership.expires_at && (
                      <p className="text-xs text-success mt-1">Expira {formatDate(userMembership.expires_at)}</p>
                    )}
                  </div>
                  <Badge className="bg-success text-success-foreground text-xs shrink-0">Verificado</Badge>
                </CardContent>
              </Card>
            )}

            {/* Loan Calculator */}
            <Card className="shadow-soft">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                  Simulador de Préstamo
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Ingresa el monto deseado y visualiza tus pagos mensuales
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm">Monto del Préstamo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="10000"
                      value={loanAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pl-7 text-base sm:text-lg font-semibold h-10"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {[5000, 10000, 15000, 20000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmountChange(amount.toString())}
                        className="text-xs h-9"
                      >
                        ${amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installments" className="text-sm">Número de Cuotas</Label>
                  <Select value={installments} onValueChange={handleInstallmentsChange}>
                    <SelectTrigger id="installments" className="h-10">
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
                  <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs sm:text-sm text-muted-foreground">Pago Mensual Estimado</span>
                      <span className="text-2xl sm:text-3xl font-bold text-primary">
                        ${estimatedPayment.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Plazo</p>
                        <p className="font-semibold text-sm mt-0.5">{installments} meses</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Tasa Anual</p>
                        <p className="font-semibold text-sm mt-0.5">{(interestRate * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                        <p className="font-semibold text-sm mt-0.5">${totalToPay.toFixed(2)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 text-xs sm:text-sm h-10"
                      onClick={generatePaymentSchedule}
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Ver Cronograma
                    </Button>
                  </div>
                )}

                {/* Información Importante */}
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-semibold mb-1.5 text-sm">Información Importante</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Solicitud revisada en 24-48 horas</li>
                      <li>• Requiere membresía activa</li>
                      <li>• Términos sujetos a historial crediticio</li>
                    </ul>
                  </div>
                </div>

<Button 
                    className="w-full h-10 text-sm"
                    disabled={!loanAmount}
                    size="lg"
                    onClick={handleStartLoanProcess}
                  >
                  Solicitar préstamo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

        <Chatbot />

        {/* Payment Schedule Simulation Dialog */}
        <Dialog open={simulationDialogOpen} onOpenChange={setSimulationDialogOpen}>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-4xl p-4 sm:p-6 flex flex-col max-h-[90vh]">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-base sm:text-lg">Cronograma de Pagos</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Distribución de tus pagos mensuales
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl p-3 sm:p-4 flex-shrink-0">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Monto</p>
                  <p className="text-xs sm:text-base font-bold mt-0.5">${parseFloat(loanAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Mensual</p>
                  <p className="text-xs sm:text-base font-bold mt-0.5">${estimatedPayment.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                  <p className="text-xs sm:text-base font-bold mt-0.5">${totalToPay.toFixed(2)}</p>
                </div>
              </div>
            </div>
              
<div className="overflow-x-auto mt-3 flex-1">
                      <Table className="w-full">
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="text-[10px] sm:text-xs w-14">Cuota</TableHead>
                    <TableHead className="text-[10px] sm:text-xs">Fecha</TableHead>
                    <TableHead className="text-[10px] sm:text-xs text-right">Capital</TableHead>
                    <TableHead className="text-[10px] sm:text-xs text-right">Interés</TableHead>
                    <TableHead className="text-[10px] sm:text-xs text-right">Total</TableHead>
                    <TableHead className="text-[10px] sm:text-xs text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentSchedule.map((payment) => (
                    <TableRow key={payment.month}>
                      <TableCell className="font-medium text-[10px] sm:text-xs">#{payment.month}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs whitespace-nowrap">{payment.date}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs text-right">${payment.principal.toFixed(2)}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs text-right">${payment.interest.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-[10px] sm:text-xs text-right">${payment.total.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground text-[10px] sm:text-xs text-right">${payment.balance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
    </>
  );
};

export default LoanRequest;
