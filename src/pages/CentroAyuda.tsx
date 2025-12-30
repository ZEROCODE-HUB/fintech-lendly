import LegalPageLayout from "@/components/LegalPageLayout";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  FileText, 
  CreditCard, 
  Shield, 
  HelpCircle,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const helpCategories = [
  {
    icon: CreditCard,
    title: "Préstamos y Créditos",
    description: "Información sobre solicitudes, aprobaciones y pagos de préstamos.",
    color: "text-primary"
  },
  {
    icon: Shield,
    title: "Seguridad",
    description: "Protege tu cuenta y aprende sobre nuestras medidas de seguridad.",
    link: "/tips-seguridad",
    color: "text-success"
  },
  {
    icon: FileText,
    title: "Documentación Legal",
    description: "Accede a nuestros avisos legales y políticas de privacidad.",
    link: "/aviso-legal",
    color: "text-danger"
  },
  {
    icon: HelpCircle,
    title: "Preguntas Frecuentes",
    description: "Encuentra respuestas a las dudas más comunes de nuestros usuarios.",
    color: "text-primary"
  },
];

const CentroAyuda = () => {
  return (
    <LegalPageLayout title="Centro de Ayuda">
      <p className="text-lg text-muted-foreground mb-8">
        Estamos aquí para ayudarte. Encuentra la información que necesitas o contáctanos directamente.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {helpCategories.map((category, index) => (
          <div 
            key={index}
            className="p-6 bg-card rounded-lg border border-border hover:shadow-medium transition-all"
          >
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${category.color === 'text-primary' ? 'bg-primary/10' : category.color === 'text-success' ? 'bg-success/10' : 'bg-danger/10'}`}>
              <category.icon className={`h-6 w-6 ${category.color}`} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
            {category.link && (
              <Link to={category.link} className="text-primary hover:underline text-sm font-medium">
                Ver más →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="p-8 bg-gradient-hero rounded-xl text-white">
        <h2 className="text-2xl font-bold mb-6">¿Necesitas ayuda personalizada?</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Teléfono</h3>
              <p className="text-white/80 text-sm">+52 55 9020 7001</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-white/80 text-sm">info@increscendofintech.com</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Horario</h3>
              <p className="text-white/80 text-sm">Lun - Vie: 9:00 - 18:00</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => window.location.href = '/contacto'}
            className="bg-white text-primary hover:bg-white/90"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Ir a Contacto
          </Button>
        </div>
      </div>
    </LegalPageLayout>
  );
};

export default CentroAyuda;
