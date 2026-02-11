import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
// table imports removed (payment history moved/removed)
import { Crown, Check, Users, Percent, CreditCard, Calendar, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  defaultMemberships, 
  mockActiveMembership, 
  UserMembership,
  Membership,
} from "@/data/memberships";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const Memberships = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState<boolean>(true);
  
  // Toggle this to simulate having/not having an active membership
  // Set to mockActiveMembership to test Scenario B, or null for Scenario A
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [autoRenewal, setAutoRenewal] = useState(userMembership?.autoRenewal ?? true);

  // Cargar membresías reales desde la base de datos (tabla membership_plans)
  useEffect(() => {
    const fetchMemberships = async () => {
      setLoadingMemberships(true);
      try {
        const { data, error } = await supabase
          .from<any>("membership_plans")
          .select("*")
          .eq("active", true)
          .order("price", { ascending: true });

        if (error) throw error;

        const plans = data ?? [];
        const mapped: Membership[] = plans.map((p: any) => {
          const features = p.features ?? {};
          const benefits = Array.isArray(features?.benefits)
            ? features.benefits
            : Array.isArray(p.features)
            ? p.features
            : [];

          // Mapear duración a un texto amigable
          let renewalPeriod = "Anual";
          if (typeof p.duration_days === "number") {
            if (p.duration_days >= 365) renewalPeriod = "Anual";
            else if (p.duration_days >= 30) renewalPeriod = "Mensual";
            else renewalPeriod = `${p.duration_days} días`;
          }

          return {
            id: p.id,
            title: p.name,
            cost: Number(p.price ?? 0),
            currency: p.currency ?? "MXN",
            targetAudience: features?.targetAudience ?? p.description ?? "",
            interestRate: Number(features?.interestRate ?? 0),
            renewalPeriod,
            benefits,
            isActive: !!p.active,
          } as Membership;
        });

        // Si no hay planes en BD, usar los mocks por defecto como fallback
        if (!mapped.length) {
          setMemberships(defaultMemberships);
        } else {
          setMemberships(mapped);
        }
      } catch (err) {
        console.error("[Memberships] fetchMemberships error", err);
        toast({
          title: "Error",
          description: "No se pudieron cargar las membresías",
          variant: "destructive",
        });
        // Fallback a los datos mock si falla la carga
        setMemberships(defaultMemberships);
      } finally {
        setLoadingMemberships(false);
      }
    };

    fetchMemberships();
  }, [toast]);

  // Cargar la membresía activa del usuario (si existe)
  useEffect(() => {
    const loadUserMembership = async () => {
      try {
        const { authService } = await import('@/utils/auth');
        const user = authService.getCurrentUser();
        if (!user?.id) return;

        const { data: umRow, error } = await supabase
          .from('user_memberships')
          .select('id, membership_plan_id, status, started_at, expires_at, auto_renew')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (!umRow) return;

        setUserMembership({
          id: umRow.id,
          membershipId: umRow.membership_plan_id,
          membershipTitle: '',
          status: umRow.status ?? 'active',
          startDate: umRow.started_at ?? new Date().toISOString(),
          expirationDate: umRow.expires_at ?? new Date().toISOString(),
          autoRenewal: umRow.auto_renew ?? false,
        });
        setAutoRenewal(umRow.auto_renew ?? false);
      } catch (err) {
        // ignore: unauthenticated/demo user
      }
    };

    loadUserMembership();
  }, []);

  const handleAcquireMembership = (membership: Membership) => {
    navigate("/membership-checkout", {
      state: { membership, membershipId: membership.id, returnTo: "/memberships" }
    });
  };

  const handleAutoRenewalToggle = (checked: boolean) => {
    setAutoRenewal(checked);
    toast({
      title: checked ? "Renovación activada" : "Renovación desactivada",
      description: checked 
        ? "Tu membresía se renovará automáticamente" 
        : "Tu membresía no se renovará automáticamente"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Activo</Badge>;
      case 'expired':
        return <Badge variant="destructive">Vencido</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Pagado</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-4 sm:px-6 gap-2 sm:gap-4 fixed md:sticky top-0 z-10 w-full md:w-auto">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Membresías</h1>
            </div>
          </header>

          <div className="p-2 sm:p-6 space-y-3 sm:space-y-6 pt-16 sm:pt-20 md:pt-6">
            {/* Available plans - always show the carousel */}
            <>
              {/* Header */}
              <div className="text-center py-3 sm:py-6 md:py-8 px-2">
                  <Crown className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-3 md:mb-4 text-primary" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5 sm:mb-2">Elige tu plan ideal</h2>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                    Selecciona la membresía que mejor se adapte a tus necesidades
                  </p>
                </div>

              {/* Membership Cards */}
              <div className="w-full mx-auto max-w-6xl px-2 sm:px-4">
                {/* Loading skeleton */}
                {loadingMemberships && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2].map((i) => (
                      <Card key={`skeleton-${i}`} className="h-full flex flex-col shadow-soft border border-border">
                        <CardHeader className="text-center pb-2 sm:pb-3 px-4">
                          <div className="mx-auto mb-2 sm:mb-3 h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-muted flex items-center justify-center">
                            <Skeleton className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full" />
                          </div>
                          <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 mx-auto mb-1.5 sm:mb-2" />
                          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mx-auto" />
                        </CardHeader>
                        <CardContent className="flex flex-col flex-grow space-y-2 sm:space-y-3 px-4">
                          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 mx-auto" />
                          <div className="space-y-1.5 sm:space-y-2 py-3 sm:py-4 border-y">
                            <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
                            <Skeleton className="h-3 sm:h-4 w-28 sm:w-36" />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2 flex-grow py-3 sm:py-4">
                            {[1, 2, 3].map((j) => (
                              <Skeleton key={j} className="h-3 sm:h-4 w-full" />
                            ))}
                          </div>
                          <Skeleton className="h-9 sm:h-10 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Membership cards grid */}
                {!loadingMemberships && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {memberships.map((membership) => (
                        <Card 
                          key={membership.id}
                          className={`h-full flex flex-col transition-all duration-300 ${userMembership && userMembership.membershipId === membership.id ? 'border-success bg-success/10 shadow-elegant' : 'shadow-soft border border-border'}`}
                        >
                            <CardHeader className="text-center pb-2 sm:pb-3 px-4 sm:px-6">
                              <div className="mx-auto mb-2 sm:mb-3 h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-gradient-hero flex items-center justify-center">
                                <Crown className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                              </div>
                              <CardTitle className="text-lg sm:text-xl md:text-2xl">{membership.title}</CardTitle>
                              <CardDescription className="flex items-center justify-center gap-1 text-xs sm:text-sm">
                                <Users className="h-3 w-3" />
                                {membership.targetAudience}
                              </CardDescription>
                              {userMembership && userMembership.membershipId === membership.id && userMembership.expirationDate && (
                                <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-success text-center">Expira {formatDate(userMembership.expirationDate)}</div>
                              )}
                            </CardHeader>
                            <CardContent className="flex flex-col flex-grow px-4 sm:px-6 pb-4 sm:pb-6">
                              {/* Pricing */}
                              <div className="text-center">
                                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                                  ${membership.cost.toLocaleString()}
                                </span>
                                <span className="text-xs sm:text-sm text-muted-foreground"> MXN / {membership.renewalPeriod}</span>
                              </div>

                              {/* Features */}
                              <div className="space-y-1.5 sm:space-y-2 py-3 sm:py-4 border-y mt-3">
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                  <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                  <span>Tasa: {membership.interestRate}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm">
                                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                  <span>Renovación: {membership.renewalPeriod}</span>
                                </div>
                              </div>

                              {/* Benefits - grows to fill space */}
                              <ul className="space-y-1.5 sm:space-y-2 flex-grow py-3 sm:py-4">
                                {membership.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0 mt-0.5" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>

                              {/* CTA Button - always at bottom */}
                              {userMembership && userMembership.membershipId === membership.id ? (
                                <Button className="w-full mt-auto bg-success text-white h-10 sm:h-11 text-sm sm:text-base" size="lg" disabled>
                                  Membresía activa
                                </Button>
                              ) : (
                                <Button 
                                  className="w-full mt-auto h-10 sm:h-11 text-sm sm:text-base"
                                  size="lg"
                                  onClick={() => handleAcquireMembership(membership)}
                                >
                                  Adquirir Membresía
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                  </div>
                )}
              </div>
            </>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Memberships;
