import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";

const History = () => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loanHistory, setLoanHistory] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("loans");

  // Load data on mount
  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load loans
      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('id, loan_number, amount, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (loansError) throw loansError;

      const mappedLoans = (loans || []).map(l => ({
        id: l.loan_number || l.id,
        loan_id: l.id,
        type: "Préstamo",
        amount: Number(l.amount || 0),
        date: new Date(l.created_at).toISOString().split('T')[0],
        status: l.status === 'active' ? 'Activo' : l.status === 'paid' ? 'Completado' : l.status === 'approved' ? 'Aprobado' : l.status.charAt(0).toUpperCase() + l.status.slice(1),
        raw: l
      }));

      setLoanHistory(mappedLoans);

      // Load payments from loan_events table (where event_type is 'payment')
      const { data: payments, error: paymentsError } = await supabase
        .from('loan_events')
        .select(`
          id,
          loan_id,
          event_type,
          created_at,
          metadata,
          loans(loan_number, amount)
        `)
        .eq('loans.user_id', user.id)
        .eq('event_type', 'payment')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      const mappedPayments = (payments || []).map((p: any) => ({
        id: `PAG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        loan: p.loans?.[0]?.loan_number || p.loan_id,
        amount: Number(p.metadata?.amount || 0),
        date: new Date(p.created_at).toISOString().split('T')[0],
        method: p.metadata?.method || "Transferencia",
        status: "Exitoso",
        raw: p
      }));

      setPaymentHistory(mappedPayments);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; border: string }> = {
      'Exitoso': { bg: 'bg-success/20', text: 'text-success', border: 'border-success' },
      'Completado': { bg: 'bg-success/20', text: 'text-success', border: 'border-success' },
      'Aprobado': { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary' },
      'Activo': { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary' },
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

  // Filter data based on search term
  const filteredLoans = loanHistory.filter(loan =>
    loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.date.includes(searchTerm) ||
    loan.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = paymentHistory.filter(payment =>
    payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.loan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.date.includes(searchTerm) ||
    payment.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const dataToExport = activeTab === 'loans' ? filteredLoans : filteredPayments;
    const headers = activeTab === 'loans' 
      ? ['ID', 'Tipo', 'Monto', 'Fecha', 'Estado']
      : ['ID', 'Préstamo', 'Monto', 'Fecha', 'Método', 'Estado'];
    
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item => 
        activeTab === 'loans'
          ? [item.id, item.type, item.amount, item.date, item.status].join(',')
          : [item.id, item.loan, item.amount, item.date, item.method, item.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 overflow-x-hidden">
          <header className="border-b border-border bg-card fixed md:sticky top-0 z-10 w-full md:w-auto">
            <div className="flex items-center h-14 sm:h-16 px-4 sm:px-6 gap-3">
              <SidebarTrigger />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Historial</h1>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 md:px-6 lg:p-8 space-y-4 sm:space-y-6 pt-16 sm:pt-20 md:pt-0">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar en historial..." 
                className="pl-8 sm:pl-10 text-xs sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <div className="pt-3">
                      <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        <span className="text-xs sm:text-sm">Exportar Historial</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-6">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Cargando préstamos...</p>
                      </div>
                    ) : filteredLoans.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No hay préstamos {searchTerm ? 'que coincidan con tu búsqueda' : 'registrados'}</p>
                      </div>
                    ) : (
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
                            {filteredLoans.map((item) => (
                              <TableRow key={item.loan_id}>
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
                    )}
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
                    <div className="pt-3">
                      <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        <span className="text-xs sm:text-sm">Exportar Pagos</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-6">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Cargando pagos...</p>
                      </div>
                    ) : filteredPayments.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No hay pagos {searchTerm ? 'que coincidan con tu búsqueda' : 'registrados'}</p>
                      </div>
                    ) : (
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
                            {filteredPayments.map((item) => (
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Chatbot />

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl rounded-2xl">
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
