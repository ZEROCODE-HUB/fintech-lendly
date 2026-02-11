import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  RefreshCw,
  Building2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { defaultMemberships } from "@/data/memberships";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/utils/auth";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabaseConfig';
import { supabase } from "@/lib/supabase";
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

const BANKS = [
  "BBVA México",
  "Santander",
  "Banorte",
  "Citibanamex",
  "HSBC",
  "Scotiabank",
  "Banco Azteca",
  "Inbursa",
  "BanCoppel",
  "Compartamos",
];

const LoanProcess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [hasMembership, setHasMembership] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<string | null>(null);
  const [userMembership, setUserMembership] = useState<any | null>(null);
  const [currentLoan, setCurrentLoan] = useState<any | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState<boolean>(true);

  // Get loan data from navigation state or use defaults (guard against partial state)
  const navState: any = (location && (location.state as any)) || {};
  const initialLoanData = {
    amount: navState.amount ?? 10000,
    installments: navState.installments ?? 12,
    monthlyPayment: navState.monthlyPayment ?? 952.38,
    interestRate: navState.interestRate ?? 42, // Percentage (e.g., 42 for 42%)
    totalToPay: navState.totalToPay ?? 11428.56,
  };

  // Convert interest rate from percentage to decimal for calculations
  const [interestRateDecimal, setInterestRateDecimal] = useState(initialLoanData.interestRate / 100);

  // If navigation included resumeLoanId, fetch loan and prefill for resume
  useEffect(() => {
    const resume = async () => {
      try {
        const s: any = location.state || {};
        const resumeLoanId: string | undefined = s.resumeLoanId ?? (localStorage.getItem('resume_loan_id') || undefined);
        const resumeStep: number = s.resumeStep ?? 4;
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
    ineKey: "",
    curp: "",
  });

  // Local files (keep only client-side until user decides to upload)
  const [ineFrontFile, setIneFrontFile] = useState<File | null>(null);
  const [ineBackFile, setIneBackFile] = useState<File | null>(null);
  const [curpFile, setCurpFile] = useState<File | null>(null);
  const [ineFrontPreview, setIneFrontPreview] = useState<string | null>(null);
  const [ineBackPreview, setIneBackPreview] = useState<string | null>(null);
  const [curpPreview, setCurpPreview] = useState<string | null>(null);

  // Camera capture state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'ineFront' | 'ineBack' | 'curp' | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Deposit data for Step 3
  const [depositData, setDepositData] = useState({
    bank: "",
    clabe: "",
  });

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

  const handleDepositDataChange = (field: string, value: string) => {
    setDepositData(prev => ({ ...prev, [field]: value }));
  };

  const createLoanRecord = async () => {
    try {
      const { authService } = await import('@/utils/auth');
      const user = authService.getCurrentUser();
      if (!user?.id) {
        toast({ title: 'Error', description: 'Usuario no autenticado.' });
        return;
      }

      const membershipName = (() => {
        if (userMembership) return userMembership;
        if (selectedMembership) return selectedMembership;
        return membershipPlans[0]?.name ?? null;
      })();

      const payload = {
        user_id: user.id,
        amount: Number(loanAmount) || 0,
        installments: Number(loanInstallments) || 12,
        monthly_payment: Number(monthlyPayment) || 0,
        interest_rate: interestRateDecimal, // Use the decimal rate from state
        total_to_pay: Number(totalToPay) || 0,
        status: 'pending',
        metadata: {
          personalData,
          depositData,
          disbursementData,
          membership: membershipName,
        },
      };

      const { data, error } = await supabase.from('loans').insert([payload]).select().maybeSingle();
      if (error || !data) {
        console.error('create loan error', error);
        toast({ title: 'Error', description: 'No se pudo crear la solicitud.' });
        return null;
      }
      // clear resume marker if present
      try { localStorage.removeItem('resume_loan_id'); } catch {}
      setCurrentLoan(data);
      toast({ title: 'Solicitud creada', description: 'Tu solicitud quedó registrada y está en estado pendiente.' });
      return data;
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Ocurrió un error al crear la solicitud.' });
      return null;
    }
  };

  const handleFileSelect = (target: 'ineFront' | 'ineBack' | 'curp', file: File) => {
    const url = URL.createObjectURL(file);
    if (target === 'ineFront') {
      setIneFrontFile(file);
      setIneFrontPreview(url);
    } else if (target === 'ineBack') {
      setIneBackFile(file);
      setIneBackPreview(url);
    } else if (target === 'curp') {
      setCurpFile(file);
      setCurpPreview(url);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, target: 'ineFront' | 'ineBack' | 'curp') => {
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

  const openCamera = async (target: 'ineFront' | 'ineBack' | 'curp') => {
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
      toast({ title: 'Error', description: 'No se pudo acceder a la cámara.' });
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

  const removeFile = (target: 'ineFront' | 'ineBack' | 'curp') => {
    if (target === 'ineFront') {
      if (ineFrontPreview) URL.revokeObjectURL(ineFrontPreview);
      setIneFrontFile(null);
      setIneFrontPreview(null);
    } else if (target === 'ineBack') {
      if (ineBackPreview) URL.revokeObjectURL(ineBackPreview);
      setIneBackFile(null);
      setIneBackPreview(null);
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
      toast({
        title: "Cálculo actualizado",
        description: "Los valores del préstamo han sido recalculados.",
      });
    }
  };

  const handleNext = async () => {
    if (currentStep === 4 && !isApproved) {
      // When user clicks "Iniciar" on step 4, create loan if needed and start polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      let loan = currentLoan;
      if (!loan) {
        loan = await createLoanRecord();
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
            try { window.dispatchEvent(new Event('reloadLoans')); } catch {}
            toast({ title: 'Firma registrada', description: 'La solicitud ha sido marcada como firmada.' });
          } catch (e) {
            console.error('Error marking loan signed', e);
            toast({ title: 'Error', description: 'No se pudo registrar la firma.' });
          }
        } else {
          toast({ title: 'Error', description: 'No se encontró la solicitud para marcar como firmada.' });
        }
      }
      setCurrentStep(prev => prev + 1);
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
    const loadMembershipsAndUser = async () => {
      try {
        setLoadingMemberships(true);

        // fetch plans and map to UI-friendly shape (same as Memberships.tsx)
        const { data: plans } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('active', true)
          .order('price', { ascending: true });

        if (plans) {
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
        const { authService } = await import('@/utils/auth');
        const user = authService.getCurrentUser();
        if (!user?.id) return;

        const { data: umRow } = await supabase
          .from('user_memberships')
          .select('id, membership_plan_id, status, started_at, expires_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (umRow) {
          setUserMembership(umRow);
          setHasMembership(true);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoadingMemberships(false);
      }
    };

    loadMembershipsAndUser();
  }, []);

  // cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
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
    const loadUserProfile = async () => {
      try {
        const { authService } = await import('@/utils/auth');
        const user = authService.getCurrentUser();
        if (!user?.id) return;

        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, address, birth_date, phone, ine_key, curp, phone_country_code')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) return;

        setPersonalData({
          firstName: data.first_name ?? '',
          lastName: data.last_name ?? '',
          address: data.address ?? '',
          birthDate: data.birth_date ? new Date(data.birth_date).toISOString().slice(0,10) : '',
          phone: data.phone ?? '',
          ineKey: data.ine_key ?? '',
          curp: data.curp ?? '',
        });
      } catch (err) {
        // ignore errors (unauthenticated/demo)
      }
    };

    loadUserProfile();
  }, []);

  // Stepper Component
  const Stepper = () => (
    <div className="w-full py-4 px-2 sm:px-4 overflow-hidden">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm md:text-base transition-all ${
                  currentStep === step.id
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
                className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 rounded transition-all hidden sm:block -mt-3 sm:-mt-4 ${
                  currentStep > step.id ? "bg-primary shadow-sm" : "bg-white shadow-md border border-muted/40"
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
    <Card className="shadow-medium">
      <CardHeader className="space-y-3 sm:space-y-0">
        {/* Mobile-first header layout */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Row 1: Back button - full width on mobile */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGoToSimulator}
            className="self-start text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2 h-11 px-3 -ml-3 sm:order-2 sm:ml-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sm:inline">Volver al Simulador</span>
          </Button>
          
          {/* Row 2-3: Title and description */}
          <div className="space-y-1 sm:order-1">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <DollarSign className="h-5 w-5 text-primary" />
              Confirma tu Préstamo
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Revisa y ajusta los detalles de tu solicitud
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Editable Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loan-amount">Monto Solicitado</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">$</span>
              <Input
                id="loan-amount"
                type="number"
                placeholder="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="pl-7 text-lg font-semibold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loan-installments">Número de Cuotas</Label>
            <Select value={loanInstallments} onValueChange={setLoanInstallments}>
              <SelectTrigger id="loan-installments">
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
          </div>
        </div>

        <Button variant="outline" onClick={calculatePayment} className="w-full md:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>

        {/* Summary Display */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/30 rounded-xl p-4 sm:p-5 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-3 md:gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground mb-1">Monto Solicitado</p>
              <p className="text-lg sm:text-lg md:text-xl font-bold text-primary whitespace-nowrap">${parseFloat(loanAmount || "0").toLocaleString()} MXN</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground mb-1">Plazo</p>
              <p className="text-lg sm:text-lg md:text-xl font-bold whitespace-nowrap">{loanInstallments} cuotas</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground mb-1">Tasa de Interés</p>
              <p className="text-base sm:text-base md:text-lg font-semibold whitespace-nowrap">{initialLoanData.interestRate}% anual</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground mb-1">Cuota Mensual</p>
              <p className="text-base sm:text-base md:text-lg font-semibold text-primary whitespace-nowrap">${monthlyPayment.toFixed(2)} MXN</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex flex-row justify-between items-center">
            <p className="text-sm font-medium text-muted-foreground">Total a Pagar</p>
            <p className="text-xl sm:text-2xl font-bold text-primary whitespace-nowrap">${totalToPay.toFixed(2)} MXN</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Step 2: Membership
  const StepMembership = () => (
    <Card className="shadow-medium">
      <CardHeader>
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
            <div className="ml-auto">
              <Button onClick={() => setCurrentStep(3)}>Continuar</Button>
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
                      <Button className="w-full mt-auto" size="lg" onClick={(e) => { e.stopPropagation(); navigate('/membership-checkout', { state: { membership, returnTo: '/loan-process' } }); }}>
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
                          <Button className="w-full mt-auto" size="lg" onClick={(e) => { e.stopPropagation(); navigate('/membership-checkout', { state: { membership, returnTo: '/loan-process' } }); }}>
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
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                placeholder="Tu nombre"
                value={personalData.firstName}
                onChange={(e) => handlePersonalDataChange("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input
                placeholder="Tus apellidos"
                value={personalData.lastName}
                onChange={(e) => handlePersonalDataChange("lastName", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Dirección</Label>
              <Input
                placeholder="Dirección completa"
                value={personalData.address}
                onChange={(e) => handlePersonalDataChange("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Nacimiento</Label>
              <Input
                type="date"
                value={personalData.birthDate}
                onChange={(e) => handlePersonalDataChange("birthDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                placeholder="+52 55 1234 5678"
                value={personalData.phone}
                onChange={(e) => handlePersonalDataChange("phone", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Section */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Cuenta Bancaria
          </CardTitle>
          <CardDescription>
            Ingresa los datos de tu cuenta principal para domiciliar tus pagos. Por seguridad, realizaremos una validación automática de titularidad con tu banco.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Banco</Label>
              <Select value={depositData.bank} onValueChange={(v) => handleDepositDataChange("bank", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu banco" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cuenta CLABE</Label>
              <Input
                type="number"
                placeholder="18 dígitos"
                maxLength={18}
                value={depositData.clabe}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 18);
                  handleDepositDataChange("clabe", value);
                }}
              />
              <p className="text-xs text-muted-foreground">Ingresa los 18 dígitos de tu CLABE</p>
            </div>
          </div>

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
                      <SelectValue placeholder="Selecciona tu banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cuenta CLABE</Label>
                  <Input
                    type="number"
                    placeholder="18 dígitos"
                    maxLength={18}
                    value={disbursementData.clabe}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 18);
                      handleDisbursementDataChange("clabe", value);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Ingresa los 18 dígitos de tu CLABE</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* INE Identification */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Identificación INE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Clave de Elector / Número INE</Label>
            <Input
              placeholder="18 dígitos alfanuméricos"
              value={personalData.ineKey}
              onChange={(e) => handlePersonalDataChange("ineKey", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors">
              {ineFrontPreview ? (
                <img src={ineFrontPreview} alt="INE Frente" className="max-h-40 object-contain rounded" />
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
                {ineFrontPreview && (
                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => removeFile('ineFront')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors">
              {ineBackPreview ? (
                <img src={ineBackPreview} alt="INE Reverso" className="max-h-40 object-contain rounded" />
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
                {ineBackPreview && (
                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => removeFile('ineBack')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CURP */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            CURP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>CURP</Label>
            <Input
              placeholder="Ej: SEXL48..."
              maxLength={18}
              value={personalData.curp}
              onChange={(e) => handlePersonalDataChange("curp", e.target.value.toUpperCase())}
            />
          </div>
          <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors">
            {curpPreview ? (
              <img src={curpPreview} alt="CURP" className="max-h-40 object-contain rounded" />
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
                {curpPreview && (
                  <Button variant="destructive" size="sm" className="gap-2" onClick={() => removeFile('curp')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
            </div>
            <p className="text-xs text-muted-foreground">Puedes subir PDF o tomar una foto</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Step 4: Review and Approval
  const StepApproval = () => (
    <Card className="shadow-medium">
      <CardHeader>
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
              <p className="text-xl font-semibold">Analizando tu perfil...</p>
              <p className="text-muted-foreground">Esto solo tomará unos segundos</p>
            </div>
          </div>
        ) : isApproved ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">¡Felicitaciones!</p>
              <p className="text-lg text-muted-foreground">Tu préstamo fue aprobado</p>
            </div>
            <Badge variant="outline" className="text-success border-success">
              Crédito Pre-aprobado
            </Badge>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <FileCheck className="h-16 w-16 text-primary mx-auto" />
            <p className="text-lg">Haz clic en "Siguiente" para iniciar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Step 5: Contract Signature
  const StepContract = () => (
    <Card className="shadow-medium">
      <CardHeader>
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
    if (currentStep === 4 && !isApproved) return "Iniciar";
    if (currentStep === 5) return "Ya he firmado el contrato";
    if (currentStep === 6) return "Ir al Dashboard";
    return "Siguiente";
  };

  const canProceed = () => {
    if (currentStep === 2 && !hasMembership && !selectedMembership) return false;
    if (currentStep === 4 && isAnalyzing) return false;
    return true;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 overflow-x-hidden">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Proceso de Préstamo</h1>
            </div>
          </header>

          <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto pt-16 sm:pt-20 md:pt-0">
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
            <div className="flex justify-between mt-6 gap-4">
              {currentStep > 1 && currentStep < 6 && (
                <Button variant="outline" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </Button>
              )}
              {currentStep === 1 && <div />}
              
              <Button 
                onClick={currentStep === 6 ? handleGoToDashboard : handleNext}
                disabled={!canProceed()}
                className="gap-2 ml-auto"
              >
                {getNextButtonText()}
                {currentStep < 6 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LoanProcess;
