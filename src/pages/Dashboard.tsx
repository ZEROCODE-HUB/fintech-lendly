import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

const Dashboard = () => {
  // Mock data - would come from API/state management
  const accountSummary = {
    balance: "$25,000.00 MXN",
    activeLoans: 2,
    nextPayment: "15 Nov 2024",
    membership: "Premium"
  };

  const recentLoans = [
    { id: 1, amount: "$10,000", status: "active", dueDate: "2024-12-15", progress: 60 },
    { id: 2, amount: "$15,000", status: "active", dueDate: "2025-01-20", progress: 30 },
  ];

  const upcomingPayments = [
    { id: 1, amount: "$2,500", date: "15 Nov 2024", type: "Préstamo #001" },
    { id: 2, amount: "$1,800", date: "20 Nov 2024", type: "Préstamo #002" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Hoy: {new Date().toLocaleDateString('es-MX')}
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-hero rounded-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">¡Bienvenido de nuevo!</h2>
              <p className="text-white/90">Aquí está un resumen de tu actividad financiera</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Saldo Disponible
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountSummary.balance}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +12% este mes
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Préstamos Activos
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountSummary.activeLoans}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    En buen estado
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Próximo Pago
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-danger" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountSummary.nextPayment}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    $2,500.00 MXN
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Membresía
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accountSummary.membership}</div>
                  <Badge variant="outline" className="mt-1 border-success text-success">
                    Activa
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Active Loans */}
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Préstamos Activos</CardTitle>
                      <CardDescription>Estado actual de tus créditos</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Todos
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentLoans.map((loan) => (
                    <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{loan.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            Vence: {loan.dueDate}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-success text-success">
                          <Clock className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progreso de pago</span>
                          <span>{loan.progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-success transition-all"
                            style={{ width: `${loan.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Payments */}
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Próximos Pagos</CardTitle>
                      <CardDescription>Mantente al día con tus obligaciones</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Todos
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{payment.type}</p>
                          <p className="text-sm text-muted-foreground">{payment.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{payment.amount}</p>
                        <Button size="sm" variant="ghost" className="h-7 px-2">
                          Pagar
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Operaciones frecuentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button size="lg" className="h-auto py-6 flex-col gap-2">
                    <DollarSign className="h-6 w-6" />
                    <span>Solicitar Préstamo</span>
                  </Button>
                  <Button size="lg" variant="outline" className="h-auto py-6 flex-col gap-2">
                    <CreditCard className="h-6 w-6" />
                    <span>Realizar Pago</span>
                  </Button>
                  <Button size="lg" variant="outline" className="h-auto py-6 flex-col gap-2">
                    <Calendar className="h-6 w-6" />
                    <span>Ver Historial</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Chatbot />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
