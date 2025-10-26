import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Download, Eye, Calendar, DollarSign } from "lucide-react";
import { Chatbot } from "@/components/Chatbot";

const MyLoans = () => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  const loans = [
    {
      id: "PREST-001",
      amount: 10000,
      approved: "2024-10-01",
      rate: 12.5,
      term: 12,
      status: "active",
      paid: 6000,
      remaining: 4000,
      nextPayment: "2024-11-15"
    },
    {
      id: "PREST-002",
      amount: 15000,
      approved: "2024-09-15",
      rate: 11.8,
      term: 18,
      status: "active",
      paid: 4500,
      remaining: 10500,
      nextPayment: "2024-11-20"
    },
    {
      id: "PREST-003",
      amount: 5000,
      approved: "2024-06-01",
      rate: 13.2,
      term: 6,
      status: "paid",
      paid: 5000,
      remaining: 0,
      nextPayment: "-"
    }
  ];

  const handleViewLoan = (loan: any) => {
    setSelectedLoan(loan);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-success/20 text-success border-success">Activo</Badge>;
    }
    if (status === 'paid') {
      return <Badge className="bg-primary/20 text-primary border-primary">Pagado</Badge>;
    }
    return <Badge variant="outline">Pendiente</Badge>;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Mis Préstamos</h1>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Préstamos
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$30,000</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monto total solicitado
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monto Pagado
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$15,500</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    51.67% del total
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Saldo Pendiente
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-danger" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$14,500</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por liquidar
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Loans Table */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Detalle de Préstamos</CardTitle>
                <CardDescription>
                  Gestiona y consulta el estado de todos tus préstamos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Tasa</TableHead>
                      <TableHead>Plazo</TableHead>
                      <TableHead>Pagado</TableHead>
                      <TableHead>Restante</TableHead>
                      <TableHead>Próximo Pago</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.id}</TableCell>
                        <TableCell>${loan.amount.toLocaleString()}</TableCell>
                        <TableCell>{loan.rate}%</TableCell>
                        <TableCell>{loan.term} meses</TableCell>
                        <TableCell className="text-success">
                          ${loan.paid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-danger">
                          ${loan.remaining.toLocaleString()}
                        </TableCell>
                        <TableCell>{loan.nextPayment}</TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewLoan(loan)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Payment Schedule */}
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cronograma de Pagos - PREST-001</CardTitle>
                    <CardDescription>Calendario detallado de cuotas mensuales</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Capital</TableHead>
                      <TableHead>Interés</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>#{i + 1}</TableCell>
                        <TableCell>15/{String(i + 5).padStart(2, '0')}/2024</TableCell>
                        <TableCell>$800</TableCell>
                        <TableCell>$100</TableCell>
                        <TableCell className="font-semibold">$900</TableCell>
                        <TableCell>
                          <Badge className="bg-success/20 text-success border-success">
                            Pagado
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i + 6}>
                        <TableCell>#{i + 7}</TableCell>
                        <TableCell>15/{String(i + 11).padStart(2, '0')}/2024</TableCell>
                        <TableCell>$800</TableCell>
                        <TableCell>$100</TableCell>
                        <TableCell className="font-semibold">$900</TableCell>
                        <TableCell>
                          <Badge variant="outline">Pendiente</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>

        <Chatbot />

        {/* View Loan Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Préstamo</DialogTitle>
              <DialogDescription>Información completa de tu préstamo</DialogDescription>
            </DialogHeader>
            {selectedLoan && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ID del Préstamo</Label>
                    <p className="font-semibold">{selectedLoan.id}</p>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <div className="mt-1">{getStatusBadge(selectedLoan.status)}</div>
                  </div>
                  <div>
                    <Label>Monto Original</Label>
                    <p className="font-semibold">${selectedLoan.amount?.toLocaleString()} MXN</p>
                  </div>
                  <div>
                    <Label>Fecha de Aprobación</Label>
                    <p className="font-semibold">{selectedLoan.approved}</p>
                  </div>
                  <div>
                    <Label>Tasa de Interés</Label>
                    <p className="font-semibold">{selectedLoan.rate}%</p>
                  </div>
                  <div>
                    <Label>Plazo</Label>
                    <p className="font-semibold">{selectedLoan.term} meses</p>
                  </div>
                  <div>
                    <Label>Monto Pagado</Label>
                    <p className="font-semibold text-success">${selectedLoan.paid?.toLocaleString()} MXN</p>
                  </div>
                  <div>
                    <Label>Saldo Restante</Label>
                    <p className="font-semibold text-danger">${selectedLoan.remaining?.toLocaleString()} MXN</p>
                  </div>
                  {selectedLoan.status === 'active' && (
                    <div className="col-span-2">
                      <Label>Próximo Pago</Label>
                      <p className="font-semibold">{selectedLoan.nextPayment}</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Progreso de Pago</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completado</span>
                      <span>{((selectedLoan.paid / selectedLoan.amount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success transition-all"
                        style={{ width: `${(selectedLoan.paid / selectedLoan.amount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default MyLoans;
