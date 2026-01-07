import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoHorizontal from "@/assets/logo-horizontal.jpg";
import { Link } from "react-router-dom";

interface LegalPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const LegalPageLayout = ({ title, children }: LegalPageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-card/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src={logoHorizontal} alt="Increscendo Fintech" className="h-10 sm:h-12 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Características</Link>
              <Link to="/#about" className="text-muted-foreground hover:text-foreground transition-colors">Nosotros</Link>
              <Link to="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contacto</Link>
              <Button onClick={() => navigate("/auth")} variant="default">
                Acceder
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 uppercase tracking-wide">
            {title}
          </h1>
          
          <article className="prose prose-lg max-w-none text-foreground/90 space-y-6 prose-justified">
            {children}
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16 px-4">
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
                <li><Link to="/#features" className="hover:text-primary transition-colors">Préstamos</Link></li>
                <li><Link to="/#features" className="hover:text-primary transition-colors">Pagos</Link></li>
                <li><Link to="/#features" className="hover:text-primary transition-colors">Recargas</Link></li>
                <li><Link to="/#features" className="hover:text-primary transition-colors">Monederos</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/aviso-legal" className="hover:text-primary transition-colors">Aviso Legal</Link></li>
                <li><Link to="/politicas-privacidad" className="hover:text-primary transition-colors">Políticas de Privacidad</Link></li>
                <li><Link to="/privacidad-empleo" className="hover:text-primary transition-colors">Privacidad Empleo</Link></li>
                <li><Link to="/tips-seguridad" className="hover:text-primary transition-colors">Tips de Seguridad</Link></li>
                <li><Link to="/bolsa-trabajo" className="hover:text-primary transition-colors">Bolsa de Trabajo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/centro-ayuda" className="hover:text-primary transition-colors">Centro de Ayuda</Link></li>
                <li><Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
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
            <p>&copy; 2024 Increscendo Fintech. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalPageLayout;
