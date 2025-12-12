import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Shield, CreditCard, Upload, Camera, Calendar, Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const MyAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Personal data state
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "usuario@ejemplo.com",
    phone: "",
    address: "",
    birthDate: "",
    curp: "",
    ineKey: "",
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const handlePersonalDataChange = (field: string, value: string) => {
    setPersonalData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePersonalData = () => {
    toast({
      title: "Cambios guardados",
      description: "Tu información personal ha sido actualizada correctamente.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña ha sido cambiada exitosamente.",
    });
    setPasswordData({ currentPassword: "", newPassword: "" });
  };

  const handleUploadImage = (side: "front" | "back") => {
    toast({
      title: `Subir INE ${side === "front" ? "Frente" : "Reverso"}`,
      description: "Funcionalidad de carga próximamente disponible.",
    });
  };

  const handleOpenCamera = (side: "front" | "back") => {
    toast({
      title: `Capturar INE ${side === "front" ? "Frente" : "Reverso"}`,
      description: "Funcionalidad de cámara próximamente disponible.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Mi Cuenta</h1>
              <p className="text-sm text-muted-foreground">Gestiona tu información personal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Card 1: Personal Information */}
        <Card className="shadow-soft border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Información Personal</CardTitle>
                <CardDescription>Actualiza tus datos personales</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  placeholder="Ingresa tu nombre"
                  value={personalData.firstName}
                  onChange={(e) => handlePersonalDataChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  placeholder="Ingresa tu apellido"
                  value={personalData.lastName}
                  onChange={(e) => handlePersonalDataChange("lastName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalData.email}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">El email no puede ser modificado</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ej: +52 55 1234 5678"
                  value={personalData.phone}
                  onChange={(e) => handlePersonalDataChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección Completa</Label>
                <Input
                  id="address"
                  placeholder="Calle, número, colonia, ciudad, estado, CP"
                  value={personalData.address}
                  onChange={(e) => handlePersonalDataChange("address", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <div className="relative">
                  <Input
                    id="birthDate"
                    type="date"
                    value={personalData.birthDate}
                    onChange={(e) => handlePersonalDataChange("birthDate", e.target.value)}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="curp">CURP</Label>
                <Input
                  id="curp"
                  placeholder="18 caracteres alfanuméricos"
                  maxLength={18}
                  value={personalData.curp}
                  onChange={(e) => handlePersonalDataChange("curp", e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ineKey">Clave INE</Label>
                <Input
                  id="ineKey"
                  placeholder="Clave de elector de tu INE"
                  value={personalData.ineKey}
                  onChange={(e) => handlePersonalDataChange("ineKey", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSavePersonalData} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Security */}
        <Card className="shadow-soft border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-warning/10">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Cambio de Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-start">
              <Button onClick={handleChangePassword} variant="secondary" className="gap-2">
                <Lock className="h-4 w-4" />
                Cambiar Contraseña
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: INE Validation */}
        <Card className="shadow-soft border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">Documentación INE</CardTitle>
                <CardDescription>Sube o captura las fotos de tu INE para validar tu identidad</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* INE Front */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">INE Frente</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors min-h-[180px]">
                  <div className="text-center">
                    <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Parte frontal de tu INE</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUploadImage("front")}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Subir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenCamera("front")}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Cámara
                    </Button>
                  </div>
                </div>
              </div>

              {/* INE Back */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">INE Reverso</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors min-h-[180px]">
                  <div className="text-center">
                    <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Parte trasera de tu INE</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUploadImage("back")}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Subir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenCamera("back")}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Cámara
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MyAccount;
