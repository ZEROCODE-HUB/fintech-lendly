import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
  PartyPopper,
  Crown,
  Star
} from "lucide-react";
import { defaultMemberships } from "@/data/memberships";

const STEPS = [
  { id: 1, title: "Confirma", icon: DollarSign },
  { id: 2, title: "Membresía", icon: CreditCard },
  { id: 3, title: "Validación", icon: User },
  { id: 4, title: "Aprobación", icon: FileCheck },
  { id: 5, title: "Contrato", icon: FileSignature },
  { id: 6, title: "Desembolso", icon: Wallet },
];

const LoanProcess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [hasMembership, setHasMembership] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<string | null>(null);

  // Get loan data from navigation state or use defaults
  const loanData = location.state || {
    amount: 10000,
    installments: 12,
    monthlyPayment: 952.38,
    interestRate: 42,
    totalToPay: 11428.56,
  };

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

  const handlePersonalDataChange = (field: string, value: string) => {
    setPersonalData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 4 && !isApproved) {
      // Start analysis simulation
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsApproved(true);
      }, 3000);
      return;
    }
    if (currentStep < 6) {
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

  // Stepper Component
  const Stepper = () => (
    <div className="w-full py-4 px-2 sm:px-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[500px] sm:min-w-0">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all ${
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  step.id
                )}
              </div>
              <span className={`text-xs mt-1 text-center ${currentStep >= step.id ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition-all ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Step 1: Confirm Loan
  const StepConfirm = () => (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <DollarSign className="h-5 w-5 text-primary" />
          Confirma tu Préstamo
        </CardTitle>
        <CardDescription>Revisa los detalles de tu solicitud</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-br from-primary/10 to-accent/30 rounded-xl p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Monto Solicitado</p>
              <p className="text-2xl font-bold text-primary">${loanData.amount.toLocaleString()} MXN</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plazo</p>
              <p className="text-2xl font-bold">{loanData.installments} cuotas</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasa de Interés</p>
              <p className="text-xl font-semibold">{loanData.interestRate}% anual</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cuota Mensual</p>
              <p className="text-xl font-semibold text-primary">${loanData.monthlyPayment.toFixed(2)} MXN</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Total a Pagar</p>
            <p className="text-2xl font-bold">${loanData.totalToPay.toFixed(2)} MXN</p>
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
        {hasMembership ? (
          <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-success" />
            <div>
              <p className="font-semibold">Membresía Activa</p>
              <p className="text-sm text-muted-foreground">Ya cuentas con una membresía vigente</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defaultMemberships.map((membership) => (
                <div
                  key={membership.id}
                  onClick={() => setSelectedMembership(membership.id)}
                  className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                    selectedMembership === membership.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {selectedMembership === membership.id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    {membership.id === "premier" ? (
                      <Star className="h-8 w-8 text-primary" />
                    ) : (
                      <Crown className="h-8 w-8 text-yellow-500" />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{membership.title}</h3>
                      <Badge variant="secondary">{membership.targetAudience}</Badge>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-primary mb-2">
                    ${membership.cost.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">MXN</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Renovación {membership.renewalPeriod}</p>
                  <ul className="space-y-2">
                    {membership.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Button
              variant="link"
              className="text-muted-foreground"
              onClick={() => setHasMembership(true)}
            >
              Ya tengo una membresía →
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Step 3: KYC Validation
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
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">INE Frente</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Upload className="h-4 w-4" />
                  Subir
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Camera className="h-4 w-4" />
                  Cámara
                </Button>
              </div>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 transition-colors">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">INE Reverso</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Upload className="h-4 w-4" />
                  Subir
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Camera className="h-4 w-4" />
                  Cámara
                </Button>
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
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">Adjuntar CURP (PDF)</p>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Subir PDF
            </Button>
            <p className="text-xs text-muted-foreground">Solo formato PDF</p>
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
            <p className="text-lg">Haz clic en "Siguiente" para iniciar el análisis</p>
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
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Monto aprobado</p>
              <p className="text-xl font-bold text-primary">${loanData.amount.toLocaleString()} MXN</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Primera cuota</p>
              <p className="text-xl font-bold">${loanData.monthlyPayment.toFixed(2)} MXN</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepConfirm />;
      case 2:
        return <StepMembership />;
      case 3:
        return <StepValidation />;
      case 4:
        return <StepApproval />;
      case 5:
        return <StepContract />;
      case 6:
        return <StepDisbursement />;
      default:
        return null;
    }
  };

  const getNextButtonText = () => {
    if (currentStep === 4 && !isApproved) return "Iniciar Análisis";
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
        
        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Proceso de Préstamo</h1>
            </div>
          </header>

          <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
            {/* Stepper */}
            <Stepper />

            {/* Step Content */}
            <div className="mt-6">
              {renderStepContent()}
            </div>

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