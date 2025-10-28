import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Banknote, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/utils/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleServiciosClick = () => {
    // TODO: Definir URL del proveedor externo
    window.location.href = 'https://servicios-externos.ejemplo.com';
  };

  const handlePrestamosClick = () => {
    navigate('/loan-request');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 bg-gradient-to-br from-background via-background to-accent/5">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                InCrescendo
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-hero flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </header>

          {/* Main Content - Centered Cards */}
          <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-4rem)] flex items-center justify-center">
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
        </main>

        <Chatbot />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
