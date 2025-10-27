import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Filter, Eye, CheckCircle, XCircle, Edit, Trash2, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const LoanManagement = () => {
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  const pendingLoans = [
    { id: "SOL-001", client: "María González", amount: 15000, purpose: "Capital de trabajo", date: "2024-10-28", score: 780 },
    { id: "SOL-002", client: "Carlos Ramírez", amount: 25000, purpose: "Expansión de negocio", date: "2024-10-27", score: 820 },
    { id: "SOL-003", client: "Ana López", amount: 10000, purpose: "Equipo", date: "2024-10-26", score: 750 },
  ];

  const activeLoans = [
    { id: "PREST-045", client: "Juan Pérez", amount: 20000, remaining: 12000, nextPayment: "2024-11-15", status: "Al día", interest: 18 },
    { id: "PREST-044", client: "Laura Sánchez", amount: 30000, remaining: 25000, nextPayment: "2024-11-10", status: "Al día", interest: 16 },
    { id: "PREST-043", client: "Roberto García", amount: 15000, remaining: 8000, nextPayment: "2024-11-05", status: "Atrasado", interest: 20 },
  ];

  const handleView = (loan: any) => {
    setSelectedLoan(loan);
    setViewDialogOpen(true);
  };

  const handleApprove = (loan: any) => {
    setSelectedLoan(loan);
    setApproveDialogOpen(true);
  };

  const handleReject = (loan: any) => {
    setSelectedLoan(loan);
    setRejectDialogOpen(true);
  };

  const handleDelete = (loan: any) => {
    setSelectedLoan(loan);
    setDeleteDialogOpen(true);
  };

  const handleViewSchedule = (loan: any) => {
    setSelectedLoan(loan);
    setScheduleDialogOpen(true);
  };

  const confirmApproval = () => {
    // Generate payment schedule when approving loan
    const principal = selectedLoan?.amount || 0;
    const months = 12; // Default term
    const monthlyRate = 0.18 / 12; // 18% annual rate
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    console.log('Cronograma generado automáticamente:', {
      loanId: selectedLoan?.id,
      principal,
      monthlyPayment: monthlyPayment.toFixed(2),
      term: months,
      totalToPay: (monthlyPayment * months).toFixed(2)
    });
    
    toast({
      title: "Préstamo Aprobado",
      description: `La solicitud ${selectedLoan?.id} ha sido aprobada. Se generó el cronograma de pagos automáticamente.`,
    });
    setApproveDialogOpen(false);
  };

  const confirmReject = () => {
    toast({
      title: "Solicitud Rechazada",
      description: `La solicitud ${selectedLoan?.id} ha sido rechazada.`,
      variant: "destructive",
    });
    setRejectDialogOpen(false);
  };

  const confirmDelete = () => {
    toast({
      title: "Registro Eliminado",
      description: "El registro ha sido eliminado del sistema.",
      variant: "destructive",
    });
    setDeleteDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === "Al día") {
      return <Badge className="bg-success/20 text-success border-success">{status}</Badge>;
    }
    return <Badge className="bg-danger/20 text-danger border-danger">{status}</Badge>;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Gestión de Préstamos</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar préstamos..." className="pl-10" />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
              </TabsList>

              {/* Pending Loans */}
              <TabsContent value="pending" className="mt-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Solicitudes Pendientes</CardTitle>
                    <CardDescription>Revisa y aprueba nuevas solicitudes de préstamo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Propósito</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingLoans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell className="font-medium">{loan.id}</TableCell>
                            <TableCell>{loan.client}</TableCell>
                            <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>
                            <TableCell>{loan.purpose}</TableCell>
                            <TableCell>{loan.date}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-primary text-primary">
                                {loan.score}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleView(loan)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-success hover:text-success" onClick={() => handleApprove(loan)}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-danger hover:text-danger" onClick={() => handleReject(loan)}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Active Loans */}
              <TabsContent value="active" className="mt-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Préstamos Activos</CardTitle>
                    <CardDescription>Monitorea el estado de préstamos en curso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Monto Original</TableHead>
                          <TableHead>Saldo Restante</TableHead>
                          <TableHead>Próximo Pago</TableHead>
                          <TableHead>Interés</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeLoans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell className="font-medium">{loan.id}</TableCell>
                            <TableCell>{loan.client}</TableCell>
                            <TableCell>${loan.amount.toLocaleString()}</TableCell>
                            <TableCell className="font-semibold">${loan.remaining.toLocaleString()}</TableCell>
                            <TableCell>{loan.nextPayment}</TableCell>
                            <TableCell>{loan.interest}%</TableCell>
                            <TableCell>{getStatusBadge(loan.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleView(loan)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleViewSchedule(loan)}>
                                  <Calendar className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(loan)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Monitoring */}
              <TabsContent value="monitoring" className="mt-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg">Cobros Exitosos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-success">94.5%</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Este mes: $285,000 MXN
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg">Pagos Fallidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-warning">3.2%</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Este mes: $9,500 MXN
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg">Morosidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-danger">2.3%</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        8 clientes atrasados
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* View Loan Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles de la Solicitud</DialogTitle>
              <DialogDescription>Información completa del préstamo</DialogDescription>
            </DialogHeader>
            {selectedLoan && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ID de Solicitud</Label>
                    <p className="font-semibold">{selectedLoan.id}</p>
                  </div>
                  <div>
                    <Label>Cliente</Label>
                    <p className="font-semibold">{selectedLoan.client}</p>
                  </div>
                  <div>
                    <Label>Monto Solicitado</Label>
                    <p className="font-semibold">${selectedLoan.amount?.toLocaleString()} MXN</p>
                  </div>
                  <div>
                    <Label>Fecha de Solicitud</Label>
                    <p className="font-semibold">{selectedLoan.date}</p>
                  </div>
                  {selectedLoan.purpose && (
                    <div className="col-span-2">
                      <Label>Propósito</Label>
                      <p className="font-semibold">{selectedLoan.purpose}</p>
                    </div>
                  )}
                  {selectedLoan.score && (
                    <div>
                      <Label>Score Crediticio</Label>
                      <p className="font-semibold">{selectedLoan.score}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprobar Préstamo</DialogTitle>
              <DialogDescription>Configura los términos del préstamo aprobado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="approved-amount">Monto Aprobado (MXN)</Label>
                <Input id="approved-amount" type="number" placeholder="15000" />
              </div>
              <div>
                <Label htmlFor="interest-rate">Tasa de Interés (%)</Label>
                <Input id="interest-rate" type="number" placeholder="18" />
              </div>
              <div>
                <Label htmlFor="term">Plazo (meses)</Label>
                <Input id="term" type="number" placeholder="12" />
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" placeholder="Observaciones adicionales..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmApproval}>
                Aprobar Préstamo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Rechazar Solicitud?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción rechazará la solicitud de préstamo. El cliente será notificado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmReject} className="bg-danger hover:bg-danger/90">
                Rechazar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar Registro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El registro será eliminado permanentemente del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-danger hover:bg-danger/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payment Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cronograma de Pagos</DialogTitle>
              <DialogDescription>
                Estado del cronograma de pagos para {selectedLoan?.client}
              </DialogDescription>
            </DialogHeader>
            {selectedLoan && (
              <div className="space-y-6">
                {/* Loan Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">ID Préstamo</Label>
                    <p className="font-semibold">{selectedLoan.id}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Monto Original</Label>
                    <p className="font-semibold">${selectedLoan.amount?.toLocaleString()} MXN</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Saldo Restante</Label>
                    <p className="font-semibold text-primary">${selectedLoan.remaining?.toLocaleString()} MXN</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Interés Anual</Label>
                    <p className="font-semibold">{selectedLoan.interest}%</p>
                  </div>
                </div>

                {/* Payment Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso de Pagos</span>
                    <span className="font-semibold">
                      {((selectedLoan.amount - selectedLoan.remaining) / selectedLoan.amount * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(selectedLoan.amount - selectedLoan.remaining) / selectedLoan.amount * 100} 
                    className="h-2"
                  />
                </div>

                {/* Payment Schedule Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Fecha de Pago</TableHead>
                        <TableHead>Pago Mensual</TableHead>
                        <TableHead>Capital</TableHead>
                        <TableHead>Interés</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const principal = selectedLoan.amount;
                        const months = 12;
                        const monthlyRate = selectedLoan.interest / 100 / 12;
                        const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                                              (Math.pow(1 + monthlyRate, months) - 1);
                        let balance = principal;
                        const payments = [];
                        const today = new Date();

                        for (let i = 1; i <= months; i++) {
                          const interestPayment = balance * monthlyRate;
                          const principalPayment = monthlyPayment - interestPayment;
                          balance -= principalPayment;

                          const paymentDate = new Date(2024, 9, 15);
                          paymentDate.setMonth(paymentDate.getMonth() + i);
                          
                          let status = 'Pendiente';
                          let statusClass = 'bg-muted/20 text-muted-foreground border-muted';
                          
                          if (balance > selectedLoan.remaining) {
                            status = 'Pagado';
                            statusClass = 'bg-success/20 text-success border-success';
                          } else if (paymentDate < today && balance <= selectedLoan.remaining) {
                            status = 'Atrasado';
                            statusClass = 'bg-danger/20 text-danger border-danger';
                          } else if (i === Math.ceil((principal - selectedLoan.remaining) / principalPayment) + 1) {
                            status = 'Próximo';
                            statusClass = 'bg-warning/20 text-warning border-warning';
                          }

                          payments.push(
                            <TableRow key={i}>
                              <TableCell className="font-medium">{i}</TableCell>
                              <TableCell>{paymentDate.toLocaleDateString('es-MX')}</TableCell>
                              <TableCell className="font-semibold">${monthlyPayment.toFixed(2)}</TableCell>
                              <TableCell>${principalPayment.toFixed(2)}</TableCell>
                              <TableCell>${interestPayment.toFixed(2)}</TableCell>
                              <TableCell>${Math.max(0, balance).toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={statusClass}>
                                  {status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return payments;
                      })()}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Pagos Realizados</div>
                      <div className="text-2xl font-bold text-success">
                        {Math.round((selectedLoan.amount - selectedLoan.remaining) / (selectedLoan.amount / 12))} / 12
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Próximo Pago</div>
                      <div className="text-2xl font-bold">{selectedLoan.nextPayment}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Estado General</div>
                      <div className="text-2xl font-bold">
                        {getStatusBadge(selectedLoan.status)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default LoanManagement;
