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
import { supabase } from "@/lib/supabase";
import PHONE_COUNTRY_CODES from '@/lib/phoneCodes';

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPhoneCode, setRegPhoneCode] = useState("+52");
  const [regPassword, setRegPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Por favor ingresa tu correo y contraseña", variant: "destructive" });
      return;
    }
    try {
      console.log('[Auth] Attempting signInWithPassword', { email });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('[Auth] signInWithPassword result', { data, error });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      // login succeeded — persist minimal local profile so UI recognizes auth
      try {
        const user = data.user ?? data.session?.user ?? null;
        if (user) {
          const profile = { id: user.id, email: user.email ?? null, name: (user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Usuario'), role: 'client', avatar: null };
          localStorage.setItem('increscendo_user', JSON.stringify(profile));
          console.log('[Auth] stored local profile after login', profile);
        }
        // persist supabase session object for later checks
        try {
          const sessionObj = data.session ?? null;
          if (sessionObj) {
            localStorage.setItem('increscendo_session', JSON.stringify(sessionObj));
            console.log('[Auth] stored local session after login', { hasSession: true });
          }
        } catch (se) {
          console.warn('[Auth] failed to store session after login', se);
        }
      } catch (e) {
        console.warn('[Auth] failed to store local profile after login', e);
      }
      toast({ title: "Bienvenido", description: "Has iniciado sesión correctamente" });
      navigate('/dashboard');
    } catch (err) {
      console.error('[Auth] Unexpected error during login', err);
      toast({ title: 'Error', description: 'Error inesperado al iniciar sesión', variant: 'destructive' });
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
                        <Input id="email" type="email" placeholder="tu@email.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
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
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    console.log('[Auth] register form submit, pathname=', window.location.pathname);
                    // basic validation
                    if (!firstName || !lastName || !regEmail || !regPassword) {
                      toast({ title: 'Error', description: 'Completa los campos requeridos', variant: 'destructive' });
                      return;
                    }

                    try {
                      console.log('[Auth] Attempting signUp', { email: regEmail });
                      // include user metadata so triggers can populate profile even without client upsert
                      let data; let error;
                      try {
                        const res = await supabase.auth.signUp(
                          { email: regEmail, password: regPassword },
                          { data: { first_name: firstName, last_name: lastName, phone: regPhone, phone_country_code: regPhoneCode } }
                        );
                        data = res.data;
                        error = res.error;
                        console.log('[Auth] signUp raw response', { res });
                      } catch (e) {
                        // unexpected throw
                        console.error('[Auth] signUp threw exception', e);
                        try {
                          console.error('[Auth] signUp exception props', Object.getOwnPropertyNames(e).reduce((acc, k) => { acc[k] = e[k]; return acc; }, {}));
                        } catch (inner) {
                          console.error('[Auth] failed to serialize signUp exception props', inner);
                        }
                        throw e;
                      }
                      console.log('[Auth] signUp response', { data, error });

                      if (error) {
                        toast({ title: 'Error', description: error.message, variant: 'destructive' });
                        return;
                      }

                      const userId = data.user?.id;
                      const session = data.session ?? null;
                      console.log('[Auth] signUp userId, session', { userId, session });

                      // persist session returned by signUp (may be null if email confirmation required)
                      try {
                        if (data.session) {
                          localStorage.setItem('increscendo_session', JSON.stringify(data.session));
                          console.log('[Auth] stored local session after signUp', { hasSession: true });
                        }
                      } catch (se) {
                        console.warn('[Auth] failed to persist session after signUp', se);
                      }
                      // If signUp returned a session, also store a minimal local profile so UI recognizes logged-in state
                      try {
                        if (data.session && data.user) {
                          const signupProfile = { id: data.user.id, email: data.user.email ?? regEmail, name: `${firstName} ${lastName}`, role: 'client', avatar: null };
                          localStorage.setItem('increscendo_user', JSON.stringify(signupProfile));
                          console.log('[Auth] stored local profile after signUp (session present)', signupProfile);
                        }
                      } catch (spErr) {
                        console.warn('[Auth] failed to store local profile after signUp', spErr);
                      }

                      if (error) {
                        try {
                          console.error('[Auth] signUp error object', error);
                          console.error('[Auth] signUp error props', Object.getOwnPropertyNames(error).reduce((acc, k) => { acc[k] = (error as any)[k]; return acc; }, {}));
                        } catch (serr) {
                          console.error('[Auth] failed to stringify signUp error', serr);
                        }
                        if ((error as any)?.message?.toLowerCase().includes('database error')) {
                          console.warn('[Auth] Detected database error during signUp. Check DB triggers/RLS.');
                        }
                      }

                      // Post-signup: ensure profile row exists in public.users. Try sign-in to obtain session if needed,
                      // then upsert profile from the signup form. If client upsert fails, try local service_role fallback.
                      let finalUserId = userId;
                      let finalSession = session;
                      if (!finalSession && regEmail && regPassword) {
                        try {
                          console.log('[Auth] no session after signUp — attempting immediate signIn');
                          const { data: siData, error: siErr } = await supabase.auth.signInWithPassword({ email: regEmail, password: regPassword });
                          console.log('[Auth] signInWithPassword after signUp', { siData, siErr });
                          if (!siErr) {
                            finalSession = siData.session ?? null;
                            finalUserId = siData.user?.id ?? finalUserId;
                            // persist session from immediate signIn
                            try {
                              if (siData.session) {
                                localStorage.setItem('increscendo_session', JSON.stringify(siData.session));
                                console.log('[Auth] stored local session after immediate signIn', { hasSession: true });
                              }
                            } catch (se2) {
                              console.warn('[Auth] failed to persist session after immediate signIn', se2);
                            }
                          }
                        } catch (siCatch) {
                          console.warn('[Auth] signIn attempt after signup threw', siCatch);
                        }
                      }

                      if (finalUserId) {
                        const profilePayload: any = {
                          id: finalUserId,
                          email: regEmail,
                          first_name: firstName || null,
                          last_name: lastName || null,
                          phone: regPhone || null,
                          phone_country_code: regPhoneCode || null,
                          metadata: { created_from: 'signup_form' },
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        };

                        try {
                          console.log('[Auth] attempting client INSERT for profile', profilePayload);
                          const insertRes = await supabase.from('users').insert(profilePayload).select();
                          console.log('[Auth] client insert result', { data: insertRes.data, error: insertRes.error, status: insertRes.status });
                          if (insertRes.error) {
                            console.warn('[Auth] client insert failed', insertRes.error);
                            try { console.warn('[Auth] insert error details', { message: (insertRes.error as any)?.message, details: (insertRes.error as any)?.details, hint: (insertRes.error as any)?.hint }); } catch (e) { /* ignore */ }
                            toast({ title: 'Aviso', description: 'No se pudo crear el perfil en la base de datos (permiso denegado o RLS).', variant: 'warning' });
                          } else {
                            try {
                              const created = (insertRes.data as any)?.[0] ?? null;
                              console.log('[Auth] profile row created', created);
                              // persist local profile so app UI treats user as logged in
                              try {
                                const profile = { id: finalUserId, email: regEmail, name: `${firstName} ${lastName}`, role: 'client', avatar: (created?.avatar_url ?? null) };
                                localStorage.setItem('increscendo_user', JSON.stringify(profile));
                                console.log('[Auth] stored local profile after signup', profile);
                              } catch (storeErr) {
                                console.warn('[Auth] failed storing local profile after insert', storeErr);
                              }
                              toast({ title: 'Cuenta creada', description: 'Tu perfil ha sido añadido a la tabla users.', variant: 'success' });
                            } catch (pErr) {
                              console.warn('[Auth] handling insert result failed', pErr);
                            }
                          }
                        } catch (insertCatch) {
                          console.error('[Auth] exception during client insert', insertCatch);
                        }

                        console.log('[Auth] completed insert attempt for profile (no local populate)');
                      }

                      // If session present, go to dashboard. If not, attempt immediate sign-in.
                      if (session) {
                        console.log('[Auth] session present after signup — skipping local populate');
                        console.log('[Auth] navigating to /dashboard (session present)');
                        navigate('/dashboard');
                      } else {
                        // try to sign in immediately (may fail if email confirmation required)
                        try {
                          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: regEmail, password: regPassword });
                          console.log('[Auth] post-signup signIn attempt', { signInData, signInError });
                          if (!signInError) {
                            console.log('[Auth] signIn after signup successful — navigating to /dashboard');
                            try {
                              if (signInData.session) {
                                localStorage.setItem('increscendo_session', JSON.stringify(signInData.session));
                                console.log('[Auth] stored local session after post-signup signIn', { hasSession: true });
                              }
                            } catch (se3) {
                              console.warn('[Auth] failed to persist session after post-signup signIn', se3);
                            }
                            // signIn succeeded
                            navigate('/dashboard');
                            return;
                          } else {
                            console.warn('[Auth] post-signup signIn returned error', signInError);
                          }
                        } catch (siErr) {
                          console.warn('[Auth] signIn after signup failed', siErr);
                        }

                        // fallback
                        toast({ title: 'Cuenta creada', description: 'Revisa tu correo para confirmar (si aplica).' });
                        console.log('[Auth] navigating to /usuario-nuevo-marketing (fallback)');
                        navigate('/usuario-nuevo-marketing');
                      }
                    } catch (err) {
                      console.error('[Auth] Unexpected error during signup', err);
                      toast({ title: 'Error', description: 'Error inesperado al registrarte', variant: 'destructive' });
                    }
                  }} className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input id="firstName" placeholder="Juan" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input id="lastName" placeholder="Pérez" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regEmail">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="regEmail" type="email" placeholder="tu@email.com" className="pl-10" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="phoneCode">Código</Label>
                        <select id="phoneCode" value={regPhoneCode} onChange={(e) => setRegPhoneCode(e.target.value)} className="h-10 w-full rounded border px-3 bg-input">
                          {PHONE_COUNTRY_CODES.map((c) => (
                            <option key={`${c.code}-${c.name}`} value={c.code}>{c.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="phone">Número de Celular</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input id="phone" type="tel" placeholder="Ej: 55 1234 5678" className="pl-10" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regPassword">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="regPassword" type="password" placeholder="••••••••" className="pl-10" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Al registrarte, aceptas nuestros{" "}
                      <a href="#" className="text-primary hover:underline">Términos y Condiciones</a> y{" "}
                      <a href="#" className="text-primary hover:underline">Política de Privacidad</a>
                    </div>
                    <Button type="submit" className="w-full" size="lg" variant="success">Crear Cuenta<ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </form>
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
