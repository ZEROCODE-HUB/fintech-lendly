import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CreditCard, Building2, Plus, Edit, Trash2, CheckCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentMethods = () => {
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [methodType, setMethodType] = useState<"card" | "bank">("card");

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "PM-001",
      type: "card",
      cardType: "Visa",
      lastFour: "4532",
      expiry: "12/25",
      token: "tok_visa_4532",
      isDefault: true,
      holderName: "Juan Pérez"
    },
    {
      id: "PM-002",
      type: "card",
      cardType: "Mastercard",
      lastFour: "8901",
      expiry: "08/26",
      token: "tok_mc_8901",
      isDefault: false,
      holderName: "Juan Pérez"
    },
    {
      id: "PM-003",
      type: "bank",
      bankName: "BBVA",
      lastDigits: "1234",
      validationStatus: "validada",
      isDefault: false,
      holderName: "Juan Pérez"
    },
  ]);

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(methods => 
      methods.map(m => ({ ...m, isDefault: m.id === methodId }))
    );
    toast({
      title: "Método Predeterminado Actualizado",
      description: "Este método será usado para cobros automáticos.",
    });
  };

  const handleEdit = (method: any) => {
    setSelectedMethod(method);
    setEditDialogOpen(true);
  };

  const handleDelete = (method: any) => {
    setSelectedMethod(method);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setPaymentMethods(methods => methods.filter(m => m.id !== selectedMethod?.id));
    toast({
      title: "Método Eliminado",
      description: "El método de pago ha sido eliminado.",
      variant: "destructive",
    });
    setDeleteDialogOpen(false);
  };

  const confirmAdd = () => {
    toast({
      title: "Método Agregado",
      description: "El método de pago ha sido agregado exitosamente.",
    });
    setAddDialogOpen(false);
  };

  const confirmEdit = () => {
    toast({
      title: "Método Actualizado",
      description: "El método de pago ha sido actualizado.",
    });
    setEditDialogOpen(false);
  };

  const getCardIcon = (cardType: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Métodos de Pago</h1>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} size="sm" className="text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden sm:inline">Agregar</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </header>

          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Info Alert */}
            <Card className="border-primary bg-accent">
              <CardContent className="flex items-start gap-3 sm:gap-4 py-3 sm:py-4">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5 sm:mt-1" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Cobros Automáticos</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    El método marcado como predeterminado será usado para procesar tus pagos automáticos mensualmente.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods List */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
              {paymentMethods.map((method) => (
                <Card key={method.id} className={`shadow-soft ${method.isDefault ? 'border-primary' : ''}`}>
                  <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {method.type === "card" ? (
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                            {getCardIcon(method.cardType)}
                          </div>
                        ) : (
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                            <span className="truncate">{method.type === "card" ? method.cardType : method.bankName}</span>
                            {method.isDefault && (
                              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary fill-primary flex-shrink-0" />
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            {method.type === "card" 
                              ? `•••• ${method.lastFour}` 
                              : `CLABE •••• ${method.lastDigits}`
                            }
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Titular:</span>
                        <span className="font-medium">{method.holderName}</span>
                      </div>
                      {method.type === "card" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expira:</span>
                          <span className="font-medium">{method.expiry}</span>
                        </div>
                      )}
                      {method.type === "bank" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estado:</span>
                          <Badge className="bg-success/20 text-success border-success">
                            {method.validationStatus === "validada" ? "Validada" : "Pendiente"}
                          </Badge>
                        </div>
                      )}
                      {method.isDefault && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estado:</span>
                          <Badge className="bg-primary/20 text-primary border-primary">
                            Predeterminado
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                      {!method.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs sm:text-sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Predeterminado</span>
                          <span className="sm:hidden">Predeterminado</span>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`${method.isDefault ? "flex-1" : ""} text-xs sm:text-sm`}
                        onClick={() => handleEdit(method)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(method)}
                        disabled={method.isDefault}
                        className="text-xs sm:text-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {paymentMethods.length === 0 && (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes métodos de pago</h3>
                  <p className="text-muted-foreground mb-4">
                    Agrega un método de pago para facilitar tus cobros automáticos
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Método de Pago
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Chatbot />

        {/* Add Payment Method Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Agregar Método de Pago</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Agrega una tarjeta o cuenta bancaria para cobros automáticos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tipo de Método</Label>
                <Select value={methodType} onValueChange={(value: "card" | "bank") => setMethodType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="bank">Cuenta Bancaria (CLABE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {methodType === "card" ? (
                <>
                  <div>
                    <Label htmlFor="card-number">Número de Tarjeta</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Vencimiento (MM/AA)</Label>
                      <Input id="expiry" placeholder="12/25" maxLength={5} />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" maxLength={4} type="password" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardholder">Nombre del Titular</Label>
                    <Input id="cardholder" placeholder="Como aparece en la tarjeta" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="bank-name">Banco</Label>
                    <Select>
                      <SelectTrigger id="bank-name">
                        <SelectValue placeholder="Selecciona tu banco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bbva">BBVA</SelectItem>
                        <SelectItem value="banamex">Banamex</SelectItem>
                        <SelectItem value="santander">Santander</SelectItem>
                        <SelectItem value="banorte">Banorte</SelectItem>
                        <SelectItem value="hsbc">HSBC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="clabe">CLABE Interbancaria</Label>
                    <Input id="clabe" placeholder="18 dígitos" maxLength={18} />
                  </div>
                  <div>
                    <Label htmlFor="account-holder">Nombre del Titular</Label>
                    <Input id="account-holder" placeholder="Como aparece en la cuenta" />
                  </div>
                  <div className="bg-accent rounded-lg p-3 text-sm">
                    <p className="font-semibold mb-1">Validación de Cuenta</p>
                    <p className="text-muted-foreground">
                      Se realizará un depósito de prueba menor a $1 MXN para validar la cuenta.
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmAdd}>
                Agregar Método
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Method Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Editar Método de Pago</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Actualiza la información de tu método de pago
              </DialogDescription>
            </DialogHeader>
            {selectedMethod && (
              <div className="space-y-4">
                {selectedMethod.type === "card" && (
                  <>
                    <div>
                      <Label>Tarjeta</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedMethod.cardType} •••• {selectedMethod.lastFour}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="edit-expiry">Vencimiento (MM/AA)</Label>
                      <Input id="edit-expiry" defaultValue={selectedMethod.expiry} maxLength={5} />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="edit-holder">Nombre del Titular</Label>
                  <Input id="edit-holder" defaultValue={selectedMethod.holderName} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmEdit}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Payment Method Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar Método de Pago?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El método de pago será eliminado permanentemente.
                {selectedMethod?.isDefault && " No puedes eliminar el método predeterminado."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete} 
                className="bg-danger hover:bg-danger/90"
                disabled={selectedMethod?.isDefault}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
};

export default PaymentMethods;
