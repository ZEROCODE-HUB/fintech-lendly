import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";

type ConektaTokenResponse = {
  id: string;
};

type ConektaErrorResponse = {
  message?: string;
  message_to_purchaser?: string;
};

type ConektaCardPayload = {
  card: {
    number: string;
    name: string;
    exp_year: string;
    exp_month: string;
    cvc: string;
  };
};

type ConektaSDK = {
  setPublicKey: (key: string) => void;
  setLanguage: (language: string) => void;
  Token: {
    create: (
      payload: ConektaCardPayload,
      successHandler: (token: ConektaTokenResponse) => void,
      errorHandler: (error: ConektaErrorResponse) => void
    ) => void;
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

const DEFAULT_TEST_CARD = {
  cardNumber: "4242 4242 4242 4242",
  expiry: "12/30",
  cvv: "123",
  cardholder: "Tarjeta Prueba",
};

const PaymentMethods = () => {
  const { toast } = useToast();
  const conektaPublicKey = (import.meta.env.VITE_CONEKTA_PUBLIC_KEY ?? "").trim();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [methodType, setMethodType] = useState<"card" | "bank">("card");
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenizingCard, setIsTokenizingCard] = useState(false);
  const [isConektaReady, setIsConektaReady] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  
  // Form states for adding/editing
  const [formData, setFormData] = useState({
    cardNumber: DEFAULT_TEST_CARD.cardNumber,
    expiry: DEFAULT_TEST_CARD.expiry,
    cvv: DEFAULT_TEST_CARD.cvv,
    cardholder: DEFAULT_TEST_CARD.cardholder,
    bankName: "",
    clabe: "",
    accountHolder: "",
  });

  const openAddDialog = () => {
    setSelectedMethod(null);
    setMethodType("card");
    setFormData({
      cardNumber: DEFAULT_TEST_CARD.cardNumber,
      expiry: DEFAULT_TEST_CARD.expiry,
      cvv: DEFAULT_TEST_CARD.cvv,
      cardholder: DEFAULT_TEST_CARD.cardholder,
      bankName: "",
      clabe: "",
      accountHolder: "",
    });
    setAddDialogOpen(true);
  };

  // Load payment methods on mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    if (!conektaPublicKey) {
      return;
    }

    if (window.Conekta) {
      window.Conekta.setPublicKey(conektaPublicKey);
      window.Conekta.setLanguage("es");
      setIsConektaReady(true);
      return;
    }

    const existingScript = document.getElementById(CONEKTA_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.Conekta) {
          window.Conekta.setPublicKey(conektaPublicKey);
          window.Conekta.setLanguage("es");
          setIsConektaReady(true);
        }
      });
      return;
    }

    const script = document.createElement("script");
    script.id = CONEKTA_SCRIPT_ID;
    script.src = CONEKTA_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.Conekta) {
        window.Conekta.setPublicKey(conektaPublicKey);
        window.Conekta.setLanguage("es");
        setIsConektaReady(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [conektaPublicKey]);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los métodos de pago",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId);

      if (error) throw error;
      
      await loadPaymentMethods();
      toast({
        title: "Método Predeterminado Actualizado",
        description: "Este método será usado para cobros automáticos.",
      });
    } catch (err) {
      console.error('Error updating default method:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el método predeterminado",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (method: any) => {
    setSelectedMethod(method);
    setEditDialogOpen(true);
  };

  const handleDelete = (method: any) => {
    setSelectedMethod(method);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', selectedMethod?.id);

      if (error) throw error;

      await loadPaymentMethods();
      toast({
        title: "Método Eliminado",
        description: "El método de pago ha sido eliminado.",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting payment method:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el método de pago",
        variant: "destructive",
      });
    }
  };

  const confirmAdd = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      if (methodType === 'card') {
        if (!formData.cardNumber || !formData.expiry || !formData.cardholder || !formData.cvv) {
          toast({
            title: "Error",
            description: "Por favor completa todos los campos requeridos",
            variant: "destructive",
          });
          return;
        }

        if (!conektaPublicKey) {
          toast({
            title: "Configuracion Incompleta",
            description: "Falta configurar VITE_CONEKTA_PUBLIC_KEY",
            variant: "destructive",
          });
          return;
        }

        if (!isConektaReady || !window.Conekta) {
          toast({
            title: "Servicio No Disponible",
            description: "No se pudo inicializar Conekta. Intenta de nuevo en unos segundos.",
            variant: "destructive",
          });
          return;
        }

        if (!validateExpiry(formData.expiry)) {
          toast({
            title: "Error",
            description: "La fecha de vencimiento es inválida o la tarjeta está expirada",
            variant: "destructive",
          });
          return;
        }

        const cardNumber = formData.cardNumber.replace(/\s+/g, "");
        const [expMonthRaw, expYearRaw] = formData.expiry.split("/");
        const expMonth = expMonthRaw?.trim() || "";
        const expYear = expYearRaw?.trim() || "";
        const cvv = formData.cvv.trim();

        if (!isValidCardNumber(cardNumber)) {
          toast({
            title: "Error",
            description: "El numero de tarjeta no tiene un formato valido",
            variant: "destructive",
          });
          return;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
          toast({
            title: "Error",
            description: "El CVV debe tener 3 o 4 digitos",
            variant: "destructive",
          });
          return;
        }

        setIsTokenizingCard(true);

        const maskedKey = conektaPublicKey ? `${conektaPublicKey.slice(0, 7)}***${conektaPublicKey.slice(-4)}` : "missing";
        console.log("[Conekta] Iniciando tokenizacion", {
          origin: window.location.origin,
          key: maskedKey,
          cardType: detectCardType(cardNumber),
        });

        // Security note: tokenize only with Conekta.js in the browser.
        // Do not send raw PAN/CVV to backend or call Conekta /tokens from server without PCI scope.
        const token = await new Promise<ConektaTokenResponse>((resolve, reject) => {
          window.Conekta!.Token.create(
            {
              card: {
                number: cardNumber,
                name: formData.cardholder.trim(),
                exp_year: expYear,
                exp_month: expMonth,
                cvc: cvv,
              },
            },
            (tokenResponse) => {
              console.log("[Conekta] Tokenizacion exitosa", { tokenId: tokenResponse.id });
              resolve(tokenResponse);
            },
            (errorResponse) => {
              console.error("[Conekta] Tokenizacion fallida", errorResponse);
              const errorMessage = errorResponse.message_to_purchaser || errorResponse.message || "No se pudo tokenizar la tarjeta";
              reject(new Error(errorMessage));
            }
          );
        });

        // Enviar token al endpoint externo que añade la tarjeta
        console.log("[Conekta] Token recibido", { tokenId: token.id });
        try {
          const resp = await fetch('https://increscendo-api.vercel.app/add-card', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ supabase_id: user.id, token_id: token.id }),
          });

          const json = await resp.json().catch(() => null);

          if (!resp.ok || !json || json.ok !== true) {
            console.error('[External add-card] Error', resp.status, json);
            const msg = json?.message || 'Error al registrar la tarjeta en el servicio externo';
            throw new Error(msg);
          }

          console.log('[External add-card] Success', json);
          toast({
            title: 'Tarjeta agregada',
            description: 'La tarjeta fue agregada correctamente.',
          });

          // Cerrar modal y recargar métodos desde la base de datos
          setAddDialogOpen(false);
          await loadPaymentMethods();
          return;
        } catch (postErr) {
          console.error('Error enviando token al servicio externo:', postErr);
          toast({
            title: 'Error',
            description: (postErr instanceof Error) ? postErr.message : 'Fallo al agregar la tarjeta',
            variant: 'destructive',
          });
          return;
        }
      } else {
        if (!formData.bankName || !formData.clabe || !formData.accountHolder) {
          toast({
            title: "Error",
            description: "Por favor completa todos los campos requeridos",
            variant: "destructive",
          });
          return;
        }

        const lastDigits = formData.clabe.slice(-4);
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            user_id: user.id,
            type: 'bank',
            bank_name: formData.bankName,
            last_digits: lastDigits,
            clabe: formData.clabe,
            holder_name: formData.accountHolder,
            validation_status: 'pendiente',
          });

        if (error) throw error;
      }

      await loadPaymentMethods();
      toast({
        title: "Método Agregado",
        description: "El método de pago ha sido agregado exitosamente.",
      });
      setAddDialogOpen(false);
      setFormData({
        cardNumber: "",
        expiry: "",
        cvv: "",
        cardholder: "",
        bankName: "",
        clabe: "",
        accountHolder: "",
      });
    } catch (err) {
      console.error('Error adding payment method:', err);
      const errorMessage = err instanceof Error ? err.message : "No se pudo agregar el método de pago";
      const isPotentialConekta403 = /could not be processed|connectivity issue|forbidden/i.test(errorMessage);

      toast({
        title: "Error",
        description: isPotentialConekta403
          ? "Conekta rechazo la tokenizacion (403). Verifica VITE_CONEKTA_PUBLIC_KEY, modo test/live y estado de tu cuenta en dashboard."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTokenizingCard(false);
    }
  };

  const detectCardType = (cardNumber: string): string => {
    const digits = cardNumber.replace(/\D/g, "");
    if (/^4/.test(digits)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
    if (/^3[47]/.test(digits)) return "American Express";
    return "Tarjeta";
  };

  const normalizeCardNumber = (value: string): string => {
    return value.replace(/\D/g, "").slice(0, MAX_CARD_DIGITS);
  };

  const formatCardNumber = (value: string): string => {
    const digits = normalizeCardNumber(value);

    // American Express usually uses 4-6-5 grouping.
    if (/^3[47]/.test(digits)) {
      const parts = [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean);
      return parts.join(" ");
    }

    return digits.match(/.{1,4}/g)?.join(" ") ?? "";
  };

  const getExpectedCardLengths = (cardNumber: string): number[] => {
    const digits = cardNumber.replace(/\D/g, "");

    if (/^3[47]/.test(digits)) return [15]; // Amex
    if (/^4/.test(digits)) return [13, 16, 19]; // Visa
    if (/^(5[1-5]|2[2-7])/.test(digits)) return [16]; // Mastercard
    if (/^(30[0-5]|36|38|39)/.test(digits)) return [14]; // Diners Club
    if (/^6(?:011|5)/.test(digits)) return [16, 19]; // Discover

    // Unknown issuer: allow common PAN lengths.
    return [13, 14, 15, 16, 17, 18, 19];
  };

  const passesLuhnCheck = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i -= 1) {
      let digit = Number(digits[i]);
      if (Number.isNaN(digit)) return false;

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  };

  const isValidCardNumber = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    if (!/^\d+$/.test(digits)) return false;

    const expectedLengths = getExpectedCardLengths(digits);
    if (!expectedLengths.includes(digits.length)) return false;

    return passesLuhnCheck(digits);
  };

  const handleCardNumberChange = (value: string) => {
    setFormData({ ...formData, cardNumber: formatCardNumber(value) });
  };

  const handleCvvChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, "").slice(0, MAX_CVV_LENGTH);
    setFormData({ ...formData, cvv: onlyDigits });
  };

  const handleCardholderChange = (value: string) => {
    setFormData({ ...formData, cardholder: value.slice(0, MAX_CARDHOLDER_LENGTH) });
  };

  const confirmEdit = async () => {
    try {
      if (selectedMethod.type === 'card') {
        if (!formData.expiry || !formData.cardholder) {
          toast({
            title: "Error",
            description: "Por favor completa todos los campos requeridos",
            variant: "destructive",
          });
          return;
        }

        if (!validateExpiry(formData.expiry)) {
          toast({
            title: "Error",
            description: "La fecha de vencimiento es inválida o la tarjeta está expirada",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from('payment_methods')
          .update({
            expiry: formData.expiry,
            holder_name: formData.cardholder,
          })
          .eq('id', selectedMethod.id);

        if (error) throw error;
      } else {
        if (!formData.accountHolder) {
          toast({
            title: "Error",
            description: "Por favor completa todos los campos requeridos",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from('payment_methods')
          .update({
            holder_name: formData.accountHolder,
          })
          .eq('id', selectedMethod.id);

        if (error) throw error;
      }

      await loadPaymentMethods();
      toast({
        title: "Método Actualizado",
        description: "El método de pago ha sido actualizado.",
      });
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating payment method:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el método de pago",
        variant: "destructive",
      });
    }
  };

  const getCardIcon = (cardType: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

  const formatExpiry = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 4 digits (MMYY)
    if (digits.length > 4) return formData.expiry;
    
    // Format as MM/YY
    if (digits.length <= 2) {
      return digits;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
  };

  const validateExpiry = (expiry: string): boolean => {
    if (!expiry || expiry.length !== 5) return false;
    
    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    
    // Validate month
    if (month < 1 || month > 12) return false;
    
    // Validate year is not in the past
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    // If year is less than current year, it's expired
    if (year < currentYear) return false;
    
    // If year is current and month is less than current month, it's expired
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    setFormData({...formData, expiry: formatted});
  };

  const cardNumberDigits = formData.cardNumber.replace(/\D/g, "");
  const showInvalidCardNumber = methodType === "card" && cardNumberDigits.length >= 13 && !isValidCardNumber(cardNumberDigits);

  const PaymentMethodSkeleton = () => (
    <Card className="shadow-soft overflow-hidden">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded mb-2" />
              <div className="h-3 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" />
            <div className="h-3 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" />
            <div className="h-3 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
          <div className="flex-1 h-9 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" />
          <div className="h-9 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Métodos de Pago</h1>
            </div>
            <Button onClick={openAddDialog} size="sm" className="text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden sm:inline">Agregar</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </header>

          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pt-16 sm:pt-20 md:pt-0">
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
              {isLoading ? (
                <>
                  <PaymentMethodSkeleton />
                  <PaymentMethodSkeleton />
                </>
              ) : paymentMethods.length === 0 ? (
                <Card className="shadow-soft md:col-span-2">
                  <CardContent className="py-12 text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes métodos de pago</h3>
                    <p className="text-muted-foreground mb-4">
                      Agrega un método de pago para facilitar tus cobros automáticos
                    </p>
                    <Button onClick={openAddDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Método de Pago
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                paymentMethods.map((method) => (
                  <Card key={method.id} className={`shadow-soft ${method.is_default ? 'border-primary' : ''}`}>
                    <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {method.type === "card" ? (
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                              {getCardIcon(method.card_type)}
                            </div>
                          ) : (
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                              <span className="truncate">{method.type === "card" ? method.card_type : method.bank_name}</span>
                              {method.is_default && (
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary fill-primary flex-shrink-0" />
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              {method.type === "card" 
                                ? `•••• ${method.last_four}` 
                                : `CLABE •••• ${method.last_digits}`
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
                            <Badge className={method.validation_status === 'validada' ? 'bg-success/20 text-success border-success' : 'bg-yellow-500/20 text-yellow-700 border-yellow-500'}>
                              {method.validation_status === "validada" ? "Validada" : "Pendiente"}
                            </Badge>
                          </div>
                        )}
                        {method.is_default && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estado:</span>
                            <Badge className="bg-primary/20 text-primary border-primary">
                              Predeterminado
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                        {!method.is_default && (
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
                          className={`${method.is_default ? "flex-1" : ""} text-xs sm:text-sm`}
                          onClick={() => {
                            setSelectedMethod(method);
                            setMethodType(method.type as 'card' | 'bank');
                            if (method.type === 'card') {
                              setFormData({
                                ...formData,
                                expiry: method.expiry || "",
                                cardholder: method.holder_name || "",
                              });
                            } else {
                              setFormData({
                                ...formData,
                                accountHolder: method.holder_name || "",
                              });
                            }
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(method)}
                          disabled={method.is_default}
                          className="text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
                    <Input 
                      id="card-number" 
                      placeholder="1234 5678 9012 3456" 
                      maxLength={MAX_CARD_INPUT_LENGTH}
                      value={formData.cardNumber}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      disabled={!!selectedMethod}
                    />
                    {showInvalidCardNumber && (
                      <p className="text-xs text-danger mt-1">Numero de tarjeta invalido</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Vencimiento (MM/AA)</Label>
                      <Input 
                        id="expiry" 
                        placeholder="07/26" 
                        maxLength={5}
                        value={formData.expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                      />
                      {formData.expiry && formData.expiry.length === 5 && !validateExpiry(formData.expiry) && (
                        <p className="text-xs text-danger mt-1">Tarjeta expirada o fecha inválida</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        placeholder="123" 
                        maxLength={MAX_CVV_LENGTH}
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={formData.cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardholder">Nombre del Titular</Label>
                    <Input 
                      id="cardholder" 
                      placeholder="Como aparece en la tarjeta"
                      maxLength={MAX_CARDHOLDER_LENGTH}
                      autoComplete="cc-name"
                      value={formData.cardholder}
                      onChange={(e) => handleCardholderChange(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="bank-name">Banco</Label>
                    <Select value={formData.bankName} onValueChange={(value) => setFormData({...formData, bankName: value})}>
                      <SelectTrigger id="bank-name">
                        <SelectValue placeholder="Selecciona tu banco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BBVA">BBVA</SelectItem>
                        <SelectItem value="Banamex">Banamex</SelectItem>
                        <SelectItem value="Santander">Santander</SelectItem>
                        <SelectItem value="Banorte">Banorte</SelectItem>
                        <SelectItem value="HSBC">HSBC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="clabe">CLABE Interbancaria</Label>
                    <Input 
                      id="clabe" 
                      placeholder="18 dígitos" 
                      maxLength={18}
                      value={formData.clabe}
                      onChange={(e) => setFormData({...formData, clabe: e.target.value})}
                      disabled={!!selectedMethod}
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-holder">Nombre del Titular</Label>
                    <Input 
                      id="account-holder" 
                      placeholder="Como aparece en la cuenta"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                    />
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
              <Button onClick={confirmAdd} disabled={isTokenizingCard}>
                {isTokenizingCard ? "Tokenizando..." : "Agregar Metodo"}
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
                        {selectedMethod.card_type} •••• {selectedMethod.last_four}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="edit-expiry">Vencimiento (MM/AA)</Label>
                      <Input 
                        id="edit-expiry" 
                        value={formData.expiry} 
                        maxLength={5}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                      />
                      {formData.expiry && formData.expiry.length === 5 && !validateExpiry(formData.expiry) && (
                        <p className="text-xs text-danger mt-1">Tarjeta expirada o fecha inválida</p>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="edit-holder">Nombre del Titular</Label>
                  <Input 
                    id="edit-holder" 
                    value={selectedMethod.type === 'card' ? formData.cardholder : formData.accountHolder}
                    onChange={(e) => setFormData({...formData, [selectedMethod.type === 'card' ? 'cardholder' : 'accountHolder']: e.target.value})}
                  />
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
