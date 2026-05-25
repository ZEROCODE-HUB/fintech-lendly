import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

export const PublicFooter = () => {
  return (
    <footer className="bg-card border-t border-border py-10 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-base">I</span>
              </div>
              <h3 className="font-semibold text-sm sm:text-base">Increscendo Fintech</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Tecnología financiera que impulsa el crecimiento de tu negocio
            </p>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Redes Sociales</p>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.facebook.com/increscendofintech/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de Increscendo Fintech"
                  className="h-8 w-8 rounded-full border border-border bg-background hover:bg-primary/10 hover:border-primary/30 transition-colors flex items-center justify-center"
                >
                  <Facebook className="h-3.5 w-3.5 text-primary" />
                </a>
                <a
                  href="https://www.instagram.com/_increscendofintech_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Increscendo Fintech"
                  className="h-8 w-8 rounded-full border border-border bg-background hover:bg-primary/10 hover:border-primary/30 transition-colors flex items-center justify-center"
                >
                  <Instagram className="h-3.5 w-3.5 text-primary" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Plataforma</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/#features" className="hover:text-primary transition-colors">Préstamos</Link></li>
              <li><Link to="/#features" className="hover:text-primary transition-colors">Pagos</Link></li>
              <li><Link to="/#features" className="hover:text-primary transition-colors">Recargas</Link></li>
              <li><Link to="/#features" className="hover:text-primary transition-colors">Monederos</Link></li>
              <li><Link to="/#features" className="hover:text-primary transition-colors">Tiempo aire</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Empresa</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/aviso-legal" className="hover:text-primary transition-colors">Aviso Legal</Link></li>
              <li><Link to="/politicas-privacidad" className="hover:text-primary transition-colors">Políticas de Privacidad</Link></li>
              <li><Link to="/terminos-y-condiciones" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/privacidad-empleo" className="hover:text-primary transition-colors">Privacidad Empleo</Link></li>
              <li><Link to="/tips-seguridad" className="hover:text-primary transition-colors">Tips de Seguridad</Link></li>
              <li><Link to="/bolsa-trabajo" className="hover:text-primary transition-colors">Bolsa de Trabajo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Soporte</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/centro-ayuda" className="hover:text-primary transition-colors">Centro de Ayuda</Link></li>
            </ul>
          </div>
        </div>

        <div className="mb-6 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            <strong>Estimado cliente:</strong> Increscendo Fintech no solicita pagos anticipados, depósitos previos ni comisiones antes de otorgar un crédito. Si alguien le solicita dinero a nombre de nuestra empresa, repórtelo inmediatamente. El único sitio oficial es <a href="https://increscendofintech.com" className="text-primary hover:underline">increscendofintech.com</a>.
          </p>
        </div>

        <div className="pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Increscendo Fintech. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};