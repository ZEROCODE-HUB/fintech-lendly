import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: any | null;
}

interface InstallmentRow {
  number: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  status: 'paid' | 'pending';
  balance: number;
}

export const PaymentScheduleModal = ({ open, onOpenChange, loan }: Props) => {
  const schedule = useMemo<InstallmentRow[]>(() => {
    if (!loan) return [];

    const l = loan.raw ?? loan;
    const P = Number(l.amount ?? loan.amount ?? 0);
    const annualRate = Number(l.interest_rate ?? l.metadata?.interest_rate ?? loan.rate ?? 0);
    const n = Number(l.installments ?? loan.installments ?? 12);
    const paidAmount = Number(l.metadata?.paid_amount ?? loan.paid ?? 0);

    const monthlyRate = annualRate / 100 / 12;
    let payment = 0;
    if (monthlyRate === 0) payment = P / n;
    else payment = P * (monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
    payment = Math.round(payment);

    let remaining = P;
    const installmentAmount = n > 0 ? Math.round(P / n) : P;
    const paidInstallments = installmentAmount > 0 ? Math.floor(paidAmount / installmentAmount) : 0;

    const approvedDate = l.approved_at ? new Date(l.approved_at) : (l.applied_at ? new Date(l.applied_at) : (l.created_at ? new Date(l.created_at) : new Date()));

    const rows: InstallmentRow[] = [];
    for (let i = 1; i <= n; i++) {
      const due = new Date(approvedDate);
      due.setMonth(due.getMonth() + i);

      const interestRaw = remaining * monthlyRate;
      const interest = Math.round(interestRaw);
      let principal = Math.round(payment - interest);
      if (i === n) principal = remaining;
      const total = principal + interest;
      const balanceAfter = Math.max(0, remaining - principal);
      const status: 'paid' | 'pending' = i <= paidInstallments ? 'paid' : 'pending';

      rows.push({
        number: i,
        dueDate: `${due.getDate().toString().padStart(2,'0')}/${(due.getMonth()+1).toString().padStart(2,'0')}/${due.getFullYear()}`,
        principal,
        interest,
        total,
        status,
        balance: balanceAfter,
      });

      remaining = balanceAfter;
    }

    return rows;
  }, [loan]);

  const handleExport = () => {
    if (!loan || !schedule.length) return;
    const headers = ['#','Fecha','Pago (MXN)','Capital (MXN)','Interés (MXN)','Saldo (MXN)'];
    const rows = schedule.map(r => [r.number, r.dueDate, r.total, r.principal, r.interest, r.balance]);
    const aoa = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');
    const filename = `cronograma_admin_${loan.id || 'loan'}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 w-[calc(100%-2rem)] sm:w-full rounded-2xl sm:rounded-lg">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
          <DialogTitle className="text-base sm:text-lg">Cronograma de Pagos {loan?.id ? `- ${loan.id}` : ''}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Listado de cuotas con capital, interés y estado de pago.</DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs sm:text-sm text-muted-foreground">
              <span className="block sm:inline">Préstamo: {loan?.id}</span>
              <span className="hidden sm:inline mx-2">—</span>
              <span className="block sm:inline">Monto: ${Number(loan?.amount ?? loan?.raw?.amount ?? 0).toLocaleString()}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0 py-4">
            <div className="min-w-full inline-block align-middle px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">#</TableHead>
                    <TableHead className="text-xs sm:text-sm">Fecha</TableHead>
                    <TableHead className="text-xs sm:text-sm">Pago</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Capital</TableHead>
                    <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Interés</TableHead>
                    <TableHead className="text-xs sm:text-sm">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map(r => (
                    <TableRow key={r.number}>
                      <TableCell className="text-xs sm:text-sm">#{r.number}</TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">{r.dueDate}</TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">${r.total.toLocaleString()}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm whitespace-nowrap">${r.principal.toLocaleString()}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs sm:text-sm whitespace-nowrap">${r.interest.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">${r.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentScheduleModal;
