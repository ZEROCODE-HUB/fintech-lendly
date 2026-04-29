import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, BarChart3, TrendingUp, Users, Clock, Wallet, Smartphone, Facebook, Instagram, Menu, X } from "lucide-react";
import heroImage from "@/assets/hero-landing.jpg";
import logoHorizontal from "@/assets/logo-horizontal.jpg";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAccess = async () => {
    try {
      // Primero intentafdfddfdsmos usar la sesión real de Supabase para obtener el rol actualizado
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
          const firstName = (profileRow as any)?.first_name ?? '';
          const lastName = (profileRow as any)?.last_name ?? '';
          const name = firstName || lastName
            ? `${firstName} ${lastName}`.trim()
            : (user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Usuario');
          const avatar = (profileRow as any)?.avatar_url ?? null;

          try {
            const profile = { id: user.id, email: user.email ?? null, name, firstName, lastName, role, avatar };
            localStorage.setItem('increscendo_user', JSON.stringify(profile));
          } catch (storeErr) {
            console.warn('[Index] failed to store refreshed profile', storeErr);
          }

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

    // Fallback: comportamiento anterior usando localStorage/testUserRole
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
    <div className="min-h-screen overflow-x-hidden">
      {/* Header/Navbar */}
      <header className="fixed top-0 w-full bg-card/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center flex-shrink-0">
              <img src={logoHorizontal} alt="Increscendo Fintech" className="h-8 sm:h-10 md:h-12 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contacto</a> 

              {/* <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Características</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">Nosotros</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contacto</a> */}
              <Button onClick={handleAccess} variant="default">
                Acceder
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <nav className="flex flex-col px-4 py-4 space-y-3">
              {/* <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="#about"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nosotros
              </a>
              <a
                href="#contact"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >Contacto
                
              </a> */}
              {/* <Button
                onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
                variant="default"
                className="w-full mt-2"
              >
                Acceder
              </Button> */}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide">
              Increscendo <span className="text-primary">Fintech</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Impulsa tu negocio con recargas, pago de servicios y préstamos de manera inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button size="lg" onClick={handleAccess} className="w-full sm:w-auto">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '#features'} className="w-full sm:w-auto">
                Conocer Más
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 pt-4 sm:pt-6">
              <div className="flex flex-col items-center justify-center px-2 sm:px-4 min-h-[56px]">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(222,47%,25%)]">+400</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Productos</p>
              </div>
              <div className="flex flex-col items-center justify-center px-2 sm:px-4 min-h-[56px] sm:border-l sm:border-border/50">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(222,47%,25%)]">$5M</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Financiamiento</p>
              </div>
              <div className="flex flex-col items-center justify-center px-2 sm:px-4 min-h-[56px] sm:border-l sm:border-border/50">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(222,47%,25%)]">100%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Seguro</p>
              </div>
              <div className="flex flex-col items-center justify-center px-2 sm:px-4 min-h-[56px] sm:border-l sm:border-border/50">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(222,47%,25%)]">24/7</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Atención</p>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <img src={heroImage} alt="Equipo Increscendo" className="rounded-2xl shadow-2xl object-cover w-full h-[500px]" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-accent/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">¿Por Qué Increscendo?</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Soluciones integrales que simplifican la vida de nuestros clientes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-success/20 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-4">Seguridad de Nivel Bancario</h3>
              <p className="text-muted-foreground">
                Protección de datos con encriptación de punta a punta y cumplimiento total de normativas financieras
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Pago de servicios, fácil y rápido.</h3>
              <p className="text-muted-foreground">
                Paga todos tus servicios de luz, agua, gas, teléfono, televisión de paga, impuestos estatales, telepeaje en un mismo lugar.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-danger/20 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="h-7 w-7 text-danger" />
              </div>
              <h3 className="text-xl font-bold mb-4">Recarga de tiempo aire en segundos</h3>
              <p className="text-muted-foreground">
                Realiza todas las recargas de las compañías de telefonía móvil en México de manera segura.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-accent/50 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Préstamos</h3>
              <p className="text-muted-foreground">
                Te apoyamos para adquirir un préstamo a través de nuestra plataforma automatizada con IA
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-success/20 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-4">Soporte Personalizado</h3>
              <p className="text-muted-foreground">
                Asistencia 24/7 con chatbot inteligente y equipo de expertos siempre disponibles
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Monederos de regalo digitales</h3>
              <p className="text-muted-foreground">
                Solicita tus códigos que se generan en nuestro sistema y te seran enviados mediante mensaje de texto SMS a su celular. 
                Podrás canjearlos y hacer uso de ellos para generar compras en internet y/o uso de los servicios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Tecnología de Vanguardia</h2>
              <p className="text-lg text-muted-foreground  max-w-prose">
                 En Increscendo Fintech combinamos tecnología de punta e inteligencia artificial, con las mejores prácticas para ofrecer soluciones financieras que verdaderamente transformen tu negocio.
              </p>
      
              <Button size="lg" variant="default" onClick={handleAccess}>
                Comienza Tu Prueba Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="bg-gradient-hero rounded-lg p-6 sm:p-8 md:p-12 text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Servicios Integrados</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span>Gestión completa de préstamos y cronogramas de pago</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span>Pagos de servicios y recargas automatizadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span>Monederos digitales con seguridad bancaria</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span>Validación de identidad con tecnología OCR</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span>Link de pagos al instante </span>
                </li>
                 <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span>Domicialización</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white px-2">¿Listo Para Transformar Tu Negocio?</h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4">
            Únete a miles de clientes que ya confían en Increscendo Fintech para
            gestionar sus operaciones financieras con tecnología de clase mundial
          </p>
            <Button
            size="lg"
            variant="success"
            onClick={() => { const userStr = localStorage.getItem('increscendo_user'); const testRole = localStorage.getItem('testUserRole'); if (!userStr && !testRole) { navigate('/auth'); return; } const user = userStr ? JSON.parse(userStr) : { role: testRole }; if (user.role === 'admin') navigate('/admin/dashboard'); else navigate('/dashboard'); }}
            className="text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 mt-4 sm:mt-8 shadow-glow w-full sm:w-auto"
          >
            Crear Cuenta Gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-card border-t border-border py-10 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="space-y-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-base sm:text-xl">I</span>
                </div>
                <h3 className="font-bold text-sm sm:text-lg">Increscendo Fintech</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-justified">
                Tecnología financiera que impulsa el crecimiento de tu negocio
              </p>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Redes Sociales</p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.facebook.com/increscendofintech/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook de Increscendo Fintech"
                    className="h-9 w-9 rounded-full border border-border bg-background hover:bg-primary/10 hover:border-primary/30 transition-colors flex items-center justify-center"
                  >
                    <Facebook className="h-4 w-4 text-primary" />
                  </a>
                  <a
                    href="https://www.instagram.com/_increscendofintech_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram de Increscendo Fintech"
                    className="h-9 w-9 rounded-full border border-border bg-background hover:bg-primary/10 hover:border-primary/30 transition-colors flex items-center justify-center"
                  >
                    <Instagram className="h-4 w-4 text-primary" />
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Préstamos</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Pagos</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Recargas</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Monederos</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Tiempo aire</a></li>
              
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/aviso-legal" className="hover:text-primary transition-colors">Aviso Legal</Link></li>
                <li><Link to="/politicas-privacidad" className="hover:text-primary transition-colors">Políticas de Privacidad</Link></li>
                <li><Link to="/terminos-y-condiciones" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
                <li><Link to="/privacidad-empleo" className="hover:text-primary transition-colors">Privacidad Empleo</Link></li>
                <li><Link to="/tips-seguridad" className="hover:text-primary transition-colors">Tips de Seguridad</Link></li>
                <li><Link to="/bolsa-trabajo" className="hover:text-primary transition-colors">Bolsa de Trabajo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/centro-ayuda" className="hover:text-primary transition-colors">Centro de Ayuda</Link></li>
              </ul>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-justified">
              <strong>Estimado cliente:</strong> Es importante informarles que Increscendo Fintech no solicita pagos anticipados, depósitos previos ni cualquier tipo de comisión antes de otorgar un crédito. Si alguien le solicita dinero a nombre de nuestra empresa, por favor repórtelo inmediatamente a nuestros canales oficiales. Proteja su información personal y financiera. El único sitio oficial de Increscendo Fintech es <a href="https://increscendofintech.com" className="text-primary hover:underline">https://increscendofintech.com</a> y solo contamos con oficinas corporativas en la CDMX, México.
            </p>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Increscendo Fintech. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
