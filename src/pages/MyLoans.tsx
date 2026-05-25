import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Eye, Calendar, DollarSign, Loader2, Shield } from 'lucide-react';
import { useAuth, useLoans } from '@/hooks';

interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending';
  principal?: number;
  interest?: number;
}

const getPaymentRequestStatusBadge = (status?: string) => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'initial':
      return <Badge className="bg-warning/20 text-warning border-warning">Pendiente</Badge>;
    case 'processing':
      return <Badge className="bg-warning/20 text-warning border-warning">En proceso</Badge>;
    case 'completed':
      return <Badge className="bg-success/20 text-success border-success">Pagado</Badge>;
    case 'failed':
      return <Badge className="bg-danger/20 text-danger border-danger">Rechazado</Badge>;
    default:
      return <Badge variant="outline">Sin estado</Badge>;
  }
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
  const { data: loans = [], isLoading } = useLoans(userId ?? undefined);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const generateInstallments = (loan: any): Installment[] => {
    const installments: Installment[] = [];
    const paidCount = Math.floor((loan.paid / loan.amount) * loan.term);
    const baseDate = new Date(loan.approved || loan.created_at);
    
    for (let i = 1; i <= loan.term; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      installments.push({
        number: i,
        dueDate: `${dueDate.getDate().toString().padStart(2, '0')}/${(dueDate.getMonth() + 1).toString().padStart(2, '0')}/${dueDate.getFullYear()}`,
        amount: Math.round(loan.amount / loan.term * (1 + loan.rate / 100)),
        status: i <= paidCount ? 'paid' : 'pending'
      });
    }
    return installments;
  };

  const currentInstallments = useMemo(() => {
    if (!selectedLoan) return [];
    return generateInstallments(selectedLoan);
  }, [selectedLoan]);

  const pendingInstallments = useMemo(() => {
    return currentInstallments.filter(inst => inst.status === 'pending');
  }, [currentInstallments]);

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

  const handleViewLoan = (loan: any) => {
    setSelectedLoan(loan);
    setViewDialogOpen(true);
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
                        <Button size="sm" variant="outline" onClick={() => handleViewLoan(loan)}>
                          <Eye className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Ver</span>
                        </Button>
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyLoans;