import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Chatbot } from "@/components/Chatbot";
import { supabase } from "@/lib/supabase";
import { increscendoApiFetch } from "@/lib/increscendoApi";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const getPaymentRequestStatusLabel = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'initial':
      return 'Pendiente';
    case 'processing':
      return 'En proceso';
    case 'completed':
      return 'Completado';
    case 'failed':
      return 'Rechazado';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pendiente';
  }
};

const History = () => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loanHistory, setLoanHistory] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("loans");
  const [loanPage, setLoanPage] = useState(1);
  const loanPageSize = 10;

  // Load data on mount
  useEffect(() => {
    loadHistoryData();
  }, []);

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
      const fetchPaymentRequestsPage = async (page: number) => {
        const response = await increscendoApiFetch(`/belvo/loans/payment-requests?page=${page}&limit=50`);
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error || 'No se pudieron cargar las solicitudes de pago');
        }

        return payload;
      };

      const allPaymentRequests: any[] = [];
      let currentPage = 1;

      while (true) {
        const payload = await fetchPaymentRequestsPage(currentPage);
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        allPaymentRequests.push(...rows);

        const pagination = payload?.pagination;
        if (!pagination?.hasMore || rows.length === 0 || currentPage >= Number(pagination?.totalPages || 1)) {
          break;
        }

        currentPage += 1;
      }

      const mappedPayments = allPaymentRequests.map((request: any) => {
        const rawStatus = String(request.status ?? request.belvo_status ?? 'initial').toLowerCase();
        const installmentNumber = request.installment_number ?? request.raw?.loan_information?.installmentNumber ?? null;
        const paymentMethodId = String(request.payment_method_id ?? request.raw?.payment_method_id ?? '').trim();

        return {
          id: String(request.payment_request_id || request.reference || `${request.loan_number || request.loan_id}-${installmentNumber || 'pago'}`),
          loan: request.loan_number || request.loan_id,
          amount: Number(request.amount || 0),
          date: new Date(request.created_at || request.synced_at || request.last_updated_at || new Date()).toISOString().split('T')[0],
          method: paymentMethodId ? `Método ${paymentMethodId.slice(0, 8)}...` : 'Sin método',
          status: getPaymentRequestStatusLabel(rawStatus),
          installment: installmentNumber,
          reference: request.reference || '',
          paymentRequestId: request.payment_request_id,
          raw: request,
        };
      });

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
    payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(payment.installment ?? '').includes(searchTerm) ||
    String(payment.reference ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loanTotalPages = Math.max(1, Math.ceil(filteredLoans.length / loanPageSize));
  const paginatedLoans = filteredLoans.slice((loanPage - 1) * loanPageSize, loanPage * loanPageSize);

  useEffect(() => {
    setLoanPage(1);
  }, [searchTerm, activeTab]);

  useEffect(() => {
    setLoanPage((currentPage) => Math.min(currentPage, loanTotalPages));
  }, [loanTotalPages]);

  const handleExport = () => {
    const dataToExport = activeTab === 'loans' ? filteredLoans : filteredPayments;
    const headers = activeTab === 'loans'
      ? ['ID', 'Tipo', 'Monto', 'Fecha', 'Estado']
      : ['ID', 'Préstamo', 'Cuota', 'Monto', 'Fecha', 'Método', 'Estado'];

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item =>
        activeTab === 'loans'
          ? [item.id, item.type, item.amount, item.date, item.status].join(',')
          : [item.id, item.loan, item.installment ?? '', item.amount, item.date, item.method, item.status].join(',')
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
                      <div className="space-y-5">
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
                              {paginatedLoans.map((item) => (
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

                        <div className="flex flex-col gap-4 pt-2 border-t">
                          <div className="text-xs sm:text-sm font-medium text-foreground bg-secondary/50 px-3 py-1.5 rounded-md w-fit">
                            {filteredLoans.length > 0
                              ? `${(loanPage - 1) * loanPageSize + 1}-${Math.min(loanPage * loanPageSize, filteredLoans.length)} de ${filteredLoans.length}`
                              : "Sin préstamos"}
                          </div>

                          {loanTotalPages > 1 && (
                            <div className="flex justify-center sm:justify-end">
                              <Pagination>
                                <PaginationContent className="gap-0 sm:gap-1">
                                  <PaginationItem>
                                    <PaginationPrevious
                                      href="#"
                                      className={`text-xs sm:text-sm ${loanPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-secondary transition-colors"}`}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        if (loanPage > 1) setLoanPage(loanPage - 1);
                                      }}
                                    />
                                  </PaginationItem>

                                  {Array.from({ length: loanTotalPages }).map((_, index) => {
                                    const page = index + 1;

                                    if (page === 1 || page === loanTotalPages || Math.abs(page - loanPage) <= 1) {
                                      return (
                                        <PaginationItem key={page}>
                                          <PaginationLink
                                            href="#"
                                            isActive={page === loanPage}
                                            onClick={(event) => {
                                              event.preventDefault();
                                              setLoanPage(page);
                                            }}
                                            className="text-xs sm:text-sm h-8 w-8"
                                          >
                                            {page}
                                          </PaginationLink>
                                        </PaginationItem>
                                      );
                                    }

                                    if (page === 2 && loanPage > 3) {
                                      return (
                                        <PaginationItem key="start-ellipsis">
                                          <PaginationEllipsis />
                                        </PaginationItem>
                                      );
                                    }

                                    if (page === loanTotalPages - 1 && loanPage < loanTotalPages - 2) {
                                      return (
                                        <PaginationItem key="end-ellipsis">
                                          <PaginationEllipsis />
                                        </PaginationItem>
                                      );
                                    }

                                    return null;
                                  })}

                                  <PaginationItem>
                                    <PaginationNext
                                      href="#"
                                      className={`text-xs sm:text-sm ${loanPage >= loanTotalPages ? "pointer-events-none opacity-50" : "hover:bg-secondary transition-colors"}`}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        if (loanPage < loanTotalPages) setLoanPage(loanPage + 1);
                                      }}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          )}
                        </div>
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
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Cuota</TableHead>
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
                                <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                                  {item.installment ? `#${item.installment}` : 'N/A'}
                                </TableCell>
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
