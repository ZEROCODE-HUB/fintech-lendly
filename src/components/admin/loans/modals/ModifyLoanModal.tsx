import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
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
      setAmount(loan.amount);
      setInstallments(loan.installments);
      setRate(18);
      setMessage('');
    }
  }, [loan]);

  const calculateSchedule = () => {
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
                          (Math.pow(1 + monthlyRate, installments) - 1);
    
    const schedule = [];
    let balance = amount;
    
    for (let i = 1; i <= installments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
      const paymentDate = new Date();
      paymentDate.setMonth(paymentDate.getMonth() + i);
      
      schedule.push({
        number: i,
        date: paymentDate.toLocaleDateString('es-MX'),
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    
    return schedule;
  };

  const schedule = calculateSchedule();
  const monthlyPayment = schedule[0]?.payment || 0;
  const totalPayment = monthlyPayment * installments;

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Capital</TableHead>
                      <TableHead>Interés</TableHead>
                      <TableHead>Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((row) => (
                      <TableRow key={row.number}>
                        <TableCell>{row.number}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>${row.payment.toFixed(2)}</TableCell>
                        <TableCell>${row.principal.toFixed(2)}</TableCell>
                        <TableCell>${row.interest.toFixed(2)}</TableCell>
                        <TableCell>${row.balance.toFixed(2)}</TableCell>
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
