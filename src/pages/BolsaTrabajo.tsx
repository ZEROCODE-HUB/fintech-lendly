import LegalPageLayout from "@/components/LegalPageLayout";
import { Button } from "@/components/ui/button";
import { Mail, Users, Award, Globe } from "lucide-react";

const BolsaTrabajo = () => {
  return (
    <LegalPageLayout title="Bolsa de Trabajo">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="text-xl text-foreground/90 leading-relaxed">
            Si tu deseo es pertenecer a nuestro grupo selecto de promotores para incrementar tus ingresos, <strong className="text-primary">esta es tu oportunidad</strong>.
          </p>

          <p className="text-foreground/80">
            Nuestros promotores constantemente participan en seminarios trimestrales en línea con una descripción de nuestros servicios y nuevos productos disponibles para nuestros clientes.
          </p>

          <div className="grid grid-cols-2 gap-4 py-6">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Red Nacional</p>
                <p className="text-sm text-muted-foreground">Promotores en todo el país</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
              <Award className="h-8 w-8 text-success" />
              <div>
                <p className="font-semibold">Capacitación</p>
                <p className="text-sm text-muted-foreground">Seminarios trimestrales</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">¡Queremos que seas parte de nuestro equipo!</h2>
            </div>
            <p className="text-foreground/80 mb-6">
              Contamos con una amplia red de promotores en todo el país. Envíanos tu CV y únete a la familia Increscendo Fintech.
            </p>
            <Button 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => window.location.href = 'mailto:empleo@increscendofintech.com'}
            >
              <Mail className="mr-2 h-5 w-5" />
              Enviar CV a empleo@increscendofintech.com
            </Button>
          </div>
        </div>

        <div className="hidden lg:block">
          <img 
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Equipo corporativo de Increscendo Fintech" 
            className="rounded-2xl shadow-2xl object-cover w-full h-[500px]"
          />
        </div>
      </div>
    </LegalPageLayout>
  );
};

export default BolsaTrabajo;
