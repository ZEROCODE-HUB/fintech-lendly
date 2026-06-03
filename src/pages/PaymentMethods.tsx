import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CreditCard, Building2, Plus, Edit, Trash2, CheckCircle, Star, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { increscendoApiFetch } from "@/lib/increscendoApi";

type ConektaTokenResponse = { id: string };
type ConektaErrorResponse = { message?: string; message_to_purchaser?: string };
type ConektaCardPayload = { card: { number: string; name: string; exp_year: string; exp_month: string; cvc: string } };
type ConektaSDK = {
  setPublicKey: (key: string) => void;
  setLanguage: (language: string) => void;
  Token: {
    create: (payload: ConektaCardPayload, successHandler: (token: ConektaTokenResponse) => void, errorHandler: (error: ConektaErrorResponse) => void) => void;
  };
};

declare global {
  interface Window {
    Conekta?: ConektaSDK;
  }
}

const CONEKTA_SCRIPT_ID = "conekta-js-sdk";
const CONEKTA_SCRIPT_URL = "https://cdn.conekta.io/js/latest/conekta.js";
const MAX_CARD_DIGITS = 19;
const MAX_CARD_INPUT_LENGTH = 23;
const MAX_CVV_LENGTH = 4;
const MAX_CARDHOLDER_LENGTH = 80;
const CLABE_LENGTH = 18;

type BankOption = { id: string; name: string };
type Institution = { id: string; name: string; status?: string };

const PaymentMethods = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const conektaPublicKey = (import.meta.env.VITE_CONEKTA_PUBLIC_KEY ?? "").trim();

  const locationState = location.state as { returnTo?: string; fromLoanProcess?: boolean; membership?: any } | null;
  const returnTo = locationState?.returnTo || null;
  const fromCheckout = Boolean(returnTo);
  const checkoutState = locationState; // preserve full state for return navigation
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [methodType, setMethodType] = useState<"card" | "bank">("card");
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenizingCard, setIsTokenizingCard] = useState(false);
  const [isConektaReady, setIsConektaReady] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholder: "",
    bankName: "",
    clabe: "",
    accountHolder: "",
  });

  const openAddDialog = () => {
    setSelectedMethod(null);
    setMethodType("card");
    setFormData({ cardNumber: "", expiry: "", cvv: "", cardholder: "", bankName: "", clabe: "", accountHolder: "" });
    setAddDialogOpen(true);
  };

  useEffect(() => {
    loadPaymentMethods();
    loadBanks();
  }, []);

  useEffect(() => {
    if (!conektaPublicKey) return;
    if (window.Conekta) { window.Conekta.setPublicKey(conektaPublicKey); window.Conekta.setLanguage("es"); setIsConektaReady(true); return; }
    const existingScript = document.getElementById(CONEKTA_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) { existingScript.addEventListener("load", () => { if (window.Conekta) { window.Conekta.setPublicKey(conektaPublicKey); window.Conekta.setLanguage("es"); setIsConektaReady(true); } }); return; }
    const script = document.createElement("script");
    script.id = CONEKTA_SCRIPT_ID;
    script.src = CONEKTA_SCRIPT_URL;
    script.async = true;
    script.onload = () => { if (window.Conekta) { window.Conekta.setPublicKey(conektaPublicKey); window.Conekta.setLanguage("es"); setIsConektaReady(true); } };
    document.body.appendChild(script);
    return () => { script.onload = null; };
  }, [conektaPublicKey]);

  const loadBanks = async () => {
    try {
      setLoadingBanks(true);
      const resp = await increscendoApiFetch('/belvo/institutions');
      if (!resp.ok) throw new Error('Error loading banks');
      const data = await resp.json();
      const bankList: BankOption[] = Array.isArray(data) ? data.filter((b: Institution) => b?.status === 'active' && b?.name).map((b: Institution) => ({ id: b.id, name: b.name })) : [];
      setBanks(bankList);
    } catch {
      setBanks([
        { id: "mx_santander", name: "Santander" },
        { id: "mx_bbva", name: "BBVA" },
        { id: "mx_banamex", name: "Citibanamex" },
        { id: "mx_banorte", name: "Banorte" },
        { id: "mx_hsbc", name: "HSBC" },
        { id: "mx_scotiabank", name: "Scotiabank" },
        { id: "mx_inbursa", name: "Inbursa" },
        { id: "mx_afirme", name: "Afirme" },
        { id: "mx_bancoppel", name: "Bancoppel" },
        { id: "mx_azteca", name: "Banco Azteca" },
      ]);
    } finally {
      setLoadingBanks(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('payment_methods').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (err) {
      toast({ title: "Error", description: "No se pudieron cargar los métodos de pago", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (method: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');
      const resp = await increscendoApiFetch('/set-default-card', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, default_payment_source_id: method.token }) });
      const json = await resp.json().catch(() => null);
      if (!resp.ok || !json || json.ok !== true) throw new Error(json?.message || 'Error al establecer predeterminado');
      toast({ title: "Método Predeterminado", description: "Este método será usado para cobros automáticos." });
      await loadPaymentMethods();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "No se pudo actualizar", variant: "destructive" });
    }
  };

  const handleEdit = (method: any) => { setSelectedMethod(method); setEditDialogOpen(true); };
  const handleDelete = (method: any) => { setSelectedMethod(method); setDeleteDialogOpen(true); };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase.from('payment_methods').delete().eq('id', selectedMethod?.id);
      if (error) throw error;
      await loadPaymentMethods();
      toast({ title: "Método Eliminado", description: "El método de pago ha sido eliminado." });
      setDeleteDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  };

  const confirmAdd = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      if (methodType === 'card') {
        if (!formData.cardNumber || !formData.expiry || !formData.cardholder || !formData.cvv) {
          toast({ title: "Campos requeridos", description: "Completa todos los campos", variant: "destructive" }); return;
        }
        if (!conektaPublicKey || !isConektaReady || !window.Conekta) {
          toast({ title: "Servicio no disponible", description: "No se pudo inicializar Conekta", variant: "destructive" }); return;
        }
        if (!validateExpiry(formData.expiry)) {
          toast({ title: "Vencimiento inválido", description: "La tarjeta está expirada o la fecha es incorrecta", variant: "destructive" }); return;
        }
        const cardNumber = formData.cardNumber.replace(/\s+/g, "");
        const [expMonthRaw, expYearRaw] = formData.expiry.split("/");
        const expMonth = expMonthRaw?.trim() || "";
        const expYear = expYearRaw?.trim() || "";
        const cvv = formData.cvv.trim();
        if (!isValidCardNumber(cardNumber)) {
          toast({ title: "Tarjeta inválida", description: "El número de tarjeta no es válido", variant: "destructive" }); return;
        }
        if (!/^\d{3,4}$/.test(cvv)) {
          toast({ title: "CVV inválido", description: "El CVV debe tener 3 o 4 dígitos", variant: "destructive" }); return;
        }

        setIsTokenizingCard(true);
        const token = await new Promise<ConektaTokenResponse>((resolve, reject) => {
          window.Conekta!.Token.create(
            { card: { number: cardNumber, name: formData.cardholder.trim(), exp_year: expYear, exp_month: expMonth, cvc: cvv } },
            (tokenResponse) => resolve(tokenResponse),
            (errorResponse) => reject(new Error(errorResponse.message_to_purchaser || errorResponse.message || "Tokenización fallida"))
          );
        });

        const resp = await increscendoApiFetch('/add-card', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ supabase_id: user.id, token_id: token.id }) });
        const json = await resp.json().catch(() => null);
        if (!resp.ok || !json || json.ok !== true) throw new Error(json?.message || 'Error al registrar la tarjeta');
        toast({ title: 'Tarjeta agregada', description: 'La tarjeta fue agregada correctamente.' });
        setAddDialogOpen(false);
        await loadPaymentMethods();
        if (fromCheckout && returnTo) {
          setTimeout(() => navigate(returnTo, { state: checkoutState }), 500);
        }
      } else {
        if (!formData.bankName || !formData.clabe || !formData.accountHolder) {
          toast({ title: "Campos requeridos", description: "Completa todos los campos", variant: "destructive" }); return;
        }
        if (!/^\d{18}$/.test(formData.clabe)) {
          toast({ title: "CLABE inválida", description: "La CLABE debe tener exactamente 18 dígitos", variant: "destructive" }); return;
        }
        const lastDigits = formData.clabe.slice(-4);
        const { error } = await supabase.from('payment_methods').insert({
          user_id: user.id, type: 'bank', bank_name: formData.bankName, last_digits: lastDigits, clabe: formData.clabe, holder_name: formData.accountHolder, validation_status: 'pendiente',
        });
        if (error) throw error;
        toast({ title: "Método agregado", description: "La cuenta bancaria fue agregada exitosamente." });
        setAddDialogOpen(false);
        await loadPaymentMethods();
        if (fromCheckout && returnTo) {
          setTimeout(() => navigate(returnTo, { state: checkoutState }), 500);
        }
      }
    } catch (err) {
      console.error('Error adding payment method:', err);
      const errMsg = err instanceof Error ? err.message : "No se pudo agregar el método de pago";
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setIsTokenizingCard(false);
    }
  };

  const confirmEdit = async () => {
    try {
      if (selectedMethod.type === 'card') {
        if (!formData.expiry || !formData.cardholder) {
          toast({ title: "Campos requeridos", description: "Completa todos los campos", variant: "destructive" }); return;
        }
        if (!validateExpiry(formData.expiry)) {
          toast({ title: "Vencimiento inválido", description: "La fecha de vencimiento es inválida", variant: "destructive" }); return;
        }
        const { error } = await supabase.from('payment_methods').update({ expiry: formData.expiry, holder_name: formData.cardholder }).eq('id', selectedMethod.id);
        if (error) throw error;
      } else {
        if (!formData.accountHolder) {
          toast({ title: "Campo requerido", description: "Completa el nombre del titular", variant: "destructive" }); return;
        }
        const { error } = await supabase.from('payment_methods').update({ holder_name: formData.accountHolder }).eq('id', selectedMethod.id);
        if (error) throw error;
      }
      await loadPaymentMethods();
      toast({ title: "Método Actualizado", description: "El método de pago fue actualizado." });
      setEditDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" });
    }
  };

  const detectCardType = (cardNumber: string): string => {
    const digits = cardNumber.replace(/\D/g, "");
    if (/^4/.test(digits)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
    if (/^3[47]/.test(digits)) return "American Express";
    return "Tarjeta";
  };

  const normalizeCardNumber = (value: string): string => value.replace(/\D/g, "").slice(0, MAX_CARD_DIGITS);

  const formatCardNumber = (value: string): string => {
    const digits = normalizeCardNumber(value);
    if (/^3[47]/.test(digits)) {
      const parts = [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean);
      return parts.join(" ");
    }
    return digits.match(/.{1,4}/g)?.join(" ") ?? "";
  };

  const passesLuhnCheck = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    let sum = 0, shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i -= 1) {
      let digit = Number(digits[i]);
      if (Number.isNaN(digit)) return false;
      if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const isValidCardNumber = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    if (!/^\d+$/.test(digits)) return false;
    const expected = (/^3[47]/.test(digits)) ? [15] : (/^4/.test(digits)) ? [13, 16, 19] : (/^(5[1-5]|2[2-7])/.test(digits)) ? [16] : [13, 14, 15, 16, 17, 18, 19];
    if (!expected.includes(digits.length)) return false;
    return passesLuhnCheck(digits);
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 4) return formData.expiry;
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  const validateExpiry = (expiry: string): boolean => {
    if (!expiry || expiry.length !== 5) return false;
    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  };

  const handleCardNumberChange = (value: string) => setFormData({ ...formData, cardNumber: formatCardNumber(value) });
  const handleCvvChange = (value: string) => setFormData({ ...formData, cvv: value.replace(/\D/g, "").slice(0, MAX_CVV_LENGTH) });
  const handleCardholderChange = (value: string) => setFormData({ ...formData, cardholder: value.slice(0, MAX_CARDHOLDER_LENGTH) });
  const handleExpiryChange = (value: string) => setFormData({ ...formData, expiry: formatExpiry(value) });

  const cardNumberDigits = formData.cardNumber.replace(/\D/g, "");
  const showInvalidCardNumber = methodType === "card" && cardNumberDigits.length >= 13 && !isValidCardNumber(cardNumberDigits);
  const clabeInvalid = methodType === "bank" && formData.clabe.length > 0 && formData.clabe.length < 18;
  const clabeError = methodType === "bank" && formData.clabe.length > 0 && !/^\d+$/.test(formData.clabe);

  const getCardBrandIcon = () => <CreditCard className="h-5 w-5" />;

  const PaymentMethodSkeleton = () => (
    <Card className="shadow-soft overflow-hidden">
      <CardHeader className="p-4"><div className="flex items-start gap-3"><div className="h-10 w-10 rounded-lg bg-muted animate-pulse" /><div className="flex-1 space-y-2"><div className="h-4 w-24 bg-muted animate-pulse rounded" /><div className="h-3 w-16 bg-muted animate-pulse rounded" /></div></div></CardHeader>
      <CardContent className="p-4 space-y-3"><div className="flex justify-between"><div className="h-3 w-16 bg-muted animate-pulse rounded" /><div className="h-3 w-16 bg-muted animate-pulse rounded" /></div><div className="flex gap-2 pt-2 border-t"><div className="flex-1 h-9 bg-muted animate-pulse rounded" /><div className="h-9 w-20 bg-muted animate-pulse rounded" /></div></CardContent>
    </Card>
  );

  return (
    <>
      <Card className="border-primary bg-accent">
        <CardContent className="flex items-start gap-3 py-4">
          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Cobros Automáticos</p>
            <p className="text-xs text-muted-foreground">El método predeterminado se usará para tus pagos automáticos mensuales.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-3">
        {fromCheckout && (
          <Button variant="outline" onClick={() => navigate(returnTo!, { state: checkoutState })} className="gap-2">
            <ArrowLeft className="h-4 w-4" />Volver
          </Button>
        )}
        <Button onClick={openAddDialog} className="gap-2 ml-auto"><Plus className="h-4 w-4" />Agregar Método de Pago</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {isLoading ? (<><PaymentMethodSkeleton /><PaymentMethodSkeleton /></>) : paymentMethods.length === 0 ? (
          <Card className="shadow-soft lg:col-span-3">
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes métodos de pago</h3>
              <p className="text-muted-foreground mb-4">Agrega un método de pago para tus cobros automáticos</p>
              <Button onClick={openAddDialog}><Plus className="h-4 w-4 mr-2" />Agregar Método</Button>
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} className={`shadow-soft flex flex-col ${method.is_default ? 'border-primary' : ''}`}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                      {method.type === "card" ? getCardBrandIcon() : <Building2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className="truncate">{method.type === "card" ? method.card_type : method.bank_name}</span>
                        {method.is_default && <Star className="h-3 w-3 text-primary fill-primary" />}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {method.type === "card" ? `•••• ${method.last_four}` : `CLABE •••• ${method.last_digits}`}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Titular:</span>
                    <span className="font-medium">{method.holder_name}</span>
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
                      <Badge className={method.validation_status === 'validada' ? 'bg-success/20 text-success border-success' : 'bg-warning/20 text-warning border-warning'}>
                        {method.validation_status === "validada" ? "Validada" : "Pendiente"}
                      </Badge>
                    </div>
                  )}
                  {method.is_default && method.type === "card" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Predeterminado:</span>
                      <Badge className="bg-primary/20 text-primary border-primary">Sí</Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t mt-auto">
                  {method.type === "card" && !method.is_default && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(method)}><Star className="h-3 w-3 mr-1" />Predeterminado</Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => { setSelectedMethod(method); setMethodType(method.type as 'card' | 'bank'); if (method.type === 'card') setFormData({ ...formData, expiry: method.expiry || "", cardholder: method.holder_name || "" }); else setFormData({ ...formData, accountHolder: method.holder_name || "" }); setEditDialogOpen(true); }}><Edit className="h-3 w-3 mr-1" />Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(method)} disabled={method.is_default}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl p-4">
          <DialogHeader>
            <DialogTitle>Agregar Método de Pago</DialogTitle>
            <DialogDescription>Agrega una tarjeta o cuenta bancaria para cobros automáticos</DialogDescription>
          </DialogHeader>
          <div className="relative">
            {isTokenizingCard && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="flex flex-col items-center gap-2"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /><p className="text-sm font-medium">Guardando método de pago...</p></div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label>Tipo de Método</Label>
                <Select value={methodType} onValueChange={(v: "card" | "bank") => setMethodType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Input id="card-number" placeholder="1234 5678 9012 3456" maxLength={MAX_CARD_INPUT_LENGTH} value={formData.cardNumber} inputMode="numeric" autoComplete="cc-number" onChange={(e) => handleCardNumberChange(e.target.value)} disabled={!!selectedMethod} />
                    {showInvalidCardNumber && <p className="text-xs text-destructive mt-1">Número de tarjeta inválido</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Vencimiento (MM/AA)</Label>
                      <Input id="expiry" placeholder="MM/AA" maxLength={5} value={formData.expiry} onChange={(e) => handleExpiryChange(e.target.value)} />
                      {formData.expiry && formData.expiry.length === 5 && !validateExpiry(formData.expiry) && <p className="text-xs text-destructive mt-1">Fecha inválida o tarjeta expirada</p>}
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" maxLength={MAX_CVV_LENGTH} type="password" inputMode="numeric" autoComplete="cc-csc" value={formData.cvv} onChange={(e) => handleCvvChange(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardholder">Nombre del Titular</Label>
                    <Input id="cardholder" placeholder="Como aparece en la tarjeta" maxLength={MAX_CARDHOLDER_LENGTH} autoComplete="cc-name" value={formData.cardholder} onChange={(e) => handleCardholderChange(e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="bank-name">Banco</Label>
                    <Select value={formData.bankName} onValueChange={(v) => setFormData({ ...formData, bankName: v })}>
                      <SelectTrigger id="bank-name"><SelectValue placeholder={loadingBanks ? "Cargando bancos..." : "Selecciona tu banco"} /></SelectTrigger>
                      <SelectContent>
                        {banks.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="clabe">CLABE Interbancaria</Label>
                    <Input id="clabe" placeholder="18 dígitos" maxLength={CLABE_LENGTH} value={formData.clabe} onChange={(e) => setFormData({ ...formData, clabe: e.target.value.replace(/\D/g, "").slice(0, CLABE_LENGTH) })} />
                    {clabeInvalid && <p className="text-xs text-destructive mt-1">La CLABE debe tener 18 dígitos ({formData.clabe.length}/18)</p>}
                    {clabeError && <p className="text-xs text-destructive mt-1">La CLABE solo debe contener números</p>}
                  </div>
                  <div>
                    <Label htmlFor="account-holder">Nombre del Titular</Label>
                    <Input id="account-holder" placeholder="Nombre como aparece en la cuenta" value={formData.accountHolder} onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })} />
                  </div>
                  <div className="bg-accent rounded-lg p-3 text-sm">
                    <p className="font-semibold mb-1">Validación de cuenta</p>
                    <p className="text-muted-foreground">Se realizará un depósito menor a $1 MXN para validar la cuenta.</p>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isTokenizingCard}>Cancelar</Button>
            <Button onClick={confirmAdd} disabled={isTokenizingCard || (methodType === "bank" && (!formData.clabe || formData.clabe.length < 18))}>{isTokenizingCard ? "Guardando..." : "Agregar Método"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl p-4">
          <DialogHeader><DialogTitle>Editar Método de Pago</DialogTitle><DialogDescription>Actualiza la información de tu método de pago</DialogDescription></DialogHeader>
          {selectedMethod && (
            <div className="space-y-4">
              {selectedMethod.type === "card" && (
                <div>
                  <Label>Tarjeta</Label>
                  <p className="text-sm text-muted-foreground">{selectedMethod.card_type} •••• {selectedMethod.last_four}</p>
                </div>
              )}
              {selectedMethod.type === "bank" && (
                <div>
                  <Label>Banco</Label>
                  <p className="text-sm text-muted-foreground">{selectedMethod.bank_name} •••• {selectedMethod.last_digits}</p>
                </div>
              )}
              <div>
                <Label htmlFor="edit-holder">Nombre del Titular</Label>
                <Input id="edit-holder" value={selectedMethod.type === 'card' ? formData.cardholder : formData.accountHolder} onChange={(e) => setFormData({ ...formData, [selectedMethod.type === 'card' ? 'cardholder' : 'accountHolder']: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar Método de Pago?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. El método será eliminado permanentemente.{selectedMethod?.is_default && " No puedes eliminar el predeterminado."}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={selectedMethod?.is_default}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PaymentMethods;
