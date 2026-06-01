import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Zap, TrendingUp, Users, Clock, Wallet, Smartphone, Facebook, Instagram } from "lucide-react";
import heroImage from "@/assets/hero-landing.webp";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const navigate = useNavigate();

  const handleAccess = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('[Index] getSession error', sessionError);
      }

      const session = sessionData?.session ?? null;
      const user = session?.user ?? null;

      if (user) {
        try {
          const { data: profileRow, error: profileErr } = await supabase
            .from('users')
            .select('role, first_name, last_name, avatar_url')
            .eq('id', user.id)
            .limit(1)
            .maybeSingle();

          if (profileErr) {
            console.warn('[Index] users lookup error', profileErr);
          }

          const role = (profileRow as any)?.role ?? 'client';

          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/service-selection');
          }
          return;
        } catch (profileCatch) {
          console.warn('[Index] exception during users lookup', profileCatch);
        }
      }
    } catch (err) {
      console.warn('[Index] handleAccess getSession failed', err);
    }

    const userStr = localStorage.getItem('increscendo_user');
    const testRole = localStorage.getItem('testUserRole');
    if (!userStr && !testRole) {
      navigate('/auth');
      return;
    }
    const userLocal = userStr ? JSON.parse(userStr) : { role: testRole };
    if (userLocal.role === 'admin') navigate('/admin/dashboard'); else navigate('/service-selection');
  };

  return (
    <div className="">
      {/* Hero Section */}
      <section className=" pb-12 px-4 sm:px-24">
        <div className="mx-auto  sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center justify-center flex-col-reverse  sm:flex-row">
          <div className="space-y-5 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Increscendo <span className="text-primary">Fintech</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg">
              Impulsa tu negocio con recargas, pago de servicios y préstamos de manera inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleAccess} className="w-full sm:w-auto">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '#features'} className="w-full sm:w-auto">
                Conocer Más
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-primary">+400</p>
                <p className="text-xs text-muted-foreground">Productos</p>
              </div>
              <div className="text-center border-l border-border/50 pl-4">
                <p className="text-xl sm:text-2xl font-bold text-primary">$5M</p>
                <p className="text-xs text-muted-foreground">Financiamiento</p>
              </div>
              <div className="text-center border-l border-border/50 pl-4">
                <p className="text-xl sm:text-2xl font-bold text-primary">100%</p>
                <p className="text-xs text-muted-foreground">Seguro</p>
              </div>
              <div className="text-center border-l border-border/50 pl-4">
                <p className="text-xl sm:text-2xl font-bold text-primary">24/7</p>
                <p className="text-xs text-muted-foreground">Atención</p>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <img src={heroImage} alt="Equipo Increscendo" className="rounded-xl shadow-soft object-cover w-full h-[400px]" loading="lazy" width={800} height={400} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-accent/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-3">¿Por Qué Increscendo?</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Soluciones integrales que simplifican la vida de nuestros clientes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-card p-5 sm:p-6 rounded-lg shadow-soft hover:shadow-medium transition-all">
              <div className="h-10 w-10 bg-success/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Seguridad de Nivel Bancario</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Protección de datos con encriptación de punta a punta y cumplimiento total de normativas financieras
              </p>
            </div>

            <div className="bg-card p-5 sm:p-6 rounded-lg shadow-soft hover:shadow-medium transition-all">
              <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Pago de servicios, fácil y rápido</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Paga todos tus servicios de luz, agua, gas, teléfono y más en un mismo lugar.
              </p>
            </div>

            <div className="bg-card p-5 sm:p-6 rounded-lg shadow-soft hover:shadow-medium transition-all">
              <div className="h-10 w-10 bg-danger/20 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-5 w-5 text-danger" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Recarga de tiempo aire en segundos</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Realiza todas las recargas de las compañías de telefonía móvil en México de manera segura.
              </p>
            </div>

            <div className="bg-card p-5 sm:p-6 rounded-lg shadow-soft hover:shadow-medium transition-all">
              <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Préstamos Inteligentes</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Te apoyamos para adquirir un préstamo a través de nuestra plataforma automatizada con IA.
              </p>
            </div>

            <div className="bg-card p-5 sm:p-6 rounded-lg shadow-soft hover:shadow-medium transition-all">
              <div className="h-10 w-10 bg-success/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Soporte Personalizado</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Asistencia 24/7 con chatbot inteligente y equipo de expertos siempre disponibles.
              </p>
            </div>

            <div className="bg-card p-5 sm:p-6 rounded-lg shadow-soft hover:shadow-medium transition-all">
              <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Monederos de regalo digitales</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Solicita códigos generados en nuestro sistema y recíbelos por SMS para usar en compras online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">Tecnología de Vanguardia</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                En Increscendo Fintech combinamos tecnología de punta e inteligencia artificial, con las mejores prácticas para ofrecer soluciones financieras que verdaderamente transformen tu negocio.
              </p>
              <Button onClick={handleAccess}>
                Comienza Tu Prueba Gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="bg-gradient-hero rounded-lg p-6 sm:p-8 text-white">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Servicios Integrados</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  <span>Gestión completa de préstamos y cronogramas de pago</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  <span>Pagos de servicios y recargas automatizadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  <span>Monederos digitales con seguridad bancaria</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  <span>Validación de identidad con tecnología OCR</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  <span>Link de pagos al instante</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                  <span>Domicialización</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white px-2">¿Listo Para Transformar Tu Negocio?</h2>
          <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto">
            Únete a miles de clientes que ya confían en Increscendo Fintech para gestionar sus operaciones financieras con tecnología de clase mundial
          </p>
          <Button
            variant="success"
            onClick={() => { const userStr = localStorage.getItem('increscendo_user'); const testRole = localStorage.getItem('testUserRole'); if (!userStr && !testRole) { navigate('/auth'); return; } const user = userStr ? JSON.parse(userStr) : { role: testRole }; if (user.role === 'admin') navigate('/admin/dashboard'); else navigate('/dashboard'); }}
            className="mt-4 w-full sm:w-auto"
          >
            Crear Cuenta Gratis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;