import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero min-h-screen flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center text-white space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wide">
            Bienvenido a Fintech
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            La plataforma digital que revoluciona la gestión de préstamos con tecnología de punta, 
            simplificando tus operaciones financieras
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              variant="success"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 bg-white/10 text-white border-white hover:bg-white hover:text-primary"
              onClick={() => navigate("/dashboard")}
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-16">¿Por Qué Elegirnos?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-shadow">
              <div className="h-12 w-12 bg-success/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-3">Seguridad Garantizada</h3>
              <p className="text-muted-foreground">
                Protección de datos de nivel bancario con encriptación de punta a punta para todas tus transacciones
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-shadow">
              <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Proceso Rápido</h3>
              <p className="text-muted-foreground">
                Solicitudes procesadas en 24-48 horas con aprobación automática para clientes calificados
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-lg shadow-medium hover:shadow-strong transition-shadow">
              <div className="h-12 w-12 bg-danger/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-danger" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gestión Inteligente</h3>
              <p className="text-muted-foreground">
                Dashboard completo con análisis en tiempo real de tus préstamos, pagos y proyecciones financieras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-white">¿Listo Para Comenzar?</h2>
          <p className="text-xl text-white/90">
            Únete a miles de usuarios que ya confían en nuestra plataforma para gestionar sus finanzas
          </p>
          <Button 
            size="lg"
            variant="success"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6 mt-8"
          >
            Crear Cuenta Gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Fintech. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
