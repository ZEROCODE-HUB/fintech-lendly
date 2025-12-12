import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Crown, Check, Users, Percent, CreditCard, Calendar, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  defaultMemberships, 
  mockActiveMembership, 
  mockPaymentHistory,
  UserMembership,
  PaymentHistory 
} from "@/data/memberships";

const Memberships = () => {
  const { toast } = useToast();
  
  // Toggle this to simulate having/not having an active membership
  // Set to mockActiveMembership to test Scenario B, or null for Scenario A
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [autoRenewal, setAutoRenewal] = useState(userMembership?.autoRenewal ?? true);
  const [paymentHistory] = useState<PaymentHistory[]>(mockPaymentHistory);

  const handleAcquireMembership = (membershipId: string) => {
    const membership = defaultMemberships.find(m => m.id === membershipId);
    if (membership) {
      // Simulate acquiring membership
      const now = new Date();
      const expirationDate = new Date(now.setFullYear(now.getFullYear() + 1));
      
      setUserMembership({
        id: `user-mem-${Date.now()}`,
        membershipId: membership.id,
        membershipTitle: membership.title,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        expirationDate: expirationDate.toISOString().split('T')[0],
        autoRenewal: true
      });
      
      toast({
        title: "¡Membresía adquirida!",
        description: `Has adquirido ${membership.title} exitosamente`
      });
    }
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
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Membresías</h1>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Scenario A: No active membership - Show available plans */}
            {!userMembership && (
              <>
                {/* Header */}
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h2 className="text-3xl font-bold mb-2">Elige tu plan ideal</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Selecciona la membresía que mejor se adapte a tus necesidades y comienza a disfrutar de todos los beneficios
                  </p>
                </div>

                {/* Membership Cards */}
                <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                  {defaultMemberships.map((membership) => (
                    <Card 
                      key={membership.id} 
                      className="shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border border-border"
                    >
                      <CardHeader className="text-center pb-3">
                        <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center">
                          <Crown className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{membership.title}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          {membership.targetAudience}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Pricing */}
                        <div className="text-center">
                          <span className="text-4xl font-bold text-primary">
                            ${membership.cost.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground"> MXN / {membership.renewalPeriod}</span>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 py-4 border-y">
                          <div className="flex items-center gap-2 text-sm">
                            <Percent className="h-4 w-4 text-primary" />
                            <span>Tasa preferencial: {membership.interestRate}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="h-4 w-4 text-primary" />
                            <span>Renovación: {membership.renewalPeriod}</span>
                          </div>
                        </div>

                        {/* Benefits */}
                        <ul className="space-y-2">
                          {membership.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-success" />
                              {benefit}
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Button 
                          className="w-full mt-4"
                          size="lg"
                          onClick={() => handleAcquireMembership(membership.id)}
                        >
                          Adquirir Membresía
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Scenario B: Has active membership */}
            {userMembership && (
              <>
                {/* My Membership Section */}
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Mi Membresía</h2>
                  
                  <Card className="shadow-elegant border-2 border-primary/20 bg-gradient-to-br from-card to-accent/5">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center">
                            <Crown className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{userMembership.membershipTitle}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              Miembro desde {formatDate(userMembership.startDate)}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(userMembership.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Membership Details */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 rounded-lg bg-accent/50">
                          <p className="text-sm text-muted-foreground mb-1">Fecha de Expiración</p>
                          <p className="font-semibold text-lg">{formatDate(userMembership.expirationDate)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-accent/50">
                          <p className="text-sm text-muted-foreground mb-1">Estado</p>
                          <p className="font-semibold text-lg flex items-center gap-2">
                            {userMembership.status === 'active' ? (
                              <>
                                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                                Activo
                              </>
                            ) : (
                              'Vencido'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Auto Renewal Toggle */}
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="h-5 w-5 text-primary" />
                          <div>
                            <Label htmlFor="auto-renewal" className="font-medium">
                              Renovación Automática
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Tu membresía se renovará automáticamente al vencer
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="auto-renewal"
                          checked={autoRenewal}
                          onCheckedChange={handleAutoRenewalToggle}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment History Section */}
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Historial de Pagos</h2>
                  
                  <Card className="shadow-soft">
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentHistory.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{formatDate(payment.date)}</TableCell>
                              <TableCell>{payment.concept}</TableCell>
                              <TableCell className="text-right font-medium">
                                ${payment.amount.toLocaleString()} MXN
                              </TableCell>
                              <TableCell className="text-center">
                                {getPaymentStatusBadge(payment.status)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {paymentHistory.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay pagos registrados
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Memberships;
