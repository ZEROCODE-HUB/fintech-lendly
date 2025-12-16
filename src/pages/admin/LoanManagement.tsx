import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, CheckCircle, XCircle, Edit, MoreHorizontal, Send, FileText, DollarSign, Bell, TrendingDown, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { ColumnConfig, PendingLoan, ContractLoan, DisbursementLoan, OverdueLoan } from "@/types/loans";
import { pendingLoans, contractLoans, disbursementLoans, activeLoans, overdueLoans, historyLoans } from "@/data/loansMockData";
import { LoanTableFilters } from "@/components/admin/loans/LoanTableFilters";
import { INECURPModal } from "@/components/admin/loans/modals/INECURPModal";
import { ModifyLoanModal } from "@/components/admin/loans/modals/ModifyLoanModal";
import { ResendContractModal, AttachContractModal } from "@/components/admin/loans/modals/ContractModals";
import { ModifyDisbursementModal, ConfirmDisbursementModal } from "@/components/admin/loans/modals/DisbursementModals";
import { SendReminderModal, SellPortfolioModal, UpdateInstallmentsModal } from "@/components/admin/loans/modals/OverdueModals";

const defaultPendingColumns: ColumnConfig[] = [
  { key: 'id', label: 'ID Préstamo', visible: true },
  { key: 'firstName', label: 'Nombres', visible: true },
  { key: 'lastName', label: 'Apellidos', visible: true },
  { key: 'requestDate', label: 'F. Solicitud', visible: true },
  { key: 'amount', label: 'Monto', visible: true },
  { key: 'installments', label: 'Cuotas', visible: true },
  { key: 'membership', label: 'Membresía', visible: true },
  { key: 'ine', label: 'INE', visible: true },
  { key: 'curp', label: 'CURP', visible: true },
  { key: 'preApproval', label: 'Pre-Aprob.', visible: true },
  { key: 'actions', label: 'Acciones', visible: true },
];

const defaultContractColumns: ColumnConfig[] = [
  { key: 'id', label: 'ID', visible: true },
  { key: 'firstName', label: 'Nombres', visible: true },
  { key: 'lastName', label: 'Apellidos', visible: true },
  { key: 'requestDate', label: 'F. Solicitud', visible: true },
  { key: 'amount', label: 'Monto', visible: true },
  { key: 'installments', label: 'Cuotas', visible: true },
  { key: 'membership', label: 'Membresía', visible: true },
  { key: 'ine', label: 'INE', visible: true },
  { key: 'curp', label: 'CURP', visible: true },
  { key: 'preApproval', label: 'Pre-Aprob.', visible: true },
  { key: 'signatureStatus', label: 'Estado Firma', visible: true },
  { key: 'resend', label: 'Reenviar', visible: true },
  { key: 'attach', label: 'Adjuntar', visible: true },
];

const defaultDisbursementColumns: ColumnConfig[] = [
  { key: 'id', label: 'ID', visible: true },
  { key: 'firstName', label: 'Nombres', visible: true },
  { key: 'lastName', label: 'Apellidos', visible: true },
  { key: 'requestDate', label: 'F. Solicitud', visible: true },
  { key: 'amount', label: 'Monto', visible: true },
  { key: 'installments', label: 'Cuotas', visible: true },
  { key: 'bank', label: 'Banco', visible: true },
  { key: 'accountNumber', label: 'Cta/CLABE', visible: true },
  { key: 'ine', label: 'INE', visible: true },
  { key: 'curp', label: 'CURP', visible: true },
  { key: 'contractStatus', label: 'Est. Contrato', visible: true },
  { key: 'disbursementStatus', label: 'Est. Desembolso', visible: true },
  { key: 'actions', label: 'Acciones', visible: true },
];

const defaultActiveColumns: ColumnConfig[] = [
  { key: 'id', label: 'ID', visible: true },
  { key: 'firstName', label: 'Nombres', visible: true },
  { key: 'lastName', label: 'Apellidos', visible: true },
  { key: 'requestDate', label: 'F. Solicitud', visible: true },
  { key: 'amount', label: 'Monto', visible: true },
  { key: 'installments', label: 'Cuotas', visible: true },
  { key: 'paidInstallments', label: 'Cuot. Pagadas', visible: true },
  { key: 'ine', label: 'INE', visible: true },
  { key: 'lastPaymentDate', label: 'F. Últ. Pago', visible: true },
  { key: 'status', label: 'Estado', visible: true },
];

const defaultOverdueColumns: ColumnConfig[] = [
  { key: 'id', label: 'ID', visible: true },
  { key: 'firstName', label: 'Nombres', visible: true },
  { key: 'lastName', label: 'Apellidos', visible: true },
  { key: 'requestDate', label: 'F. Solicitud', visible: true },
  { key: 'amount', label: 'Monto', visible: true },
  { key: 'installments', label: 'Cuotas', visible: true },
  { key: 'paidInstallments', label: 'Cuot. Pagadas', visible: true },
  { key: 'ine', label: 'INE', visible: true },
  { key: 'lastPaymentDate', label: 'F. Últ. Pago', visible: true },
  { key: 'status', label: 'Estado', visible: true },
  { key: 'actions', label: 'Acciones', visible: true },
];

const defaultHistoryColumns: ColumnConfig[] = [
  { key: 'id', label: 'ID', visible: true },
  { key: 'firstName', label: 'Nombres', visible: true },
  { key: 'lastName', label: 'Apellidos', visible: true },
  { key: 'requestDate', label: 'F. Solicitud', visible: true },
  { key: 'amount', label: 'Monto', visible: true },
  { key: 'installments', label: 'Cuotas', visible: true },
  { key: 'paidInstallments', label: 'Cuot. Pagadas', visible: true },
  { key: 'ine', label: 'INE', visible: true },
  { key: 'lastPaymentDate', label: 'F. Últ. Pago', visible: true },
  { key: 'status', label: 'Estado', visible: true },
];

const LoanManagement = () => {
  const { toast } = useToast();

  // Filter states for each tab
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingSort, setPendingSort] = useState('date-desc');
  const [pendingColumns, setPendingColumns] = useState(defaultPendingColumns);

  const [contractSearch, setContractSearch] = useState('');
  const [contractSort, setContractSort] = useState('date-desc');
  const [contractColumns, setContractColumns] = useState(defaultContractColumns);

  const [disbursementSearch, setDisbursementSearch] = useState('');
  const [disbursementSort, setDisbursementSort] = useState('date-desc');
  const [disbursementColumns, setDisbursementColumns] = useState(defaultDisbursementColumns);

  const [activeSearch, setActiveSearch] = useState('');
  const [activeSort, setActiveSort] = useState('date-desc');
  const [activeColumns, setActiveColumns] = useState(defaultActiveColumns);

  const [overdueSearch, setOverdueSearch] = useState('');
  const [overdueSort, setOverdueSort] = useState('date-desc');
  const [overdueColumns, setOverdueColumns] = useState(defaultOverdueColumns);

  const [historySearch, setHistorySearch] = useState('');
  const [historySort, setHistorySort] = useState('date-desc');
  const [historyColumns, setHistoryColumns] = useState(defaultHistoryColumns);

  // Modal states
  const [ineCurpModal, setIneCurpModal] = useState<{ open: boolean; loan: PendingLoan | null; type: 'ine' | 'curp' }>({ open: false, loan: null, type: 'ine' });
  const [modifyModal, setModifyModal] = useState<{ open: boolean; loan: PendingLoan | null }>({ open: false, loan: null });
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; loan: PendingLoan | null }>({ open: false, loan: null });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; loan: PendingLoan | null }>({ open: false, loan: null });

  const [resendModal, setResendModal] = useState<{ open: boolean; loan: ContractLoan | null }>({ open: false, loan: null });
  const [attachModal, setAttachModal] = useState<{ open: boolean; loan: ContractLoan | null }>({ open: false, loan: null });

  const [modifyDisbursementModal, setModifyDisbursementModal] = useState<{ open: boolean; loan: DisbursementLoan | null }>({ open: false, loan: null });
  const [confirmDisbursementModal, setConfirmDisbursementModal] = useState<{ open: boolean; loan: DisbursementLoan | null }>({ open: false, loan: null });

  const [reminderModal, setReminderModal] = useState<{ open: boolean; loan: OverdueLoan | null }>({ open: false, loan: null });
  const [sellPortfolioModal, setSellPortfolioModal] = useState<{ open: boolean; loan: OverdueLoan | null }>({ open: false, loan: null });
  const [updateInstallmentsModal, setUpdateInstallmentsModal] = useState<{ open: boolean; loan: OverdueLoan | null }>({ open: false, loan: null });

  const exportToExcel = () => {
    toast({ title: "Exportando...", description: "El archivo Excel se descargará en breve." });
  };

  const getSignatureStatusBadge = (status: string) => {
    switch (status) {
      case 'Firmado': return <Badge className="bg-success/20 text-success border-success">{status}</Badge>;
      case 'Espera': return <Badge className="bg-warning/20 text-warning border-warning">{status}</Badge>;
      case 'Error': return <Badge className="bg-danger/20 text-danger border-danger">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Al día': return <Badge className="bg-success/20 text-success border-success">{status}</Badge>;
      case 'Atrasado': return <Badge className="bg-warning/20 text-warning border-warning">{status}</Badge>;
      case 'Urgente': return <Badge className="bg-danger/20 text-danger border-danger">{status}</Badge>;
      case 'Liquidado': return <Badge className="bg-success/20 text-success border-success">{status}</Badge>;
      case 'Cartera Vendida': return <Badge className="bg-muted text-muted-foreground">{status}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isColumnVisible = (columns: ColumnConfig[], key: string) => 
    columns.find(c => c.key === key)?.visible ?? true;

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
          </header>

          <div className="p-6">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full max-w-4xl grid-cols-6 mb-6">
                <TabsTrigger value="pending">Pendiente</TabsTrigger>
                <TabsTrigger value="contract">Firma Contrato</TabsTrigger>
                <TabsTrigger value="disbursement">Desembolso</TabsTrigger>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="overdue">Atrasados</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>

              {/* PENDIENTE Tab */}
              <TabsContent value="pending">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Solicitudes Pendientes</CardTitle>
                    <CardDescription>Revisa y aprueba nuevas solicitudes de préstamo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoanTableFilters
                      searchTerm={pendingSearch}
                      onSearchChange={setPendingSearch}
                      sortOrder={pendingSort}
                      onSortChange={setPendingSort}
                      columns={pendingColumns}
                      onColumnsChange={setPendingColumns}
                      showExport
                      onExport={exportToExcel}
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isColumnVisible(pendingColumns, 'id') && <TableHead>ID Préstamo</TableHead>}
                            {isColumnVisible(pendingColumns, 'firstName') && <TableHead>Nombres</TableHead>}
                            {isColumnVisible(pendingColumns, 'lastName') && <TableHead>Apellidos</TableHead>}
                            {isColumnVisible(pendingColumns, 'requestDate') && <TableHead>F. Solicitud</TableHead>}
                            {isColumnVisible(pendingColumns, 'amount') && <TableHead>Monto</TableHead>}
                            {isColumnVisible(pendingColumns, 'installments') && <TableHead>Cuotas</TableHead>}
                            {isColumnVisible(pendingColumns, 'membership') && <TableHead>Membresía</TableHead>}
                            {isColumnVisible(pendingColumns, 'ine') && <TableHead>INE</TableHead>}
                            {isColumnVisible(pendingColumns, 'curp') && <TableHead>CURP</TableHead>}
                            {isColumnVisible(pendingColumns, 'preApproval') && <TableHead>Pre-Aprob.</TableHead>}
                            {isColumnVisible(pendingColumns, 'actions') && <TableHead>Acciones</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingLoans.filter(l => 
                            l.firstName.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                            l.lastName.toLowerCase().includes(pendingSearch.toLowerCase())
                          ).map((loan) => (
                            <TableRow key={loan.id}>
                              {isColumnVisible(pendingColumns, 'id') && <TableCell className="font-medium">{loan.id}</TableCell>}
                              {isColumnVisible(pendingColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                              {isColumnVisible(pendingColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                              {isColumnVisible(pendingColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                              {isColumnVisible(pendingColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                              {isColumnVisible(pendingColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                              {isColumnVisible(pendingColumns, 'membership') && <TableCell>{loan.membership}</TableCell>}
                              {isColumnVisible(pendingColumns, 'ine') && (
                                <TableCell>
                                  <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setIneCurpModal({ open: true, loan, type: 'ine' })}>
                                    {loan.ineNumber.slice(0, 10)}...
                                  </Button>
                                </TableCell>
                              )}
                              {isColumnVisible(pendingColumns, 'curp') && (
                                <TableCell>
                                  <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setIneCurpModal({ open: true, loan, type: 'curp' })}>
                                    {loan.curpNumber.slice(0, 10)}...
                                  </Button>
                                </TableCell>
                              )}
                              {isColumnVisible(pendingColumns, 'preApproval') && (
                                <TableCell>
                                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning">{loan.preApproval}</Badge>
                                </TableCell>
                              )}
                              {isColumnVisible(pendingColumns, 'actions') && (
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => setModifyModal({ open: true, loan })} title="Modificar">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-success hover:text-success" onClick={() => setApproveDialog({ open: true, loan })} title="Aprobar">
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-danger hover:text-danger" onClick={() => setRejectDialog({ open: true, loan })} title="Rechazar">
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* FIRMA CONTRATO Tab */}
              <TabsContent value="contract">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Firma de Contrato</CardTitle>
                    <CardDescription>Gestiona el proceso de firma de contratos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoanTableFilters
                      searchTerm={contractSearch}
                      onSearchChange={setContractSearch}
                      sortOrder={contractSort}
                      onSortChange={setContractSort}
                      columns={contractColumns}
                      onColumnsChange={setContractColumns}
                      showExport
                      onExport={exportToExcel}
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isColumnVisible(contractColumns, 'id') && <TableHead>ID</TableHead>}
                            {isColumnVisible(contractColumns, 'firstName') && <TableHead>Nombres</TableHead>}
                            {isColumnVisible(contractColumns, 'lastName') && <TableHead>Apellidos</TableHead>}
                            {isColumnVisible(contractColumns, 'requestDate') && <TableHead>F. Solicitud</TableHead>}
                            {isColumnVisible(contractColumns, 'amount') && <TableHead>Monto</TableHead>}
                            {isColumnVisible(contractColumns, 'installments') && <TableHead>Cuotas</TableHead>}
                            {isColumnVisible(contractColumns, 'membership') && <TableHead>Membresía</TableHead>}
                            {isColumnVisible(contractColumns, 'ine') && <TableHead>INE</TableHead>}
                            {isColumnVisible(contractColumns, 'curp') && <TableHead>CURP</TableHead>}
                            {isColumnVisible(contractColumns, 'preApproval') && <TableHead>Pre-Aprob.</TableHead>}
                            {isColumnVisible(contractColumns, 'signatureStatus') && <TableHead>Estado Firma</TableHead>}
                            {isColumnVisible(contractColumns, 'resend') && <TableHead>Reenviar</TableHead>}
                            {isColumnVisible(contractColumns, 'attach') && <TableHead>Adjuntar</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contractLoans.filter(l => 
                            l.firstName.toLowerCase().includes(contractSearch.toLowerCase()) ||
                            l.lastName.toLowerCase().includes(contractSearch.toLowerCase())
                          ).map((loan) => (
                            <TableRow key={loan.id}>
                              {isColumnVisible(contractColumns, 'id') && <TableCell className="font-medium">{loan.id}</TableCell>}
                              {isColumnVisible(contractColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                              {isColumnVisible(contractColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                              {isColumnVisible(contractColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                              {isColumnVisible(contractColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                              {isColumnVisible(contractColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                              {isColumnVisible(contractColumns, 'membership') && <TableCell>{loan.membership}</TableCell>}
                              {isColumnVisible(contractColumns, 'ine') && <TableCell>{loan.ineNumber.slice(0, 10)}...</TableCell>}
                              {isColumnVisible(contractColumns, 'curp') && <TableCell>{loan.curpNumber.slice(0, 10)}...</TableCell>}
                              {isColumnVisible(contractColumns, 'preApproval') && (
                                <TableCell>
                                  <Badge className="bg-success/20 text-success border-success">{loan.preApproval}</Badge>
                                </TableCell>
                              )}
                              {isColumnVisible(contractColumns, 'signatureStatus') && (
                                <TableCell>{getSignatureStatusBadge(loan.signatureStatus)}</TableCell>
                              )}
                              {isColumnVisible(contractColumns, 'resend') && (
                                <TableCell>
                                  <Button size="sm" variant="outline" onClick={() => setResendModal({ open: true, loan })}>
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                              {isColumnVisible(contractColumns, 'attach') && (
                                <TableCell>
                                  <Button size="sm" variant="outline" onClick={() => setAttachModal({ open: true, loan })}>
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DESEMBOLSO Tab */}
              <TabsContent value="disbursement">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Desembolso</CardTitle>
                    <CardDescription>Gestiona los desembolsos de préstamos aprobados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoanTableFilters
                      searchTerm={disbursementSearch}
                      onSearchChange={setDisbursementSearch}
                      sortOrder={disbursementSort}
                      onSortChange={setDisbursementSort}
                      columns={disbursementColumns}
                      onColumnsChange={setDisbursementColumns}
                      showExport
                      onExport={exportToExcel}
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isColumnVisible(disbursementColumns, 'id') && <TableHead>ID</TableHead>}
                            {isColumnVisible(disbursementColumns, 'firstName') && <TableHead>Nombres</TableHead>}
                            {isColumnVisible(disbursementColumns, 'lastName') && <TableHead>Apellidos</TableHead>}
                            {isColumnVisible(disbursementColumns, 'requestDate') && <TableHead>F. Solicitud</TableHead>}
                            {isColumnVisible(disbursementColumns, 'amount') && <TableHead>Monto</TableHead>}
                            {isColumnVisible(disbursementColumns, 'installments') && <TableHead>Cuotas</TableHead>}
                            {isColumnVisible(disbursementColumns, 'bank') && <TableHead>Banco</TableHead>}
                            {isColumnVisible(disbursementColumns, 'accountNumber') && <TableHead>Cta/CLABE</TableHead>}
                            {isColumnVisible(disbursementColumns, 'ine') && <TableHead>INE</TableHead>}
                            {isColumnVisible(disbursementColumns, 'curp') && <TableHead>CURP</TableHead>}
                            {isColumnVisible(disbursementColumns, 'contractStatus') && <TableHead>Est. Contrato</TableHead>}
                            {isColumnVisible(disbursementColumns, 'disbursementStatus') && <TableHead>Est. Desembolso</TableHead>}
                            {isColumnVisible(disbursementColumns, 'actions') && <TableHead>Acciones</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {disbursementLoans.filter(l => 
                            l.firstName.toLowerCase().includes(disbursementSearch.toLowerCase()) ||
                            l.lastName.toLowerCase().includes(disbursementSearch.toLowerCase())
                          ).map((loan) => (
                            <TableRow key={loan.id}>
                              {isColumnVisible(disbursementColumns, 'id') && <TableCell className="font-medium">{loan.id}</TableCell>}
                              {isColumnVisible(disbursementColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                              {isColumnVisible(disbursementColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                              {isColumnVisible(disbursementColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                              {isColumnVisible(disbursementColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                              {isColumnVisible(disbursementColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                              {isColumnVisible(disbursementColumns, 'bank') && <TableCell>{loan.bank}</TableCell>}
                              {isColumnVisible(disbursementColumns, 'accountNumber') && <TableCell>{loan.accountNumber}</TableCell>}
                              {isColumnVisible(disbursementColumns, 'ine') && <TableCell>{loan.ineNumber.slice(0, 10)}...</TableCell>}
                              {isColumnVisible(disbursementColumns, 'curp') && <TableCell>{loan.curpNumber.slice(0, 10)}...</TableCell>}
                              {isColumnVisible(disbursementColumns, 'contractStatus') && (
                                <TableCell>
                                  <Badge className="bg-success/20 text-success border-success">{loan.contractStatus}</Badge>
                                </TableCell>
                              )}
                              {isColumnVisible(disbursementColumns, 'disbursementStatus') && (
                                <TableCell>
                                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning">{loan.disbursementStatus}</Badge>
                                </TableCell>
                              )}
                              {isColumnVisible(disbursementColumns, 'actions') && (
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="outline" onClick={() => setModifyDisbursementModal({ open: true, loan })} title="Modificar">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="default" onClick={() => setConfirmDisbursementModal({ open: true, loan })} title="Confirmar Desembolso">
                                      <DollarSign className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ACTIVOS Tab */}
              <TabsContent value="active">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Préstamos Activos</CardTitle>
                    <CardDescription>Préstamos al día con sus pagos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoanTableFilters
                      searchTerm={activeSearch}
                      onSearchChange={setActiveSearch}
                      sortOrder={activeSort}
                      onSortChange={setActiveSort}
                      columns={activeColumns}
                      onColumnsChange={setActiveColumns}
                      showExport
                      onExport={exportToExcel}
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isColumnVisible(activeColumns, 'id') && <TableHead>ID</TableHead>}
                            {isColumnVisible(activeColumns, 'firstName') && <TableHead>Nombres</TableHead>}
                            {isColumnVisible(activeColumns, 'lastName') && <TableHead>Apellidos</TableHead>}
                            {isColumnVisible(activeColumns, 'requestDate') && <TableHead>F. Solicitud</TableHead>}
                            {isColumnVisible(activeColumns, 'amount') && <TableHead>Monto</TableHead>}
                            {isColumnVisible(activeColumns, 'installments') && <TableHead>Cuotas</TableHead>}
                            {isColumnVisible(activeColumns, 'paidInstallments') && <TableHead>Cuot. Pagadas</TableHead>}
                            {isColumnVisible(activeColumns, 'ine') && <TableHead>INE</TableHead>}
                            {isColumnVisible(activeColumns, 'lastPaymentDate') && <TableHead>F. Últ. Pago</TableHead>}
                            {isColumnVisible(activeColumns, 'status') && <TableHead>Estado</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeLoans.filter(l => 
                            l.firstName.toLowerCase().includes(activeSearch.toLowerCase()) ||
                            l.lastName.toLowerCase().includes(activeSearch.toLowerCase())
                          ).map((loan) => (
                            <TableRow key={loan.id}>
                              {isColumnVisible(activeColumns, 'id') && <TableCell className="font-medium">{loan.id}</TableCell>}
                              {isColumnVisible(activeColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                              {isColumnVisible(activeColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                              {isColumnVisible(activeColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                              {isColumnVisible(activeColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                              {isColumnVisible(activeColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                              {isColumnVisible(activeColumns, 'paidInstallments') && <TableCell>{loan.paidInstallments}/{loan.installments}</TableCell>}
                              {isColumnVisible(activeColumns, 'ine') && <TableCell>{loan.ineNumber.slice(0, 10)}...</TableCell>}
                              {isColumnVisible(activeColumns, 'lastPaymentDate') && <TableCell>{loan.lastPaymentDate}</TableCell>}
                              {isColumnVisible(activeColumns, 'status') && <TableCell>{getStatusBadge(loan.status)}</TableCell>}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ATRASADOS Tab */}
              <TabsContent value="overdue">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Préstamos Atrasados</CardTitle>
                    <CardDescription>Préstamos con pagos pendientes o en mora</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoanTableFilters
                      searchTerm={overdueSearch}
                      onSearchChange={setOverdueSearch}
                      sortOrder={overdueSort}
                      onSortChange={setOverdueSort}
                      columns={overdueColumns}
                      onColumnsChange={setOverdueColumns}
                      showExport
                      onExport={exportToExcel}
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isColumnVisible(overdueColumns, 'id') && <TableHead>ID</TableHead>}
                            {isColumnVisible(overdueColumns, 'firstName') && <TableHead>Nombres</TableHead>}
                            {isColumnVisible(overdueColumns, 'lastName') && <TableHead>Apellidos</TableHead>}
                            {isColumnVisible(overdueColumns, 'requestDate') && <TableHead>F. Solicitud</TableHead>}
                            {isColumnVisible(overdueColumns, 'amount') && <TableHead>Monto</TableHead>}
                            {isColumnVisible(overdueColumns, 'installments') && <TableHead>Cuotas</TableHead>}
                            {isColumnVisible(overdueColumns, 'paidInstallments') && <TableHead>Cuot. Pagadas</TableHead>}
                            {isColumnVisible(overdueColumns, 'ine') && <TableHead>INE</TableHead>}
                            {isColumnVisible(overdueColumns, 'lastPaymentDate') && <TableHead>F. Últ. Pago</TableHead>}
                            {isColumnVisible(overdueColumns, 'status') && <TableHead>Estado</TableHead>}
                            {isColumnVisible(overdueColumns, 'actions') && <TableHead>Acciones</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overdueLoans.filter(l => 
                            l.firstName.toLowerCase().includes(overdueSearch.toLowerCase()) ||
                            l.lastName.toLowerCase().includes(overdueSearch.toLowerCase())
                          ).map((loan) => (
                            <TableRow key={loan.id}>
                              {isColumnVisible(overdueColumns, 'id') && <TableCell className="font-medium">{loan.id}</TableCell>}
                              {isColumnVisible(overdueColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                              {isColumnVisible(overdueColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                              {isColumnVisible(overdueColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                              {isColumnVisible(overdueColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                              {isColumnVisible(overdueColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                              {isColumnVisible(overdueColumns, 'paidInstallments') && <TableCell>{loan.paidInstallments}/{loan.installments}</TableCell>}
                              {isColumnVisible(overdueColumns, 'ine') && <TableCell>{loan.ineNumber.slice(0, 10)}...</TableCell>}
                              {isColumnVisible(overdueColumns, 'lastPaymentDate') && <TableCell>{loan.lastPaymentDate}</TableCell>}
                              {isColumnVisible(overdueColumns, 'status') && <TableCell>{getStatusBadge(loan.status)}</TableCell>}
                              {isColumnVisible(overdueColumns, 'actions') && (
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setReminderModal({ open: true, loan })}>
                                        <Bell className="h-4 w-4 mr-2" />
                                        Enviar recordatorio
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setSellPortfolioModal({ open: true, loan })}>
                                        <TrendingDown className="h-4 w-4 mr-2" />
                                        Vender cartera
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setUpdateInstallmentsModal({ open: true, loan })}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Actualizar cuotas
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* HISTORIAL Tab */}
              <TabsContent value="history">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Historial de Préstamos</CardTitle>
                    <CardDescription>Préstamos liquidados o vendidos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoanTableFilters
                      searchTerm={historySearch}
                      onSearchChange={setHistorySearch}
                      sortOrder={historySort}
                      onSortChange={setHistorySort}
                      columns={historyColumns}
                      onColumnsChange={setHistoryColumns}
                      showExport
                      onExport={exportToExcel}
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isColumnVisible(historyColumns, 'id') && <TableHead>ID</TableHead>}
                            {isColumnVisible(historyColumns, 'firstName') && <TableHead>Nombres</TableHead>}
                            {isColumnVisible(historyColumns, 'lastName') && <TableHead>Apellidos</TableHead>}
                            {isColumnVisible(historyColumns, 'requestDate') && <TableHead>F. Solicitud</TableHead>}
                            {isColumnVisible(historyColumns, 'amount') && <TableHead>Monto</TableHead>}
                            {isColumnVisible(historyColumns, 'installments') && <TableHead>Cuotas</TableHead>}
                            {isColumnVisible(historyColumns, 'paidInstallments') && <TableHead>Cuot. Pagadas</TableHead>}
                            {isColumnVisible(historyColumns, 'ine') && <TableHead>INE</TableHead>}
                            {isColumnVisible(historyColumns, 'lastPaymentDate') && <TableHead>F. Últ. Pago</TableHead>}
                            {isColumnVisible(historyColumns, 'status') && <TableHead>Estado</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyLoans.filter(l => 
                            l.firstName.toLowerCase().includes(historySearch.toLowerCase()) ||
                            l.lastName.toLowerCase().includes(historySearch.toLowerCase())
                          ).map((loan) => (
                            <TableRow key={loan.id}>
                              {isColumnVisible(historyColumns, 'id') && <TableCell className="font-medium">{loan.id}</TableCell>}
                              {isColumnVisible(historyColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                              {isColumnVisible(historyColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                              {isColumnVisible(historyColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                              {isColumnVisible(historyColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                              {isColumnVisible(historyColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                              {isColumnVisible(historyColumns, 'paidInstallments') && <TableCell>{loan.paidInstallments}/{loan.installments}</TableCell>}
                              {isColumnVisible(historyColumns, 'ine') && <TableCell>{loan.ineNumber.slice(0, 10)}...</TableCell>}
                              {isColumnVisible(historyColumns, 'lastPaymentDate') && <TableCell>{loan.lastPaymentDate}</TableCell>}
                              {isColumnVisible(historyColumns, 'status') && <TableCell>{getStatusBadge(loan.status)}</TableCell>}
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

        {/* Modals */}
        <INECURPModal
          open={ineCurpModal.open}
          onOpenChange={(open) => setIneCurpModal(prev => ({ ...prev, open }))}
          loan={ineCurpModal.loan}
          type={ineCurpModal.type}
          onSave={() => toast({ title: "Guardado", description: "Los datos se guardaron correctamente." })}
          onValidate={() => toast({ title: "Validación", description: "Documento marcado como validado." })}
        />

        <ModifyLoanModal
          open={modifyModal.open}
          onOpenChange={(open) => setModifyModal(prev => ({ ...prev, open }))}
          loan={modifyModal.loan}
          onSend={() => toast({ title: "Enviado", description: "La propuesta ha sido enviada al cliente." })}
        />

        <AlertDialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog(prev => ({ ...prev, open }))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Aprobar Solicitud?</AlertDialogTitle>
              <AlertDialogDescription>
                Se aprobará la solicitud de préstamo {approveDialog.loan?.id} por ${approveDialog.loan?.amount.toLocaleString()} MXN.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => toast({ title: "Aprobado", description: "La solicitud ha sido aprobada." })}>
                Aprobar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, open }))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Rechazar Solicitud?</AlertDialogTitle>
              <AlertDialogDescription>
                Se rechazará la solicitud de préstamo {rejectDialog.loan?.id}. El cliente será notificado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-danger hover:bg-danger/90" onClick={() => toast({ title: "Rechazado", description: "La solicitud ha sido rechazada.", variant: "destructive" })}>
                Rechazar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ResendContractModal
          open={resendModal.open}
          onOpenChange={(open) => setResendModal(prev => ({ ...prev, open }))}
          loan={resendModal.loan}
          onResend={() => toast({ title: "Reenviado", description: "El contrato ha sido reenviado al cliente." })}
          onSave={() => toast({ title: "Guardado", description: "Los datos se guardaron correctamente." })}
        />

        <AttachContractModal
          open={attachModal.open}
          onOpenChange={(open) => setAttachModal(prev => ({ ...prev, open }))}
          loan={attachModal.loan}
          onConfirm={() => toast({ title: "Adjuntado", description: "Los contratos firmados han sido adjuntados." })}
        />

        <ModifyDisbursementModal
          open={modifyDisbursementModal.open}
          onOpenChange={(open) => setModifyDisbursementModal(prev => ({ ...prev, open }))}
          loan={modifyDisbursementModal.loan}
          onSave={() => toast({ title: "Guardado", description: "Los datos bancarios se actualizaron." })}
        />

        <ConfirmDisbursementModal
          open={confirmDisbursementModal.open}
          onOpenChange={(open) => setConfirmDisbursementModal(prev => ({ ...prev, open }))}
          loan={confirmDisbursementModal.loan}
          onConfirm={() => toast({ title: "Desembolso confirmado", description: "El desembolso ha sido registrado exitosamente." })}
        />

        <SendReminderModal
          open={reminderModal.open}
          onOpenChange={(open) => setReminderModal(prev => ({ ...prev, open }))}
          loan={reminderModal.loan}
          onConfirm={() => toast({ title: "Recordatorio enviado", description: "Se envió el recordatorio de pago al cliente." })}
        />

        <SellPortfolioModal
          open={sellPortfolioModal.open}
          onOpenChange={(open) => setSellPortfolioModal(prev => ({ ...prev, open }))}
          loan={sellPortfolioModal.loan}
          onConfirm={() => toast({ title: "Cartera vendida", description: "La venta de cartera ha sido registrada." })}
        />

        <UpdateInstallmentsModal
          open={updateInstallmentsModal.open}
          onOpenChange={(open) => setUpdateInstallmentsModal(prev => ({ ...prev, open }))}
          loan={updateInstallmentsModal.loan}
          onConfirm={() => toast({ title: "Cuotas actualizadas", description: "Las cuotas han sido actualizadas correctamente." })}
        />
      </div>
    </SidebarProvider>
  );
};

export default LoanManagement;
