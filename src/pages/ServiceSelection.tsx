import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Banknote, ArrowRight, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logoFull from "@/assets/logo-full.webp";
import { increscendoApiFetch } from "@/lib/increscendoApi";

const ServiceSelection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleServiciosClick = async () => {
    const userStr = localStorage.getItem('increscendo_user');
    const testRole = localStorage.getItem('testUserRole');
    if (!userStr && !testRole) { navigate('/auth'); return; }
    const user = userStr ? JSON.parse(userStr) : { role: testRole };
    const email = user?.email;
    if (!email) { navigate('/auth'); return; }

    setLoading(true);
    console.log('[ServiceSelection] iniciando handleServiciosClick con email:', email);

    const newWindow = window.open('about:blank', '_blank');

    if (!newWindow || newWindow.closed) {
      console.error('[ServiceSelection] popup bloqueado o no se pudo abrir la ventana');
      alert('No se pudo abrir la ventana. Verifica que tu navegador permita pop-ups.');
      setLoading(false);
      return;
    }

    try {
      console.log('[ServiceSelection] llamando a API tekae-token...');
      const resp = await increscendoApiFetch('/tekae-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('[ServiceSelection] respuesta API:', resp.status, resp.ok);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error('[ServiceSelection] tekae-token error:', err);
        alert('Error al abrir el servicio. Intenta nuevamente.');
        setLoading(false);
        return;
      }

      const data = await resp.json();
      console.log('[ServiceSelection] datos recibidos:', { ok: data?.ok, hasFinalUrl: !!data?.finalUrl });

      const finalUrl = data?.finalUrl;
      if (!finalUrl) {
        console.error('[ServiceSelection] missing finalUrl en respuesta:', data);
        alert('No se pudo obtener la URL del servicio.');
        setLoading(false);
        return;
      }

      console.log('[ServiceSelection] finalUrl obtenida, intentando abrir ventana:', finalUrl.substring(0, 100) + '...');

      newWindow.location.href = finalUrl;

      console.log('[ServiceSelection] ventana abierta exitosamente');

      // Esperar 1 segundo antes de desactivar loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      console.log('[ServiceSelection] loading desactivado');

    } catch (e) {
      console.error('[ServiceSelection] error general:', e);
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
      alert('Error de red al conectar con el servicio.');
      setLoading(false);
    }
  };

  const handlePrestamosClick = () => {
    const userStr = localStorage.getItem('increscendo_user');
    const testRole = localStorage.getItem('testUserRole');
    if (!userStr && !testRole) { navigate('/auth'); return; }
    const user = userStr ? JSON.parse(userStr) : { role: testRole };
    if (user.role === 'admin') navigate('/admin/dashboard'); else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Logo Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex justify-center">
          <img src={logoFull} alt="Increscendo Fintech" className="h-48 sm:h-64 md:h-80 lg:h-96 w-auto" />
        </div>
      </div>

      {/* Main Content - Centered Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {/* Welcome Message */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-hero bg-clip-text text-transparent">
              Bienvenido
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-4">
              Selecciona un servicio para comenzar
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Card 1: Servicios y Recargas */}
            <Card
              className="group cursor-pointer shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 animate-fade-in"
              onClick={handleServiciosClick}
            >
              <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="mx-auto mb-3 sm:mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">
                  Servicios y Recargas
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 sm:px-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Conectando...</p>
                  </div>
                ) : (
                  <>
                    <CardDescription className="text-sm sm:text-base mb-4 sm:mb-6">
                      Paga servicios, recarga celular y más
                    </CardDescription>
                    <div className="flex items-center justify-center gap-2 text-primary font-medium group-hover:gap-4 transition-all text-sm sm:text-base">
                      <span>Ir al servicio</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 2: Préstamos */}
            <Card
              className="group cursor-pointer shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-2 hover:border-success/50 animate-fade-in"
              onClick={handlePrestamosClick}
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
                <div className="flex items-center justify-center gap-2 text-success font-medium group-hover:gap-4 transition-all text-sm sm:text-base">
                  <span>Ir a préstamos</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
