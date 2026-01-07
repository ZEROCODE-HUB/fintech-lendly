import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Crown, 
  Tag, 
  Receipt, 
  CheckCircle2, 
  ArrowLeft,
  CreditCard,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { defaultMemberships } from "@/data/memberships";

interface LocationState {
  membershipId: string;
  returnTo?: string;
}

const MembershipCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const state = location.state as LocationState | null;
  const membershipId = state?.membershipId || "premier";
  const returnTo = state?.returnTo || "/memberships";
  
  const membership = defaultMemberships.find(m => m.id === membershipId) || defaultMemberships[0];
  
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [requestInvoice, setRequestInvoice] = useState(false);
  const [rfc, setRfc] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const originalPrice = membership.cost;
  const discountAmount = couponApplied ? (originalPrice * discount / 100) : 0;
  const finalTotal = originalPrice - discountAmount;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "descuento10") {
      setDiscount(10);
      setCouponApplied(true);
      toast({
        title: "¡Cupón aplicado!",
        description: "Se aplicó un descuento del 10%",
      });
    } else if (couponCode.toLowerCase() === "descuento20") {
      setDiscount(20);
      setCouponApplied(true);
      toast({
        title: "¡Cupón aplicado!",
        description: "Se aplicó un descuento del 20%",
      });
    } else {
      toast({
        title: "Cupón inválido",
        description: "El código ingresado no es válido",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setDiscount(0);
  };

  const handleProceedToPayment = () => {
    if (!termsAccepted) {
      toast({
        title: "Términos requeridos",
        description: "Debes aceptar los Términos y Condiciones para continuar",
        variant: "destructive",
      });
      return;
    }

    if (requestInvoice && (!rfc || !fiscalAddress)) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa los datos de facturación",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Procesando pago...",
      description: "Serás redirigido al procesador de pagos",
    });

    setTimeout(() => {
      toast({
        title: "¡Membresía adquirida!",
        description: `Has adquirido ${membership.title} exitosamente`,
      });
      
      if (returnTo === "/loan-process") {
        navigate("/loan-process", { state: { membershipAcquired: true } });
      } else {
        navigate("/memberships");
      }
    }, 1500);
  };

  const handleBack = () => {
    navigate(returnTo);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setTermsModalOpen(false);
    toast({
      title: "Términos aceptados",
      description: "Has aceptado los Términos y Condiciones",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Checkout Membresía</h1>
            </div>
          </header>

          <div className="p-6 max-w-3xl mx-auto space-y-6">
            {/* Order Summary */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Resumen del Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/10 to-accent/30 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-hero flex items-center justify-center">
                      <Crown className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{membership.title}</h3>
                      <p className="text-sm text-muted-foreground">Renovación {membership.renewalPeriod}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${originalPrice.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">MXN</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Section */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Cupón de Descuento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {couponApplied ? (
                  <div className="flex items-center justify-between p-4 bg-success/10 border border-success/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium">Cupón aplicado</p>
                        <p className="text-sm text-muted-foreground">{discount}% de descuento</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                      Quitar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Input
                      placeholder="Ingresa tu código de descuento"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleApplyCoupon} disabled={!couponCode}>
                      Aplicar
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Prueba: "DESCUENTO10" o "DESCUENTO20"
                </p>
              </CardContent>
            </Card>

            {/* Billing Data */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Datos de Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="request-invoice"
                    checked={requestInvoice}
                    onCheckedChange={(checked) => setRequestInvoice(checked as boolean)}
                  />
                  <Label htmlFor="request-invoice" className="font-medium cursor-pointer">
                    ¿Solicitar Factura?
                  </Label>
                </div>

                {requestInvoice && (
                  <div className="space-y-4 pt-4 border-t animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label htmlFor="rfc">RFC <span className="text-destructive">*</span></Label>
                      <Input
                        id="rfc"
                        placeholder="Ej: XAXX010101000"
                        value={rfc}
                        onChange={(e) => setRfc(e.target.value.toUpperCase())}
                        maxLength={13}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fiscal-address">Dirección Fiscal <span className="text-destructive">*</span></Label>
                      <Input
                        id="fiscal-address"
                        placeholder="Dirección fiscal completa"
                        value={fiscalAddress}
                        onChange={(e) => setFiscalAddress(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms and Conditions Section */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Términos y Condiciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms-accepted"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms-accepted" className="font-medium cursor-pointer leading-relaxed">
                      He leído y acepto los{" "}
                      <button
                        type="button"
                        onClick={() => setTermsModalOpen(true)}
                        className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      >
                        Términos y Condiciones
                      </button>
                      . <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Es obligatorio aceptar los términos para continuar con el pago.
                    </p>
                  </div>
                </div>

                {termsAccepted && (
                  <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg animate-in fade-in-50">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">Términos aceptados</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total and Payment */}
            <Card className="shadow-elegant border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${originalPrice.toLocaleString()} MXN</span>
                  </div>
                  
                  {couponApplied && (
                    <div className="flex justify-between text-success">
                      <span>Descuento ({discount}%)</span>
                      <span>-${discountAmount.toLocaleString()} MXN</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Final</span>
                    <div className="text-right">
                      {couponApplied && (
                        <p className="text-sm text-muted-foreground line-through">
                          ${originalPrice.toLocaleString()} MXN
                        </p>
                      )}
                      <p className="text-2xl font-bold text-primary">
                        ${finalTotal.toLocaleString()} MXN
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={!termsAccepted}
                >
                  Proceder al Pago
                </Button>
                
                {!termsAccepted && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Acepta los Términos y Condiciones para habilitar el botón de pago
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Terms and Conditions Modal */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Términos y Condiciones
            </DialogTitle>
            <DialogDescription>
              Por favor lee detenidamente los siguientes términos antes de continuar.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6 text-sm text-muted-foreground text-justified pr-4">
              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">1. Aceptación de los Términos</h3>
                <p className="leading-relaxed">
                  Al adquirir una membresía en Increscendo Fintech, el usuario acepta estar sujeto a estos Términos y Condiciones. 
                  Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio ni completar la compra 
                  de la membresía.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">2. Descripción del Servicio</h3>
                <p className="leading-relaxed">
                  La membresía otorga acceso a servicios financieros especializados, incluyendo tasas preferenciales en 
                  préstamos, asesoría financiera personalizada, y acceso a productos exclusivos. Los beneficios específicos 
                  varían según el tipo de membresía adquirida (Premier o Gold).
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">3. Renovación y Vigencia</h3>
                <p className="leading-relaxed">
                  Las membresías tienen una vigencia anual a partir de la fecha de adquisición. La renovación puede ser 
                  automática o manual según la preferencia del usuario. Se enviará un recordatorio 30 días antes del 
                  vencimiento de la membresía.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">4. Política de Pagos</h3>
                <p className="leading-relaxed">
                  El pago de la membresía se realiza de forma anticipada y en una sola exhibición. Aceptamos tarjetas de 
                  crédito, débito y transferencias bancarias. Todos los precios están expresados en pesos mexicanos (MXN) 
                  e incluyen impuestos aplicables.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">5. Política de Cancelación y Reembolsos</h3>
                <p className="leading-relaxed">
                  El usuario podrá solicitar la cancelación de su membresía dentro de los primeros 14 días naturales 
                  posteriores a la adquisición, siempre que no haya utilizado los servicios incluidos. Pasado este período, 
                  no se realizarán reembolsos parciales ni totales.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">6. Uso de Datos Personales</h3>
                <p className="leading-relaxed">
                  Los datos personales proporcionados serán tratados conforme a nuestra Política de Privacidad, cumpliendo 
                  con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. La información 
                  será utilizada exclusivamente para la prestación del servicio.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">7. Obligaciones del Usuario</h3>
                <p className="leading-relaxed">
                  El usuario se compromete a proporcionar información veraz y actualizada, mantener la confidencialidad 
                  de sus credenciales de acceso, y utilizar los servicios de manera responsable y conforme a la ley. 
                  El uso indebido resultará en la cancelación inmediata de la membresía sin derecho a reembolso.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">8. Limitación de Responsabilidad</h3>
                <p className="leading-relaxed">
                  Increscendo Fintech no será responsable por daños indirectos, incidentales o consecuentes derivados 
                  del uso de los servicios. Nuestra responsabilidad máxima se limitará al monto pagado por la membresía 
                  en el período vigente.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">9. Modificaciones a los Términos</h3>
                <p className="leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en 
                  vigor al momento de su publicación. Es responsabilidad del usuario revisar periódicamente estos términos. 
                  El uso continuado del servicio constituye aceptación de las modificaciones.
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-foreground mb-2">10. Jurisdicción y Ley Aplicable</h3>
                <p className="leading-relaxed">
                  Estos términos se regirán e interpretarán de acuerdo con las leyes de los Estados Unidos Mexicanos. 
                  Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes 
                  de la Ciudad de México, renunciando a cualquier otro fuero que pudiera corresponderles.
                </p>
              </section>
            </div>
          </ScrollArea>
          
          <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setTermsModalOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={handleAcceptTerms}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aceptar Términos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default MembershipCheckout;
