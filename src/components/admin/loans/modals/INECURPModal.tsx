import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye } from "lucide-react";
import { PendingLoan } from "@/types/loans";

interface INECURPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: PendingLoan | null;
  type: 'ine' | 'curp';
  onSave: (data: { ineNumber?: string; curpNumber?: string }) => void;
  onValidate: () => void;
}

export const INECURPModal = ({ open, onOpenChange, loan, type, onSave, onValidate }: INECURPModalProps) => {
  const [editValue, setEditValue] = useState(type === 'ine' ? loan?.ineNumber || '' : loan?.curpNumber || '');

  const handleSave = () => {
    if (type === 'ine') {
      onSave({ ineNumber: editValue });
    } else {
      onSave({ curpNumber: editValue });
    }
    onOpenChange(false);
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{type === 'ine' ? 'Documentos INE' : 'Documento CURP'}</DialogTitle>
          <DialogDescription>
            {loan.firstName} {loan.lastName} - {loan.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{type === 'ine' ? 'Número INE' : 'CURP'}</Label>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={type === 'ine' ? 'Ingrese número INE' : 'Ingrese CURP'}
            />
          </div>

          {type === 'ine' ? (
            <Tabs defaultValue="front" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="front">Frontal</TabsTrigger>
                <TabsTrigger value="back">Trasera</TabsTrigger>
              </TabsList>
              <TabsContent value="front" className="space-y-3">
                <div className="border rounded-lg p-4 bg-muted/30 aspect-video flex items-center justify-center">
                  {loan.ineFront ? (
                    <img src={loan.ineFront} alt="INE Frontal" className="max-h-full object-contain" />
                  ) : (
                    <p className="text-muted-foreground">Sin imagen frontal</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver completo
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="back" className="space-y-3">
                <div className="border rounded-lg p-4 bg-muted/30 aspect-video flex items-center justify-center">
                  {loan.ineBack ? (
                    <img src={loan.ineBack} alt="INE Trasera" className="max-h-full object-contain" />
                  ) : (
                    <p className="text-muted-foreground">Sin imagen trasera</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver completo
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-3">
              <div className="border rounded-lg p-4 bg-muted/30 aspect-[3/4] max-h-[300px] flex items-center justify-center">
                {loan.curpPdf ? (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Documento CURP (PDF)</p>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver PDF
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sin documento CURP</p>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={onValidate}>
            Validar
          </Button>
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
