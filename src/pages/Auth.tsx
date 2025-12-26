import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import loginHero from "@/assets/login-hero.jpg";
import logoIcon from "@/assets/logo-icon.jpeg";
import { ArrowRight, Lock, Mail, Phone } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión correctamente",
      });
      navigate('/service-selection');
    } else {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo y contraseña",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 flex items-center justify-center p-12">
            <div className="text-center space-y-6 max-w-md">
              <h1 className="text-5xl font-bold text-white uppercase tracking-wide">
                Increscendo Fintech
              </h1>
              <p className="text-xl text-white/90">
                Digitaliza tus operaciones financieras con tecnología de punta
              </p>
              <div className="pt-6 space-y-3 text-white/80 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-sm">Gestión completa de préstamos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-sm">Pagos y recargas automatizadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-sm">Seguridad y confianza garantizada</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-sm">Recarga tiempo aire</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-sm">Paga tus servicios</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-sm">Paga y compra más de 400 productos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-sm">Notificaciones inmediatas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-sm">Atención 24/7 con nuestro asistente inteligente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-accent/30">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img src={logoIcon} alt="Increscendo Fintech" className="h-20 sm:h-24 md:h-28 w-20 sm:w-24 md:w-28 rounded-full object-cover shadow-lg" />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 md:mb-8">
              <TabsTrigger value="login" className="text-xs sm:text-sm">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register" className="text-xs sm:text-sm">Registrarse</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="shadow-medium border-0">
                <CardHeader className="space-y-1 px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl">Accede a tu cuenta</CardTitle>
                  <CardDescription>
                    Ingresa tus credenciales para continuar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="tu@email.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="••••••••"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="text-muted-foreground">Recordarme</span>
                      </label>
                      <a href="#" className="text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Ingresar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  {/* Test Access Buttons */}
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">Acceso rápido (solo testing)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          localStorage.setItem('testUserRole', 'client');
                          localStorage.setItem('testUserEmail', 'cliente@test.com');
                          toast({
                            title: "Acceso Cliente",
                            description: "Ingresando como usuario cliente",
                          });
                          navigate('/service-selection');
                        }}
                      >
                        Cliente Test
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          localStorage.setItem('testUserRole', 'admin');
                          localStorage.setItem('testUserEmail', 'admin@gmail.com');
                          toast({
                            title: "Acceso Admin",
                            description: "Ingresando como administrador",
                          });
                          navigate('/admin/dashboard');
                        }}
                      >
                        Admin Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card className="shadow-medium border-0">
                <CardHeader className="space-y-1 px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl">Crear cuenta</CardTitle>
                  <CardDescription>
                    Completa el formulario para registrarte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Juan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Pérez"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regEmail">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="regEmail" 
                        type="email" 
                        placeholder="tu@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Número de Celular</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+52 123 456 7890"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regPassword">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="regPassword" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Al registrarte, aceptas nuestros{" "}
                    <a href="#" className="text-primary hover:underline">
                      Términos y Condiciones
                    </a>{" "}
                    y{" "}
                    <a href="#" className="text-primary hover:underline">
                      Política de Privacidad
                    </a>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    variant="success"
                    onClick={() => navigate('/usuario-nuevo-marketing')}
                  >
                    Crear Cuenta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
