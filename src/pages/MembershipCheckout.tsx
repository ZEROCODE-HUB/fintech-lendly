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
import { supabase } from "@/lib/supabase";
import { authService } from "@/utils/auth";

interface LocationState {
  membershipId?: string;
  membership?: any;
  returnTo?: string;
}

const MembershipCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const state = (location.state || {}) as LocationState;
  const membershipId = state?.membershipId;
  const returnTo = state?.returnTo || "/memberships";

  // Prefer membership object passed via navigation state, otherwise fall back to lookup by id
  const membership = (state?.membership as any)
    || (membershipId ? defaultMemberships.find((m) => m.id === membershipId) : null)
    || defaultMemberships[0];
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [discountFixedAmount, setDiscountFixedAmount] = useState<number>(0);
  const [requestInvoice, setRequestInvoice] = useState(false);
  const [rfc, setRfc] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const originalPrice = Number(membership?.cost ?? membership?.price ?? 0) || 0;
  // compute discount preview (either percent or fixed amount)
  const discountAmount = appliedCoupon ? (discountPercent ? Math.round((originalPrice * discountPercent) / 100) : discountFixedAmount) : 0;
  const finalTotal = Math.max(0, originalPrice - discountAmount);

  const handleApplyCoupon = async () => {
    const code = couponCode?.toUpperCase().trim();
    if (!code) return;
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      if (error) throw error;
      if (!coupon) {
        return toast({ title: 'Cupón inválido', description: 'El código ingresado no es válido', variant: 'destructive' });
      }

      // Basic validations (do NOT consume/redce usage here)
      if (!coupon.active) return toast({ title: 'Cupón inactivo', description: 'Este cupón no está activo', variant: 'destructive' });
      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) return toast({ title: 'No disponible aún', description: 'El cupón aún no está activo', variant: 'destructive' });
      // treat ends_at <= now as expired
      if (coupon.ends_at && new Date(coupon.ends_at) <= now) return toast({ title: 'Expirado', description: 'El cupón ya expiró', variant: 'destructive' });
      if (coupon.max_redemptions !== null && coupon.redeemed_count !== null && coupon.redeemed_count >= coupon.max_redemptions) {
        return toast({ title: 'Cupon agotado', description: 'El cupón alcanzó su límite de usos', variant: 'destructive' });
      }

      // Set applied coupon locally (do not update DB yet)
      setAppliedCoupon(coupon);
      if (coupon.discount_percent !== null && coupon.discount_percent !== undefined) {
        setDiscountPercent(Number(coupon.discount_percent));
        setDiscountFixedAmount(0);
      } else if (coupon.discount_amount !== null && coupon.discount_amount !== undefined) {
        setDiscountPercent(null);
        setDiscountFixedAmount(Number(coupon.discount_amount));
      } else {
        setDiscountPercent(null);
        setDiscountFixedAmount(0);
      }

      toast({ title: '¡Cupón aplicado!', description: coupon.discount_percent ? `-${coupon.discount_percent}%` : `-$${coupon.discount_amount}` });
    } catch (err) {
      console.error('[MembershipCheckout] apply coupon', err);
      toast({ title: 'Error', description: 'Error al validar el cupón', variant: 'destructive' });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscountPercent(null);
    setDiscountFixedAmount(0);
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

    // create invoice row (pending) with metadata pointing to membership plan
    (async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser?.id) throw new Error('Usuario no autenticado');

        const invoicePayload: any = {
          user_id: currentUser.id,
          coupon_id: appliedCoupon?.id ?? null,
          amount: originalPrice,
          discount_amount: discountAmount,
          currency: 'MXN',
          status: 'pending',
          metadata: { membership_plan_id: membership.id },
        };
        if (requestInvoice) {
          invoicePayload.rfc = rfc || null;
          invoicePayload.fiscal_address = fiscalAddress || null;
        }

        const { data: invoice, error: insertErr } = await supabase.from('invoices').insert([invoicePayload]).select().maybeSingle();
        if (insertErr || !invoice) {
          console.error('[MembershipCheckout] create invoice', insertErr);
          toast({ title: 'Error', description: 'No fue posible crear la factura', variant: 'destructive' });
          return;
        }

        toast({ title: 'Procesando pago...', description: 'Redirigiendo al procesador de pagos' });
        // simulate external payment flow (replace with real provider integration)
        setTimeout(async () => {
          try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) throw new Error('Usuario no autenticado');

            // If coupon applied, attempt conditional consume
            if (appliedCoupon) {
              // fetch latest coupon row
              const { data: latest, error: fetchErr } = await supabase.from('coupons').select('*').eq('id', appliedCoupon.id).maybeSingle();
              if (fetchErr) throw fetchErr;
              if (!latest) {
                await supabase.from('invoices').update({ status: 'failed' }).eq('id', invoice.id);
                toast({ title: 'Error', description: 'Cupón no encontrado', variant: 'destructive' });
                return;
              }

              if (latest.max_redemptions !== null && (latest.redeemed_count || 0) >= latest.max_redemptions) {
                await supabase.from('invoices').update({ status: 'failed' }).eq('id', invoice.id);
                toast({ title: 'Cupón agotado', description: 'El cupón ya no tiene usos disponibles', variant: 'destructive' });
                return;
              }

              if (latest.max_redemptions !== null) {
                // conditional update to reduce race window
                const { data: updated, error: updErr } = await supabase.from('coupons')
                  .update({ redeemed_count: (latest.redeemed_count || 0) + 1 })
                  .eq('id', appliedCoupon.id)
                  .lt('redeemed_count', latest.max_redemptions)
                  .select();
                if (updErr) throw updErr;
                if (!updated || (Array.isArray(updated) && updated.length === 0)) {
                  await supabase.from('invoices').update({ status: 'failed' }).eq('id', invoice.id);
                  toast({ title: 'Cupon agotado', description: 'El cupón ya no tiene usos disponibles', variant: 'destructive' });
                  return;
                }
              } else {
                const { error: updErr } = await supabase.from('coupons')
                  .update({ redeemed_count: (latest.redeemed_count || 0) + 1 })
                  .eq('id', appliedCoupon.id);
                if (updErr) throw updErr;
              }

              // record redemption
              const { error: redeemErr } = await supabase.from('coupon_redemptions').insert([{ coupon_id: appliedCoupon.id, user_id: currentUser.id, invoice_id: invoice.id }]);
              if (redeemErr) {
                // try to rollback decrement to the latest known value
                await supabase.from('coupons').update({ redeemed_count: (latest.redeemed_count || 0) }).eq('id', appliedCoupon.id);
                await supabase.from('invoices').update({ status: 'failed' }).eq('id', invoice.id);
                toast({ title: 'Error', description: 'No fue posible registrar el uso del cupón', variant: 'destructive' });
                return;
              }
            }

            // Create user_membership
            const { data: plan } = await supabase.from('membership_plans').select('*').eq('id', membership.id).maybeSingle();
            if (plan) {
              const duration_days = plan.duration_days ?? 30;
              const started_at = new Date().toISOString();
              const expires_at = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString();
              const { data: um, error: umErr } = await supabase.from('user_memberships').insert([{
                user_id: currentUser.id,
                membership_plan_id: plan.id,
                status: 'active',
                started_at,
                expires_at,
                auto_renew: false,
                metadata: {}
              }]).select().maybeSingle();
              if (umErr) {
                // attempt rollback of coupon redemption if we created it
                try { await supabase.from('coupon_redemptions').delete().eq('invoice_id', invoice.id); } catch (e) {}
                try { await supabase.from('coupons').update({ redeemed_count: (appliedCoupon?.redeemed_count || 0) }).eq('id', appliedCoupon?.id); } catch (e) {}
                await supabase.from('invoices').update({ status: 'failed' }).eq('id', invoice.id);
                toast({ title: 'Error', description: 'No fue posible crear la membresía', variant: 'destructive' });
                return;
              }

              // attach membership id to invoice
              await supabase.from('invoices').update({ user_membership_id: um.id }).eq('id', invoice.id);
            }

            // mark invoice paid
            const { error: payErr } = await supabase.from('invoices').update({ status: 'paid', payment_provider: 'test', provider_payment_id: Math.random().toString(36).slice(2,10) }).eq('id', invoice.id);
            if (payErr) {
              await supabase.from('invoices').update({ status: 'failed' }).eq('id', invoice.id);
              throw payErr;
            }

            toast({ title: '¡Membresía adquirida!', description: `Has adquirido ${membership.name ?? membership.title ?? ''} exitosamente` });
            if (returnTo === '/loan-process') navigate('/loan-process', { state: { membershipAcquired: true } });
            else navigate('/memberships');
          } catch (err) {
            console.error('[MembershipCheckout] finalize flow (client)', err);
            toast({ title: 'Error', description: 'Ocurrió un error finalizando el pago', variant: 'destructive' });
            try { await supabase.from('invoices').update({ status: 'failed' }).eq('id', invoice.id); } catch (e) {}
          }
        }, 1500);
      } catch (err) {
        console.error('[MembershipCheckout] proceed', err);
        toast({ title: 'Error', description: 'No fue posible iniciar el pago', variant: 'destructive' });
      }
    })();
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
          <header className="h-16 border-b border-border bg-card flex items-center px-4 sm:px-6 gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg sm:text-2xl font-bold">Checkout Membresía</h1>
            </div>
          </header>

          <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4 sm:space-y-6 pt-20 md:pt-6">
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
                      <h3 className="font-bold text-lg">{membership.name ?? membership.title}</h3>
                      <p className="text-sm text-muted-foreground">Renovación {membership.renewalPeriod ?? membership.duration_days ?? ''}</p>
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
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-4 bg-success/10 border border-success/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium">Cupón aplicado</p>
                        <p className="text-sm text-muted-foreground">{discountPercent !== null ? `${discountPercent}% de descuento` : discountFixedAmount ? `-$${discountFixedAmount}` : ''}</p>
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
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-success">
                      <span>{discountPercent !== null ? `Descuento (${discountPercent}%)` : `Descuento`}</span>
                      <span>-${discountAmount.toLocaleString()} MXN</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Final</span>
                    <div className="text-right">
                      {appliedCoupon && (
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

                {!termsAccepted && (
                  <p className="text-xs text-muted-foreground text-center mt-4 p-2 bg-muted/50 rounded-lg">
                    Acepta los Términos y Condiciones para habilitar el botón de pago
                  </p>
                )}

                <div className="space-y-3 mt-6">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleProceedToPayment}
                    disabled={!termsAccepted}
                  >
                    Proceder al Pago
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Terms and Conditions Modal */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[85vh] flex flex-col rounded-2xl">
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
