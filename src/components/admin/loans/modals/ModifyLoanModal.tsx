import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import * as XLSX from 'xlsx';
import { PendingLoan } from "@/types/loans";

interface ModifyLoanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: PendingLoan | null;
  onSend: (data: { amount: number; installments: number; rate: number; message: string }) => void;
}

export const ModifyLoanModal = ({ open, onOpenChange, loan, onSend }: ModifyLoanModalProps) => {
  const [amount, setAmount] = useState(0);
  const [installments, setInstallments] = useState(12);
  const [rate, setRate] = useState(18);
  const [message, setMessage] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    if (loan) {
      setAmount(loan.amount ?? loan.raw?.amount ?? 0);
      setInstallments(loan.installments ?? loan.raw?.installments ?? 12);
      setRate(loan.raw?.interest_rate ?? loan.interest_rate ?? loan.metadata?.interest_rate ?? 18);
      setMessage('');
    }
  }, [loan]);

  const calculateSchedule = useMemo(() => {
    if (!loan) return [];

    const l = loan.raw ?? loan;
    const P = Number(l.amount ?? amount ?? 0);
    const n = Number(l.installments ?? installments ?? 12);
    const annualRate = Number(l.interest_rate ?? rate ?? l.metadata?.interest_rate ?? 0);
    const monthlyRate = annualRate / 100 / 12;

    let monthlyPayment = 0;
    if (monthlyRate === 0) monthlyPayment = P / n;
    else monthlyPayment = P * (monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
    monthlyPayment = Math.round(monthlyPayment);

    const schedule: any[] = [];
    let remaining = P;

    const paidAmount = Number(l.metadata?.paid_amount ?? 0);
    const approvedDate = l.approved_at ? new Date(l.approved_at) : (l.applied_at ? new Date(l.applied_at) : (l.created_at ? new Date(l.created_at) : new Date()));

    const paidInstallments = monthlyPayment > 0 ? Math.floor(paidAmount / monthlyPayment) : 0;

    for (let i = 1; i <= n; i++) {
      const due = new Date(approvedDate);
      due.setMonth(due.getMonth() + i);

      const interestRaw = remaining * monthlyRate;
      const interest = Math.round(interestRaw);
      let principal = Math.round(monthlyPayment - interest);
      if (i === n) principal = remaining;
      const total = principal + interest;
      const balanceAfter = Math.max(0, remaining - principal);

      const status = i <= paidInstallments ? 'paid' : 'pending';

      schedule.push({
        number: i,
        date: `${due.getDate().toString().padStart(2,'0')}/${(due.getMonth()+1).toString().padStart(2,'0')}/${due.getFullYear()}`,
        payment: total,
        principal,
        interest,
        balance: balanceAfter,
        status,
      });

      remaining = balanceAfter;
    }

    return schedule;
  }, [loan, amount, installments, rate]);

  const schedule = calculateSchedule;
  const monthlyPayment = schedule[0]?.payment || 0;
  const totalPayment = monthlyPayment * (installments || schedule.length);

  const handleSend = () => {
    onSend({ amount, installments, rate, message });
    onOpenChange(false);
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modificar Préstamo</DialogTitle>
          <DialogDescription>
            Simulador de condiciones - {loan.firstName} {loan.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="mod-amount">Monto (MXN)</Label>
              <Input
                id="mod-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="mod-installments">Cuotas</Label>
              <Input
                id="mod-installments"
                type="number"
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="mod-rate">Tasa Anual (%)</Label>
              <Input
                id="mod-rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Pago Mensual</p>
              <p className="text-xl font-bold">${monthlyPayment.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total a Pagar</p>
              <p className="text-xl font-bold">${totalPayment.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <Collapsible open={showSchedule} onOpenChange={setShowSchedule}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                  Ver Cronograma de Pagos
                <ChevronDown className={`h-4 w-4 transition-transform ${showSchedule ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
                <div className="border rounded-lg max-h-[300px] overflow-auto">
                  <div className="p-3 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => {
                      if (!schedule || schedule.length === 0) return;
                      const headers = ['#','Fecha','Pago (MXN)','Capital (MXN)','Interés (MXN)','Saldo (MXN)','Estado'];
                      const rows = schedule.map((r:any) => [r.number, r.date, r.payment, r.principal, r.interest, r.balance, r.status === 'paid' ? 'Pagado' : 'Pendiente']);
                      const aoa = [headers, ...rows];
                      const ws = XLSX.utils.aoa_to_sheet(aoa);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');
                      XLSX.writeFile(wb, `cronograma_loan_${loan?.id || 'loan'}.xlsx`);
                    }}>
                      Exportar
                    </Button>
                  </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Capital</TableHead>
                      <TableHead>Interés</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {schedule.map((row) => (
                        <TableRow key={row.number}>
                          <TableCell>{row.number}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>${row.payment.toLocaleString(undefined, {maximumFractionDigits:0})}</TableCell>
                          <TableCell>${row.principal.toLocaleString(undefined, {maximumFractionDigits:0})}</TableCell>
                          <TableCell>${row.interest.toLocaleString(undefined, {maximumFractionDigits:0})}</TableCell>
                          <TableCell>${row.balance.toLocaleString(undefined, {maximumFractionDigits:0})}</TableCell>
                          <TableCell>
                            {row.status === 'paid' ? (
                              <span className="text-success">Pagado</span>
                            ) : (
                              <span className="text-muted-foreground">Pendiente</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div>
            <Label htmlFor="email-message">Mensaje para correo</Label>
            <Textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escriba el mensaje que se enviará al cliente..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSend}>
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
