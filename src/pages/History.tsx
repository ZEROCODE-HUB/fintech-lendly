import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Chatbot } from "@/components/Chatbot";

const History = () => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  const handleViewDetails = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setViewDialogOpen(true);
  };

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
          <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Historial</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="text-xs sm:text-sm">Filtrar</span>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline text-xs sm:text-sm">Exportar</span>
              </Button>
            </div>
          </header>

          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar en historial..." 
                className="pl-8 sm:pl-10 text-xs sm:text-sm"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="loans" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="loans" className="text-xs sm:text-sm">Préstamos</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs sm:text-sm">Pagos</TabsTrigger>
              </TabsList>

              {/* Loan History */}
              <TabsContent value="loans" className="mt-4 sm:mt-6">
                <Card className="shadow-soft">
                  <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl">Historial de Préstamos</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Todos los préstamos solicitados en tu cuenta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-6">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">ID</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Tipo</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Monto</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Fecha</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Estado</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loanHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{item.id}</TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">{item.type}</TableCell>
                            <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                              ${item.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{item.date}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewDetails(item, 'loan')}
                                className="text-xs"
                              >
                                <span className="hidden sm:inline">Ver Detalles</span>
                                <span className="sm:hidden">Ver</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment History */}
              <TabsContent value="payments" className="mt-4 sm:mt-6">
                <Card className="shadow-soft">
                  <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl">Historial de Pagos</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Registro completo de todos tus pagos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-6">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">ID</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Préstamo</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Monto</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Fecha</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">Método</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{item.id}</TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{item.loan}</TableCell>
                            <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                              ${item.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">{item.date}</TableCell>
                            <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">{item.method}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Chatbot />

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Detalles del Registro</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">Información completa de la transacción</DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                {selectedItem.type === 'loan' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ID de Préstamo</Label>
                      <p className="font-semibold">{selectedItem.id}</p>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <p className="font-semibold">{selectedItem.type}</p>
                    </div>
                    <div>
                      <Label>Monto</Label>
                      <p className="font-semibold">${selectedItem.amount?.toLocaleString()} MXN</p>
                    </div>
                    <div>
                      <Label>Fecha de Solicitud</Label>
                      <p className="font-semibold">{selectedItem.date}</p>
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                  </div>
                )}
                {selectedItem.type === 'service' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ID de Servicio</Label>
                      <p className="font-semibold">{selectedItem.id}</p>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <p className="font-semibold">{selectedItem.type}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Descripción</Label>
                      <p className="font-semibold">{selectedItem.description}</p>
                    </div>
                    <div>
                      <Label>Fecha</Label>
                      <p className="font-semibold">{selectedItem.date}</p>
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default History;
