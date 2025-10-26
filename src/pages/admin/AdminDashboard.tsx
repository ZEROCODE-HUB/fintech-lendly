import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const AdminDashboard = () => {
  const stats = {
    totalClients: 245,
    activeLoans: 128,
    pendingRequests: 12,
    totalDisbursed: "$2,450,000 MXN",
    collectionRate: "94.5%",
    overdueLoans: 8
  };

  const monthlyData = [
    { month: "Ene", disbursed: 180000, collected: 165000 },
    { month: "Feb", disbursed: 220000, collected: 195000 },
    { month: "Mar", disbursed: 250000, collected: 230000 },
    { month: "Abr", disbursed: 200000, collected: 210000 },
    { month: "May", disbursed: 280000, collected: 255000 },
    { month: "Jun", disbursed: 320000, collected: 290000 },
  ];

  const loanStatusData = [
    { name: "Activos", value: 128, color: "hsl(var(--success))" },
    { name: "Pendientes", value: 12, color: "hsl(var(--warning))" },
    { name: "Vencidos", value: 8, color: "hsl(var(--danger))" },
    { name: "Completados", value: 97, color: "hsl(var(--primary))" },
  ];

  const recentActivity = [
    { id: 1, type: "Nueva Solicitud", user: "María González", amount: "$15,000", time: "Hace 5 min" },
    { id: 2, type: "Pago Recibido", user: "Carlos Ramírez", amount: "$2,500", time: "Hace 15 min" },
    { id: 3, type: "Préstamo Aprobado", user: "Ana López", amount: "$20,000", time: "Hace 1 hora" },
    { id: 4, type: "Pago Atrasado", user: "Juan Pérez", amount: "$3,200", time: "Hace 2 horas" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-hero rounded-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
              <p className="text-white/90">Vista general del estado del negocio</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Clientes
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClients}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +8% este mes
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Préstamos Activos
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeLoans}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cartera saludable
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Solicitudes Pendientes
                  </CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requieren atención
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Desembolsado
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDisbursed}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    En el último semestre
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tasa de Cobranza
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.collectionRate}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Excelente desempeño
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Préstamos Vencidos
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-danger" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overdueLoans}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atención requerida
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Monthly Performance */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Desempeño Mensual</CardTitle>
                  <CardDescription>Desembolsos vs Cobranza</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="disbursed" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Desembolsado"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="collected" 
                        stroke="hsl(var(--success))" 
                        strokeWidth={2}
                        name="Cobrado"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Loan Status Distribution */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Estado de Préstamos</CardTitle>
                  <CardDescription>Distribución de cartera</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={loanStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {loanStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas operaciones del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                          {activity.type.includes("Solicitud") && <Clock className="h-5 w-5 text-warning" />}
                          {activity.type.includes("Pago Recibido") && <CheckCircle2 className="h-5 w-5 text-success" />}
                          {activity.type.includes("Aprobado") && <CheckCircle2 className="h-5 w-5 text-primary" />}
                          {activity.type.includes("Atrasado") && <XCircle className="h-5 w-5 text-danger" />}
                        </div>
                        <div>
                          <p className="font-semibold">{activity.type}</p>
                          <p className="text-sm text-muted-foreground">{activity.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{activity.amount}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
