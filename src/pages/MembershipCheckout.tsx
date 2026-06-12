import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
  CreditCard,
  FileText,
  Zap,
  X,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { defaultMemberships } from "@/data/memberships";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { increscendoApiFetch } from "@/lib/increscendoApi";
import { sendEmail } from "@/lib/emailService";
import { membershipAcquiredTemplate } from "@/lib/emailTemplates";

interface LocationState {
  membershipId?: string;
  membership?: any;
  returnTo?: string;
  fromLoanProcess?: boolean;
}

const CHECKOUT_STATE_KEY = 'membership_checkout_state';

const MembershipCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { userId } = useAuth();

  const state = (location.state || {}) as LocationState;
  const membershipId = state?.membershipId;
  const returnTo = state?.returnTo || "/memberships";
  const fromLoanProcess = state?.fromLoanProcess || (returnTo && returnTo.includes('loan-process'));

  const [userProfile, setUserProfile] = useState<{ first_name?: string; last_name?: string; email?: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase.from('profiles').select('first_name,last_name,email').eq('id', userId).single()
      .then(({ data }) => { if (data) setUserProfile(data); });
  }, [userId]);

  const cardholderName = userProfile
    ? `${userProfile.first_name ?? ''} ${userProfile.last_name ?? ''}`.trim()
    : 'Usuario';

  const formatDate = (v?: string) => {
    if (!v) return '—';
    try {
      const d = new Date(v);
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return v; }
  };

  const formatMoney = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

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
  const [acquiring, setAcquiring] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [cardErrorOpen, setCardErrorOpen] = useState(false);
  const [noConektaModalOpen, setNoConektaModalOpen] = useState(false);

  // Persist checkout form state across payment-methods navigation
  const saveCheckoutState = () => {
    try {
      sessionStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify({
        couponCode,
        appliedCoupon,
        discountPercent,
        discountFixedAmount,
        requestInvoice,
        rfc,
        fiscalAddress,
        termsAccepted,
        membership,
        membershipId,
        returnTo,
        fromLoanProcess,
      }));
    } catch { }
  };

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHECKOUT_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.couponCode === 'string') setCouponCode(parsed.couponCode);
        if (parsed.appliedCoupon) setAppliedCoupon(parsed.appliedCoupon);
        if (typeof parsed.discountPercent === 'number') setDiscountPercent(parsed.discountPercent);
        if (typeof parsed.discountFixedAmount === 'number') setDiscountFixedAmount(parsed.discountFixedAmount);
        if (typeof parsed.requestInvoice === 'boolean') setRequestInvoice(parsed.requestInvoice);
        if (typeof parsed.rfc === 'string') setRfc(parsed.rfc);
        if (typeof parsed.fiscalAddress === 'string') setFiscalAddress(parsed.fiscalAddress);
        if (typeof parsed.termsAccepted === 'boolean') setTermsAccepted(parsed.termsAccepted);
        sessionStorage.removeItem(CHECKOUT_STATE_KEY);
      }
    } catch { }
  }, []);

  const isMissingCardError = (value: unknown) => {
    const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
    return /no\s*sources?|no\s*cards?|sin\s*tarjeta|missing\s*(card|source|payment|method)|add\s*(a\s*)?(card|payment|method|source)|not\s*found.*(card|tarjeta)|no\s*(payment\s*)?method|sin\s*(medio|metodo|método)/i.test(text);
  };

  const originalPrice = Number(membership?.cost ?? membership?.price ?? 0) || 0;
  const discountAmount = appliedCoupon ? (discountPercent ? Math.round((originalPrice * discountPercent) / 100) : discountFixedAmount) : 0;
  const finalTotal = Math.max(0, originalPrice - discountAmount);

  const handleApplyCoupon = async () => {
    const code = couponCode?.toUpperCase().trim();
    if (!code) return;
    try {
      const { data: coupon, error } = await supabase.from('coupons').select('*').eq('code', code).maybeSingle();
      if (error) throw error;
      if (!coupon) return toast({ title: 'Cupón inválido', description: 'Código no válido', variant: 'destructive' });
      if (!coupon.active) return toast({ title: 'Cupón inactivo', variant: 'destructive' });
      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) return toast({ title: 'Cupón aún no disponible', variant: 'destructive' });
      if (coupon.ends_at && new Date(coupon.ends_at) <= now) return toast({ title: 'Cupón expirado', variant: 'destructive' });
      if (coupon.max_redemptions !== null && coupon.redeemed_count !== null && coupon.redeemed_count >= coupon.max_redemptions) {
        return toast({ title: 'Cupón agotado', variant: 'destructive' });
      }

      setAppliedCoupon(coupon);
      if (coupon.discount_percent !== null) setDiscountPercent(Number(coupon.discount_percent)), setDiscountFixedAmount(0);
      else if (coupon.discount_amount !== null) setDiscountPercent(null), setDiscountFixedAmount(Number(coupon.discount_amount));
      else setDiscountPercent(null), setDiscountFixedAmount(0);

      toast({ title: '¡Cupón aplicado!', description: coupon.discount_percent ? `-${coupon.discount_percent}%` : `-$${coupon.discount_amount}` });
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo validar el cupón', variant: 'destructive' });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(null);
    setDiscountFixedAmount(0);
    setCouponCode("");
  };

  const handleProceedToPayment = () => {
    if (!termsAccepted) {
      toast({ title: "Acepta los términos", description: "Debes aceptarlos para continuar", variant: "destructive" });
      return;
    }
    if (requestInvoice && (!rfc || !fiscalAddress)) {
      toast({ title: "Datos incompletos", description: "Completa los datos de facturación", variant: "destructive" });
      return;
    }

    (async () => {
      try {
        if (!userId) throw new Error('Usuario no autenticado');
        setAcquiring(true);
        const resp = await increscendoApiFetch('/acquire-membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            membership_plan_id: membership.id,
            ...(appliedCoupon ? { coupon_code: appliedCoupon.code } : {}),
          }),
        });
        const json = await resp.json().catch(() => null);

        if (!resp.ok) {
          const titleMap: Record<number, string> = {
            400: 'Datos inválidos',
            402: 'Pago no exitoso',
            422: 'Error de pago',
            502: 'Error de procesador',
            504: 'Tiempo de espera',
          };
          let errorMsg = '';
          // Try to extract the Spanish user-friendly message from body (stringified Conekta error)
          if (json?.body && typeof json.body === 'string') {
            try {
              const parsedBody = JSON.parse(json.body);
              const detailMsg = parsedBody?.details?.[0]?.message;
              if (detailMsg) errorMsg = detailMsg;
            } catch {}
          }
          if (!errorMsg) {
            errorMsg = json?.error || json?.message || json?.details || 'Error al comunicar con el servicio';
          }
          if (resp.status === 502) errorMsg = 'El procesador de pagos rechazó la solicitud. Intenta de nuevo.';
          else if (resp.status === 504) errorMsg = 'El servidor no respondió a tiempo. Intenta de nuevo.';
          if (isMissingCardError(errorMsg)) { setCardErrorOpen(true); return; }
          toast({ title: titleMap[resp.status] || 'Error', description: errorMsg, variant: 'destructive' });
          return;
        }

        if (!json || json.ok !== true) {
          const msg = json?.error || json?.message || JSON.stringify(json) || 'Respuesta inválida del servidor';
          if (isMissingCardError(msg)) { setCardErrorOpen(true); return; }
          toast({ title: 'Error', description: msg, variant: 'destructive' });
          return;
        }

        setPreviewData(json);
        setPreviewOpen(true);
        toast({ title: '¡Membresía activada!', description: 'Tu membresía se ha activado correctamente.' });
        // Send membership confirmation email
        if (userProfile?.email) {
          const userName = `${userProfile.first_name ?? ''} ${userProfile.last_name ?? ''}`.trim() || 'Usuario';
          const um = json.user_membership ?? null;
          sendEmail({
            to: userProfile.email,
            subject: '¡Membresía Activada!',
            html: membershipAcquiredTemplate({
              name: userName,
              planName: membership.name ?? membership.title ?? 'Membresía',
              amount: (finalTotal || originalPrice).toLocaleString('es-MX'),
              startDate: um?.started_at ? new Date(um.started_at).toLocaleDateString('es-MX') : new Date().toLocaleDateString('es-MX'),
              expirationDate: um?.expires_at ? new Date(um.expires_at).toLocaleDateString('es-MX') : '—',
            }),
            text: `Hola ${userName}, tu membresía ${membership.name ?? membership.title} ha sido activada correctamente. Ya puedes disfrutar de todos los beneficios.`,
          }).catch(e => console.warn('[membership] email error', e));
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
        if (isMissingCardError(errMsg)) setCardErrorOpen(true);
        else toast({ title: 'Error', description: (err instanceof Error) ? err.message : 'Error al adquirir', variant: 'destructive' });
      } finally {
        setAcquiring(false);
      }
    })();
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setTermsModalOpen(false);
    toast({ title: "Términos aceptados" });
  };

  return (
    <>
      <div className="p-4 sm:p-6 md:px-8 mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {fromLoanProcess && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/loan-process')} className="text-muted-foreground shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Adquirir Membresía</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {fromLoanProcess ? 'Completa tu pago para continuar con tu préstamo' : 'Confirma y completa tu compra'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem(CHECKOUT_STATE_KEY); navigate(fromLoanProcess ? '/loan-process' : returnTo); }} className="text-muted-foreground shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Back to loan process banner */}
        {fromLoanProcess && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Navegas desde tu solicitud de préstamo</p>
              <p className="text-xs text-muted-foreground">Una vez completada la membresía, continuarás con tu proceso de préstamo.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Left column */}
          <div className="xl:col-span-3 space-y-3">
            {/* Plan card */}
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-hero flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{membership.name ?? membership.title}</p>
                    <p className="text-xs text-muted-foreground">{membership.renewalPeriod}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">{formatMoney(originalPrice)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Coupon card */}
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">¿Tienes un cupón?</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      <span className="text-sm font-medium">{appliedCoupon.code}</span>
                      <Badge variant="outline" className="text-xs text-success border-success/30 ml-1">
                        {discountPercent !== null ? `-${discountPercent}%` : `-${formatMoney(discountFixedAmount)}`}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="text-xs">Quitar</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código del cupón"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      maxLength={20}
                      className="text-sm"
                    />
                    <Button onClick={handleApplyCoupon} disabled={!couponCode} size="sm" variant="outline">Aplicar</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Billing card */}
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">Facturación</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="request-invoice" checked={requestInvoice} onCheckedChange={(c) => setRequestInvoice(!!c)} />
                  <Label htmlFor="request-invoice" className="text-sm cursor-pointer">Solicitar factura fiscal</Label>
                </div>
                {requestInvoice && (
                  <div className="space-y-2 mt-3 pl-6">
                    <Input placeholder="RFC" value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} maxLength={13} className="text-sm h-9" />
                    <Input placeholder="Dirección fiscal completa" value={fiscalAddress} onChange={(e) => setFiscalAddress(e.target.value)} className="text-sm h-9" />
                  </div>
                )}
              </CardContent>
            </Card>
            {fromLoanProcess && (
              <Button variant="outline" onClick={() => { sessionStorage.removeItem(CHECKOUT_STATE_KEY); navigate('/loan-process'); }} className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Préstamo
              </Button>
            )}
          </div>

          {/* Right column: summary */}
          <div className="xl:col-span-2">
              <div className="sticky top-4">
                <Card className="shadow-soft border-2 border-primary/10">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold">Resumen</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-foreground truncate mr-2">{membership.name ?? membership.title}</span>
                        <span className="text-sm font-bold">{formatMoney(originalPrice)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-success">
                          <span className="text-sm">Descuento</span>
                          <span className="text-sm font-semibold">-{formatMoney(discountAmount)}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base">Total</span>
                      <div className="text-right">
                        {appliedCoupon && <p className="text-xs text-muted-foreground line-through">{formatMoney(originalPrice)}</p>}
                        <p className="text-2xl font-extrabold text-primary">{formatMoney(finalTotal)}</p>
                      </div>
                    </div>



              {/* Terms inside card, above button */}
              <div className="flex items-center gap-2">
                <Checkbox id="terms-inline" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(!!c)} />
                <Label htmlFor="terms-inline" className="text-xs cursor-pointer leading-relaxed">
                  Acepto los{" "}
                  <button type="button" onClick={() => setTermsModalOpen(true)} className="text-primary hover:underline">
                    Términos y Condiciones
                  </button>
                </Label>
              </div>

              <Button className="w-full" size="lg" onClick={handleProceedToPayment} disabled={!termsAccepted || acquiring}>
                {acquiring ? 'Procesando...' : 'Confirmar compra'}
              </Button>

              <Button variant="ghost" className="w-full text-muted-foreground" size="sm" onClick={() => { sessionStorage.removeItem(CHECKOUT_STATE_KEY); navigate(fromLoanProcess ? '/loan-process' : returnTo); }}>
                Cancelar
              </Button>
            </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>


      {/* Terms Modal */}
      <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-xl max-h-[85vh] flex flex-col p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Términos y Condiciones
            </DialogTitle>
            <DialogDescription>Lee antes de continuar</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-4 text-sm text-muted-foreground pr-4">
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-1">1. Aceptación</h3>
                <p className="leading-relaxed">Al adquirir una membresía aceptas estos términos. Si no estás de acuerdo, no completes la compra.</p>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-1">2. Servicio</h3>
                <p className="leading-relaxed">La membresía otorga acceso a tasas preferenciales y asesoría financiera personalizada.</p>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-1">3. Vigencia</h3>
                <p className="leading-relaxed">Vigencia anual. Renovación automática o manual. Recordatorio 30 días antes del vencimiento.</p>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-1">4. Cancelación</h3>
                <p className="leading-relaxed">Cancelación dentro de 14 días naturales sin uso del servicio. Después, sin reembolsos.</p>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-1">5. Datos personales</h3>
                <p className="leading-relaxed">Conforme a la Ley Federal de Protección de Datos. Uso exclusivo para la prestación del servicio.</p>
              </section>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setTermsModalOpen(false)}>Cerrar</Button>
            <Button onClick={handleAcceptTerms}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¡Membresía activada!</DialogTitle>
            <DialogDescription>Tu membresía está lista</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {previewData ? (
              (() => {
                const src = previewData.added_source ?? null;
                const um = previewData.user_membership ?? null;
                return (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{membership.name ?? membership.title}</p>
                        <Badge className={`mt-1 text-xs ${um?.status === 'active' ? 'bg-success' : 'bg-warning'}`}>Activa</Badge>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-2 divide-x">
                        <div className="px-3 py-2">
                          <p className="text-xs text-muted-foreground">Monto</p>
                          <p className="text-sm font-bold text-primary">{formatMoney(finalTotal)}</p>
                        </div>
                        <div className="px-3 py-2">
                          <p className="text-xs text-muted-foreground">Método</p>
                          <p className="text-sm">{src ? `${src.brand} •••• ${src.last4}` : 'Tarjeta'}</p>
                        </div>
                      </div>
                      <div className="border-t px-3 py-2">
                        <p className="text-xs text-muted-foreground">Vigencia</p>
                        <p className="text-sm">{formatDate(um?.started_at)} — {formatDate(um?.expires_at)}</p>
                      </div>
                    </div>
                  </>
                );
              })()
            ) : null}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Cerrar</Button>
            <Button onClick={() => { setPreviewOpen(false); sessionStorage.removeItem(CHECKOUT_STATE_KEY); navigate(fromLoanProcess ? '/loan-process' : returnTo); }}>Finalizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No card modal */}
      <Dialog open={cardErrorOpen} onOpenChange={setCardErrorOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Agrega una tarjeta</DialogTitle>
            <DialogDescription>Agrega un método de pago para completar la suscripción.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCardErrorOpen(false)}>Cerrar</Button>
            <Button onClick={() => { setCardErrorOpen(false); saveCheckoutState(); navigate('/payment-methods', { state: { returnTo: '/membership-checkout', membership, fromLoanProcess, openAddDialog: true } }); }}>Ir a Métodos de Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No conekta modal */}
      <Dialog open={noConektaModalOpen} onOpenChange={setNoConektaModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Método de pago requerido</DialogTitle>
            <DialogDescription>Agrega una tarjeta para continuar.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoConektaModalOpen(false)}>Cerrar</Button>
            <Button onClick={() => { setNoConektaModalOpen(false); saveCheckoutState(); navigate('/payment-methods', { state: { returnTo: '/membership-checkout', membership, fromLoanProcess, openAddDialog: true } }); }}>Ir a Métodos de Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MembershipCheckout;
