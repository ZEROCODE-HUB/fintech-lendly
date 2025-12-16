import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wallet,
  FileText
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const AdminDashboard = () => {
  const [membershipDateRange, setMembershipDateRange] = useState("6months");
  const [profitabilityDateRange, setProfitabilityDateRange] = useState("6months");

  // KPI Stats
  const stats = {
    totalClients: 245,
    activeLoans: 128,
    pendingRequests: 12,
    totalDisbursed: 2450000,
    overdueLoans: 8,
    pendingDisbursement: 185000, // Pendiente + Pendiente de firma
  };

  // Membership status data (Usuarios Registrados vs Con Membresía)
  const membershipData = {
    "3months": [
      { month: "Oct", registrados: 180, conMembresia: 145 },
      { month: "Nov", registrados: 210, conMembresia: 165 },
      { month: "Dic", registrados: 245, conMembresia: 190 },
    ],
    "6months": [
      { month: "Jul", registrados: 120, conMembresia: 95 },
      { month: "Ago", registrados: 145, conMembresia: 115 },
      { month: "Sep", registrados: 160, conMembresia: 130 },
      { month: "Oct", registrados: 180, conMembresia: 145 },
      { month: "Nov", registrados: 210, conMembresia: 165 },
      { month: "Dic", registrados: 245, conMembresia: 190 },
    ],
    "12months": [
      { month: "Ene", registrados: 50, conMembresia: 35 },
      { month: "Feb", registrados: 65, conMembresia: 48 },
      { month: "Mar", registrados: 80, conMembresia: 60 },
      { month: "Abr", registrados: 95, conMembresia: 72 },
      { month: "May", registrados: 105, conMembresia: 82 },
      { month: "Jun", registrados: 115, conMembresia: 90 },
      { month: "Jul", registrados: 120, conMembresia: 95 },
      { month: "Ago", registrados: 145, conMembresia: 115 },
      { month: "Sep", registrados: 160, conMembresia: 130 },
      { month: "Oct", registrados: 180, conMembresia: 145 },
      { month: "Nov", registrados: 210, conMembresia: 165 },
      { month: "Dic", registrados: 245, conMembresia: 190 },
    ],
  };

  // Active loans status (Donut chart data)
  const activeLoanStatusData = [
    { name: "Al día", value: 98, color: "hsl(var(--success))" },
    { name: "Atrasado", value: 18, color: "hsl(var(--warning))" },
    { name: "Urgente", value: 8, color: "hsl(var(--danger))" },
    { name: "Jurídico", value: 4, color: "hsl(142, 50%, 30%)" },
  ];

  const totalActiveLoans = activeLoanStatusData.reduce((acc, item) => acc + item.value, 0);

  // Profitability data (Desembolsos vs Pagos de Usuarios)
  const profitabilityData = {
    "3months": [
      { month: "Oct", desembolsos: 280000, pagos: 255000 },
      { month: "Nov", desembolsos: 320000, pagos: 290000 },
      { month: "Dic", desembolsos: 350000, pagos: 310000 },
    ],
    "6months": [
      { month: "Jul", desembolsos: 180000, pagos: 165000 },
      { month: "Ago", desembolsos: 220000, pagos: 195000 },
      { month: "Sep", desembolsos: 250000, pagos: 230000 },
      { month: "Oct", desembolsos: 280000, pagos: 255000 },
      { month: "Nov", desembolsos: 320000, pagos: 290000 },
      { month: "Dic", desembolsos: 350000, pagos: 310000 },
    ],
    "12months": [
      { month: "Ene", desembolsos: 120000, pagos: 105000 },
      { month: "Feb", desembolsos: 135000, pagos: 120000 },
      { month: "Mar", desembolsos: 150000, pagos: 138000 },
      { month: "Abr", desembolsos: 145000, pagos: 140000 },
      { month: "May", desembolsos: 160000, pagos: 152000 },
      { month: "Jun", desembolsos: 175000, pagos: 162000 },
      { month: "Jul", desembolsos: 180000, pagos: 165000 },
      { month: "Ago", desembolsos: 220000, pagos: 195000 },
      { month: "Sep", desembolsos: 250000, pagos: 230000 },
      { month: "Oct", desembolsos: 280000, pagos: 255000 },
      { month: "Nov", desembolsos: 320000, pagos: 290000 },
      { month: "Dic", desembolsos: 350000, pagos: 310000 },
    ],
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalActiveLoans) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">Cantidad: <span className="font-medium text-foreground">{data.value}</span></p>
          <p className="text-sm text-muted-foreground">Porcentaje: <span className="font-medium text-foreground">{percentage}%</span></p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipLine = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">{entry.name.includes("$") || entry.dataKey.includes("desembolsos") || entry.dataKey.includes("pagos") ? formatCurrency(entry.value) : entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            {/* KPI Cards Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              <Card variant="elevated" className="animate-fade-in-up [animation-delay:0ms] hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Clientes
                  </CardTitle>
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalClients}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="inline-flex items-center text-success font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8%
                    </span>
                    <span className="ml-1">este mes</span>
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="animate-fade-in-up [animation-delay:50ms] hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Préstamos Activos
                  </CardTitle>
                  <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.activeLoans}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cartera saludable
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="animate-fade-in-up [animation-delay:100ms] hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Solicitudes Pendientes
                  </CardTitle>
                  <div className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.pendingRequests}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Requieren atención
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="animate-fade-in-up [animation-delay:150ms] hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Desembolsado
                  </CardTitle>
                  <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(stats.totalDisbursed)}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    En el último semestre
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="animate-fade-in-up [animation-delay:200ms] hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Préstamos Vencidos
                  </CardTitle>
                  <div className="h-9 w-9 rounded-xl bg-danger/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-danger" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.overdueLoans}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Atención requerida
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="animate-fade-in-up [animation-delay:250ms] hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total por Desembolsar
                  </CardTitle>
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(stats.pendingDisbursement)}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <FileText className="inline h-3 w-3 mr-1" />
                    Pendiente + Pend. Firma
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Central Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Membership Status - Line Chart */}
              <Card variant="elevated" className="animate-fade-in-up [animation-delay:300ms]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Estado de Membresías</CardTitle>
                      <CardDescription>Usuarios Registrados vs Con Membresía</CardDescription>
                    </div>
                    <Select value={membershipDateRange} onValueChange={setMembershipDateRange}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 meses</SelectItem>
                        <SelectItem value="6months">6 meses</SelectItem>
                        <SelectItem value="12months">12 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={membershipData[membershipDateRange as keyof typeof membershipData]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip content={<CustomTooltipLine />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="registrados" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Usuarios Registrados"
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="conMembresia" 
                        stroke="hsl(var(--success))" 
                        strokeWidth={2}
                        name="Usuarios con Membresía"
                        dot={{ fill: "hsl(var(--success))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Active Loans Status - Donut Chart */}
              <Card variant="elevated" className="animate-fade-in-up [animation-delay:350ms]">
                <CardHeader>
                  <CardTitle>Estado de Préstamos Activos</CardTitle>
                  <CardDescription>Distribución de cartera activa</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activeLoanStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {activeLoanStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipPie />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry: any) => (
                          <span className="text-sm text-foreground">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Profitability Section */}
            <Card variant="elevated" className="animate-fade-in-up [animation-delay:400ms]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rentabilidad</CardTitle>
                    <CardDescription>Desembolsos vs Pagos de Usuarios</CardDescription>
                  </div>
                  <Select value={profitabilityDateRange} onValueChange={setProfitabilityDateRange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">3 meses</SelectItem>
                      <SelectItem value="6months">6 meses</SelectItem>
                      <SelectItem value="12months">12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={profitabilityData[profitabilityDateRange as keyof typeof profitabilityData]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltipLine />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="desembolsos" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Desembolsos"
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pagos" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      name="Pagos de Usuarios"
                      dot={{ fill: "hsl(var(--success))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
