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
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Tag, 
  Receipt, 
  CheckCircle2, 
  ArrowLeft,
  CreditCard
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

    // Simulate payment redirect
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
                >
                  Proceder al Pago
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MembershipCheckout;
