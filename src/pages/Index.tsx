import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Zap, BarChart3, TrendingUp, Users, Clock, DollarSign, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-landing.jpg";
import logoHorizontal from "@/assets/logo-horizontal.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header/Navbar */}
      <header className="fixed top-0 w-full bg-card/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src={logoHorizontal} alt="Increscendo Fintech" className="h-10 sm:h-12 w-auto" />
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Características</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">Nosotros</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contacto</a>
              <Button onClick={() => navigate("/auth")} variant="default">
                Acceder
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold uppercase tracking-wide">
              Increscendo <span className="text-primary">Fintech</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Digitaliza tus operaciones de préstamo con tecnología avanzada, inteligencia artificial 
              y análisis de Big Data para potenciar el crecimiento de tu negocio
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '#features'}>
                Conocer Más
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div>
                <p className="text-3xl font-bold text-primary">245+</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">$2.4M</p>
                <p className="text-sm text-muted-foreground">Desembolsado</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">94.5%</p>
                <p className="text-sm text-muted-foreground">Cobranza</p>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <img src={heroImage} alt="Equipo Increscendo" className="rounded-2xl shadow-2xl object-cover w-full h-[500px]" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-accent/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">¿Por Qué Increscendo?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Soluciones integrales que simplifican la vida de nuestros clientes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <h3 className="text-xl font-bold mb-4">Aprobación Instantánea</h3>
              <p className="text-muted-foreground">
                Proceso automatizado con IA que evalúa y aprueba solicitudes en menos de 24 horas
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-danger/20 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-danger" />
              </div>
              <h3 className="text-xl font-bold mb-4">Análisis Inteligente</h3>
              <p className="text-muted-foreground">
                Dashboard con Big Data que proporciona insights en tiempo real sobre tu portafolio financiero
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-accent/50 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Crecimiento Continuo</h3>
              <p className="text-muted-foreground">
                Plataforma diseñada para escalar con tu negocio y potenciar tu expansión internacional
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
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Gestión Automatizada</h3>
              <p className="text-muted-foreground">
                Pagos automáticos, recordatorios inteligentes y conciliación en tiempo real
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Tecnología de Vanguardia</h2>
              <p className="text-lg text-muted-foreground">
                En Increscendo Fintech combinamos inteligencia artificial, Big Data y las mejores 
                prácticas de la industria logística internacional para ofrecer soluciones financieras 
                que verdaderamente transforman negocios.
              </p>
              <p className="text-lg text-muted-foreground">
                Nuestra plataforma integra todos los servicios que necesitas: desde pagos y recargas 
                hasta gestión completa de préstamos con seguimiento en tiempo real.
              </p>
              <Button size="lg" variant="default" onClick={() => navigate("/auth")}>
                Comienza Tu Prueba Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="bg-gradient-hero rounded-lg p-12 text-white">
              <h3 className="text-2xl font-bold mb-6">Servicios Integrados</h3>
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
                  <span>Dashboard administrativo con análisis avanzado</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">¿Listo Para Transformar Tu Negocio?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Únete a miles de empresas que ya confían en Increscendo Fintech para 
            gestionar sus operaciones financieras con tecnología de clase mundial
          </p>
          <Button 
            size="lg"
            variant="success"
            onClick={() => navigate("/auth")}
            className="text-lg px-10 py-7 mt-8 shadow-glow"
          >
            Crear Cuenta Gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-card border-t border-border py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">I</span>
                </div>
                <h3 className="font-bold text-lg">Increscendo Fintech</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Tecnología financiera que impulsa el crecimiento de tu negocio
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Préstamos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pagos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Recargas</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Monederos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Prensa</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Increscendo Fintech. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
