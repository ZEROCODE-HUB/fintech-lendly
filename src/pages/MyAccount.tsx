import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabaseConfig';
import PHONE_COUNTRY_CODES from '@/lib/phoneCodes';
import { User, Shield, CreditCard, Upload, Camera, Calendar, Save, Lock, Eye, EyeOff, Pencil, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const MyAccount = () => {
  const { userId, isAdmin } = useAuth();
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
  const [ineFrontFile, setIneFrontFile] = useState<File | null>(null);
  const [ineBackFile, setIneBackFile] = useState<File | null>(null);
  const [ineFrontPreview, setIneFrontPreview] = useState<string | null>(null);
  const [ineBackPreview, setIneBackPreview] = useState<string | null>(null);
  const [ineFrontDeleted, setIneFrontDeleted] = useState(false);
  const [ineBackDeleted, setIneBackDeleted] = useState(false);
  const [isUploadingIne, setIsUploadingIne] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const uploadFileToStorage = async (file: File, folder: string, fileName: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User not authenticated');

      const filePath = `${folder}/${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return publicUrl?.publicUrl || null;
    } catch (err) {
      console.error(`Error uploading ${fileName}:`, err);
      return null;
    }
  };

  const handleIneFileSelect = (side: "front" | "back", file: File) => {
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setIneFrontFile(file);
      setIneFrontPreview(url);
      setIneFrontDeleted(false);
    } else {
      setIneBackFile(file);
      setIneBackPreview(url);
      setIneBackDeleted(false);
    }
  };

  const handleUploadIne = (side: "front" | "back") => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast({ title: 'Error', description: 'Por favor selecciona una imagen.', variant: 'destructive' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Error', description: 'La imagen no debe superar 5MB.', variant: 'destructive' });
        return;
      }

      handleIneFileSelect(side, file);
    };
    input.click();
  };

  const handleOpenCamera = async (side: "front" | "back") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '50%';
      canvas.style.left = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
      canvas.style.zIndex = '9999';
      canvas.style.border = '2px solid white';
      canvas.style.borderRadius = '8px';
      document.body.appendChild(canvas);

      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capturar';
      captureBtn.style.position = 'fixed';
      captureBtn.style.bottom = '20px';
      captureBtn.style.left = '50%';
      captureBtn.style.transform = 'translateX(-50%)';
      captureBtn.style.padding = '12px 24px';
      captureBtn.style.background = '#22c55e';
      captureBtn.style.color = 'white';
      captureBtn.style.border = 'none';
      captureBtn.style.borderRadius = '8px';
      captureBtn.style.zIndex = '10000';
      captureBtn.style.cursor = 'pointer';
      document.body.appendChild(captureBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancelar';
      cancelBtn.style.position = 'fixed';
      cancelBtn.style.bottom = '20px';
      cancelBtn.style.right = '20px';
      cancelBtn.style.padding = '12px 24px';
      cancelBtn.style.background = '#ef4444';
      cancelBtn.style.color = 'white';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '8px';
      cancelBtn.style.zIndex = '10000';
      cancelBtn.style.cursor = 'pointer';
      document.body.appendChild(cancelBtn);

      const cleanup = () => {
        stream.getTracks().forEach(t => t.stop());
        document.body.removeChild(video);
        document.body.removeChild(canvas);
        document.body.removeChild(captureBtn);
        document.body.removeChild(cancelBtn);
      };

      captureBtn.onclick = () => {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `ine_${side}_${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleIneFileSelect(side, file);
          }
          cleanup();
        }, 'image/jpeg', 0.8);
      };

      cancelBtn.onclick = cleanup;
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo acceder a la cámara.', variant: 'destructive' });
    }
  };

  const handleSaveIneDocuments = async () => {
    if (!ineFrontFile && !ineBackFile && !ineFrontDeleted && !ineBackDeleted) {
      toast({ title: 'Sin cambios', description: 'No hay cambios en los documentos INE.' });
      return;
    }

    setIsUploadingIne(true);
    try {
      if (!userId) throw new Error('No se pudo identificar al usuario');

      const timestamp = Date.now();
      const updates: Record<string, string | null> = {};

      if (ineFrontDeleted) {
        updates.ine_front_url = null;
      } else if (ineFrontFile) {
        const url = await uploadFileToStorage(ineFrontFile, 'ine-documents', `ine_front_${timestamp}.jpg`);
        if (url) updates.ine_front_url = url;
      }

      if (ineBackDeleted) {
        updates.ine_back_url = null;
      } else if (ineBackFile) {
        const url = await uploadFileToStorage(ineBackFile, 'ine-documents', `ine_back_${timestamp}.jpg`);
        if (url) updates.ine_back_url = url;
      }

      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();
        const { error } = await supabase.from('users').update(updates).eq('id', userId);
        if (error) throw error;
        toast({ title: 'Éxito', description: 'Documentos INE guardados correctamente.' });
        if (typeof window !== 'undefined' && (window as any).refreshSidebarUserData) {
          (window as any).refreshSidebarUserData();
        }
      }
    } catch (err) {
      console.error('[MyAccount] save INE error', err);
      toast({ title: 'Error', description: 'No se pudieron guardar los documentos.', variant: 'destructive' });
    } finally {
      setIsUploadingIne(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!userId) {
          console.warn('[MyAccount] no user id available to load profile');
          return;
        }

        setIsLoadingProfile(true);
        let { data, error } = await supabase.from('users').select('first_name,last_name,email,phone,phone_country_code,avatar_url,role,metadata,terms_accepted,address,birth_date,curp,ine_key,ine_front_url,ine_back_url,created_at,updated_at').eq('id', userId).limit(1).single();
        if (error) {
          console.warn('[MyAccount] user row fetch error', error);
        }

        if (!data) {
          try {
            let authEmail: string | null = null;
            try { const gu = await supabase.auth.getUser(); authEmail = gu.data?.user?.email ?? null; } catch (e) { /* ignore */ }

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
            const ins = await supabase.from('users').insert(minimal).select();
            if (ins.error) {
              console.warn('[MyAccount] minimal insert failed', ins.error);
            } else {
              data = (ins.data as any)?.[0] ?? null;
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
          setIneFrontPreview(data.ine_front_url || null);
          setIneBackPreview(data.ine_back_url || null);
          try { setUserRole(data.role ?? currentUser?.role ?? null); } catch (e) { /* ignore */ }
        }
        setIsLoadingProfile(false);
      } catch (e) {
        console.error('[MyAccount] error loading profile', e);
      }
    };

    loadProfile();

    try {
      const storedUser = localStorage.getItem('increscendo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        setUserRole(u.role ?? null);
      }
    } catch (e) { /* ignore */ }
  }, []);

  const handlePersonalDataChange = (field: string, value: string) => {
    setPersonalData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const handleSavePersonalData = async () => {
    try {
      if (!userId) throw new Error('No se pudo identificar al usuario');

      const updates = {
        first_name: personalData.firstName,
        last_name: personalData.lastName,
        phone: personalData.phone,
        phone_country_code: personalData.phoneCountryCode,
        address: personalData.address,
        birth_date: personalData.birthDate || null,
        curp: personalData.curp || null,
        ine_key: personalData.ineKey || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) throw error;

      toast({ title: 'Éxito', description: 'Datos actualizados correctamente.' });

      if (typeof window !== 'undefined' && (window as any).refreshSidebarUserData) {
        (window as any).refreshSidebarUserData();
      }

      try {
        const profile = {
          id: userId,
          email: personalData.email,
          name: `${personalData.firstName} ${personalData.lastName}`.trim(),
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          role: userRole ?? 'client',
          avatar: avatarUrl,
        };
        localStorage.setItem('increscendo_user', JSON.stringify(profile));
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('[MyAccount] save error', err);
      toast({ title: 'Error', description: 'No se pudieron guardar los datos.', variant: 'destructive' });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({ title: 'Error', description: 'Completa ambos campos.', variant: 'destructive' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: 'Error', description: 'La nueva contraseña debe tener al menos 6 caracteres.', variant: 'destructive' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      toast({ title: 'Éxito', description: 'Contraseña actualizada correctamente.' });
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error('[MyAccount] change password error', err);
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.', variant: 'destructive' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast({ title: 'Error', description: 'Por favor selecciona una imagen.', variant: 'destructive' });
        return;
      }

      if (file.size > 1 * 1024 * 1024) {
        toast({ title: 'Error', description: 'La imagen no debe superar 1MB.', variant: 'destructive' });
        return;
      }

      setIsUploadingAvatar(true);

      if (!userId) {
        throw new Error('No se pudo identificar al usuario');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('[MyAccount] upload error', uploadError);
        throw new Error('Error al subir la imagen');
      }

      const { data: publicUrlData } = supabase.storage
        .from('user-documents')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error('Error al obtener URL de la imagen');
      }

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

      if (typeof window !== 'undefined' && (window as any).refreshSidebarUserData) {
        (window as any).refreshSidebarUserData();
      }
    } catch (err) {
      console.error('[MyAccount] avatar upload error', err);
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'No se pudo subir la imagen.', variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-4 animate-pulse">
        <Card className="shadow-soft border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32 sm:w-40" />
                <Skeleton className="h-4 w-48 sm:w-56" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-border/50">
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Card className="shadow-soft border-border/50 mb-4">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 self-center">
              <label htmlFor="avatar-upload" className="relative cursor-pointer group">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAvatar}
                  disabled={isUploadingAvatar}
                  className="hidden"
                />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-visible relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full ring-4 ring-white shadow-lg" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-full ring-4 ring-white shadow-lg">
                      <User className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    </div>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-10">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-spin" />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center shadow-lg cursor-pointer group-hover:scale-110 transition-transform z-30 ring-2 ring-white">
                    <Pencil className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                </div>
              </label>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg truncate">{personalData.firstName} {personalData.lastName}</CardTitle>
                <CardDescription className="text-xs truncate">{personalData.email}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-soft border-border/50">
        <CardContent className="p-4 sm:p-6 pt-0">
          <CardTitle className="text-lg border-b border-border/50 mb-4">Información Personal</CardTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="firstName" className="text-xs sm:text-sm">Nombre</Label>
              <Input
                id="firstName"
                placeholder="Ingresa tu nombre"
                value={personalData.firstName}
                onChange={(e) => handlePersonalDataChange("firstName", e.target.value)}
                className="text-sm"
                maxLength={50}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="lastName" className="text-xs sm:text-sm">Apellido</Label>
              <Input
                id="lastName"
                placeholder="Ingresa tu apellido"
                value={personalData.lastName}
                onChange={(e) => handlePersonalDataChange("lastName", e.target.value)}
                className="text-sm"
                maxLength={50}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalData.email}
                disabled
                className="text-sm bg-muted text-muted-foreground cursor-not-allowed"
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
                  className="h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: '28px' }}
                >
                  {PHONE_COUNTRY_CODES.map(c => (
                    <option key={`${c.code}-${c.name}`} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ej: 55 1234 5678"
                  className="col-span-2 text-sm"
                  value={personalData.phone}
                  onChange={(e) => handlePersonalDataChange("phone", e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
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
                className="text-sm"
                maxLength={200}
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
                  className="pr-10 text-sm"
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
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
              <Label htmlFor="ineKey" className="text-xs sm:text-sm">Clave INE</Label>
              <Input
                id="ineKey"
                placeholder="Clave de elector de tu INE"
                value={personalData.ineKey}
                onChange={(e) => handlePersonalDataChange("ineKey", e.target.value.toUpperCase())}
                className="text-sm"
                maxLength={20}
              />
            </div>
          </div>
          <div className="mt-4 sm:mt-6 flex justify-end">
            <Button onClick={handleSavePersonalData} className="gap-2 text-sm">
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft my-4 border-border/50">
        <CardHeader className="p-4 sm:p-5 pb-0">
          <CardTitle className="text-base sm:text-lg">Cambio de Contraseña</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
            <div className="flex-1 w-full space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs sm:text-sm">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  className="pr-10 text-sm"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs sm:text-sm">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                className="text-sm"
                minLength={6}
                maxLength={50}
              />
            </div>
            <Button onClick={handleChangePassword} variant="secondary" className="gap-2 text-sm w-full sm:w-auto" disabled={isChangingPassword}>
              <Lock className="h-4 w-4" />
              {isChangingPassword ? 'Cambiando...' : 'Cambiar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card className="shadow-soft border-border/50">
          <CardHeader className="p-4 sm:p-5 pb-0">
            <CardTitle className="text-base sm:text-lg">Documentación INE</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Sube o captura las fotos de tu INE para validar tu identidad</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-xs sm:text-sm font-medium">INE Frente</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-between gap-3 bg-muted/30 hover:bg-muted/50 transition-colors min-h-[180px]">
                  <div className="flex-1 flex items-center justify-center w-full">
                    {ineFrontPreview && !ineFrontDeleted ? (
                      <div className="relative w-full flex justify-center">
                        <img src={ineFrontPreview} alt="INE Frente" className="max-h-28 object-contain rounded" />
                        <button
                          onClick={() => setIneFrontDeleted(true)}
                          className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/80 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CreditCard className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground/70">INE Frente</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleUploadIne("front")} className="gap-1.5 h-8 text-xs">
                      <Upload className="h-3 w-3" />
                      Subir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenCamera("front")} className="gap-1.5 h-8 text-xs">
                      <Camera className="h-3 w-3" />
                      Cámara
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label className="text-xs sm:text-sm font-medium">INE Reverso</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-between gap-3 bg-muted/30 hover:bg-muted/50 transition-colors min-h-[180px]">
                  <div className="flex-1 flex items-center justify-center w-full">
                    {ineBackPreview && !ineBackDeleted ? (
                      <div className="relative w-full flex justify-center">
                        <img src={ineBackPreview} alt="INE Reverso" className="max-h-28 object-contain rounded" />
                        <button
                          onClick={() => setIneBackDeleted(true)}
                          className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/80 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CreditCard className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground/70">INE Reverso</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleUploadIne("back")} className="gap-1.5 h-8 text-xs">
                      <Upload className="h-3 w-3" />
                      Subir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenCamera("back")} className="gap-1.5 h-8 text-xs">
                      <Camera className="h-3 w-3" />
                      Cámara
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 flex justify-end">
              <Button onClick={handleSaveIneDocuments} className="gap-2 text-sm" disabled={isUploadingIne || (!ineFrontFile && !ineBackFile && !ineFrontDeleted && !ineBackDeleted)}>
                {isUploadingIne ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar INE
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyAccount;