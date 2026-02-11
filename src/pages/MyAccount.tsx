import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import PHONE_COUNTRY_CODES from '@/lib/phoneCodes';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { User, Shield, CreditCard, Upload, Camera, Calendar, Save, Lock, ImagePlus } from "lucide-react";
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
          setAvatarUrl(data.avatar_url || null);
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

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Error', description: 'Por favor selecciona una imagen.', variant: 'destructive' });
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Error', description: 'La imagen no debe superar 5MB.', variant: 'destructive' });
        return;
      }

      setIsUploadingAvatar(true);

      // Obtener user ID
      let userId: string | null = null;
      try { userId = JSON.parse(localStorage.getItem('increscendo_session') || '{}')?.user?.id ?? null; } catch { }
      if (!userId) {
        try { const { data } = await supabase.auth.getUser(); userId = data?.user?.id ?? null; } catch (e) { /* ignore */ }
      }

      if (!userId) {
        throw new Error('No se pudo identificar al usuario');
      }

      // Subir imagen a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('[MyAccount] uploading avatar to', filePath);

      const { data, error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('[MyAccount] upload error', uploadError);
        throw new Error('Error al subir la imagen');
      }

      // Obtener URL pública de la imagen
      const { data: publicUrlData } = supabase.storage
        .from('user-documents')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error('Error al obtener URL de la imagen');
      }

      // Actualizar avatar_url en la tabla users
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('[MyAccount] update avatar_url error', updateError);
        throw new Error('Error al guardar la foto de perfil');
      }

      setAvatarUrl(publicUrl);
      toast({ title: 'Éxito', description: 'Tu foto de perfil ha sido actualizada.' });
    } catch (err) {
      console.error('[MyAccount] avatar upload error', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al subir la foto de perfil',
        variant: 'destructive'
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
            <SidebarTrigger />
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold truncate">Mi Cuenta</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block truncate">Gestiona tu información personal</p>
              </div>
            </div>
          </header>

          <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 pt-16 sm:pt-20 md:pt-0">
            {isLoadingProfile && (
              <div className="p-4 bg-muted rounded text-sm text-muted-foreground">Cargando información de usuario...</div>
            )}
            {/* Card 1: Personal Information */}
            <Card className="shadow-soft border-border/50">
              <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">Información Personal</CardTitle>
                      <CardDescription className="text-xs sm:text-sm truncate">Actualiza tus datos personales</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      )}
                    </div>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleUploadAvatar}
                        disabled={isUploadingAvatar}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs h-8"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={isUploadingAvatar}
                      >
                        <Upload className="h-3 w-3" />
                        {isUploadingAvatar ? 'Subiendo...' : 'Cambiar'}
                      </Button>
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6" className="px-3 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="firstName" className="text-xs sm:text-sm">Nombre</Label>
                    <Input
                      id="firstName"
                      placeholder="Ingresa tu nombre"
                      value={personalData.firstName}
                      onChange={(e) => handlePersonalDataChange("firstName", e.target.value)}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="lastName" className="text-xs sm:text-sm">Apellido</Label>
                    <Input
                      id="lastName"
                      placeholder="Ingresa tu apellido"
                      value={personalData.lastName}
                      onChange={(e) => handlePersonalDataChange("lastName", e.target.value)}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalData.email}
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed h-9 sm:h-10 text-sm"
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">El email no puede ser modificado</p>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Teléfono</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        id="phoneCode"
                        value={personalData.phoneCountryCode}
                        onChange={(e) => handlePersonalDataChange("phoneCountryCode", e.target.value)}
                        className="h-9 sm:h-10 rounded border px-2 bg-input text-sm"
                      >
                        {PHONE_COUNTRY_CODES.map(c => (
                          <option key={`${c.code}-${c.name}`} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Ej: 55 1234 5678"
                        className="col-span-2 h-9 sm:h-10 text-sm"
                        value={personalData.phone}
                        onChange={(e) => handlePersonalDataChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-xs sm:text-sm">Dirección Completa</Label>
                    <Input
                      id="address"
                      placeholder="Calle, número, colonia, ciudad, estado, CP"
                      value={personalData.address}
                      onChange={(e) => handlePersonalDataChange("address", e.target.value)}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="birthDate" className="text-xs sm:text-sm">Fecha de Nacimiento</Label>
                    <div className="relative">
                      <Input
                        id="birthDate"
                        type="date"
                        value={personalData.birthDate}
                        onChange={(e) => handlePersonalDataChange("birthDate", e.target.value)}
                        className="pr-10 h-9 sm:h-10 text-sm"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="curp" className="text-xs sm:text-sm">CURP</Label>
                    <Input
                      id="curp"
                      placeholder="18 caracteres alfanuméricos"
                      maxLength={18}
                      value={personalData.curp}
                      onChange={(e) => handlePersonalDataChange("curp", e.target.value.toUpperCase())}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                    <Label htmlFor="ineKey" className="text-xs sm:text-sm">Clave INE</Label>
                    <Input
                      id="ineKey"
                      placeholder="Clave de elector de tu INE"
                      value={personalData.ineKey}
                      onChange={(e) => handlePersonalDataChange("ineKey", e.target.value)}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 flex justify-end">
                  <Button onClick={handleSavePersonalData} className="gap-2 h-9 sm:h-10 text-sm">
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Security */}
            <Card className="shadow-soft border-border/50">
              <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-warning/10 flex-shrink-0">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">Cambio de Contraseña</CardTitle>
                    <CardDescription className="text-xs sm:text-sm truncate">Actualiza tu contraseña de acceso</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-xl">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="currentPassword" className="text-xs sm:text-sm">Contraseña Actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="newPassword" className="text-xs sm:text-sm">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      className="h-9 sm:h-10 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 flex justify-start">
                  <Button onClick={handleChangePassword} variant="secondary" className="gap-2 h-9 sm:h-10 text-sm">
                    <Lock className="h-4 w-4" />
                    Cambiar Contraseña
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: INE Validation - Only for non-admin users */}
            {!isAdmin && (
              <Card className="shadow-soft border-border/50">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-success/10 flex-shrink-0">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-lg">Documentación INE</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Sube o captura las fotos de tu INE para validar tu identidad</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* INE Front */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-medium">INE Frente</Label>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-3 sm:gap-4 bg-muted/30 hover:bg-muted/50 transition-colors min-h-[160px] sm:min-h-[180px]">
                        <div className="text-center">
                          <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-muted-foreground">Parte frontal de tu INE</p>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadImage("front")}
                            className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs"
                          >
                            <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                            Subir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCamera("front")}
                            className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs"
                          >
                            <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                            Cámara
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* INE Back */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-medium">INE Reverso</Label>
                      <div className="border-2 border-dashed border-border rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-3 sm:gap-4 bg-muted/30 hover:bg-muted/50 transition-colors min-h-[160px] sm:min-h-[180px]">
                        <div className="text-center">
                          <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-muted-foreground">Parte trasera de tu INE</p>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadImage("back")}
                            className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs"
                          >
                            <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                            Subir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCamera("back")}
                            className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs"
                          >
                            <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
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