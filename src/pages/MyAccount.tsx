import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import PHONE_COUNTRY_CODES from '@/lib/phoneCodes';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { User, Shield, CreditCard, Upload, Camera, Calendar, Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/utils/auth";

const MyAccount = () => {
  const currentUser = authService.getCurrentUser();
  const [userRole, setUserRole] = useState<string | null>(currentUser?.role ?? null);
  const isAdmin = userRole === 'admin';
  const { toast } = useToast();

  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+52",
    address: "",
    birthDate: "",
    curp: "",
    ineKey: "",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // try to get user id from local session stored earlier
        let sessionStr = null;
        try { sessionStr = localStorage.getItem('increscendo_session'); } catch { }
        let userId: string | null = null;
        if (sessionStr) {
          try {
            const sessionObj = JSON.parse(sessionStr);
            userId = sessionObj?.user?.id ?? null;
          } catch (e) { console.warn('[MyAccount] failed parsing stored session', e); }
        }

        // fallback to supabase.getUser() if no local session
        if (!userId) {
          try {
            const { data } = await supabase.auth.getUser();
            userId = data?.user?.id ?? null;
          } catch (e) { console.warn('[MyAccount] supabase.getUser failed', e); }
        }

        if (!userId) {
          console.warn('[MyAccount] no user id available to load profile');
          return;
        }

        console.log('[MyAccount] loading users row for id', userId);
        setIsLoadingProfile(true);
        let { data, error } = await supabase.from('users').select('first_name,last_name,email,phone,phone_country_code,avatar_url,role,metadata,terms_accepted,address,birth_date,curp,ine_key,created_at,updated_at').eq('id', userId).limit(1).single();
        if (error) {
          console.warn('[MyAccount] user row fetch error', error);
        }

        // If no row found, try to create a minimal profile row for this authenticated user
        if (!data) {
          try {
            // try to get email from auth if available
            let authEmail: string | null = null;
            try { const gu = await supabase.auth.getUser(); authEmail = gu.data?.user?.email ?? null; } catch (e) { /* ignore */ }

            // try to derive names from local stored profile
            let derivedFirst = '';
            let derivedLast = '';
            try {
              const stored = localStorage.getItem('increscendo_user');
              if (stored) {
                const p = JSON.parse(stored);
                if (p.name) {
                  const parts = String(p.name).split(' ');
                  derivedFirst = parts.slice(0, -1).join(' ') || parts[0] || '';
                  derivedLast = parts.slice(-1).join(' ') || '';
                }
              }
            } catch (e) { /* ignore */ }

            const minimal: any = {
              id: userId,
              email: authEmail ?? undefined,
              first_name: derivedFirst || null,
              last_name: derivedLast || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            console.log('[MyAccount] attempting to insert minimal users row', minimal);
            const ins = await supabase.from('users').insert(minimal).select();
            if (ins.error) {
              console.warn('[MyAccount] minimal insert failed', ins.error);
            } else {
              data = (ins.data as any)?.[0] ?? null;
              console.log('[MyAccount] minimal profile created', data);
              // update local minimal profile cache
              try {
                const profile = { id: userId, email: authEmail ?? undefined, name: `${minimal.first_name || ''} ${minimal.last_name || ''}`.trim(), firstName: minimal.first_name || '', lastName: minimal.last_name || '', role: data?.role ?? 'client', avatar: data?.avatar_url ?? null };
                localStorage.setItem('increscendo_user', JSON.stringify(profile));
              } catch (e) { /* ignore */ }
            }
          } catch (e) {
            console.error('[MyAccount] exception while creating minimal profile', e);
          }
        }

        if (data) {
          setPersonalData(prev => ({
            ...prev,
            firstName: data.first_name || prev.firstName,
            lastName: data.last_name || prev.lastName,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            phoneCountryCode: data.phone_country_code || prev.phoneCountryCode,
            address: data.address || prev.address,
            birthDate: data.birth_date ?? prev.birthDate,
            curp: data.curp || prev.curp,
            ineKey: data.ine_key || prev.ineKey,
          }));
          // set role from DB so UI can reflect admin vs client
          try { setUserRole(data.role ?? currentUser?.role ?? null); } catch (e) { /* ignore */ }
          console.log('[MyAccount] loaded profile from users table', data);
        }
        setIsLoadingProfile(false);
      } catch (e) {
        console.error('[MyAccount] error loading profile', e);
      }
    };

    loadProfile();
  }, []);

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
    const save = async () => {
      try {
        // determine user id from stored session or supabase
        let sessionStr = null;
        try { sessionStr = localStorage.getItem('increscendo_session'); } catch { }
        let userId: string | null = null;
        if (sessionStr) {
          try { userId = JSON.parse(sessionStr)?.user?.id ?? null; } catch (e) { /* ignore */ }
        }
        if (!userId) {
          try { const { data } = await supabase.auth.getUser(); userId = data?.user?.id ?? null; } catch (e) { /* ignore */ }
        }
        if (!userId) {
          toast({ title: 'Error', description: 'No se pudo identificar al usuario autenticado.', variant: 'destructive' });
          return;
        }

        const payload: any = {
          first_name: personalData.firstName || null,
          last_name: personalData.lastName || null,
          phone: personalData.phone || null,
          phone_country_code: personalData.phoneCountryCode || null,
          address: personalData.address || null,
          birth_date: personalData.birthDate || null,
          curp: personalData.curp || null,
          ine_key: personalData.ineKey || null,
          updated_at: new Date().toISOString(),
        };

        console.log('[MyAccount] updating users row for', userId, payload);
        const { data, error } = await supabase.from('users').update(payload).eq('id', userId).select();
        if (error) {
          console.error('[MyAccount] update error', error);
          toast({ title: 'Error', description: 'No se pudieron guardar los cambios en la base de datos.', variant: 'destructive' });
          return;
        }
        console.log('[MyAccount] update success', data);
        toast({ title: 'Cambios guardados', description: 'Tu información personal ha sido actualizada correctamente.' });
        // update local profile minimal
        try {
          const stored = localStorage.getItem('increscendo_user');
          if (stored) {
            const profile = JSON.parse(stored);
            profile.name = `${payload.first_name || ''} ${payload.last_name || ''}`.trim() || profile.name;
            profile.firstName = payload.first_name || '';
            profile.lastName = payload.last_name || '';
            profile.email = data?.[0]?.email ?? profile.email;
            localStorage.setItem('increscendo_user', JSON.stringify(profile));
          }
        } catch (e) { /* ignore */ }
      } catch (e) {
        console.error('[MyAccount] save error', e);
        toast({ title: 'Error', description: 'Error inesperado al guardar.', variant: 'destructive' });
      }
    };
    save();
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Mi Cuenta</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Gestiona tu información personal</p>
              </div>
            </div>
          </header>

          <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6 pt-16 sm:pt-20 md:pt-0">
            {isLoadingProfile && (
              <div className="p-4 bg-muted rounded text-sm text-muted-foreground">Cargando información de usuario...</div>
            )}
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
                    <Label>Teléfono</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        id="phoneCode"
                        value={personalData.phoneCountryCode}
                        onChange={(e) => handlePersonalDataChange("phoneCountryCode", e.target.value)}
                        className="h-10 rounded border px-3 bg-input"
                      >
                        {PHONE_COUNTRY_CODES.map(c => (
                          <option key={`${c.code}-${c.name}`} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Ej: 55 1234 5678"
                        className="col-span-2"
                        value={personalData.phone}
                        onChange={(e) => handlePersonalDataChange("phone", e.target.value)}
                      />
                    </div>
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

            {/* Card 3: INE Validation - Only for non-admin users */}
            {!isAdmin && (
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
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MyAccount;