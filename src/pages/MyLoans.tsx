import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Eye, Calendar, DollarSign, Loader2, Shield, Check } from 'lucide-react';
import { useAuth, useLoans } from '@/hooks';
import { increscendoApiFetch } from '@/lib/increscendoApi';

interface Installment {
  number: number;
  status: string;
  amount: number;
  due_date?: string;
  payment_request_id: string | null;
  updated_at?: string | null;
  failed_reason?: string | null;
  failed_reason_message?: string | null;
}

interface InstallmentsResponse {
  ok: boolean;
  data: Installment[];
}

const getPaymentRequestStatusBadge = (status?: string) => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'pending':
      return <Badge className="bg-warning/20 text-warning border-warning">Pendiente</Badge>;
    case 'initial':
    case 'processing':
      return <Badge className="bg-warning/20 text-warning border-warning">En proceso</Badge>;
    case 'paid':
    case 'completed':
    case 'successful':
      return <Badge className="bg-success/20 text-success border-success">Pagado</Badge>;
    case 'failed':
      return <Badge className="bg-danger/20 text-danger border-danger">Rechazado</Badge>;
    case 'canceled':
      return <Badge className="bg-muted text-muted-foreground border-muted-foreground">Cancelado</Badge>;
    case 'chargeback':
      return <Badge className="bg-danger/20 text-danger border-danger">Contracargo</Badge>;
    default:
      return <Badge variant="outline">Sin estado</Badge>;
  }
};

const getFailedReasonMessage = (reason: string | null): string | null => {
  if (!reason) return null;
  const map: Record<string, string> = {
    'account_invalid': 'Cuenta inválida',
    'canceled_by_operations': 'Cancelado por operaciones',
    'canceled_by_merchant': 'Cancelado por el comercio',
    'consent_not_confirmed': 'Consentimiento no confirmado',
    'customer_blocked': 'Cliente bloqueado',
    'document_invalid': 'Documento inválido',
    'high_risk': 'Riesgo alto',
    'high_risk_institution': 'Riesgo alto en institución',
    'transaction_limits_exceeded': 'Límite de transacción excedido',
  };
  return map[reason] || reason;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-success/20 text-success border-success">Activo</Badge>;
    case 'paid':
      return <Badge className="bg-primary/20 text-primary border-primary">Pagado</Badge>;
    case 'signed':
      return <Badge className="bg-warning/20 text-warning border-warning">Desembolso</Badge>;
    case 'approved':
      return <Badge className="bg-blue-500/20 text-blue-600 border-blue-300">Aprobado</Badge>;
    case 'cancelled':
    case 'rejected':
      return <Badge className="bg-danger/20 text-danger border-danger">Rechazado</Badge>;
    default:
      return <Badge variant="outline">Pendiente</Badge>;
  }
};

const MyLoans: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { data: loans = [], isLoading, refetch } = useLoans(userId ?? undefined);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [paymentLoan, setPaymentLoan] = useState<any>(null);
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installmentsLoading, setInstallmentsLoading] = useState(false);

  const loadLoans = async () => {
    await refetch();
  };

  const fetchInstallments = async (loanId: string) => {
    setInstallmentsLoading(true);
    setInstallments([]);
    try {
      const resp = await increscendoApiFetch(`/belvo/loans/${loanId}/installments`);
      const result: InstallmentsResponse = await resp.json();
      if (result.ok && result.data) {
        setInstallments(result.data);
      }
    } catch (e) {
      console.error('Error fetching installments', e);
      setInstallments([]);
    } finally {
      setInstallmentsLoading(false);
    }
  };

  const isPaid = (status: string) => ['paid', 'completed', 'successful'].includes(status?.toLowerCase());
  const isLocked = (status: string) => ['initial', 'processing'].includes(status?.toLowerCase());
  const isSelectable = (status: string) => !isPaid(status) && !isLocked(status);

  const allInstallments = useMemo(() => {
    return [...installments].sort((a, b) => a.number - b.number);
  }, [installments]);

  const unpaidCount = useMemo(() => {
    return installments.filter(inst => isSelectable(inst.status)).length;
  }, [installments]);

  useEffect(() => {
    if (installments.length > 0) {
      const firstSelectable = installments.find(inst => isSelectable(inst.status));
      setSelectedInstallments(firstSelectable ? [firstSelectable.number] : []);
    }
  }, [installments]);

  const filteredLoans = useMemo(() => {
    if (statusFilter === 'all') return loans;
    return loans.filter(l => l.status === statusFilter);
  }, [loans, statusFilter]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(loans.map(l => l.status).filter(Boolean))).sort();
  }, [loans]);

  const kpis = useMemo(() => {
    const totalRequested = loans.reduce((s, l) => s + Number(l.amount || 0), 0);
    const totalPaid = loans.reduce((s, l) => s + Number(l.metadata?.paid_amount || 0), 0);
    const totalRemaining = loans.reduce((s, l) => s + Number(l.amount || 0) - Number(l.metadata?.paid_amount || 0), 0);
    const percent = totalRequested > 0 ? (totalPaid / totalRequested) * 100 : 0;
    return { totalRequested, totalPaid, totalRemaining, percent };
  }, [loans]);

  const totalToPay = useMemo(() => {
    return installments
      .filter(inst => isSelectable(inst.status) && selectedInstallments.includes(inst.number))
      .reduce((sum, inst) => sum + inst.amount, 0);
  }, [selectedInstallments, installments]);

  const handleViewLoan = (loan: any) => {
    setSelectedLoan(loan);
    setViewDialogOpen(true);
  };

  const handleOpenPayment = async (loan: any) => {
    const rawLoan = loan.raw ?? loan;
    const fullLoan = { ...loan, raw: rawLoan };
    setPaymentLoan(fullLoan);
    setPaymentDialogOpen(true);
    await fetchInstallments(fullLoan.id);
  };

  const handleInstallmentToggle = (installmentNumber: number) => {
    const inst = installments.find(i => i.number === installmentNumber);
    if (!inst || !isSelectable(inst.status)) return;
    const firstUnpaidNumber = installments.find(i => !isPaid(i.status))?.number;
    if (!firstUnpaidNumber || installmentNumber === firstUnpaidNumber) return;

    setSelectedInstallments(prev => {
      if (prev.includes(installmentNumber)) {
        return prev.filter(num => num < installmentNumber);
      } else {
        const previousNumber = installmentNumber - 1;
        if (prev.includes(previousNumber) || previousNumber < firstUnpaidNumber) {
          const newSelected = [...prev];
          for (let i = firstUnpaidNumber; i <= installmentNumber; i++) {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-soft md:min-h-[130px] lg:min-h-[150px]">
          <div className="flex flex-col h-full p-4 sm:p-6 justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Préstamos</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">${kpis.totalRequested.toLocaleString()}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Monto total solicitado</p>
            </div>
          </div>
        </Card>

        <Card className="shadow-soft md:min-h-[130px] lg:min-h-[150px]">
          <div className="flex flex-col h-full p-4 sm:p-6 justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Monto Pagado</span>
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">${kpis.totalPaid.toLocaleString()}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{kpis.percent.toFixed(2)}% del total</p>
            </div>
          </div>
        </Card>

        <Card className="shadow-soft md:min-h-[130px] lg:min-h-[150px] sm:col-span-2 md:col-span-2 lg:col-span-1">
          <div className="flex flex-col h-full p-4 sm:p-6 justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo Pendiente</span>
              <DollarSign className="h-4 w-4 text-danger" />
            </div>
            <div className="space-y-2">
              <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">${kpis.totalRemaining.toLocaleString()}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Por liquidar</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Loans Table */}
      <Card className="shadow-soft">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Detalle de Préstamos</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Gestiona y consulta el estado de todos tus préstamos</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs sm:text-sm">Estado</Label>
              <select
                className="border rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">ID</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">Monto</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Tasa</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">Plazo</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Pagado</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">Saldo</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">Estado</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No tienes préstamos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                        {loan.loan_number ?? loan.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">${Number(loan.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">{Number(loan.interest_rate * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{loan.installments}m</TableCell>
                      <TableCell className="text-success text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                        ${Number(loan.metadata?.paid_amount ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-danger text-xs sm:text-sm whitespace-nowrap">
                        ${(Number(loan.amount) - Number(loan.metadata?.paid_amount ?? 0)).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {loan.status === 'active' && (
                            <Button size="sm" variant="default" onClick={() => handleOpenPayment(loan)}>
                              <CreditCard className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline">Pagar</span>
                            </Button>
                          )}
                          {loan.status === 'approved' && (
                            <Button size="sm" variant="default" onClick={() => navigate('/loan-process', { state: { resumeLoanId: loan.id, resumeStep: 5 } })}>
                              <span className="hidden sm:inline">Continuar</span>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleViewLoan(loan)}>
                            <Eye className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">Ver</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Loan Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Detalles del Préstamo</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Información completa de tu préstamo</DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>ID</Label><p className="font-semibold">{selectedLoan.loan_number ?? selectedLoan.id?.slice(0, 8)}</p></div>
                <div><Label>Estado</Label><div className="mt-1">{getStatusBadge(selectedLoan.status)}</div></div>
                <div><Label>Monto</Label><p className="font-semibold">${Number(selectedLoan.amount).toLocaleString()} MXN</p></div>
                <div><Label>Plazo</Label><p className="font-semibold">{selectedLoan.installments} meses</p></div>
                <div><Label>Pagado</Label><p className="font-semibold text-success">${Number(selectedLoan.metadata?.paid_amount ?? 0).toLocaleString()} MXN</p></div>
                <div><Label>Saldo</Label><p className="font-semibold text-danger">${(Number(selectedLoan.amount) - Number(selectedLoan.metadata?.paid_amount ?? 0)).toLocaleString()} MXN</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Checkout Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl p-0 overflow-hidden flex flex-col max-h-[90vh] rounded-2xl border-0 shadow-2xl">
          {/* Header - Minimal & Clean */}
          <div className="px-6 pt-6 pb-5 flex-shrink-0 bg-background">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">
                    Pagar Cuotas
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                    Préstamo {paymentLoan?.loan_number ?? paymentLoan?.id?.slice(0, 8)}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          {/* Content - Clean with subtle separator */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {/* Summary Bar */}
            <div className="flex items-center justify-between py-4 px-4 bg-muted/30 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Monto Total</p>
                  <p className="text-xs text-muted-foreground">{selectedInstallments.length} cuota{selectedInstallments.length !== 1 ? 's' : ''} seleccionada{selectedInstallments.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  ${totalToPay.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">MXN</p>
              </div>
            </div>



            {/* Installments Section */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Plan de Pagos</span>
                </div>
                {unpaidCount > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {unpaidCount} pendiente{unpaidCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-muted/50 border-b border-border/60 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-1"></div>
                  <div className="col-span-1">Cuota</div>
                  <div className="col-span-3">Vencimiento</div>
                  <div className="col-span-2 text-right">Monto</div>
                  <div className="col-span-2 text-right">Estado</div>
                  <div className="col-span-3">Observación</div>
                </div>

                {/* Table Body */}
                <div className="max-h-[240px] overflow-y-auto divide-y divide-border/40">
                  {installmentsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : allInstallments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <p className="text-sm text-muted-foreground">No hay cuotas disponibles</p>
                    </div>
                  ) : (
                    allInstallments.map((installment, index) => {
                      const status = installment.status?.toLowerCase();
                      const isUnpaid = !isPaid(status);
                      const isItemLocked = isLocked(status);
                      const firstSelectableIndex = allInstallments.findIndex(i => isSelectable(i.status));
                      const isFirstSelectable = index === firstSelectableIndex;
                      const isSelected = selectedInstallments.includes(installment.number);
                      const previousSelected = !isFirstSelectable && (index === 0 || selectedInstallments.includes(allInstallments[index - 1]?.number));
                      const canSelect = isSelectable(status) && (isFirstSelectable || previousSelected);

                      return (
                        <div
                          key={installment.number}
                          className={`
                            grid grid-cols-12 gap-3 px-4 py-3 items-center text-sm transition-colors
                            ${isSelected
                              ? 'bg-primary/5'
                              : canSelect ? 'hover:bg-muted/30 cursor-pointer' : ''
                            }
                            ${!isUnpaid && !isItemLocked ? 'opacity-60' : ''}
                          `}
                          onClick={() => canSelect && handleInstallmentToggle(installment.number)}
                        >
                          <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                            {isUnpaid && !isItemLocked ? (
                              <Checkbox
                                checked={isSelected}
                                disabled={!canSelect}
                                onCheckedChange={() => handleInstallmentToggle(installment.number)}
                              />
                            ) : null}
                          </div>
                          <div className="col-span-1 flex items-center gap-1">
                            <span className="font-semibold text-foreground">#{installment.number}</span>
                            {isFirstSelectable && (
                              <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">SIG</span>
                            )}
                          </div>
                          <div className="col-span-3 text-muted-foreground text-sm">
                            {installment.due_date ? new Date(installment.due_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase()) : '-'}
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="font-semibold text-foreground tabular-nums">${installment.amount.toLocaleString()}</span>
                          </div>
                          <div className="col-span-2 text-right" onClick={(e) => e.stopPropagation()}>
                            {getPaymentRequestStatusBadge(installment.status)}
                          </div>
                          <div className="col-span-3 text-xs text-muted-foreground truncate" title={getFailedReasonMessage(installment.failed_reason) || ''}>
                            {getFailedReasonMessage(installment.failed_reason) || '-'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {unpaidCount > 0 && (
                <p className="text-[11px] text-muted-foreground mt-2.5 px-1">
                  La primera cuota pendiente es obligatoria. Selecciona cuotas consecutivas.
                </p>
              )}
            </div>
          </div>

          {/* Processing State */}
          {isProcessing ? (
            <div className="flex-shrink-0 px-6 py-10 flex flex-col items-center justify-center bg-muted/30 border-t border-border">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-full border-4 border-primary/10" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <Shield className="absolute inset-0 m-auto h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Procesando pago</h3>
              <p className="text-sm text-muted-foreground">No cierres esta ventana</p>
            </div>
          ) : (
            <div className="flex-shrink-0 px-6 py-5 border-t border-border bg-muted/20 rounded-b-2xl">
              <Button
                className="w-full h-12 text-sm font-semibold tracking-wide"
                disabled={selectedInstallments.length === 0}
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const loanId = paymentLoan?.id;
                    if (!loanId) throw new Error('Loan not found');

                    const payload = { installmentNumbers: selectedInstallments };

                    const createResp = await increscendoApiFetch(`/belvo/loans/${loanId}/payment-request`, {
                      method: 'POST',
                      body: JSON.stringify(payload),
                    });
                    const createData = await createResp.json().catch(() => null);

                    if (!createResp.ok) {
                      const errorMsg = createData?.error || 'No se pudo crear la solicitud de pago.';
                      alert(errorMsg);
                      throw new Error(errorMsg);
                    }

                    const folio = createData?.payment_requests?.[0]?.payment_request_id || createData?.payment_request_id || '';

                    if (createData.partial) {
                      const succeeded = createData.payment_requests?.length || 0;
                      alert(`Se crearon ${succeeded} de ${selectedInstallments.length} solicitudes de pago. ${createData.message || ''}`);
                    }

                    await fetchInstallments(loanId);
                    await loadLoans();

                    setIsProcessing(false);
                    navigate(`/payment-success?amount=${totalToPay}&folio=${folio}`);
                  } catch (e: any) {
                    console.error('Payment processing error', e);
                    setIsProcessing(false);
                    navigate(`/payment-error?returnTo=/my-loans`);
                  }
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceder al Pago · ${totalToPay.toLocaleString()} MXN
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyLoans;
