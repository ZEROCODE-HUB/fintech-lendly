import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { ContractLoan } from "@/types/loans";

interface ResendContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: ContractLoan | null;
  onResend: (data: Partial<ContractLoan>) => void;
  onSave: (data: Partial<ContractLoan>) => void;
}

export const ResendContractModal = ({ open, onOpenChange, loan, onResend, onSave }: ResendContractModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    birthDate: '',
    phone: '',
    bank: '',
    accountNumber: ''
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        firstName: loan.firstName,
        lastName: loan.lastName,
        address: loan.address || '',
        birthDate: loan.birthDate || '',
        phone: loan.phone || '',
        bank: loan.bank || '',
        accountNumber: loan.accountNumber || ''
      });
    }
  }, [loan]);

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Reenviar Contrato</DialogTitle>
          <DialogDescription>
            Editar datos del cliente antes de reenviar - {loan.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nombres</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <Label>Apellidos</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label>Dirección</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <Label>Fecha de Nacimiento</Label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>Banco</Label>
            <Input
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
            />
          </div>
          <div>
            <Label>Cuenta/CLABE</Label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={() => { onSave(formData); onOpenChange(false); }}>
            Guardar
          </Button>
          <Button onClick={() => { onResend(formData); onOpenChange(false); }}>
            Reenviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AttachContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: ContractLoan | null;
  onConfirm: (files: File[]) => void;
}

export const AttachContractModal = ({ open, onOpenChange, loan, onConfirm }: AttachContractModalProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjuntar Contratos Firmados</DialogTitle>
          <DialogDescription>
            {loan.firstName} {loan.lastName} - {loan.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <Input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
              id="contract-upload"
            />
            <label htmlFor="contract-upload">
              <Button variant="outline" size="sm" asChild>
                <span>Seleccionar archivos</span>
              </Button>
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Archivos seleccionados:</p>
              {files.map((file, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">• {file.name}</p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setFiles([]); onOpenChange(false); }}>
            Cancelar
          </Button>
          <Button onClick={() => { onConfirm(files); setFiles([]); onOpenChange(false); }} disabled={files.length === 0}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
