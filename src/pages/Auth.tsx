import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import loginHero from "@/assets/login-hero.webp";
import logoIcon from "@/assets/logo-icon.webp";
import { ArrowRight, Lock, Mail, Phone, MailCheck, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { translateError } from "@/lib/errorMessages";
import PHONE_COUNTRY_CODES from '@/lib/phoneCodes';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;
const PHONE_REGEX = /^\d{6,14}$/;
const NAME_MAX_LENGTH = 50;
const LASTNAME_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 100;
const PHONE_MAX_LENGTH = 14;
const PASSWORD_MAX_LENGTH = 50;

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPhoneCode, setRegPhoneCode] = useState("+52");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    terms?: string;
  }>({});
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateLoginForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "El correo electrónico es requerido";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Ingresa un correo electrónico válido";
    }

    if (!password) {
      errors.password = "La contraseña es requerida";
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      password?: string;
      terms?: string;
    } = {};

    if (!firstName.trim()) {
      errors.firstName = "El nombre es requerido";
    } else if (firstName.trim().length < 2) {
      errors.firstName = "El nombre debe tener al menos 2 caracteres";
    }

    if (!lastName.trim()) {
      errors.lastName = "El apellido es requerido";
    } else if (lastName.trim().length < 2) {
      errors.lastName = "El apellido debe tener al menos 2 caracteres";
    }

    if (!regEmail.trim()) {
      errors.email = "El correo electrónico es requerido";
    } else if (!EMAIL_REGEX.test(regEmail)) {
      errors.email = "Ingresa un correo electrónico válido";
    }

    if (regPhone && !PHONE_REGEX.test(regPhone.replace(/\s/g, ''))) {
      errors.phone = "El número de teléfono debe tener entre 6 y 14 dígitos";
    }

    if (!regPassword) {
      errors.password = "La contraseña es requerida";
    } else if (regPassword.length < PASSWORD_MIN_LENGTH) {
      errors.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
    }

    if (!acceptTerms) {
      errors.terms = "Debes aceptar los términos y condiciones";
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({ title: "Error", description: translateError(error.message), variant: "destructive" });
        return;
      }

      const signedUser = data.user ?? data.session?.user ?? null;
      const emailConfirmedAt = (signedUser as any)?.email_confirmed_at ?? (signedUser as any)?.confirmed_at ?? null;

      if (!emailConfirmedAt) {
        await supabase.auth.signOut();
        try {
          localStorage.removeItem('increscendo_user');
          localStorage.removeItem('increscendo_session');
        } catch (lsErr) {
          console.warn('[Auth] failed to clear local storage', lsErr);
        }
        setVerifyEmail(email);
        setShowVerifyModal(true);
        setActiveTab('login');
        return;
      }

      try {
        const user = data.user ?? data.session?.user ?? null;
        if (user) {
          const { data: profileRow } = await supabase.from('users').select('role, first_name, last_name, avatar_url').eq('id', user.id).limit(1).maybeSingle();
          const role = (profileRow as any)?.role ?? 'client';
          const firstNameVal = (profileRow as any)?.first_name ?? '';
          const lastNameVal = (profileRow as any)?.last_name ?? '';
          const name = firstNameVal || lastNameVal ? `${firstNameVal} ${lastNameVal}`.trim() : (user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Usuario');
          const avatar = (profileRow as any)?.avatar_url ?? null;
          const profile = { id: user.id, email: user.email ?? null, name, firstName: firstNameVal, lastName: lastNameVal, role, avatar };
          localStorage.setItem('increscendo_user', JSON.stringify(profile));
        }
        const sessionObj = data.session ?? null;
        if (sessionObj) {
          localStorage.setItem('increscendo_session', JSON.stringify(sessionObj));
        }
      } catch (e) {
        console.warn('[Auth] failed to store profile', e);
      }

      toast({ title: "Bienvenido", description: "Has iniciado sesión correctamente" });

      const stored = localStorage.getItem('increscendo_user');
      const u = stored ? JSON.parse(stored) : null;
      if (u?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        const firstLoginKey = `increscendo_first_login_done_${u?.id ?? 'unknown'}`;
        const alreadyCompleted = localStorage.getItem(firstLoginKey) === '1';
        if (!alreadyCompleted) {
          localStorage.setItem(firstLoginKey, '1');
          navigate('/service-selection');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('[Auth] Unexpected error during login', err);
      toast({ title: 'Error', description: 'Error inesperado al iniciar sesión', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('check-email', {
        body: { email: regEmail.toLowerCase().trim() },
      });

      if (fnError || fnData?.exists === true) {
        toast({ 
          title: fnData?.exists === true ? 'Correo ya registrado' : 'Error', 
          description: fnData?.exists === true 
            ? 'Este correo electrónico ya tiene una cuenta. Intenta iniciar sesión.' 
            : 'No se pudo verificar el correo. Intenta de nuevo.',
          variant: 'destructive' 
        });
        setIsLoading(false);
        return;
      }

      const res = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: { first_name: firstName, last_name: lastName, phone: regPhone, phone_country_code: regPhoneCode }
        }
      });
      const { data, error } = res;

      if (error) {
        toast({ title: 'Error', description: translateError(error.message), variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const userId = data.user?.id;

      try {
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn('[Auth] signOut after signUp failed', signOutErr);
      }
      try {
        localStorage.removeItem('increscendo_session');
        localStorage.removeItem('increscendo_user');
      } catch (lsErr) {
        console.warn('[Auth] clear local storage after signUp failed', lsErr);
      }

      // Profile is created automatically by trigger in Supabase
      // based on auth.users metadata (first_name, last_name, phone, phone_country_code)

      toast({ title: 'Cuenta creada', description: 'Te enviamos un correo para confirmar y activar tu cuenta.' });
      setVerifyEmail(regEmail);
      setShowVerifyModal(true);
      setActiveTab('login');
      setEmail(regEmail);
      setFirstName('');
      setLastName('');
      setRegPhone('');
      setRegPassword('');
      setAcceptTerms(false);
      setRegisterErrors({});
    } catch (err) {
      console.error('[Auth] Unexpected error during signup', err);
      toast({ title: 'Error', description: 'Error inesperado al registrarte', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
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
                {[
                  "Gestión completa de préstamos",
                  "Pagos y recargas automatizadas",
                  "Seguridad y confianza garantizada",
                  "Recarga tiempo aire",
                  "Paga tus servicios",
                  "Paga y compra más de 400 productos",
                  "Notificaciones inmediatas",
                  "Atención 24/7 con nuestro asistente inteligente",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4  bg-accent/30">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6 sm:mb-8">
            <img src={logoIcon} alt="Increscendo Fintech" className="h-20 sm:h-24 md:h-28 w-20 sm:w-24 md:w-28 rounded-full object-cover shadow-lg" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 md:mb-8 bg-muted/30">
              <TabsTrigger value="login" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="shadow-medium border-0">
                <CardHeader className="space-y-1 px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl">Accede a tu cuenta</CardTitle>
                  <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          className={`pl-10 ${loginErrors.email ? 'border-destructive' : ''}`}
                          value={email}
                          maxLength={EMAIL_MAX_LENGTH}
                          onChange={(e) => {
                            setEmail(e.target.value.slice(0, EMAIL_MAX_LENGTH));
                            if (loginErrors.email) setLoginErrors(prev => ({ ...prev, email: undefined }));
                          }}
                        />
                      </div>
                      {loginErrors.email && <p className="text-xs text-destructive">{loginErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`pl-10 pr-10 ${loginErrors.password ? 'border-destructive' : ''}`}
                          value={password}
                          maxLength={PASSWORD_MAX_LENGTH}
                          onChange={(e) => {
                            setPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH));
                            if (loginErrors.password) setLoginErrors(prev => ({ ...prev, password: undefined }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {loginErrors.password && <p className="text-xs text-destructive">{loginErrors.password}</p>}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="text-muted-foreground">Recordarme</span>
                      </label>
                      <Link to="/forgot-password" className="text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          Ingresar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-center mt-4">
                    <p className="text-[10px] text-muted-foreground/60">v1.0.1</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="shadow-medium border-0">
                <CardHeader className="space-y-1 px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl">Crear cuenta</CardTitle>
                  <CardDescription>Completa el formulario para registrarte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          placeholder="Juan"
                          className={registerErrors.firstName ? 'border-destructive' : ''}
                          value={firstName}
                          maxLength={NAME_MAX_LENGTH}
                          onChange={(e) => {
                            setFirstName(e.target.value.slice(0, NAME_MAX_LENGTH));
                            if (registerErrors.firstName) setRegisterErrors(prev => ({ ...prev, firstName: undefined }));
                          }}
                        />
                        {registerErrors.firstName && <p className="text-xs text-destructive">{registerErrors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          placeholder="Pérez"
                          className={registerErrors.lastName ? 'border-destructive' : ''}
                          value={lastName}
                          maxLength={LASTNAME_MAX_LENGTH}
                          onChange={(e) => {
                            setLastName(e.target.value.slice(0, LASTNAME_MAX_LENGTH));
                            if (registerErrors.lastName) setRegisterErrors(prev => ({ ...prev, lastName: undefined }));
                          }}
                        />
                        {registerErrors.lastName && <p className="text-xs text-destructive">{registerErrors.lastName}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regEmail">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="regEmail"
                          type="email"
                          placeholder="tu@email.com"
                          className={`pl-10 ${registerErrors.email ? 'border-destructive' : ''}`}
                          value={regEmail}
                          maxLength={EMAIL_MAX_LENGTH}
                          onChange={(e) => {
                            setRegEmail(e.target.value.slice(0, EMAIL_MAX_LENGTH));
                            if (registerErrors.email) setRegisterErrors(prev => ({ ...prev, email: undefined }));
                          }}
                        />
                      </div>
                      {registerErrors.email && <p className="text-xs text-destructive">{registerErrors.email}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="phoneCode">Código</Label>
                        <select
                          id="phoneCode"
                          value={regPhoneCode}
                          onChange={(e) => setRegPhoneCode(e.target.value)}
                          className="h-10 w-full rounded border px-3 bg-input"
                        >
                          {PHONE_COUNTRY_CODES.map((c) => (
                            <option key={`${c.code}-${c.name}`} value={c.code}>{c.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="phone">Número de Celular</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="55 1234 5678"
                            className={`pl-10 ${registerErrors.phone ? 'border-destructive' : ''}`}
                            value={regPhone}
                            onChange={(e) => {
                              setRegPhone(e.target.value.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH));
                              if (registerErrors.phone) setRegisterErrors(prev => ({ ...prev, phone: undefined }));
                            }}
                            maxLength={PHONE_MAX_LENGTH}
                          />
                        </div>
                        {registerErrors.phone && <p className="text-xs text-destructive">{registerErrors.phone}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regPassword">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="regPassword"
                          type={showRegPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`pl-10 pr-10 ${registerErrors.password ? 'border-destructive' : ''}`}
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH));
                            if (registerErrors.password) setRegisterErrors(prev => ({ ...prev, password: undefined }));
                          }}
                          maxLength={PASSWORD_MAX_LENGTH}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {registerErrors.password && <p className="text-xs text-destructive">{registerErrors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-border"
                          checked={acceptTerms}
                          onChange={(e) => {
                            setAcceptTerms(e.target.checked);
                            if (registerErrors.terms) setRegisterErrors(prev => ({ ...prev, terms: undefined }));
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          Acepto los{" "}
                          <a href="/terminos-y-condiciones" className="text-primary hover:underline">Términos y Condiciones</a> y{" "}
                          <a href="/politicas-privacidad" className="text-primary hover:underline">Política de Privacidad</a>
                        </span>
                      </label>
                      {registerErrors.terms && <p className="text-xs text-destructive">{registerErrors.terms}</p>}
                    </div>
                    <Button type="submit" className="w-full" size="lg" variant="success" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creando cuenta...
                        </>
                      ) : (
                        <>
                          Crear Cuenta
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MailCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>Verifica tu correo electrónico</DialogTitle>
                  <DialogDescription>
                    Para activar tu cuenta necesitamos que confirmes tu dirección de correo.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              {verifyEmail && (
                <p>
                  Te enviamos un mensaje a <span className="font-medium text-foreground">{verifyEmail}</span> con un enlace de activación.
                </p>
              )}
              <ul className="list-disc list-inside space-y-1">
                <li>Abre tu bandeja de entrada y busca el correo de confirmación.</li>
                <li>Haz clic en el botón o enlace para activar tu cuenta.</li>
                <li>Luego vuelve aquí e inicia sesión con tu correo y contraseña.</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Si no lo encuentras, revisa tu carpeta de spam o correo no deseado. Si el enlace expira, puedes solicitar uno nuevo desde la opción de recuperar contraseña.
              </p>
            </div>
            <DialogFooter className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowVerifyModal(false)}>Cerrar</Button>
              <Button onClick={() => { setActiveTab('login'); setShowVerifyModal(false); }}>Ir a iniciar sesión</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Auth;