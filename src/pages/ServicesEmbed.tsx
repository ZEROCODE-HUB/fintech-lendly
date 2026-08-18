import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoFull from "@/assets/logo-full.png";

export const SERVICES_EMBED_STORAGE_KEY = "services_embed_url";

const ServicesEmbed = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SERVICES_EMBED_STORAGE_KEY);
    if (stored) {
      setUrl(stored);
    } else {
      navigate("/service-selection", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      <header className="flex items-center justify-between gap-3 bg-background border-b px-4 sm:px-6 py-2.5 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <img src={logoFull} alt="Increscendo Fintech" className="h-9 sm:h-10 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-semibold truncate">Servicios y Recargas</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Plataforma de pagos integrada</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate("/service-selection")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver
          </Button>
        </div>
      </header>

      <div className="relative flex-1">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/30">
            <Loader className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando el servicio...</p>
          </div>
        )}
        {url && (
          <iframe
            src={url}
            title="Servicios y Recargas"
            className="w-full h-full border-0"
            onLoad={() => setLoaded(true)}
            allow="payment"
          />
        )}
      </div>
    </div>
  );
};

export default ServicesEmbed;