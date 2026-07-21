import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  CreditCard,
  User,
  FileCheck,
  FileSignature,
  Wallet,
  Upload,
  Camera,
  FileText,
  Trash2,
  Loader2,
  PartyPopper,
  Crown,
  Star,
  Building2,
  Mail,
  Clock,
  TriangleAlert
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { defaultMemberships } from "@/data/memberships";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabaseConfig';
import { supabase } from "@/lib/supabase";
import { increscendoApiFetch, getSupabaseAccessToken } from "@/lib/increscendoApi";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const STEPS = [
  { id: 1, title: "Confirma", icon: DollarSign },
  { id: 2, title: "Membresía", icon: CreditCard },
  { id: 3, title: "Validación", icon: User },
  { id: 4, title: "Aprobación", icon: FileCheck },
  { id: 5, title: "Contrato", icon: FileSignature },
  { id: 6, title: "Desembolso", icon: Wallet },
];

const INTEREST_RATE = 0.42;
const ALLOWED_INSTALLMENTS = [3, 6, 9, 12, 18, 24];
const INSTITUTIONS_ENDPOINT = "/belvo/institutions";

type Institution = {
  id: string;
  name: string;
  status: string;
};

const DEFAULT_INSTITUTION_ID = "mx_santander";

const normalizeText = (value: string) => value.trim();
const isValidPhone = (value: string) => /^[0-9]{10}$/.test(value.replace(/\D/g, '').trim());
const isValidDate = (value: string) => {
  if (!value) return false;
  // Accept YYYY-MM-DD or common ISO-like formats. Parse as local date (avoid timezone shifts).
  const parts = value.trim().split(/[-/]/);
  if (parts.length < 3) return false;
  const [y, m, d] = parts.map(p => parseInt(p, 10));
  if (!y || !m || !d) return false;
  // construct a date using local timezone to avoid UTC offset issues
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return false;
  // Ensure the components match (guards against parsing like new Date('2020-02-31') -> Mar 2)
  if (dt.getFullYear() !== y || dt.getMonth() !== (m - 1) || dt.getDate() !== d) return false;
  // Birth date must be in the past (not today or future)
  const today = new Date();
  // zero time portion for comparison
  today.setHours(0, 0, 0, 0);
  return dt.getTime() < today.getTime();
};

const isOfMinimumAge = (value: string, minAge = 18) => {
  if (!isValidDate(value)) return false;
  const parts = value.trim().split(/[-/]/).map(p => parseInt(p, 10));
  const [y, m, d] = parts;
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= minAge;
};
const isValidCurp = (value: string) => value ? /^[A-Z0-9Ñ]{18}$/.test(value.trim().toUpperCase()) : false;
const isValidIne = (value: string) => value ? /^[A-Z0-9]{6,20}$/.test(value.trim().toUpperCase()) : false;
const isValidClabe = (value: string) => value ? /^\d{18}$/.test(value.trim()) : false;
const isSantanderBank = (bankId: string) => {
  const name = bankId?.toLowerCase() || '';
  return name.includes('santander');
};
const hasForbiddenClabePrefix = (value: string, bankId: string) => isSantanderBank(bankId) && /^814/.test(value.trim());
const isValidRfc = (value: string) => /^[A-Z0-9]{12,13}$/.test(value.trim().toUpperCase());
const hasDocumentSource = (file: File | null, url: string) => Boolean(file || normalizeText(url));

const FIELD_LABELS: Record<string, string> = {
  loanAmount: 'Monto',
  loanInstallments: 'Plazo',
  firstName: 'Nombre',
  lastName: 'Apellidos',
  address: 'Dirección',
  birthDate: 'Fecha de nacimiento',
  phone: 'Teléfono',
  rfc: 'RFC',
  ineKey: 'Clave INE',
  curp: 'CURP',
  paymentMethodId: 'Método de pago',
  bank: 'Banco',
  clabe: 'CLABE',
  disbursementBank: 'Banco de desembolso',
  disbursementClabe: 'CLABE de desembolso',
  reference_name: 'Nombre del obligado',
  reference_relationship: 'Relación del obligado',
  reference_phone: 'Teléfono del obligado',
  references: 'Obligado solidario',
  ineFront: 'INE frontal',
  ineBack: 'INE reverso',
  selfieWithIne: 'Selfie con INE',
  curpFile: 'Documento CURP',
};

const LoanProcess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasMembership, setHasMembership] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<string | null>(null);
  const [userMembership, setUserMembership] = useState<any | null>(null);
  const [currentLoan, setCurrentLoan] = useState<any | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const submittedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState<boolean>(true);
  const [bankPaymentMethods, setBankPaymentMethods] = useState<any[]>([]);
  const [loadingBankPaymentMethods, setLoadingBankPaymentMethods] = useState<boolean>(true);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get loan data from navigation state or use defaults (guard against partial state)
  const navState: any = (location && (location.state as any)) || {};
  const initialLoanData = useMemo(() => ({
    amount: navState.amount ?? 10000,
    installments: navState.installments ?? 12,
    monthlyPayment: navState.monthlyPayment ?? 952.38,
    interestRate: navState.interestRate ?? 42,
    totalToPay: navState.totalToPay ?? 11428.56,
  }), [navState.amount, navState.installments, navState.monthlyPayment, navState.interestRate, navState.totalToPay]);

  // Convert interest rate from percentage to decimal for calculations
  const [interestRateDecimal, setInterestRateDecimal] = useState(initialLoanData.interestRate / 100);

  // If navigation included resumeLoanId, fetch loan and prefill for resume
  useEffect(() => {
    const s: any = location.state || {};
    const resumeLoanId: string | undefined = s.resumeLoanId ?? (localStorage.getItem('resume_loan_id') || undefined);
    const resumeStep: number = s.resumeStep ?? 4;

    // Set step immediately to avoid flash of step 1
    if (resumeLoanId) setCurrentStep(resumeStep);

    const resume = async () => {
      try {
        if (!resumeLoanId) return;

        const { data: loanRow, error } = await supabase.from('loans').select('*').eq('id', resumeLoanId).maybeSingle();
        if (error) throw error;
        if (!loanRow) return;

        // Prefill editable fields
        setLoanAmount(String(loanRow.amount ?? initialLoanData.amount));
        setLoanInstallments(String(loanRow.installments ?? initialLoanData.installments));
        setMonthlyPayment(Number(loanRow.monthly_payment ?? initialLoanData.monthlyPayment));
        setTotalToPay(Number(loanRow.total_to_pay ?? initialLoanData.totalToPay));

        // Prefill metadata KYC and accounts if available
        const md = loanRow.metadata ?? {};
        if (md.personalData) setPersonalData(prev => ({ ...prev, ...(md.personalData || {}) }));
        if (md.depositData) setDepositData(prev => ({ ...prev, ...(md.depositData || {}) }));
        if (md.disbursementData) setDisbursementData(prev => ({ ...prev, ...(md.disbursementData || {}) }));

        setCurrentLoan(loanRow);
        if (loanRow.status === 'signed') {
          setIsApproved(true);
          setCurrentStep(6);
        } else {
          setCurrentStep(resumeStep);
        }

        // If still pending, show analyzing loader; if approved, set flag for signature pending
        if (loanRow.status === 'pending' || loanRow.status === 'under_review') {
          setIsAnalyzing(true);
          // start polling for status changes
          if (pollIntervalRef.current == null) {
            const id = window.setInterval(async () => {
              try {
                const { data: refreshed } = await supabase.from('loans').select('status').eq('id', resumeLoanId).maybeSingle();
                if (refreshed?.status && refreshed.status !== loanRow.status) {
                  setIsAnalyzing(false);
                  if (refreshed.status === 'approved') {
                    setIsApproved(true);
                    setCurrentStep(4);
                  } else if (refreshed.status === 'signed') {
                    setIsApproved(true);
                    setCurrentStep(6);
                  }
                  // stop polling if approved or otherwise
                  if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
                }
              } catch (e) { console.warn('poll error', e); }
            }, 10000);
            pollIntervalRef.current = id;
          }
        }
      } catch (e) {
        console.error('resume load error', e);
      }
    };
    resume();
    return () => {
      if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    };
  }, [location.state]);

  const SAVED_STATE_KEY = 'loan_process_state';

  const saveLoanProcessState = () => {
    try {
      sessionStorage.setItem(SAVED_STATE_KEY, JSON.stringify({
        currentStep,
        loanAmount,
        loanInstallments,
        monthlyPayment,
        totalToPay,
        interestRateDecimal,
        personalData,
        depositData,
        disbursementData,
        references,
        includeSolidario,
        selectedMembership,
        hasMembership,
        useSameAccount,
        depositSource,
      }));
    } catch { }
  };

  // Restore full state from sessionStorage when returning from membership-checkout
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SAVED_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.currentStep) setCurrentStep(state.currentStep);
        if (state.loanAmount) setLoanAmount(state.loanAmount);
        if (state.loanInstallments) setLoanInstallments(state.loanInstallments);
        if (state.monthlyPayment) setMonthlyPayment(state.monthlyPayment);
        if (state.totalToPay) setTotalToPay(state.totalToPay);
        if (state.interestRateDecimal) setInterestRateDecimal(state.interestRateDecimal);
        if (state.personalData) setPersonalData(state.personalData);
        if (state.depositData) setDepositData(state.depositData);
        if (state.disbursementData) setDisbursementData(state.disbursementData);
        if (state.references) setReferences(state.references);
        if (typeof state.includeSolidario === 'boolean') setIncludeSolidario(state.includeSolidario);
        if (typeof state.selectedMembership === 'string') setSelectedMembership(state.selectedMembership);
        if (typeof state.hasMembership === 'boolean') setHasMembership(state.hasMembership);
        if (typeof state.useSameAccount === 'boolean') setUseSameAccount(state.useSameAccount);
        if (state.depositSource) setDepositSource(state.depositSource);
        sessionStorage.removeItem(SAVED_STATE_KEY);
      }
    } catch { }
  }, []);

  // Editable loan data state for Step 1
  const [loanAmount, setLoanAmount] = useState(String(initialLoanData.amount ?? 10000));
  const [loanInstallments, setLoanInstallments] = useState(String(initialLoanData.installments ?? 12));
  const [monthlyPayment, setMonthlyPayment] = useState(Number(initialLoanData.monthlyPayment ?? 952.38));
  const [totalToPay, setTotalToPay] = useState(Number(initialLoanData.totalToPay ?? 11428.56));

  // Personal data state for KYC
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    birthDate: "",
    phone: "",
    rfc: "",
    ineKey: "",
    curp: "",
    ineFrontUrl: "",
    ineBackUrl: "",
    selfieWithIneUrl: "",
    curpUrl: "",
  });

  const [references, setReferences] = useState([
    { name: "", relationship: "", phone: "" },
  ]);
  const [includeSolidario, setIncludeSolidario] = useState(false);

  // Local files (keep only client-side until user decides to upload)
  const [ineFrontFile, setIneFrontFile] = useState<File | null>(null);
  const [ineBackFile, setIneBackFile] = useState<File | null>(null);
  const [selfieWithIneFile, setSelfieWithIneFile] = useState<File | null>(null);
  const [curpFile, setCurpFile] = useState<File | null>(null);
  const [ineFrontPreview, setIneFrontPreview] = useState<string | null>(null);
  const [ineBackPreview, setIneBackPreview] = useState<string | null>(null);
  const [selfieWithInePreview, setSelfieWithInePreview] = useState<string | null>(null);
  const [curpPreview, setCurpPreview] = useState<string | null>(null);

  // Camera capture state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'ineFront' | 'ineBack' | 'selfieWithIne' | 'curp' | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Deposit data for Step 3
  const [depositData, setDepositData] = useState({
    paymentMethodId: "",
    paymentMethodLabel: "",
    bank: DEFAULT_INSTITUTION_ID,
    clabe: "",
  });
  const [depositSource, setDepositSource] = useState<'saved' | 'new'>('new');
  const [isDepositMethodModalOpen, setIsDepositMethodModalOpen] = useState(false);

  // Disbursement account state
  const [useSameAccount, setUseSameAccount] = useState(true);
  const [disbursementData, setDisbursementData] = useState({
    bank: "",
    clabe: "",
  });

  const handleDisbursementDataChange = (field: string, value: string) => {
    setDisbursementData(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonalDataChange = (field: string, value: string) => {
    setPersonalData(prev => ({ ...prev, [field]: value }));
  };

  const updateReference = (index: number, field: "name" | "relationship" | "phone", value: string) => {
    setReferences(prev => prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref)));
  };

  useEffect(() => {
    if (!includeSolidario) return;

    setReferences(prev => {
      if (prev.length === 1) return prev;
      if (prev.length === 0) return [{ name: "", relationship: "", phone: "" }];
      return [prev[0]];
    });
  }, [includeSolidario]);

  const handleDepositDataChange = (field: string, value: string) => {
    setDepositData(prev => ({ ...prev, [field]: value }));
  };

  const handleDepositMethodChange = (methodId: string) => {
    const selectedMethod = bankPaymentMethods.find(method => method.id === methodId) ?? null;

    if (!selectedMethod) {
      setDepositData(prev => ({
        ...prev,
        paymentMethodId: "",
        paymentMethodLabel: "",
        bank: "",
        clabe: "",
      }));
      return;
    }

    setDepositData(prev => ({
      ...prev,
      paymentMethodId: selectedMethod.id,
      paymentMethodLabel: `${selectedMethod.bank_name || "Banco"} · CLABE •••• ${selectedMethod.clabe?.slice?.(-4) || selectedMethod.last_digits || "----"}`,
      bank: selectedMethod.bank_name || "",
      clabe: selectedMethod.clabe || selectedMethod.last_digits || "",
    }));
  };

  const handleDepositSourceChange = (source: 'saved' | 'new') => {
    setDepositSource(source);

    if (source === 'new') {
      setDepositData(prev => ({
        ...prev,
        paymentMethodId: "",
        paymentMethodLabel: "",
        bank: prev.bank || DEFAULT_INSTITUTION_ID,
      }));
    }
  };

  const selectedSavedMethod = useMemo(() => bankPaymentMethods.find(method => method.id === depositData.paymentMethodId) ?? null, [bankPaymentMethods, depositData.paymentMethodId]);

  const validateStepOne = () => {
    const nextErrors: Record<string, string> = {};
    const amountValue = Number(loanAmount);
    const installmentsValue = Number(loanInstallments);

    if (!amountValue || amountValue <= 0) {
      nextErrors.loanAmount = "Ingresa un monto mayor a 0.";
    }

    if (!ALLOWED_INSTALLMENTS.includes(installmentsValue)) {
      nextErrors.loanInstallments = "Selecciona un plazo válido.";
    }

    return nextErrors;
  };

  const validateStepThree = () => {
    const nextErrors: Record<string, string> = {};
    const selectedBankMethod = bankPaymentMethods.find(method => method.id === depositData.paymentMethodId) ?? null;
    const hasLegacyBankData = Boolean(normalizeText(depositData.bank)) && isValidClabe(depositData.clabe);

    if (!normalizeText(personalData.firstName)) nextErrors.firstName = "El nombre es obligatorio.";
    if (!normalizeText(personalData.lastName)) nextErrors.lastName = "Los apellidos son obligatorios.";
    if (!normalizeText(personalData.address)) nextErrors.address = "La dirección es obligatoria.";
    if (!isValidDate(personalData.birthDate)) {
      nextErrors.birthDate = "Ingresa una fecha de nacimiento válida.";
    } else if (!isOfMinimumAge(personalData.birthDate, 18)) {
      nextErrors.birthDate = "Debes ser mayor de 18 años.";
    }
    if (!isValidPhone(personalData.phone)) nextErrors.phone = "Ingresa un teléfono válido.";
    if (!isValidRfc(personalData.rfc)) nextErrors.rfc = "Ingresa un RFC válido.";
    if (!isValidIne(personalData.ineKey)) nextErrors.ineKey = "Ingresa una clave INE válida.";
    if (!isValidCurp(personalData.curp)) nextErrors.curp = "Ingresa una CURP válida de 18 caracteres.";

    if (depositSource === 'saved') {
      if (!selectedBankMethod && !hasLegacyBankData) {
        nextErrors.paymentMethodId = "Selecciona un método bancario guardado.";
      } else if (selectedBankMethod?.validation_status === 'pendiente') {
        nextErrors.paymentMethodId = "Selecciona un banco validado desde tus métodos de pago.";
      }
    } else {
      if (!normalizeText(depositData.bank)) nextErrors.bank = "Selecciona un banco.";
      if (!isValidClabe(depositData.clabe)) nextErrors.clabe = "La CLABE debe tener 18 dígitos.";
      else if (hasForbiddenClabePrefix(depositData.clabe, depositData.bank)) nextErrors.clabe = "El prefijo 814 no está permitido para Santander. Usa la CLABE con prefijo 014.";
    }

    if (depositSource === 'saved' && !isValidClabe(depositData.clabe)) {
      nextErrors.clabe = "La CLABE debe tener 18 dígitos.";
    }

    if (includeSolidario) {
      const solidario = references[0];
      if (!solidario) {
        nextErrors.references = "Agrega un obligado solidario.";
      } else {
        if (!normalizeText(solidario.name)) nextErrors.reference_name = "El nombre del obligado solidario es obligatorio.";
        if (!normalizeText(solidario.relationship)) nextErrors.reference_relationship = "Indica la relación.";
        if (!isValidPhone(solidario.phone)) nextErrors.reference_phone = "Ingresa un teléfono válido.";
      }
    }

    if (!hasDocumentSource(ineFrontFile, personalData.ineFrontUrl)) nextErrors.ineFront = "Adjunta la parte frontal de tu INE.";
    if (!hasDocumentSource(ineBackFile, personalData.ineBackUrl)) nextErrors.ineBack = "Adjunta el reverso de tu INE.";
    if (!hasDocumentSource(selfieWithIneFile, personalData.selfieWithIneUrl)) nextErrors.selfieWithIne = "Adjunta tu selfie con INE.";
    if (!hasDocumentSource(curpFile, personalData.curpUrl) && !normalizeText(personalData.curp)) nextErrors.curpFile = "Adjunta tu CURP o completa el campo.";

    if (!useSameAccount) {
      if (!normalizeText(disbursementData.bank)) nextErrors.disbursementBank = "Selecciona un banco para el desembolso.";
      if (!isValidClabe(disbursementData.clabe)) nextErrors.disbursementClabe = "La CLABE de desembolso debe tener 18 dígitos.";
      else if (hasForbiddenClabePrefix(disbursementData.clabe, disbursementData.bank)) nextErrors.disbursementClabe = "El prefijo 814 no está permitido para Santander. Usa la CLABE con prefijo 014.";
    }

    return nextErrors;
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) return validateStepOne();
    if (currentStep === 3) return validateStepThree();
    return {};
  };

  useEffect(() => {
    if (currentStep !== 3) return;

    setValidationErrors(validateStepThree());
  }, [
    currentStep,
    personalData.firstName,
    personalData.lastName,
    personalData.address,
    personalData.birthDate,
    personalData.phone,
    personalData.ineKey,
    personalData.curp,
    personalData.ineFrontUrl,
    personalData.ineBackUrl,
    personalData.selfieWithIneUrl,
    personalData.curpUrl,
    depositData.paymentMethodId,
    depositData.bank,
    depositData.clabe,
    depositSource,
    includeSolidario,
    references,
    ineFrontFile,
    ineBackFile,
    selfieWithIneFile,
    curpFile,
    useSameAccount,
    disbursementData.bank,
    disbursementData.clabe,
    bankPaymentMethods,
  ]);

  // Map API error messages to Spanish user-friendly messages
  const getErrorMessage = (errorData: any): string => {
    // If the API returns { ok: false, error: "..." } - extract the error directly
    if (typeof errorData?.error === 'string' && errorData.error.length > 0) {
      return errorData.error;
    }

    // Extract the error message, prioritizing details.message
    const detailedMessage = errorData?.details?.message || errorData?.message || '';
    const errorMessage = (detailedMessage || errorData?.error || '').toLowerCase().trim();

    // Map common errors (all keys in lowercase for case-insensitive matching)
    const errorMap: Record<string, string> = {
      'clabe': 'La CLABE no es válida. Verifica que tenga 18 dígitos.',
      'invalid clabe': 'La CLABE proporcionada no es válida. Verifica los 18 dígitos.',
      'clabe is invalid': 'La CLABE no es válida. Verifica que tenga 18 dígitos.',
      'bank account number does not follow the correct format': 'El número de cuenta no tiene el formato correcto. Verifica los datos.',
      'bank account already registered': 'Esta cuenta bancaria ya ha sido registrada. Por favor, usa otra CLABE.',
      'invalid bank': 'El banco seleccionado no es válido. Por favor, selecciona otro.',
      'user not found': 'Usuario no encontrado. Por favor, intenta de nuevo.',
      'failed to create payment method': 'No se pudo crear el método de pago. Verifica los datos e intenta de nuevo.',
      'failed to create client': 'No se pudo crear la solicitud. Intenta de nuevo más tarde.',
      'payment method already exists': 'Ya existe un método de pago con estos datos.',
      'missing required fields': 'Faltan campos requeridos. Revisa la información ingresada.',
      'unauthorized': 'No estás autorizado para realizar esta acción.',
      'bad request': 'Los datos enviados no son válidos. Revisa la información.',
      'network': 'Error de conexión. Verifica tu internet.',
      'timeout': 'La solicitud tardó demasiado. Intenta de nuevo.',
      'not found': 'No se encontró el recurso. Intenta de nuevo.',
      'conflict': 'Ya existe un registro con estos datos.',
      'unprocessable entity': 'Los datos no son válidos. Revisa la información.',
      'internal server error': 'Error del servidor. Intenta más tarde.',
      'service unavailable': 'Servicio temporalmente unavailable. Intenta más tarde.',
    };

    // Check if error message matches any known pattern (case-insensitive)
    for (const [key, spanish] of Object.entries(errorMap)) {
      if (errorMessage.includes(key.toLowerCase())) {
        return spanish;
      }
    }

    // Fallback: if we have a detailed message, use it; otherwise generic
    if (detailedMessage) {
      return detailedMessage;
    }
    if (errorData?.error) {
      return errorData.error;
    }

    return 'Ocurrió un error. Por favor, intenta de nuevo.';
  };

  const createLoanRecord = async () => {
    try {
      if (!userId) {
        toast({ title: 'Error', description: 'Usuario no autenticado.', variant: 'destructive' });
        return;
      }

      const formData = new FormData();

      // Campos de texto
      formData.append('user_id', userId);
      formData.append('amount', String(Number(loanAmount) || 0));
      formData.append('installments', String(Number(loanInstallments) || 12));
      if (monthlyPayment) formData.append('monthly_payment', String(Number(monthlyPayment)));
      if (totalToPay) formData.append('total_to_pay', String(Number(totalToPay)));

      // Objetos como JSON strings
      formData.append('personalData', JSON.stringify({
        firstName: personalData.firstName,
        lastName: personalData.lastName,
        address: personalData.address,
        birthDate: personalData.birthDate,
        phone: personalData.phone,
        rfc: personalData.rfc,
        curp: personalData.curp,
        ineKey: personalData.ineKey,
      }));

      formData.append('depositData', JSON.stringify({
        bank: depositData.bank,
        clabe: depositData.clabe,
        holder_name: `${personalData.firstName} ${personalData.lastName}`.trim(),
      }));

      if (disbursementData.bank || disbursementData.clabe) {
        formData.append('disbursementData', JSON.stringify({
          bank: disbursementData.bank,
          clabe: disbursementData.clabe,
        }));
      }

      if (depositSource === 'saved' && depositData.paymentMethodId) {
        formData.append('paymentMethodId', depositData.paymentMethodId);
      }

      // Archivos (cada uno opcional)
      if (ineFrontFile) formData.append('ineFront', ineFrontFile);
      if (ineBackFile) formData.append('ineBack', ineBackFile);
      if (selfieWithIneFile) formData.append('selfieWithIne', selfieWithIneFile);
      if (curpFile) formData.append('curp', curpFile);

      // Fetch con auth token y timeout extendido para archivos
      const token = await getSupabaseAccessToken();
      const response = await fetch('https://increscendo-api.vercel.app/belvo/loan-request', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
        signal: AbortSignal.timeout(60000),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = getErrorMessage(result);
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        return null;
      }

      setCurrentLoan(result.loan);
      toast({ title: 'Solicitud creada', description: 'Tu solicitud quedó registrada.' });

      try { localStorage.removeItem('resume_loan_id'); } catch { }

      return result.loan;
    } catch (err) {
      console.error(err);
      const errorDesc = getErrorMessage(err);
      toast({ title: 'Error', description: errorDesc, variant: 'destructive' });
      return null;
    }
  };

  const handleFileSelect = (target: 'ineFront' | 'ineBack' | 'selfieWithIne' | 'curp', file: File) => {
    const url = URL.createObjectURL(file);
    if (target === 'ineFront') {
      setIneFrontFile(file);
      setIneFrontPreview(url);
    } else if (target === 'ineBack') {
      setIneBackFile(file);
      setIneBackPreview(url);
    } else if (target === 'selfieWithIne') {
      setSelfieWithIneFile(file);
      setSelfieWithInePreview(url);
    } else if (target === 'curp') {
      setCurpFile(file);
      setCurpPreview(url);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, target: 'ineFront' | 'ineBack' | 'selfieWithIne' | 'curp') => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(target, file);
    e.currentTarget.value = '';
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      setMediaStream(null);
    }
  };

  const openCamera = async (target: 'ineFront' | 'ineBack' | 'selfieWithIne' | 'curp') => {
    setCameraTarget(target);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setIsCameraOpen(false);
      stopCamera();
      toast({ title: 'Error', description: 'No se pudo acceder a la cámara.', variant: 'destructive' });
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraTarget) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${cameraTarget}_${Date.now()}.jpg`, { type: blob.type });
      handleFileSelect(cameraTarget, file);
      stopCamera();
      setIsCameraOpen(false);
    }, 'image/jpeg', 0.9);
  };

  const removeFile = (target: 'ineFront' | 'ineBack' | 'selfieWithIne' | 'curp') => {
    if (target === 'ineFront') {
      if (ineFrontPreview) URL.revokeObjectURL(ineFrontPreview);
      setIneFrontFile(null);
      setIneFrontPreview(null);
    } else if (target === 'ineBack') {
      if (ineBackPreview) URL.revokeObjectURL(ineBackPreview);
      setIneBackFile(null);
      setIneBackPreview(null);
    } else if (target === 'selfieWithIne') {
      if (selfieWithInePreview) URL.revokeObjectURL(selfieWithInePreview);
      setSelfieWithIneFile(null);
      setSelfieWithInePreview(null);
    } else if (target === 'curp') {
      if (curpPreview) URL.revokeObjectURL(curpPreview);
      setCurpFile(null);
      setCurpPreview(null);
    }
  };

  // Calculate payment based on amount and installments
  const calculatePayment = () => {
    const principal = parseFloat(loanAmount) || 0;
    const months = parseInt(loanInstallments) || 12;
    const monthlyRate = interestRateDecimal / 12;

    if (principal > 0) {
      const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      setMonthlyPayment(payment);
      setTotalToPay(payment * months);
    } else {
      setMonthlyPayment(0);
      setTotalToPay(0);
    }
  };

  useEffect(() => {
    calculatePayment();
  }, [loanAmount, loanInstallments, interestRateDecimal]);

  useEffect(() => {
    let mounted = true;
    const loadInstitutions = async () => {
      try {
        setLoadingInstitutions(true);
        const response = await increscendoApiFetch(INSTITUTIONS_ENDPOINT);
        if (!response.ok) throw new Error(`institutions status ${response.status}`);

        const body = await response.json();
        const mapped = Array.isArray(body) ? body : (body?.data ?? []);
        const activeInstitutions = mapped.filter((item: Institution) => item?.status === 'active' && item?.name);
        if (mounted) setInstitutions(activeInstitutions);
      } catch (err) {
        console.error('Error loading institutions:', err);
        if (mounted) setInstitutions([]);
      } finally {
        if (mounted) setLoadingInstitutions(false);
      }
    };

    loadInstitutions();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadBankPaymentMethods = async () => {
      try {
        setLoadingBankPaymentMethods(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;

        const { data, error } = await supabase
          .from('payment_methods')
          .select('id, bank_name, clabe, last_digits, validation_status, is_default, created_at')
          .eq('user_id', userId)
          .eq('type', 'bank')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (mounted) setBankPaymentMethods(data ?? []);
      } catch (err) {
        console.error('Error loading bank payment methods:', err);
      } finally {
        if (mounted) setLoadingBankPaymentMethods(false);
      }
    };

    loadBankPaymentMethods();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (depositSource !== 'saved') return;
    if (depositData.paymentMethodId || !bankPaymentMethods.length) return;

    const matchedMethod = bankPaymentMethods.find(method => {
      const methodLastDigits = method.clabe?.slice?.(-4) || method.last_digits || "";
      const depositLastDigits = depositData.clabe?.slice?.(-4) || "";

      return Boolean(depositData.bank)
        && method.bank_name === depositData.bank
        && (
          method.clabe === depositData.clabe ||
          (methodLastDigits && depositLastDigits && methodLastDigits === depositLastDigits)
        );
    });

    if (matchedMethod) {
      handleDepositMethodChange(matchedMethod.id);
    }
  }, [depositSource, bankPaymentMethods, depositData.bank, depositData.clabe, depositData.paymentMethodId]);

  useEffect(() => {
    if (depositSource === 'new' && depositData.paymentMethodId) {
      setDepositData(prev => ({
        ...prev,
        paymentMethodId: '',
        paymentMethodLabel: '',
      }));
    }
  }, [depositSource, depositData.paymentMethodId]);

  const bankOptions = useMemo(() => institutions
    .filter((institution) => institution.status === 'active')
    .map((institution) => ({ id: institution.id, name: institution.name })),
    [institutions]
  );

  const getInstitutionName = useCallback((institutionId: string) => {
    const institution = institutions.find((item) => item.id === institutionId);
    return institution?.name || institutionId;
  }, [institutions]);

  const isSubmittingRef = useRef(false);

  const handleNext = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
    const nextErrors = validateCurrentStep();
    setValidationErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const fieldNames = Object.keys(nextErrors)
        .map(key => FIELD_LABELS[key] || key)
        .join(', ');
      toast({
        title: 'Revisa los campos',
        description: `Corrige: ${fieldNames}.`,
      });
      return;
    }

    if (currentStep === 2 && !hasMembership && !selectedMembership) {
      toast({
        title: 'Membresía requerida',
        description: 'Selecciona o adquiere una membresía para continuar.',
      });
      return;
    }

    if (currentStep === 4 && !isApproved) {
      // When user clicks "Iniciar" on step 4, create loan if needed and start polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      let loan = currentLoan;
      if (!loan) {
        setIsSubmitting(true);
        loan = await createLoanRecord();
        setIsSubmitting(false);
        if (!loan) return; // creation failed
      }

      setIsAnalyzing(true);

      const checkStatus = async () => {
        try {
          const { data, error } = await supabase.from('loans').select('status').eq('id', loan.id).maybeSingle();
          if (error) {
            console.error('poll error', error);
            return;
          }
          const status = data?.status;
          if (status === 'approved' || status === 'active') {
            setIsAnalyzing(false);
            setIsApproved(true);
            setIsSubmitted(false);
            // refresh current loan with latest status
            const { data: full, error: fullErr } = await supabase.from('loans').select('*').eq('id', loan.id).maybeSingle();
            if (!fullErr && full) setCurrentLoan(full);

            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        } catch (e) {
          console.error('status check error', e);
        }
      };

      // Show loading for 3.5 seconds before showing submitted state
      submittedTimeoutRef.current = setTimeout(() => {
        if (!isApproved) {
          setIsAnalyzing(false);
          setIsSubmitted(true);
        }
      }, 3500);

      // run initial check immediately
      await checkStatus();

      // start polling every 10s
      if (!isApproved && !pollIntervalRef.current) {
        pollIntervalRef.current = window.setInterval(checkStatus, 10000) as unknown as number;
      }

      return;
    }

    if (currentStep < 6) {
      // If moving from Contract step, mark as signed in DB
      if (currentStep === 5) {
        // try to determine loan id from currentLoan or resume marker
        const loanId = currentLoan?.id ?? (() => { try { return localStorage.getItem('resume_loan_id') || null; } catch { return null; } })();
        if (loanId) {
          try {
            const { error } = await supabase.from('loans').update({ status: 'signed', signed_at: new Date().toISOString() }).eq('id', loanId);
            if (error) throw error;
            // update local state if currentLoan matches
            if (currentLoan && currentLoan.id === loanId) {
              setCurrentLoan(prev => prev ? ({ ...prev, status: 'signed', signed_at: new Date().toISOString() }) : prev);
            }
            // notify other views to reload
            try { window.dispatchEvent(new Event('reloadLoans')); } catch { }
            toast({ title: 'Firma registrada', description: 'La solicitud ha sido marcada como firmada.' });
          } catch (e) {
            console.error('Error marking loan signed', e);
            toast({ title: 'Error', description: 'No se pudo registrar la firma.', variant: 'destructive' });
          }
        } else {
          toast({ title: 'Error', description: 'No se encontró la solicitud para marcar como firmada.', variant: 'destructive' });
        }
      }
      setCurrentStep(prev => prev + 1);
    }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToSimulator = () => {
    navigate("/loan-request");
  };

  useEffect(() => {
    let mounted = true;
    const loadMembershipsAndUser = async () => {
      try {
        setLoadingMemberships(true);

        // fetch plans and map to UI-friendly shape (same as Memberships.tsx)
        const { data: plans } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('active', true)
          .order('price', { ascending: true });

        if (plans && mounted) {
          const mapped = (plans as any[]).map((p: any) => {
            const features = p.features ?? {};
            const benefits = Array.isArray(features?.benefits)
              ? features.benefits
              : Array.isArray(p.features)
                ? p.features
                : [];

            let renewalPeriod = 'Anual';
            if (typeof p.duration_days === 'number') {
              if (p.duration_days >= 365) renewalPeriod = 'Anual';
              else if (p.duration_days >= 30) renewalPeriod = 'Mensual';
              else renewalPeriod = `${p.duration_days} días`;
            }

            return {
              id: p.id,
              title: p.name ?? p.title,
              name: p.name ?? p.title,
              cost: Number(p.price ?? p.cost ?? 0),
              currency: p.currency ?? 'MXN',
              targetAudience: features?.targetAudience ?? p.description ?? '',
              interestRate: Number(features?.interestRate ?? 0),
              renewalPeriod,
              benefits,
              isActive: !!p.active,
            };
          });
          setMembershipPlans(mapped as any[]);
        }

        // fetch user membership
        if (!userId || !mounted) return;

        const { data: umRow } = await supabase
          .from('user_memberships')
          .select('id, membership_plan_id, status, started_at, expires_at')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (umRow && mounted) {
          setUserMembership(umRow);
          setHasMembership(true);
        }
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoadingMemberships(false);
      }
    };

    loadMembershipsAndUser();
  }, []);

  // cleanup polling interval and timeouts on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (submittedTimeoutRef.current) {
        clearTimeout(submittedTimeoutRef.current);
        submittedTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentLoan?.status === 'signed' && currentStep === 5) {
      setCurrentStep(6);
    }
  }, [currentLoan?.status, currentStep]);

  useEffect(() => {
    if (currentStep !== 5 || !currentLoan?.id) return;

    const id = window.setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('loans')
          .select('status')
          .eq('id', currentLoan.id)
          .maybeSingle();
        if (error) throw error;
        if (data?.status === 'signed') {
          setCurrentLoan(prev => prev ? ({ ...prev, status: 'signed' }) : prev);
          setCurrentStep(6);
        }
      } catch (e) {
        console.warn('sign status poll error', e);
      }
    }, 5000);

    return () => {
      clearInterval(id);
    };
  }, [currentStep, currentLoan?.id]);

  // Load current user's profile and prefill personal data for Step 3
  useEffect(() => {
    let mounted = true;
    const loadUserProfile = async () => {
      try {
        if (!userId) return;

        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, address, birth_date, phone, rfc, ine_key, curp, phone_country_code, ine_front_url, ine_back_url, selfie_url, curp_url')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;
        if (!data || !mounted) return;

        // Set document URLs if they exist in the database
        const ineFrontUrl = data.ine_front_url || '';
        const ineBackUrl = data.ine_back_url || '';
        const selfieWithIneUrl = data.selfie_url || '';
        const curpUrl = data.curp_url || '';

        // Set previews from database URLs if no local file is selected
        if (ineFrontUrl && !ineFrontFile) setIneFrontPreview(ineFrontUrl);
        if (ineBackUrl && !ineBackFile) setIneBackPreview(ineBackUrl);
        if (selfieWithIneUrl && !selfieWithIneFile) setSelfieWithInePreview(selfieWithIneUrl);
        if (curpUrl && !curpFile) setCurpPreview(curpUrl);

        setPersonalData({
          firstName: data.first_name ?? '',
          lastName: data.last_name ?? '',
          address: data.address ?? '',
          birthDate: data.birth_date ? new Date(data.birth_date).toISOString().slice(0, 10) : '',
          phone: data.phone ?? '',
          rfc: data.rfc ?? '',
          ineKey: data.ine_key ?? '',
          curp: data.curp ?? '',
          ineFrontUrl,
          ineBackUrl,
          selfieWithIneUrl,
          curpUrl,
        });
      } catch (err) {
        // ignore errors (unauthenticated/demo)
      }
    };

    loadUserProfile();
    return () => { mounted = false; };
  }, []);

  // Stepper Component
  const Stepper = () => (
    <div className="w-full py-5 px-2 sm:px-4 overflow-hidden border-b border-border/50">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm md:text-base transition-all ${currentStep === step.id
                  ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2"
                  : currentStep > step.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-white text-muted-foreground border-2 border-muted shadow-sm"
                  }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                ) : (
                  step.id
                )}
              </div>
              <span className={`text-[10px] sm:text-xs mt-2 text-center hidden sm:block ${currentStep === step.id ? "text-primary font-semibold" : currentStep > step.id ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 rounded transition-all hidden sm:block -mt-3 sm:-mt-4 ${currentStep > step.id ? "bg-primary shadow-sm" : "bg-white shadow-md border border-muted/40"
                  }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Step 1: Confirm Loan (Updated with editable fields)
  const StepConfirm = () => (
    <Card className="shadow-soft">
      <CardHeader className="p-4 sm:p-6 md:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              Vista Previa del Préstamo
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Revisa y ajusta los detalles antes de continuar
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoToSimulator}
            className="self-start text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2 h-9 px-3 -ml-2 sm:order-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Simulador</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 md:p-7 space-y-4">
        {/* Editable Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loan-amount" className="text-sm">Monto del Préstamo</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="loan-amount"
                type="number"
                placeholder="10,000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="pl-7 text-base sm:text-lg font-semibold h-10"
              />
            </div>
            {validationErrors.loanAmount && <p className="text-xs text-destructive">{validationErrors.loanAmount}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan-installments" className="text-sm">Número de Cuotas</Label>
            <Select value={loanInstallments} onValueChange={setLoanInstallments}>
              <SelectTrigger id="loan-installments" className="h-10">
                <SelectValue placeholder="Selecciona el número de cuotas" />
              </SelectTrigger>
              <SelectContent>
                {[3, 6, 9, 12, 18, 24].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} cuotas
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.loanInstallments && <p className="text-xs text-destructive">{validationErrors.loanInstallments}</p>}
          </div>
        </div>

        {/* Summary Display */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl p-4 space-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">Pago Mensual Estimado</span>
            <span className="text-2xl sm:text-3xl font-bold text-primary">
              ${monthlyPayment.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Plazo</p>
              <p className="font-semibold text-sm mt-0.5">{loanInstallments} meses</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Tasa Anual</p>
              <p className="font-semibold text-sm mt-0.5">{initialLoanData.interestRate}%</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
              <p className="font-semibold text-sm mt-0.5">${totalToPay.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Step 2: Membership
  const StepMembership = () => (
    <Card className="shadow-medium">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CreditCard className="h-5 w-5 text-primary" />
          Adquiere tu Membresía
        </CardTitle>
        <CardDescription>Selecciona una membresía para continuar con tu préstamo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {userMembership || hasMembership ? (
          <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
            <div>
              <p className="font-semibold">Membresía Activa</p>
              <p className="text-sm text-muted-foreground">Ya cuentas con una membresía vigente</p>
              {userMembership?.expires_at && (
                <p className="text-sm text-success mt-1">Expira {new Date(userMembership.expires_at).toLocaleDateString('es-MX')}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: Vertical Stack */}
            <div className="w-full md:hidden space-y-4">
              {(loadingMemberships ? defaultMemberships : membershipPlans.length ? membershipPlans : defaultMemberships).map((membership: any) => (
                <Card key={membership.id} className={`flex flex-col transition-all duration-300 ${selectedMembership && selectedMembership === membership.id ? 'border-success bg-success/10 shadow-elegant' : 'shadow-soft border border-border hover:shadow-elegant'}`}>
                  <CardHeader className="text-center pb-3">
                    <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{membership.name ?? membership.title}</CardTitle>
                    <CardDescription className="flex items-center justify-center gap-1">
                      <Badge variant="secondary">{membership.targetAudience}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-primary">${(membership.cost ?? membership.price ?? 0).toLocaleString()}</span>
                      <span className="text-muted-foreground"> MXN / {membership.renewalPeriod}</span>
                    </div>

                    <div className="space-y-2 py-4 border-y">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Tasa preferencial:</span>
                        <span>{membership.interestRate ?? 0}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Renovación:</span>
                        <span>{membership.renewalPeriod}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 flex-grow py-4">
                      {(membership.benefits ?? []).map((benefit: any, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {typeof benefit === 'string' ? benefit : benefit.label || JSON.stringify(benefit)}
                        </li>
                      ))}
                    </ul>

                    {selectedMembership && selectedMembership === membership.id ? (
                      <Button className="w-full mt-auto bg-success text-white" size="lg" disabled>
                        Membresía seleccionada
                      </Button>
                    ) : (
                      <Button className="w-full mt-auto" size="lg" onClick={(e) => { e.stopPropagation(); saveLoanProcessState(); navigate('/membership-checkout', { state: { membership, returnTo: '/loan-process' } }); }}>
                        Adquirir Membresía
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: Horizontal Scroll */}
            <div className="hidden md:block w-full">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {(loadingMemberships ? defaultMemberships : membershipPlans.length ? membershipPlans : defaultMemberships).map((membership: any) => (
                  <div key={membership.id} className="flex-shrink-0 w-[320px] snap-start">
                    <Card className={`h-full flex flex-col transition-all duration-300 hover:-translate-y-2 ${selectedMembership && selectedMembership === membership.id ? 'border-success bg-success/10 shadow-elegant' : 'shadow-soft border border-border hover:shadow-elegant'}`}>
                      <CardHeader className="text-center pb-3">
                        <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center">
                          <Crown className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{membership.name ?? membership.title}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-1">
                          <Badge variant="secondary">{membership.targetAudience}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow">
                        <div className="text-center">
                          <span className="text-4xl font-bold text-primary">${(membership.cost ?? membership.price ?? 0).toLocaleString()}</span>
                          <span className="text-muted-foreground"> MXN / {membership.renewalPeriod}</span>
                        </div>

                        <div className="space-y-2 py-4 border-y">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Tasa preferencial:</span>
                            <span>{membership.interestRate ?? 0}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Renovación:</span>
                            <span>{membership.renewalPeriod}</span>
                          </div>
                        </div>

                        <ul className="space-y-2 flex-grow py-4">
                          {(membership.benefits ?? []).map((benefit: any, index: number) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-success" />
                              {typeof benefit === 'string' ? benefit : benefit.label || JSON.stringify(benefit)}
                            </li>
                          ))}
                        </ul>

                        {selectedMembership && selectedMembership === membership.id ? (
                          <Button className="w-full mt-auto bg-success text-white" size="lg" disabled>
                            Membresía seleccionada
                          </Button>
                        ) : (
                          <Button className="w-full mt-auto" size="lg" onClick={(e) => { e.stopPropagation(); saveLoanProcessState(); navigate('/membership-checkout', { state: { membership, returnTo: '/loan-process' } }); }}>
                            Adquirir Membresía
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Step 3: KYC Validation (Updated with Deposit section)
  const StepValidation = () => (
    <div className="space-y-4">      {/* Personal Information */}
      <Card className="shadow-medium">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                placeholder="Tu nombre"
                maxLength={50}
                value={personalData.firstName}
                onChange={(e) => handlePersonalDataChange("firstName", e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">Máx. 50 caracteres</p>
              {validationErrors.firstName && <p className="text-xs text-destructive">{validationErrors.firstName}</p>}
            </div>
            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input
                placeholder="Tus apellidos"
                maxLength={50}
                value={personalData.lastName}
                onChange={(e) => handlePersonalDataChange("lastName", e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">Máx. 50 caracteres</p>
              {validationErrors.lastName && <p className="text-xs text-destructive">{validationErrors.lastName}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Dirección</Label>
              <Input
                placeholder="Dirección completa"
                maxLength={100}
                value={personalData.address}
                onChange={(e) => handlePersonalDataChange("address", e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">Máx. 100 caracteres</p>
              {validationErrors.address && <p className="text-xs text-destructive">{validationErrors.address}</p>}
            </div>
            <div className="space-y-2">
              <Label>Fecha de Nacimiento</Label>
              <Input
                type="date"
                value={personalData.birthDate}
                onChange={(e) => handlePersonalDataChange("birthDate", e.target.value)}
              />
              {validationErrors.birthDate && <p className="text-xs text-destructive">{validationErrors.birthDate}</p>}
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                placeholder="55 1234 5678"
                maxLength={10}
                value={personalData.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handlePersonalDataChange("phone", digits);
                }}
              />
              <p className="text-[11px] text-muted-foreground">10 dígitos sin espacios</p>
              {validationErrors.phone && <p className="text-xs text-destructive">{validationErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label>RFC</Label>
              <Input
                placeholder="ABCD123456XYZ"
                maxLength={13}
                value={personalData.rfc}
                onChange={(e) => handlePersonalDataChange("rfc", e.target.value.toUpperCase())}
              />
              <p className="text-[11px] text-muted-foreground">12 o 13 caracteres alfanuméricos</p>
              {validationErrors.rfc && <p className="text-xs text-destructive">{validationErrors.rfc}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Section */}
      <Card className="shadow-medium">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Cuenta Bancaria
          </CardTitle>
          <CardDescription>
            Ingresa los datos de tu cuenta principal para domiciliar tus pagos. Por seguridad, realizaremos una validación automática de titularidad con tu banco.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">


            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={depositSource === 'new' ? 'default' : 'outline'}
                size="sm"
                className="h-9 rounded-full px-4"
                onClick={() => handleDepositSourceChange('new')}
              >
                Nueva cuenta
              </Button>
              <Button
                type="button"
                variant={depositSource === 'saved' ? 'default' : 'outline'}
                size="sm"
                className="h-9 rounded-full px-4"
                onClick={() => setIsDepositMethodModalOpen(true)}
              >
                Mis cuentas guardadas
              </Button>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {depositSource === 'saved' ? (
              <div className="space-y-2 md:col-span-2">


                <div className="rounded-xl border border-border/70 bg-background px-4 py-3 shadow-sm">
                  {selectedSavedMethod ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{selectedSavedMethod.bank_name || 'Banco'}</p>
                        <p className="text-xs text-muted-foreground">CLABE •••• {selectedSavedMethod.clabe?.slice?.(-4) || selectedSavedMethod.last_digits || '----'} · {selectedSavedMethod.validation_status === 'validada' ? 'Validado' : 'Pendiente'}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-primary" onClick={() => setIsDepositMethodModalOpen(true)}>
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Sin método guardado</p>
                        <p className="text-xs text-muted-foreground">Selecciona uno en el modal si quieres usar una cuenta validada.</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-primary" onClick={() => setIsDepositMethodModalOpen(true)}>
                        Seleccionar
                      </Button>
                    </div>
                  )}

                  {validationErrors.paymentMethodId && <p className="text-xs text-destructive">{validationErrors.paymentMethodId}</p>}
                </div>
              </div>
            ) : null

            }
            <div className="space-y-2">
              <Label>Banco</Label>
              <Select value={depositData.bank} onValueChange={(v) => handleDepositDataChange("bank", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingInstitutions ? "Cargando bancos..." : "Selecciona tu banco"} />
                </SelectTrigger>
                <SelectContent>
                  {bankOptions.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.bank && <p className="text-xs text-destructive">{validationErrors.bank}</p>}
              {!loadingInstitutions && bankOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">No se pudo cargar la lista de instituciones.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Cuenta CLABE</Label>
                <Input
                  type="text"
                  placeholder="18 dígitos"
                  maxLength={18}
                  value={depositData.clabe}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 18);
                    handleDepositDataChange("clabe", value);
                  }}
                  disabled={depositSource === 'saved' && !!depositData.paymentMethodId}
                />
              {
                depositSource === 'saved' && depositData.paymentMethodId && (
                  <Badge variant={selectedSavedMethod?.validation_status === 'validada' ? 'secondary' : 'outline'} className="text-[10px] uppercase tracking-wide">
                    {selectedSavedMethod?.validation_status === 'validada' ? 'Validado' : 'Pendiente'}
                  </Badge>
                )
              }

              {validationErrors.clabe && <p className="text-xs text-destructive">{validationErrors.clabe}</p>}
              {!validationErrors.clabe && depositData.clabe.length >= 3 && hasForbiddenClabePrefix(depositData.clabe, depositData.bank) && (
                <p className="text-xs text-warning flex items-center gap-1">
                  <TriangleAlert className="h-3 w-3" /> El prefijo 814 no está permitido para Santander. Usa la CLABE con prefijo 014.
                </p>
              )}
            </div>

          </div>

          <Dialog open={isDepositMethodModalOpen} onOpenChange={setIsDepositMethodModalOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Selecciona un método guardado</DialogTitle>
                <DialogDescription>
                  Elige una cuenta ya validada o vuelve a usar la cuenta nueva para capturar otra CLABE.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    handleDepositSourceChange('new');
                    setIsDepositMethodModalOpen(false);
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${depositSource === 'new' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 hover:bg-muted/40'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">Cuenta nueva</p>
                      <p className="text-xs text-muted-foreground">Captura banco y CLABE manualmente.</p>
                    </div>
                    {depositSource === 'new' ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <div className="mt-0.5 h-5 w-5 rounded-full border border-muted-foreground/30" />}
                  </div>
                </button>

                <div className="grid gap-3">
                  {bankPaymentMethods.map((method) => {
                    const isSelected = depositData.paymentMethodId === method.id && depositSource === 'saved';
                    const isValidated = method.validation_status === 'validada';
                    const clabeLastDigits = method.clabe?.slice?.(-4) || method.last_digits || '----';

                    return (
                      <button
                        key={method.id}
                        type="button"
                        disabled={!isValidated}
                        onClick={() => {
                          handleDepositMethodChange(method.id);
                          setDepositSource('saved');
                          setIsDepositMethodModalOpen(false);
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : isValidated ? 'border-border hover:border-primary/40 hover:bg-muted/40' : 'border-border/50 bg-muted/30 opacity-60 cursor-not-allowed'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className={`font-medium ${isValidated ? 'text-foreground' : 'text-muted-foreground'}`}>{method.bank_name || 'Banco'}</p>
                            <p className="text-xs text-muted-foreground">CLABE •••• {clabeLastDigits}</p>
                            {!isValidated && (
                              <p className="text-xs text-warning flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" /> Esta cuenta está en revisión
                              </p>
                            )}
                          </div>
                          <Badge variant={isValidated ? 'secondary' : 'outline'} className="text-[10px] uppercase tracking-wide">
                            {isValidated ? 'Validado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!bankPaymentMethods.length && (
                  <div className="rounded-xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                    No tienes métodos guardados todavía.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Same account checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="same-account"
              checked={useSameAccount}
              onCheckedChange={(checked) => setUseSameAccount(checked === true)}
            />
            <Label htmlFor="same-account" className="text-sm font-normal cursor-pointer">
              Usar esta misma cuenta para el depósito del préstamo
            </Label>
          </div>

          {/* Disbursement account section - shown when checkbox is unchecked */}
          {!useSameAccount && (
            <div className="border-t pt-6 space-y-4">
              <div>
                <h4 className="font-medium text-base">Cuenta para Desembolso</h4>
                <p className="text-sm text-muted-foreground">Ingresa los datos de la cuenta donde deseas recibir el depósito de tu préstamo</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Select value={disbursementData.bank} onValueChange={(v) => handleDisbursementDataChange("bank", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingInstitutions ? "Cargando bancos..." : "Selecciona tu banco"} />
                    </SelectTrigger>
                    <SelectContent>
                      {bankOptions.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.disbursementBank && <p className="text-xs text-destructive">{validationErrors.disbursementBank}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cuenta CLABE</Label>
                <Input
                  type="text"
                  placeholder="18 dígitos"
                  maxLength={18}
                  value={disbursementData.clabe}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 18);
                    handleDisbursementDataChange("clabe", value);
                  }}
                />
                  <p className="text-xs text-muted-foreground">Ingresa los 18 dígitos de tu CLABE</p>
                  {validationErrors.disbursementClabe && <p className="text-xs text-destructive">{validationErrors.disbursementClabe}</p>}
                  {!validationErrors.disbursementClabe && disbursementData.clabe.length >= 3 && hasForbiddenClabePrefix(disbursementData.clabe, disbursementData.bank) && (
                    <p className="text-xs text-warning flex items-center gap-1">
                      <TriangleAlert className="h-3 w-3" /> El prefijo 814 no está permitido para Santander. Usa la CLABE con prefijo 014.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* References Section */}
      <Card className="shadow-medium">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Obligado solidario
          </CardTitle>
          <CardDescription>
            Activa esta opción si quieres agregar un obligado solidario o referencia de confianza.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-solidario"
              checked={includeSolidario}
              onCheckedChange={(checked) => setIncludeSolidario(checked === true)}
            />
            <Label htmlFor="include-solidario" className="text-sm font-normal cursor-pointer">
              Agregar obligado solidario
            </Label>
          </div>

          {includeSolidario && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Obligado solidario 1</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nombre completo</Label>
                  <Input
                    placeholder="Ej: Ana Perez"
                    maxLength={50}
                    value={references[0]?.name || ""}
                    onChange={(e) => updateReference(0, "name", e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">Máx. 50 caracteres</p>
                  {validationErrors.reference_name && <p className="text-xs text-destructive">{validationErrors.reference_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Relacion</Label>
                  <Input
                    placeholder="Ej: Hermana, Amigo"
                    maxLength={30}
                    value={references[0]?.relationship || ""}
                    onChange={(e) => updateReference(0, "relationship", e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">Máx. 30 caracteres</p>
                  {validationErrors.reference_relationship && <p className="text-xs text-destructive">{validationErrors.reference_relationship}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Telefono</Label>
                  <Input
                    placeholder="55 1234 5678"
                    maxLength={10}
                    value={references[0]?.phone || ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateReference(0, "phone", digits);
                    }}
                  />
                  <p className="text-[11px] text-muted-foreground">10 dígitos sin espacios</p>
                  {validationErrors.reference_phone && <p className="text-xs text-destructive">{validationErrors.reference_phone}</p>}
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Solo se permite un obligado solidario por contrato.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* INE Identification */}
      <Card className="shadow-medium">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Identificación INE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Clave de Elector / Número INE</Label>
            <Input
              placeholder="18 caracteres"
              maxLength={20}
              value={personalData.ineKey}
              onChange={(e) => handlePersonalDataChange("ineKey", e.target.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase())}
            />
            <p className="text-[11px] text-muted-foreground">6 a 20 caracteres alfanuméricos</p>
            {validationErrors.ineKey && <p className="text-xs text-destructive">{validationErrors.ineKey}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors">
              {ineFrontPreview ? (
                ineFrontFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <p className="text-sm font-medium text-success text-center">INE Frente cargado</p>
                  </div>
                ) : (
                  <img src={ineFrontPreview} alt="INE Frente" className="max-h-40 object-contain rounded" />
                )
              ) : (
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground text-center">INE Frente</p>
              <div className="flex gap-2">
                <input id="ine-front-input" accept="image/*" type="file" className="hidden" onChange={(e) => handleFileInput(e, 'ineFront')} />
                <label htmlFor="ine-front-input">
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <span>
                      <Upload className="h-4 w-4" /> Subir
                    </span>
                  </Button>
                </label>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => openCamera('ineFront')}>
                  <Camera className="h-4 w-4" /> Cámara
                </Button>
                {ineFrontFile && (
                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => removeFile('ineFront')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {validationErrors.ineFront && <p className="text-xs text-destructive text-center">{validationErrors.ineFront}</p>}
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors">
              {ineBackPreview ? (
                ineBackFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <p className="text-sm font-medium text-success text-center">INE Reverso cargado</p>
                  </div>
                ) : (
                  <img src={ineBackPreview} alt="INE Reverso" className="max-h-40 object-contain rounded" />
                )
              ) : (
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground text-center">INE Reverso</p>
              <div className="flex gap-2">
                <input id="ine-back-input" accept="image/*" type="file" className="hidden" onChange={(e) => handleFileInput(e, 'ineBack')} />
                <label htmlFor="ine-back-input">
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <span>
                      <Upload className="h-4 w-4" /> Subir
                    </span>
                  </Button>
                </label>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => openCamera('ineBack')}>
                  <Camera className="h-4 w-4" /> Cámara
                </Button>
                {ineBackFile && (
                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => removeFile('ineBack')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {validationErrors.ineBack && <p className="text-xs text-destructive text-center">{validationErrors.ineBack}</p>}
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors">
              {selfieWithInePreview ? (
                selfieWithIneFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <p className="text-sm font-medium text-success text-center">Selfie cargado</p>
                  </div>
                ) : (
                  <img src={selfieWithInePreview} alt="Selfie con INE" className="max-h-40 object-contain rounded" />
                )
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="text-sm text-muted-foreground text-center">Selfie con INE</p>
              <div className="flex gap-2">
                <input id="selfie-ine-input" accept="image/*" type="file" className="hidden" onChange={(e) => handleFileInput(e, 'selfieWithIne')} />
                <label htmlFor="selfie-ine-input">
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <span>
                      <Upload className="h-4 w-4" /> Subir
                    </span>
                  </Button>
                </label>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => openCamera('selfieWithIne')}>
                  <Camera className="h-4 w-4" /> Cámara
                </Button>
                {selfieWithIneFile && (
                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => removeFile('selfieWithIne')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {validationErrors.selfieWithIne && <p className="text-xs text-destructive text-center">{validationErrors.selfieWithIne}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CURP */}
      <Card className="shadow-medium">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            CURP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>CURP</Label>
            <Input
              type="text"
              placeholder="18 caracteres alfanuméricos"
              maxLength={18}
              value={personalData.curp}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9ñÑ]/g, '').toUpperCase().slice(0, 18);
                handlePersonalDataChange("curp", value);
              }}
            />
            <p className="text-[11px] text-muted-foreground">18 caracteres alfanuméricos</p>
            {validationErrors.curp && <p className="text-xs text-destructive">{validationErrors.curp}</p>}
          </div>
          <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors">
            {curpPreview ? (
              curpFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-sm font-medium text-success">{curpFile.name}</p>
                  <p className="text-xs text-muted-foreground">Archivo cargado</p>
                </div>
              ) : (
                <img src={curpPreview} alt="CURP" className="max-h-40 object-contain rounded" />
              )
            ) : curpFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <p className="text-sm font-medium text-success">{curpFile.name}</p>
                <p className="text-xs text-muted-foreground">Archivo listo para subir</p>
              </div>
            ) : (
              <FileText className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground text-center">Adjuntar CURP (PDF o imagen)</p>
            <div className="flex gap-2">
              <input id="curp-input" accept="application/pdf,image/*" type="file" className="hidden" onChange={(e) => handleFileInput(e, 'curp')} />
              <label htmlFor="curp-input">
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <span>
                    <Upload className="h-4 w-4" /> Subir
                  </span>
                </Button>
              </label>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => openCamera('curp')}>
                <Camera className="h-4 w-4" /> Cámara
              </Button>
              {curpFile && (
                <Button variant="destructive" size="sm" className="gap-2" onClick={() => removeFile('curp')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Puedes subir PDF o tomar una foto</p>
            {validationErrors.curpFile && <p className="text-xs text-destructive">{validationErrors.curpFile}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 4: Review and Approval
  const StepApproval = () => (
    <Card className="shadow-medium">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileCheck className="h-5 w-5 text-primary" />
          Revisión y Aprobación
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[300px] flex items-center justify-center">
        {isAnalyzing ? (
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
            <div>
              <p className="text-xl font-semibold">Estamos revisando tu perfil...</p>
              <p className="text-muted-foreground">Estamos validando tu información para continuar con el proceso</p>
            </div>
          </div>
        ) : isSubmitted ? (
          <div className="text-center space-y-4 max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">Solicitud Enviada</p>
              <p className="text-muted-foreground mt-2">Hemos recibido tu solicitud exitosamente. Te notificaremos al correo registrado sobre el estado de tu préstamo una vez que sea revisada por nuestro equipo.</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-sm text-muted-foreground">
              <p>Tiempo estimado de revisión: 24-48 horas hábiles</p>
            </div>
          </div>
        ) : isApproved ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">¡Felicitaciones!</p>
              <p className="text-lg text-muted-foreground">Tu préstamo fue pre aprobado</p>
            </div>
            <Badge variant="outline" className="text-success border-success">
              Crédito Pre-aprobado
            </Badge>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-xl font-semibold">Resumen de tu solicitud</p>
              <p className="text-sm text-muted-foreground">Haz clic en "Iniciar" para confirmar y continuar con la revision.</p>
            </div>
            <div className="w-full max-w-3xl mx-auto">
              <div className="text-xs uppercase tracking-wider text-muted-foreground text-left mb-3">Datos personales</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[11px] text-muted-foreground">Titular</p>
                  <p className="text-sm font-medium">
                    {`${personalData.firstName} ${personalData.lastName}`.trim() || "Sin nombre registrado"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[11px] text-muted-foreground">RFC</p>
                  <p className="text-sm font-medium">{personalData.rfc || "Sin RFC"}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[11px] text-muted-foreground">Contacto</p>
                  <p className="text-sm font-medium">{personalData.phone || "Sin telefono"}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[11px] text-muted-foreground">Banco</p>
                  <p className="text-sm font-medium">{depositData.bank ? getInstitutionName(depositData.bank) : "Sin banco"}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[11px] text-muted-foreground">Cuenta CLABE</p>
                  <p className="text-sm font-medium">{depositData.clabe ? `****${depositData.clabe.slice(-4)}` : "Sin CLABE"}</p>
                </div>
              </div>

              <div className="text-xs uppercase tracking-wider text-muted-foreground text-left mt-4 mb-3">Resumen del credito</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[11px] text-muted-foreground">Monto solicitado</p>
                  <p className="text-base font-semibold">${Number(loanAmount || 0).toLocaleString()} MXN</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[11px] text-muted-foreground">Plazo</p>
                  <p className="text-base font-semibold">{loanInstallments} cuotas</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[11px] text-muted-foreground">Cuota estimada</p>
                  <p className="text-base font-semibold">${monthlyPayment.toFixed(2)} MXN</p>
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Al continuar, autorizas el inicio de la revision de tu informacion.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Step 5: Contract Signature
  const StepContract = () => (
    <Card className="shadow-medium">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileSignature className="h-5 w-5 text-primary" />
          Firma de Contrato
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[300px] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <FileSignature className="h-12 w-12 text-primary" />
          </div>
          <div>
            <p className="text-xl font-semibold mb-2">Contrato enviado</p>
            <p className="text-muted-foreground">
              Hemos enviado el contrato a tu correo electrónico registrado. Por favor, revísalo y fírmalo digitalmente para completar el proceso.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              📧 Revisa tu bandeja de entrada y spam
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Step 6: Disbursement
  const StepDisbursement = () => (
    <Card className="shadow-medium overflow-hidden">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <PartyPopper className="h-20 w-20 animate-bounce" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">¡Crescendo Juntos!</h2>
            <p className="text-primary-foreground/80 text-lg">
              Tu préstamo ha sido procesado exitosamente
            </p>
          </div>
        </div>
      </div>
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="bg-success/10 border border-success/30 rounded-xl p-6">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Desembolso en proceso</p>
            <p className="text-muted-foreground">
              El desembolso se realizará en tu cuenta registrada dentro de las próximas <strong>24 horas</strong>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-left">
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Monto aprobado</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-primary">${parseFloat(loanAmount).toLocaleString()} MXN</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Primera cuota</p>
              <p className="text-base sm:text-lg md:text-xl font-bold">${monthlyPayment.toFixed(2)} MXN</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return StepConfirm();
      case 2:
        return StepMembership();
      case 3:
        return StepValidation();
      case 4:
        return StepApproval();
      case 5:
        return StepContract();
      case 6:
        return StepDisbursement();
      default:
        return null;
    }
  };

  const getNextButtonText = () => {
    if (currentStep === 4 && isSubmitted) return "";
    if (currentStep === 4 && !isApproved) return "Iniciar";
    if (currentStep === 5) return "Ya he firmado el contrato";
    if (currentStep === 6) return "Ir al Dashboard";
    return "Siguiente";
  };

  const canProceed = () => {
    if (currentStep === 4 && (isAnalyzing || isSubmitted)) return false;
    return true;
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Procesando solicitud</h3>
            <p className="text-sm text-muted-foreground">Estamos creando tu solicitud. Por favor espera...</p>
          </div>
        </div>
      )}

      {/* Stepper */}
      <Stepper />

      {/* Step Content */}
      <div className="mt-6">
        {renderStepContent()}
      </div>

      {/* Camera modal for capture (local only) */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card p-4 rounded-lg w-full max-w-2xl">
            <div className="relative">
              <video ref={videoRef} className="w-full rounded" playsInline />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-between mt-3">
              <Button variant="ghost" onClick={() => { stopCamera(); setIsCameraOpen(false); }}>Cancelar</Button>
              <div className="flex gap-2">
                <Button onClick={takePhoto}>Tomar foto</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {!isSubmitted && (
        <div className="flex justify-between mt-6 gap-4 items-center">
          {currentStep > 1 && currentStep < 6 && (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </Button>
          )}
          {currentStep === 1 && <div />}

          <Button
            onClick={currentStep === 6 ? handleGoToDashboard : handleNext}
            disabled={currentStep === 4 && !canProceed()}
            className="gap-2 ml-auto"
          >
            {getNextButtonText()}
            {currentStep < 6 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoanProcess;
