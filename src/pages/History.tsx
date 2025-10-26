import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Chatbot } from "@/components/Chatbot";

const History = () => {
  const loanHistory = [
    { id: "PREST-001", type: "Préstamo", amount: 10000, date: "2024-10-01", status: "Aprobado" },
    { id: "PREST-002", type: "Préstamo", amount: 15000, date: "2024-09-15", status: "Aprobado" },
    { id: "PREST-003", type: "Préstamo", amount: 5000, date: "2024-06-01", status: "Completado" },
  ];

  const paymentHistory = [
    { id: "PAG-045", loan: "PREST-001", amount: 900, date: "2024-10-15", method: "Tarjeta", status: "Exitoso" },
    { id: "PAG-044", loan: "PREST-001", amount: 900, date: "2024-09-15", method: "Transferencia", status: "Exitoso" },
    { id: "PAG-043", loan: "PREST-002", amount: 1200, date: "2024-10-20", method: "Tarjeta", status: "Exitoso" },
    { id: "PAG-042", loan: "PREST-002", amount: 1200, date: "2024-09-20", method: "Tarjeta", status: "Exitoso" },
    { id: "PAG-041", loan: "PREST-003", amount: 850, date: "2024-08-01", method: "Transferencia", status: "Exitoso" },
  ];

  const serviceHistory = [
    { id: "SERV-120", type: "Recarga", description: "Recarga Telcel $200", date: "2024-10-25", status: "Completado" },
    { id: "SERV-119", type: "Pago", description: "CFE - Luz", date: "2024-10-20", status: "Completado" },
    { id: "SERV-118", type: "Recarga", description: "Recarga Movistar $100", date: "2024-10-15", status: "Completado" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; border: string }> = {
      'Exitoso': { bg: 'bg-success/20', text: 'text-success', border: 'border-success' },
      'Completado': { bg: 'bg-success/20', text: 'text-success', border: 'border-success' },
      'Aprobado': { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary' },
      'Pendiente': { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning' },
      'Rechazado': { bg: 'bg-danger/20', text: 'text-danger', border: 'border-danger' },
    };
    
    const variant = variants[status] || { bg: '', text: '', border: '' };
    return (
      <Badge className={`${variant.bg} ${variant.text} ${variant.border}`}>
        {status}
      </Badge>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Historial</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar en historial..." 
                className="pl-10"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="loans" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="loans">Préstamos</TabsTrigger>
                <TabsTrigger value="payments">Pagos</TabsTrigger>
                <TabsTrigger value="services">Servicios</TabsTrigger>
              </TabsList>

              {/* Loan History */}
              <TabsContent value="loans" className="mt-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Historial de Préstamos</CardTitle>
                    <CardDescription>
                      Todos los préstamos solicitados en tu cuenta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Fecha de Solicitud</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loanHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell className="font-semibold">
                              ${item.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                Ver Detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment History */}
              <TabsContent value="payments" className="mt-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Historial de Pagos</CardTitle>
                    <CardDescription>
                      Registro completo de pagos realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Pago</TableHead>
                          <TableHead>Préstamo</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.id}</TableCell>
                            <TableCell>{payment.loan}</TableCell>
                            <TableCell className="font-semibold">
                              ${payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Recibo
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Service History */}
              <TabsContent value="services" className="mt-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Historial de Servicios</CardTitle>
                    <CardDescription>
                      Recargas, pagos de servicios y otras operaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceHistory.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.id}</TableCell>
                            <TableCell>{service.type}</TableCell>
                            <TableCell>{service.description}</TableCell>
                            <TableCell>{service.date}</TableCell>
                            <TableCell>{getStatusBadge(service.status)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                Ver Detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Chatbot />
      </div>
    </SidebarProvider>
  );
};

export default History;
