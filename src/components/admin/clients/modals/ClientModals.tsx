import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/types/clients";
import { Download, Upload, User, IdCard, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: Partial<Client>) => void;
}

export const AddUserModal = ({ open, onOpenChange, onConfirm }: AddUserModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    role: "Usuario",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    ine: "",
    curp: "",
    membership: "",
  });

  const handleSubmit = () => {
    onConfirm(formData);
    toast({ title: "Usuario agregado", description: "El usuario ha sido registrado exitosamente." });
    onOpenChange(false);
    setFormData({
      role: "Usuario",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      birthDate: "",
      ine: "",
      curp: "",
      membership: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
          <DialogDescription>Complete los datos del nuevo usuario</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Rol</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Usuario">Usuario</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nombres</Label>
            <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
          </div>
          <div>
            <Label>Apellidos</Label>
            <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div>
            <Label>Fecha de Nacimiento</Label>
            <Input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
          </div>
          <div>
            <Label>INE</Label>
            <Input value={formData.ine} onChange={(e) => setFormData({ ...formData, ine: e.target.value })} />
          </div>
          <div>
            <Label>CURP</Label>
            <Input value={formData.curp} onChange={(e) => setFormData({ ...formData, curp: e.target.value })} />
          </div>
          <div>
            <Label>Membresía</Label>
            <Select value={formData.membership} onValueChange={(v) => setFormData({ ...formData, membership: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Premier">Premier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar Usuario</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ModifyClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onConfirm: (data: Client) => void;
}

export const ModifyClientModal = ({ open, onOpenChange, client, onConfirm }: ModifyClientModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Client>>(client || {});

  const handleSubmit = () => {
    if (client) {
      onConfirm({ ...client, ...formData } as Client);
      toast({ title: "Usuario modificado", description: "Los datos han sido actualizados." });
      onOpenChange(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modificar Usuario</DialogTitle>
          <DialogDescription>Edite los datos del usuario {client.firstName} {client.lastName}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Rol</Label>
            <Select value={formData.role || client.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Usuario">Usuario</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nombres</Label>
            <Input defaultValue={client.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
          </div>
          <div>
            <Label>Apellidos</Label>
            <Input defaultValue={client.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" defaultValue={client.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input defaultValue={client.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input defaultValue={client.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div>
            <Label>Fecha de Nacimiento</Label>
            <Input type="date" defaultValue={client.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
          </div>
          <div>
            <Label>INE</Label>
            <Input defaultValue={client.ine} onChange={(e) => setFormData({ ...formData, ine: e.target.value })} />
          </div>
          <div>
            <Label>CURP</Label>
            <Input defaultValue={client.curp} onChange={(e) => setFormData({ ...formData, curp: e.target.value })} />
          </div>
          <div>
            <Label>Membresía</Label>
            <Select defaultValue={client.membership} onValueChange={(v) => setFormData({ ...formData, membership: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Premier">Premier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onConfirm: () => void;
}

export const DeleteClientModal = ({ open, onOpenChange, client, onConfirm }: DeleteClientModalProps) => {
  const { toast } = useToast();

  const handleConfirm = () => {
    onConfirm();
    toast({ title: "Usuario eliminado", description: "El usuario ha sido eliminado del sistema.", variant: "destructive" });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar Usuario?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente al usuario {client?.firstName} {client?.lastName} y todos sus datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-danger hover:bg-danger/90">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface ViewPhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export const ViewPhotoModal = ({ open, onOpenChange, client }: ViewPhotoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Foto de Perfil</DialogTitle>
          <DialogDescription>{client?.firstName} {client?.lastName}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-48 bg-accent rounded-full flex items-center justify-center">
            <User className="w-24 h-24 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            (Simulación - en producción mostraría la foto real del usuario)
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ViewDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export const ViewDocumentsModal = ({ open, onOpenChange, client }: ViewDocumentsModalProps) => {
  const { toast } = useToast();

  const handleReplace = (docType: string) => {
    toast({ title: "Archivo reemplazado", description: `El ${docType} ha sido actualizado.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Documentos del Usuario</DialogTitle>
          <DialogDescription>{client?.firstName} {client?.lastName}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="ine" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ine">INE</TabsTrigger>
            <TabsTrigger value="curp">CURP</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ine" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IdCard className="h-5 w-5" /> INE - Frente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-accent rounded-lg p-8 text-center mb-4">
                  <IdCard className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">(Imagen frontal del INE)</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleReplace("INE Frontal")}>
                    <Upload className="h-4 w-4 mr-2" /> Reemplazar
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IdCard className="h-5 w-5" /> INE - Reverso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-accent rounded-lg p-8 text-center mb-4">
                  <IdCard className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">(Imagen trasera del INE)</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" /> Descargar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleReplace("INE Reverso")}>
                    <Upload className="h-4 w-4 mr-2" /> Reemplazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5" /> CURP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-accent rounded-lg p-8 text-center mb-4">
                  <FileText className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">(PDF del CURP)</p>
                  <p className="text-xs text-muted-foreground mt-1">CURP: {client?.curp}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" /> Descargar PDF
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleReplace("CURP")}>
                    <Upload className="h-4 w-4 mr-2" /> Reemplazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
