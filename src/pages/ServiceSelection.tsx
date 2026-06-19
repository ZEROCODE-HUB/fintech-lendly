import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Banknote, ArrowRight, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logoFull from "@/assets/logo-full.png";
import { increscendoApiFetch } from "@/lib/increscendoApi";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ServiceSelection = () => {
  const navigate = useNavigate();
  const [isLoadingServicios, setIsLoadingServicios] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleServiciosClick = async (e: React.MouseEvent) => {

    if (isLoadingServicios) return;



    setApiError(null);
    setIsLoadingServicios(true);

    try {
      const resp = await increscendoApiFetch('/tekae-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error('[ServiceSelection] tekae-token error:', err);
        setApiError(err?.message || 'Error al abrir el servicio. Intenta nuevamente.');
        setIsLoadingServicios(false);
        return;
      }

      const json = await resp.json();
      const data = json?.data ?? json;
      const finalUrl = data?.finalUrl;

      if (!finalUrl) {
        console.error('[ServiceSelection] No finalUrl:', data);
        setApiError('No se pudo obtener la URL del servicio.');
        setIsLoadingServicios(false);
        return;
      }

      setIsLoadingServicios(false);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');

    } catch (err) {
      console.error('[ServiceSelection] Error:', err);
      setApiError('Error de red al conectar con el servicio.');
      setIsLoadingServicios(false);
    }
  };

  const handlePrestamosClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const userStr = localStorage.getItem('increscendo_user');
    const testRole = localStorage.getItem('testUserRole');
    if (!userStr && !testRole) {
      navigate('/auth');
      return;
    }
    const user = userStr ? JSON.parse(userStr) : { role: testRole };
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex flex-col">
      {/* Logo Header */}
      <div className="flex justify-center mt-6 sm:mt-8">
        <img src={logoFull} alt="Increscendo Fintech" className="h-20 sm:h-28" />
      </div>

      {/* Main Content - Centered Cards */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Error Alert */}
          {apiError && (
            <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Welcome Message */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-1 bg-gradient-hero bg-clip-text text-transparent">
              Bienvenido
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-4">
              Selecciona un servicio para comenzar
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Card 1: Servicios y Recargas */}
            <button
              type="button"
              onClick={handleServiciosClick}
              disabled={isLoadingServicios}
              className="text-left disabled:opacity-80 group cursor-pointer shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 animate-fade-in rounded-2xl bg-background overflow-hidden w-full"
            >
              <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="mx-auto mb-3 sm:mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  {isLoadingServicios ? (
                    <Loader className="h-8 w-8 sm:h-10 sm:w-10 text-white animate-spin" />
                  ) : (
                    <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  )}
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">
                  {isLoadingServicios ? 'Conectando...' : 'Servicios y Recargas'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 sm:px-6">
                <CardDescription className="text-sm sm:text-base mb-4 sm:mb-6">
                  Paga servicios, recarga celular y más
                </CardDescription>
                <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm sm:text-base">
                  <span>{isLoadingServicios ? 'Obteniendo URL segura...' : 'Ir al servicio'}</span>
                  {!isLoadingServicios && <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />}
                </div>
              </CardContent>
            </button>

            {/* Card 2: Préstamos */}
            <button
              type="button"
              onClick={handlePrestamosClick}
              className="text-left group cursor-pointer shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-2 hover:border-success/50 animate-fade-in rounded-2xl bg-background overflow-hidden w-full"
              style={{ animationDelay: '0.1s' }}
            >
              <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="mx-auto mb-3 sm:mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-success to-success/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <Banknote className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-success transition-colors">
                  Préstamos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 sm:px-6">
                <CardDescription className="text-sm sm:text-base mb-4 sm:mb-6">
                  Solicita y gestiona tus préstamos
                </CardDescription>
                <div className="flex items-center justify-center gap-2 text-success font-medium text-sm sm:text-base">
                  <span>Ir a préstamos</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
