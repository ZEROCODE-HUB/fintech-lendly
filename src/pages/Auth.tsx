import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import loginHero from "@/assets/login-hero.jpg";
import { ArrowRight, Lock, Mail, Phone, Upload, UserCog, User } from "lucide-react";
import { authService } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDemoLogin = (role: 'admin' | 'client') => {
    authService.loginDemo(role);
    toast({
      title: "Acceso Demo",
      description: `Has ingresado como ${role === 'admin' ? 'Administrador' : 'Cliente'}`,
    });
    navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard');
  };

  return (
    <div className="min-h-screen flex">
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
              <div className="pt-8 space-y-4 text-white/80 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Gestión completa de préstamos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Pagos y recargas automatizadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Seguridad y confianza garantizada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-accent/30">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="text-2xl">Accede a tu cuenta</CardTitle>
                  <CardDescription>
                    Ingresa tus credenciales para continuar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="tu@email.com"
                        className="pl-10"
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
                  <Button className="w-full" size="lg">
                    Ingresar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Separator className="my-6" />

                  <div className="space-y-3">
                    <p className="text-sm text-center text-muted-foreground font-medium">
                      Acceso Demo (Sin Registro)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => handleDemoLogin('client')}
                        className="w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Cliente
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => handleDemoLogin('admin')}
                        className="w-full"
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        Admin
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle className="text-2xl">Crear cuenta</CardTitle>
                  <CardDescription>
                    Completa el formulario para registrarte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="ine">Documento INE</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span className="text-sm">Haz clic para cargar tu INE</span>
                        <span className="text-xs">PDF, JPG o PNG (máx. 5MB)</span>
                      </div>
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
                  <Button className="w-full" size="lg" variant="success">
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
