import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabase';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Eye, Calendar, DollarSign, Loader2, Shield } from "lucide-react";
import { Chatbot } from "@/components/Chatbot";

interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending';
}

const MyLoans = () => {
  const navigate = useNavigate();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([]);
  const [paymentLoan, setPaymentLoan] = useState<any>(null);
  const [loansData, setLoansData] = useState<any[]>([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);

  // Generate installments for a loan
  const generateInstallments = (loan: any): Installment[] => {
    const installments: Installment[] = [];
    const paidCount = Math.floor((loan.paid / loan.amount) * loan.term);
    
    for (let i = 1; i <= loan.term; i++) {
      const baseDate = new Date(loan.approved);
      baseDate.setMonth(baseDate.getMonth() + i);
      
      installments.push({
        number: i,
        dueDate: `${baseDate.getDate().toString().padStart(2, '0')}/${(baseDate.getMonth() + 1).toString().padStart(2, '0')}/${baseDate.getFullYear()}`,
        amount: Math.round(loan.amount / loan.term * (1 + loan.rate / 100)),
        status: i <= paidCount ? 'paid' : 'pending'
      });
    }
    return installments;
  };

  const currentInstallments = useMemo(() => {
    if (!paymentLoan) return [];
    return generateInstallments(paymentLoan);
  }, [paymentLoan]);

  const pendingInstallments = useMemo(() => {
    return currentInstallments.filter(inst => inst.status === 'pending');
  }, [currentInstallments]);

  const handleViewLoan = (loan: any) => {
    setSelectedLoan(loan);
    setViewDialogOpen(true);
  };

  const handleOpenPayment = (loan: any) => {
    setPaymentLoan(loan);
    // Pre-select first pending installment
    const installments = generateInstallments(loan);
    const firstPending = installments.find(inst => inst.status === 'pending');
    if (firstPending) {
      setSelectedInstallments([firstPending.number]);
    } else {
      setSelectedInstallments([]);
    }
    setPaymentDialogOpen(true);
  };

  const loadLoans = async () => {
    try {
      setIsLoadingLoans(true);
      // try to get user id from local session first
      let sessionStr = null;
      try { sessionStr = localStorage.getItem('increscendo_session'); } catch { }
      let userId: string | null = null;
      if (sessionStr) {
        try { userId = JSON.parse(sessionStr)?.user?.id ?? null; } catch (e) { }
      }
      if (!userId) {
        try { const { data } = await supabase.auth.getUser(); userId = data?.user?.id ?? null; } catch (e) { console.warn('supabase.getUser failed', e); }
      }
      if (!userId) return setLoansData([]);

      const { data, error } = await supabase.from('loans').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      if (!data) return setLoansData([]);

      const mapped = (data as any[]).map((l) => {
        const amount = Number(l.amount ?? 0);
        const paid = Number(l.metadata?.paid_amount ?? 0);
        const remaining = Math.max(0, amount - paid);
        return {
          id: l.id,
          amount,
          approved: l.approved_at ? new Date(l.approved_at).toISOString().slice(0,10) : (l.applied_at ? new Date(l.applied_at).toISOString().slice(0,10) : ''),
          rate: Number(l.interest_rate ?? l.metadata?.interest_rate ?? 0),
          term: l.installments ?? 12,
          status: l.status ?? 'pending',
          paid,
          remaining,
          nextPayment: l.metadata?.next_payment_date ? new Date(l.metadata.next_payment_date).toISOString().slice(0,10) : '-',
          raw: l,
        };
      });

      setLoansData(mapped);
      if (mapped.length) setSelectedLoanId(prev => prev ?? String(mapped[0].id));
    } catch (err) {
      console.error('Error loading user loans', err);
    } finally {
      setIsLoadingLoans(false);
    }
  };

  useEffect(() => {
    loadLoans();
    const onReload = () => { loadLoans(); };
    window.addEventListener('reloadLoans', onReload);
    return () => { window.removeEventListener('reloadLoans', onReload); };
  }, []);

  const handleInstallmentToggle = (installmentNumber: number) => {
    const firstPendingNumber = pendingInstallments[0]?.number;
    
    // First pending installment is mandatory
    if (installmentNumber === firstPendingNumber) return;
    
    setSelectedInstallments(prev => {
      if (prev.includes(installmentNumber)) {
        // Uncheck: remove this and all following installments
        return prev.filter(num => num < installmentNumber);
      } else {
        // Check: only allow if previous installment is selected
        const previousNumber = installmentNumber - 1;
        if (prev.includes(previousNumber) || previousNumber < firstPendingNumber!) {
          // Add all installments up to this one
          const newSelected = [...prev];
          for (let i = firstPendingNumber!; i <= installmentNumber; i++) {
            if (!newSelected.includes(i)) {
              newSelected.push(i);
            }
          }
          return newSelected.sort((a, b) => a - b);
        }
        return prev;
      }
    });
  };

  const totalToPay = useMemo(() => {
    return pendingInstallments
      .filter(inst => selectedInstallments.includes(inst.number))
      .reduce((sum, inst) => sum + inst.amount, 0);
  }, [selectedInstallments, pendingInstallments]);

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-success/20 text-success border-success">Activo</Badge>;
    }
    if (status === 'paid') {
      return <Badge className="bg-primary/20 text-primary border-primary">Pagado</Badge>;
    }
    return <Badge variant="outline">Pendiente</Badge>;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 overflow-x-hidden">
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center h-14 sm:h-16 px-4 sm:px-6 gap-3">
              <SidebarTrigger />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Mis Préstamos</h1>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 md:px-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-soft md:min-h-[130px] lg:min-h-[150px]">
                <div className="flex flex-col h-full p-3 sm:p-4 md:p-5 lg:p-6 justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Préstamos</span>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">$30,000</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Monto total solicitado
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="shadow-soft md:min-h-[130px] lg:min-h-[150px]">
                <div className="flex flex-col h-full p-3 sm:p-4 md:p-5 lg:p-6 justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Monto Pagado</span>
                    <DollarSign className="h-4 w-4 text-success" />
                  </div>
                  <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">$15,500</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      51.67% del total
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="shadow-soft md:min-h-[130px] lg:min-h-[150px] sm:col-span-2 md:col-span-2 lg:col-span-1">
                <div className="flex flex-col h-full p-3 sm:p-4 md:p-5 lg:p-6 justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo Pendiente</span>
                    <DollarSign className="h-4 w-4 text-danger" />
                  </div>
                  <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">$14,500</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Por liquidar
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Loans Table */}
            <Card className="shadow-soft">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl">Detalle de Préstamos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Gestiona y consulta el estado de todos tus préstamos
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-6">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">ID</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Monto</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Tasa</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">Plazo</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Pagado</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Restante</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden xl:table-cell">Próximo Pago</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Estado</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(isLoadingLoans ? [] : loansData).map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{loan.id}</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">${loan.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{loan.rate}%</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">{loan.term}m</TableCell>
                        <TableCell className="text-success text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                          ${loan.paid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-danger text-xs sm:text-sm whitespace-nowrap">
                          ${loan.remaining.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden xl:table-cell">{loan.nextPayment}</TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewLoan(loan)}
                              className="text-xs whitespace-nowrap"
                            >
                              <Eye className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline">Ver</span>
                            </Button>
                            {(loan.status === 'pending' || loan.status === 'under_review' || loan.status === 'approved') && (
                              <Button
                                size="sm"
                                className="text-xs whitespace-nowrap"
                                onClick={() => {
                                  try { localStorage.setItem('resume_loan_id', String(loan.id)); } catch { }
                                  const step = (loan.status === 'approved') ? 5 : 4;
                                  navigate('/loan-process', { state: { resumeLoanId: loan.id, resumeStep: step } });
                                }}
                              >
                                Continuar
                              </Button>
                            )}
                            {loan.status === 'active' && (
                              <Button 
                                size="sm" 
                                className="text-xs whitespace-nowrap bg-primary hover:bg-primary/90"
                                onClick={() => handleOpenPayment(loan)}
                              >
                                <CreditCard className="h-3 w-3 sm:mr-1" />
                                <span className="hidden sm:inline">Pagar cuotas</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>

            {/* Payment Schedule */}
            <Card className="shadow-soft">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl">Cronograma de Pagos</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Selecciona un préstamo para ver su calendario de cuotas</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <select 
                      className="border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                      value={selectedLoanId}
                      onChange={(e) => setSelectedLoanId(e.target.value)}
                    >
                      {loansData.map((loan) => (
                          <option key={loan.id} value={loan.id}>
                            {loan.id} - ${loan.amount.toLocaleString()}
                          </option>
                        ))}
                    </select>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-6">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Cuota</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Fecha</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Capital</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Interés</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Total</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">#{i + 1}</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">15/{String(i + 5).padStart(2, '0')}/24</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">$800</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">$100</TableCell>
                        <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">$900</TableCell>
                        <TableCell>
                          <Badge className="bg-success/20 text-success border-success text-xs">
                            Pagado
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i + 6}>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">#{i + 7}</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">15/{String(i + 11).padStart(2, '0')}/24</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">$800</TableCell>
                        <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">$100</TableCell>
                        <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">$900</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">Pendiente</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Chatbot />

        {/* View Loan Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Detalles del Préstamo</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">Información completa de tu préstamo</DialogDescription>
            </DialogHeader>
            {selectedLoan && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ID del Préstamo</Label>
                    <p className="font-semibold">{selectedLoan.id}</p>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <div className="mt-1">{getStatusBadge(selectedLoan.status)}</div>
                  </div>
                  <div>
                    <Label>Monto Original</Label>
                    <p className="font-semibold">${selectedLoan.amount?.toLocaleString()} MXN</p>
                  </div>
                  <div>
                    <Label>Fecha de Aprobación</Label>
                    <p className="font-semibold">{selectedLoan.approved}</p>
                  </div>
                  <div>
                    <Label>Tasa de Interés</Label>
                    <p className="font-semibold">{selectedLoan.rate}%</p>
                  </div>
                  <div>
                    <Label>Plazo</Label>
                    <p className="font-semibold">{selectedLoan.term} meses</p>
                  </div>
                  <div>
                    <Label>Monto Pagado</Label>
                    <p className="font-semibold text-success">${selectedLoan.paid?.toLocaleString()} MXN</p>
                  </div>
                  <div>
                    <Label>Saldo Restante</Label>
                    <p className="font-semibold text-danger">${selectedLoan.remaining?.toLocaleString()} MXN</p>
                  </div>
                  {selectedLoan.status === 'active' && (
                    <div className="col-span-2">
                      <Label>Próximo Pago</Label>
                      <p className="font-semibold">{selectedLoan.nextPayment}</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Progreso de Pago</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completado</span>
                      <span>{((selectedLoan.paid / selectedLoan.amount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success transition-all"
                        style={{ width: `${(selectedLoan.paid / selectedLoan.amount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Checkout Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-6">
              <DialogHeader className="text-white">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                  Pagar Cuotas
                </DialogTitle>
                <DialogDescription className="text-white/80 text-sm">
                  {paymentLoan?.id} - Selecciona las cuotas a pagar
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              {/* Total Amount */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="font-medium text-muted-foreground">Monto Total a Pagar</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                      ${totalToPay.toLocaleString()} MXN
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Installments List */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Cuotas Pendientes</Label>
                <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2">
                  {pendingInstallments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay cuotas pendientes para este préstamo.
                    </p>
                  ) : (
                    pendingInstallments.map((installment, index) => {
                      const isFirst = index === 0;
                      const isSelected = selectedInstallments.includes(installment.number);
                      const previousSelected = index === 0 || selectedInstallments.includes(pendingInstallments[index - 1]?.number);
                      const isDisabled = !isFirst && !previousSelected;

                      return (
                        <div
                          key={installment.number}
                          className={`
                            flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all
                            ${isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-border hover:border-primary/50'
                            }
                            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          onClick={() => !isDisabled && handleInstallmentToggle(installment.number)}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isFirst || isDisabled}
                            onCheckedChange={() => handleInstallmentToggle(installment.number)}
                            className={isFirst ? 'opacity-70' : ''}
                          />
                          <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs">Cuota</span>
                              <p className="font-semibold">#{installment.number}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs">Vencimiento</span>
                              <p className="font-medium">{installment.dueDate}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-muted-foreground text-xs">Monto</span>
                              <p className="font-bold text-primary">${installment.amount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {pendingInstallments.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    * La primera cuota pendiente es obligatoria. Solo puedes seleccionar cuotas consecutivas.
                  </p>
                )}
              </div>
            </div>

            {/* Processing State */}
            {isProcessing ? (
              <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[300px]">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Shield className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
                  Procesando tu pago de forma segura...
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  No cierres ni recargues esta ventana
                </p>
              </div>
            ) : (
              <DialogFooter className="p-4 sm:p-6 pt-0">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-base"
                  disabled={selectedInstallments.length === 0}
                  onClick={() => {
                    setIsProcessing(true);
                    // Simulate payment processing
                    setTimeout(() => {
                      setIsProcessing(false);
                      setPaymentDialogOpen(false);
                      // Simulate success (90% success rate for demo)
                      const isSuccess = Math.random() > 0.1;
                      const folio = "INC-" + Math.random().toString(36).substring(2, 10).toUpperCase();
                      if (isSuccess) {
                        navigate(`/payment-success?amount=${totalToPay}&folio=${folio}`);
                      } else {
                        navigate(`/payment-error?returnTo=/my-loans`);
                      }
                    }, 3000);
                  }}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceder al Pago
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default MyLoans;
