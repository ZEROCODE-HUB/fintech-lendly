import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Banknote, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ServiceSelection = () => {
  const navigate = useNavigate();

  const handleServiciosClick = () => {
    window.location.href = 'https://www.google.com';
  };

  const handlePrestamosClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Main Content - Centered Cards */}
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {/* Welcome Message */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-hero bg-clip-text text-transparent">
              Bienvenido a InCrescendo
            </h2>
            <p className="text-muted-foreground text-lg">
              Selecciona un servicio para comenzar
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1: Servicios y Recargas */}
            <Card 
              className="group cursor-pointer shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 animate-fade-in"
              onClick={handleServiciosClick}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <CreditCard className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                  Servicios y Recargas
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base mb-6">
                  Paga servicios, recarga celular y más
                </CardDescription>
                <div className="flex items-center justify-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                  <span>Ir al servicio</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Préstamos */}
            <Card 
              className="group cursor-pointer shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-2 hover:border-success/50 animate-fade-in"
              onClick={handlePrestamosClick}
              style={{ animationDelay: '0.1s' }}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-success to-success/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <Banknote className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold group-hover:text-success transition-colors">
                  Préstamos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base mb-6">
                  Solicita y gestiona tus préstamos
                </CardDescription>
                <div className="flex items-center justify-center gap-2 text-success font-medium group-hover:gap-4 transition-all">
                  <span>Ir a préstamos</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
