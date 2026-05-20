import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, CheckCircle, XCircle, CheckCircle2, Edit, MoreHorizontal, Send, FileText, DollarSign, Bell, TrendingDown, RefreshCw, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PaymentScheduleModal from '@/components/admin/loans/modals/PaymentScheduleModal';
import { useToast } from "@/hooks/use-toast";

import { ColumnConfig, PendingLoan, ContractLoan, DisbursementLoan, OverdueLoan } from "@/types/loans";
import { supabase } from "@/lib/supabase";
import { authService } from '@/utils/auth';
import { increscendoApiFetch } from "@/lib/increscendoApi";
import { LoanTableFilters } from "@/components/admin/loans/LoanTableFilters";
import { INECURPModal } from "@/components/admin/loans/modals/INECURPModal";
import { ModifyLoanModal } from "@/components/admin/loans/modals/ModifyLoanModal";
import { ResendContractModal, AttachContractModal } from "@/components/admin/loans/modals/ContractModals";
import { ModifyDisbursementModal, ConfirmDisbursementModal } from "@/components/admin/loans/modals/DisbursementModals";
import { SendReminderModal, SellPortfolioModal, UpdateInstallmentsModal } from "@/components/admin/loans/modals/OverdueModals";
import { jsPDF } from "jspdf";

const defaultPendingColumns: ColumnConfig[] = [
  { key: 'id', label: 'ID Préstamo', visible: true },
  { key: 'firstName', label: 'Nombres', visible: true },
  { key: 'lastName', label: 'Apellidos', visible: true },
  { key: 'requestDate', label: 'F. Solicitud', visible: true },
  { key: 'amount', label: 'Monto', visible: true },
  { key: 'installments', label: 'Cuotas', visible: true },
  { key: 'membership', label: 'Membresía', visible: true },
  // { key: 'accountVerification', label: 'Verificación cuenta', visible: false },
  { key: 'ine', label: 'INE', visible: true },
  { key: 'consent', label: 'Consentimiento', visible: true },
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
  { key: 'consent', label: 'Consentimiento', visible: true },
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
  { key: 'consent', label: 'Consentimiento', visible: true },
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
  { key: 'consent', label: 'Consentimiento', visible: true },
  { key: 'lastPaymentDate', label: 'F. Últ. Pago', visible: true },
  { key: 'status', label: 'Estado', visible: true },
  { key: 'actions', label: 'Acciones', visible: true },
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
  { key: 'consent', label: 'Consentimiento', visible: true },
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
  { key: 'consent', label: 'Consentimiento', visible: true },
  { key: 'lastPaymentDate', label: 'F. Últ. Pago', visible: true },
  { key: 'status', label: 'Estado', visible: true },
];

type PaymentRow = {
  installment: number;
  date: string;
  principal: number;
  interest: number;
  total: number;
  balance: number;
};

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatShortDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const normalizeMonthlyRate = (annualRate: number) => {
  if (!Number.isFinite(annualRate) || annualRate <= 0) return 0;
  if (annualRate > 1) return annualRate / 100 / 12;
  return annualRate / 12;
};

const calculateMonthlyPayment = (principal: number, monthlyRate: number, months: number) => {
  if (principal <= 0 || months <= 0) return 0;
  if (monthlyRate <= 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

const buildFrenchSchedule = (principal: number, monthlyRate: number, months: number, monthlyPayment: number, startDate: Date) => {
  const rows: PaymentRow[] = [];
  let remainingBalance = principal;

  for (let i = 1; i <= months; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;

    if (i === months) {
      principalPayment = remainingBalance;
    }

    remainingBalance = Math.max(0, remainingBalance - principalPayment);

    const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + (i - 1), startDate.getDate());
    rows.push({
      installment: i,
      date: formatShortDate(dueDate),
      principal: principalPayment,
      interest: interestPayment,
      total: monthlyPayment,
      balance: remainingBalance,
    });
  }

  return rows;
};

const generateLoanSchedulePdfBase64 = (loan: any) => {
  const principal = Number(loan.amount ?? loan.raw?.amount ?? 0);
  const months = Number(loan.installments ?? loan.raw?.installments ?? 0);
  const storedAnnualRate = Number(loan.raw?.interest_rate ?? 0.42);
  const monthlyRate = normalizeMonthlyRate(storedAnnualRate);
  const monthlyPayment = Number(loan.raw?.monthly_payment ?? calculateMonthlyPayment(principal, monthlyRate, months));
  const firstDueDate = new Date();
  firstDueDate.setMonth(firstDueDate.getMonth() + 1);

  const rows = buildFrenchSchedule(principal, monthlyRate, months, monthlyPayment, firstDueDate);
  const totalToPay = Number(loan.raw?.total_to_pay ?? monthlyPayment * months);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 36;
  const right = pageWidth - 36;
  const tableTop = 142;
  const rowHeight = 16;
  const colX = [left, 84, 152, 256, 348, 438, 528];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Cronograma de Pagos', left, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${loan.firstName ?? ''} ${loan.lastName ?? ''}`.trim(), left, 58);
  doc.text(`Solicitud: ${loan.id ?? ''}`, left, 72);
  doc.text(`Monto: ${formatMoney(principal)}`, left, 86);
  doc.text(`TNA: ${(storedAnnualRate > 1 ? storedAnnualRate : storedAnnualRate * 100).toFixed(2)}%`, 220, 86);
  doc.text(`Tasa mensual: ${(monthlyRate * 100).toFixed(4)}%`, 220, 100);
  doc.text(`Pagos: ${months}`, 420, 86);
  doc.text(`Pago mensual: ${formatMoney(monthlyPayment)}`, 420, 100);
  doc.text(`Total a pagar: ${formatMoney(totalToPay)}`, 420, 114);

  doc.setDrawColor(190, 190, 190);
  doc.line(left, tableTop - 12, right, tableTop - 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CUOTA', colX[0], tableTop);
  doc.text('FECHA', colX[1], tableTop);
  doc.text('CAPITAL', colX[2], tableTop);
  doc.text('INTERES', colX[3], tableTop);
  doc.text('TOTAL', colX[4], tableTop);
  doc.text('SALDO', colX[5], tableTop);

  doc.setFont('helvetica', 'normal');
  let y = tableTop + 14;

  rows.forEach((r) => {
    if (y > pageHeight - 96) {
      doc.addPage();
      y = 48;
      doc.setFont('helvetica', 'bold');
      doc.text('CUOTA', colX[0], y);
      doc.text('FECHA', colX[1], y);
      doc.text('CAPITAL', colX[2], y);
      doc.text('INTERES', colX[3], y);
      doc.text('TOTAL', colX[4], y);
      doc.text('SALDO', colX[5], y);
      doc.setFont('helvetica', 'normal');
      y += 14;
    }

    doc.setFontSize(8);
    doc.text(String(r.installment), colX[0], y);
    doc.text(r.date, colX[1], y);
    doc.text(formatMoney(r.principal), colX[2], y, { align: 'left' });
    doc.text(formatMoney(r.interest), colX[3], y, { align: 'left' });
    doc.text(formatMoney(r.total), colX[4], y, { align: 'left' });
    doc.text(formatMoney(r.balance), colX[5], y, { align: 'left' });
    y += rowHeight;
  });

  const signatureY = Math.max(y + 28, pageHeight - 96);
  doc.setDrawColor(60, 60, 60);
  doc.line(left + 8, signatureY, 230, signatureY);
  doc.setFontSize(8);
  doc.text('Firma del cliente', left + 8, signatureY + 14);

  const dataUri = doc.output('datauristring');
  return dataUri.split(',')[1] ?? '';
};

const LoanManagement = () => {
  const { toast } = useToast();

  // Real data from Supabase
  const [pendingLoansData, setPendingLoansData] = useState<any[]>([]);
  const [contractLoansData, setContractLoansData] = useState<any[]>([]);
  const [disbursementLoansData, setDisbursementLoansData] = useState<any[]>([]);
  const [activeLoansData, setActiveLoansData] = useState<any[]>([]);
  const [overdueLoansData, setOverdueLoansData] = useState<any[]>([]);
  const [historyLoansData, setHistoryLoansData] = useState<any[]>([]);
  // Per-tab loading and pagination
  const [activeTab, setActiveTab] = useState<string>('pending');
  const pageSize = 5;

  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [contractPage, setContractPage] = useState(1);
  const [contractTotal, setContractTotal] = useState(0);
  const [contractLoading, setContractLoading] = useState(false);

  const [disbursementPage, setDisbursementPage] = useState(1);
  const [disbursementTotal, setDisbursementTotal] = useState(0);
  const [disbursementLoading, setDisbursementLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [activeTotal, setActiveTotal] = useState(0);
  const [activeLoading, setActiveLoading] = useState(false);

  const [overduePage, setOverduePage] = useState(1);
  const [overdueTotal, setOverdueTotal] = useState(0);
  const [overdueLoading, setOverdueLoading] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);

  const mapLoan = (l: any) => {
    const user = l.users ?? {};
    const latestSignature = Array.isArray(l.loan_signatures) && l.loan_signatures.length ? l.loan_signatures[0] : null;
    const latestDisbursement = Array.isArray(l.loan_disbursements) && l.loan_disbursements.length ? l.loan_disbursements[0] : null;

    let membershipVal = '';
    if (user.user_memberships && Array.isArray(user.user_memberships) && user.user_memberships.length > 0 && user.user_memberships[0]?.membership_plans?.name) {
      membershipVal = user.user_memberships[0].membership_plans.name;
    } else {
      const rawMembership = l.metadata?.membership;
      membershipVal = typeof rawMembership === 'string'
        ? rawMembership
        : (rawMembership && typeof rawMembership === 'object'
          ? (rawMembership.name ?? rawMembership.title ?? '')
          : '');
    }

    const paidAmount = Number(l.metadata?.paid_amount ?? 0);
    const amt = Number(l.amount ?? 0);
    const term = Number(l.installments ?? l.metadata?.installments ?? 12);
    const installmentAmount = term > 0 ? Math.round(amt / term) : amt;
    const paidInstallments = installmentAmount > 0 ? Math.floor(paidAmount / installmentAmount) : 0;
    const lastPaymentDate = l.metadata?.last_payment_date ? (new Date(l.metadata.last_payment_date)).toISOString().slice(0, 10) : '';

    let friendlyStatus = '';
    if (l.status === 'closed') friendlyStatus = 'Liquidado';
    else if (l.status === 'active') {
      if (l.metadata?.overdue === true) friendlyStatus = 'Atrasado';
      else friendlyStatus = 'Al día';
    } else if (l.status === 'cancelled') {
      friendlyStatus = 'Rechazado';
    } else {
      friendlyStatus = l.status ?? '';
    }

    const approvedDateForNext = l.approved_at ? new Date(l.approved_at) : (l.applied_at ? new Date(l.applied_at) : (l.created_at ? new Date(l.created_at) : null));
    let nextPaymentDate = '';
    if (l.metadata?.next_payment_date) {
      try { nextPaymentDate = new Date(l.metadata.next_payment_date).toISOString().slice(0, 10); } catch { nextPaymentDate = ''; }
    } else if (approvedDateForNext) {
      const termCount = Number(l.installments ?? l.metadata?.installments ?? 12);
      const amtVal = Number(l.amount ?? 0);
      const installmentAmount = termCount > 0 ? Math.round(amtVal / termCount) : amtVal;
      const paidAmt = Number(l.metadata?.paid_amount ?? 0);
      const paidInst = installmentAmount > 0 ? Math.floor(paidAmt / installmentAmount) : 0;
      const nextInst = paidInst + 1;
      const d = new Date(approvedDateForNext);
      d.setMonth(d.getMonth() + nextInst);
      nextPaymentDate = d.toISOString().slice(0, 10);
    }

    const today = new Date().toISOString().slice(0, 10);
    const totalAmount = Number(l.amount ?? 0);
    const overdueFlag = (l.status === 'active') && !!nextPaymentDate && (nextPaymentDate < today) && (paidAmount < totalAmount);

    return {
      id: l.loan_number ?? l.id,
      uuid: l.id,
      user_id: l.user_id,
      email: user.email ?? '',
      firstName: user.first_name ?? '',
      lastName: user.last_name ?? '',
      requestDate: l.applied_at ? new Date(l.applied_at).toISOString().slice(0, 10) : (l.created_at ? new Date(l.created_at).toISOString().slice(0, 10) : ''),
      amount: l.amount,
      installments: l.installments,
      paidInstallments,
      membership: membershipVal,
      ineNumber: user.ine_key ?? l.metadata?.ine_key ?? '',
      curpNumber: user.curp ?? l.metadata?.curp ?? '',
      preApproval: l.metadata?.pre_approval ?? (l.status === 'pending' ? 'En Revisión' : 'Aprobado'),
      isAccountVerified: l.metadata?.account_verified === true,
      signatureStatus: latestSignature ? 'Firmado' : (l.status === 'signed' ? 'Firmado' : 'Espera'),
      contractStatus: l.status === 'signed' ? 'Firmado' : l.status,
      disbursementStatus: latestDisbursement ? 'Desembolsado' : (l.status === 'disbursed' ? 'Desembolsado' : 'Pendiente'),
      bank: latestDisbursement?.destination_account?.bank ?? l.metadata?.bank ?? '',
      accountNumber: latestDisbursement?.destination_account?.clabe ?? l.metadata?.clabe ?? '',
      lastPaymentDate,
      nextPaymentDate,
      overdue: overdueFlag,
      status: friendlyStatus,
      raw: l,
    };
  };

  const renderSkeletonRows = (columns: ColumnConfig[]) => {
    const visibleCols = columns.filter(c => c.visible).length || 6;
    return Array.from({ length: pageSize }).map((_, i) => (
      <TableRow key={`skel-${i}`}>
        <TableCell colSpan={visibleCols}>
          <div className="py-2"><Skeleton className="h-6 w-full" /></div>
        </TableCell>
      </TableRow>
    ));
  };

  const renderPagination = (page: number, total: number, onPageChange: (p: number) => void) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (totalPages <= 1) return null;

    const pagesSet = new Set<number>();
    pagesSet.add(1);
    pagesSet.add(totalPages);
    for (let p = page - 1; p <= page + 1; p++) {
      if (p > 1 && p < totalPages) pagesSet.add(p);
    }
    // ensure nearby second/penultimate pages for nicer UX
    if (2 < totalPages) pagesSet.add(2);
    if (totalPages - 1 > 1) pagesSet.add(totalPages - 1);

    const pages = Array.from(pagesSet).sort((a, b) => a - b);

    const nodes: any[] = [];
    nodes.push(
      <Button key="first" size="sm" variant="ghost" onClick={() => onPageChange(1)} disabled={page <= 1} className="!p-2">
        ‹
      </Button>
    );
    nodes.push(
      <Button key="prev" size="sm" variant="ghost" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="!p-2">
        ←
      </Button>
    );

    let lastShown = 0;
    pages.forEach((p) => {
      if (lastShown && p - lastShown > 1) {
        nodes.push(<div key={`ell-${p}`} className="px-2 text-muted-foreground">…</div>);
      }
      lastShown = p;

      nodes.push(
        <Button
          key={`p-${p}`}
          size="sm"
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded-md ${p === page ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:bg-muted/50'}`}
        >
          {p}
        </Button>
      );
    });

    nodes.push(
      <Button key="next" size="sm" variant="ghost" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="!p-2">
        →
      </Button>
    );
    nodes.push(
      <Button key="last" size="sm" variant="ghost" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} className="!p-2">
        ›
      </Button>
    );

    return (
      <div className="bg-card/70 px-3 py-2 rounded-lg shadow-sm flex items-center gap-3">
        {nodes}
      </div>
    );
  };

  const reloadCurrentTab = async () => {
    switch (activeTab) {
      case 'pending': return await loadPending(pendingPage);
      case 'contract': return await loadContract(contractPage);
      case 'disbursement': return await loadDisbursement(disbursementPage);
      case 'active': return await loadActive(activePage);
      case 'overdue': return await loadOverdue(overduePage);
      case 'history': return await loadHistory(historyPage);
      default: return;
    }
  };

  const loadPending = async (page = 1) => {
    setPendingLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('loans')
        .select('id, loan_number, amount, installments, monthly_payment, interest_rate, total_to_pay, status, status_consent, applied_at, created_at, approved_at, signed_at, disbursed_at, metadata, user_id, users(first_name,last_name,ine_key,curp,phone,email,user_memberships(membership_plans(name))), loan_signatures(*), loan_disbursements(*)', { count: 'exact' })
        .in('status', ['pending', 'under_review', 'cancelled'])
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      const mapped = (data || []).map(mapLoan);
      setPendingLoansData(mapped);
      setPendingTotal(count || mapped.length);
      setPendingPage(page);
    } catch (err) {
      console.error('Error loading pending loans', err);
      toast({ title: 'Error', description: 'No se pudieron cargar las solicitudes pendientes.' });
    } finally { setPendingLoading(false); }
  };

  const loadContract = async (page = 1) => {
    setContractLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('loans')
        .select('id, loan_number, amount, installments, monthly_payment, interest_rate, total_to_pay, status, status_consent, applied_at, created_at, approved_at, signed_at, disbursed_at, metadata, user_id, users(first_name,last_name,ine_key,curp,phone,email,user_memberships(membership_plans(name))), loan_signatures(*), loan_disbursements(*)', { count: 'exact' })
        .in('status', ['approved', 'signed'])
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      const mapped = (data || []).map(mapLoan);
      setContractLoansData(mapped);
      setContractTotal(count || mapped.length);
      setContractPage(page);
    } catch (err) {
      console.error('Error loading contract loans', err);
      toast({ title: 'Error', description: 'No se pudieron cargar las firmas.' });
    } finally { setContractLoading(false); }
  };

  const loadDisbursement = async (page = 1) => {
    setDisbursementLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('loans')
        .select('id, loan_number, amount, installments, monthly_payment, interest_rate, total_to_pay, status, status_consent, applied_at, created_at, approved_at, signed_at, disbursed_at, metadata, user_id, users(first_name,last_name,ine_key,curp,phone,email,user_memberships(membership_plans(name))), loan_signatures(*), loan_disbursements(*)', { count: 'exact' })
        .in('status', ['signed', 'disbursed'])
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      const mapped = (data || []).map(mapLoan);
      setDisbursementLoansData(mapped);
      setDisbursementTotal(count || mapped.length);
      setDisbursementPage(page);
    } catch (err) {
      console.error('Error loading disbursement loans', err);
      toast({ title: 'Error', description: 'No se pudieron cargar los desembolsos.' });
    } finally { setDisbursementLoading(false); }
  };

  const loadActive = async (page = 1) => {
    setActiveLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('loans')
        .select('id, loan_number, amount, installments, monthly_payment, interest_rate, total_to_pay, status, status_consent, applied_at, created_at, approved_at, signed_at, disbursed_at, metadata, user_id, users(first_name,last_name,ine_key,curp,phone,email,user_memberships(membership_plans(name))), loan_signatures(*), loan_disbursements(*)', { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      const mapped = (data || []).map(mapLoan);
      setActiveLoansData(mapped);
      setActiveTotal(count || mapped.length);
      setActivePage(page);
    } catch (err) {
      console.error('Error loading active loans', err);
      toast({ title: 'Error', description: 'No se pudieron cargar los préstamos activos.' });
    } finally { setActiveLoading(false); }
  };

  const loadOverdue = async (page = 1) => {
    setOverdueLoading(true);
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('id, loan_number, amount, installments, monthly_payment, interest_rate, total_to_pay, status, status_consent, applied_at, created_at, approved_at, signed_at, disbursed_at, metadata, user_id, users(first_name,last_name,ine_key,curp,phone,email,user_memberships(membership_plans(name))), loan_signatures(*), loan_disbursements(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map(mapLoan);
      const filtered = mapped.filter(m => m.overdue);
      const from = (page - 1) * pageSize;
      const paginated = filtered.slice(from, from + pageSize);
      setOverdueLoansData(paginated);
      setOverdueTotal(filtered.length);
      setOverduePage(page);
    } catch (err) {
      console.error('Error loading overdue loans', err);
      toast({ title: 'Error', description: 'No se pudieron cargar los préstamos atrasados.' });
    } finally { setOverdueLoading(false); }
  };

  const loadHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('loans')
        .select('id, loan_number, amount, installments, monthly_payment, interest_rate, total_to_pay, status, status_consent, applied_at, created_at, approved_at, signed_at, disbursed_at, metadata, user_id, users(first_name,last_name,ine_key,curp,phone,email,user_memberships(membership_plans(name))), loan_signatures(*), loan_disbursements(*)', { count: 'exact' })
        .in('status', ['closed', 'cancelled'])
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      const mapped = (data || []).map(mapLoan);
      setHistoryLoansData(mapped);
      setHistoryTotal(count || mapped.length);
      setHistoryPage(page);
    } catch (err) {
      console.error('Error loading history loans', err);
      toast({ title: 'Error', description: 'No se pudo cargar el historial.' });
    } finally { setHistoryLoading(false); }
  };

  // load default tab once
  useEffect(() => { loadPending(1); }, []);

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
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });
  const [ineCurpModal, setIneCurpModal] = useState<{ open: boolean; loan: any | null; type: 'ine' | 'curp' }>({ open: false, loan: null, type: 'ine' });
  const [modifyModal, setModifyModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });

  const [resendModal, setResendModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });
  const [attachModal, setAttachModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });

  const [modifyDisbursementModal, setModifyDisbursementModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });
  const [confirmDisbursementModal, setConfirmDisbursementModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });

  const [reminderModal, setReminderModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });
  const [sellPortfolioModal, setSellPortfolioModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });
  const [updateInstallmentsModal, setUpdateInstallmentsModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; loan: any | null }>({ open: false, loan: null });

  const exportToExcel = () => {
    toast({ title: "Exportando...", description: "El archivo Excel se descargará en breve." });
  };

  const handleApproveLoan = async () => {
    const loan = approveDialog.loan;
    if (!loan) return;
    const loadingToast = toast({ title: 'Cargando...', description: 'Aprobando solicitud.' });
    const loanId = loan.uuid ?? loan.raw?.id ?? loan.id;
    try {
      if (loanId) {
        const consentsResp = await increscendoApiFetch('/belvo/consents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loan_id: loanId }),
        });
        const consentsData = await consentsResp.json().catch(() => null);
        if (!consentsResp.ok) {
          throw consentsData || new Error('Belvo consents error');
        }
      }

      const { error } = await supabase
        .from('loans')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', loanId);

      if (error) throw error;

      if (loan.user_id) {
        try {
          await supabase.from('notifications').insert([
            {
              user_id: loan.user_id,
              type: 'loan_signature_pending',
              title: 'Firma pendiente',
              message: 'Tienes una firma pendiente. Por favor revisa tu correo para firmar el contrato.',
              url: '/my-loans',
              channels: ['email'],
            },
          ]);
        } catch (e) {
          console.warn('[admin] failed to insert notification', e);
        }
      }

      if (loan.email) {
        try {
          const optionalPdfBase64 = generateLoanSchedulePdfBase64(loan);
          const optionalPdfName = `cronograma-${loan.id ?? loan.uuid ?? 'prestamo'}.pdf`;
          const resp = await increscendoApiFetch('/signnow-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient_email: loan.email,
              optional_pdf_base64: optionalPdfBase64,
              optional_pdf_name: optionalPdfName,
            }),
          });
          const data = await resp.json().catch(() => null);
          if (!resp.ok) throw data || new Error('External function error');
          try {
            const updates: any = { metadata: Object.assign({}, loan.raw?.metadata || {}, { signnow_invite: data }) };
            if (data?.docId) updates.id_document = data.docId;
            await supabase.from('loans').update(updates).eq('id', loanId);
          } catch (e) {
            console.error('[admin] failed to save signnow_invite metadata', e);
          }
          toast({ title: 'Contrato enviado', description: 'Se envió la invitación de firma por correo.' });
        } catch (e) {
          console.warn('[admin] signnow invite error', e);
          toast({ title: 'Aviso', description: 'La solicitud se aprobó, pero no se pudo enviar la invitación de firma.' });
        }
      }
      loadingToast.update({ id: loadingToast.id, title: 'Aprobado', description: `La solicitud ${loan.id} pasó a estado Aprobado (firma pendiente).` });
      setApproveDialog({ open: false, loan: null });
      await reloadCurrentTab();
    } catch (err) {
      console.error('Error aprobando solicitud', err);
      loadingToast.update({ id: loadingToast.id, title: 'Error', description: 'No se pudo aprobar la solicitud.', variant: 'destructive' });
    }
  };

  const handleRejectLoan = async () => {
    const loan = rejectDialog.loan;
    if (!loan) return;
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', loan.uuid ?? loan.raw?.id);

      if (error) throw error;
      toast({ title: 'Rechazado', description: `La solicitud ${loan.id} ha sido rechazada.`, variant: 'destructive' });
      setRejectDialog({ open: false, loan: null });
      await reloadCurrentTab();
    } catch (err) {
      console.error('Error rechazando solicitud', err);
      toast({ title: 'Error', description: 'No se pudo rechazar la solicitud.' });
    }
  };

  const handleConfirmDisbursement = async (file: File | null) => {
    const loan = confirmDisbursementModal.loan;
    if (!loan) return;
    try {
      toast({ title: 'Procesando', description: 'Confirmando desembolso...' });

      let publicUrl: string | null = null;
      if (file) {
        const userId = loan.user_id || 'unknown';
        const ext = file.name.split('.').pop() || 'pdf';
        const objectName = `voucher-${loan.uuid ?? loan.raw?.id}-${Date.now()}.${ext}`;
        const path = `${userId}/${objectName}`;

        const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicData } = await supabase.storage.from('documents').getPublicUrl(path);
        publicUrl = (publicData as any)?.publicUrl ?? null;
      }

      // insert loan_disbursement record
      const disbursementPayload: any = {
        loan_id: loan.uuid ?? loan.raw?.id,
        amount: loan.amount,
        destination_account: { bank: loan.bank, clabe: loan.accountNumber },
      };
      const { error: disbErr } = await supabase.from('loan_disbursements').insert([disbursementPayload]);
      if (disbErr) throw disbErr;

      // insert loan_documents if we uploaded a file
      if (publicUrl) {
        const uploader = authService.getCurrentUser();
        const docPayload = {
          loan_id: loan.uuid ?? loan.raw?.id,
          type: 'voucher',
          uploader_id: uploader?.id ?? null,
          file_url: publicUrl,
          file_name: file?.name ?? null,
          mime_type: file?.type ?? null,
        };
        const { error: docErr } = await supabase.from('loan_documents').insert([docPayload]);
        if (docErr) console.warn('Failed to insert loan_documents', docErr);
      }

      // update loan status to active and set disbursed_at
      const { error: loanErr } = await supabase.from('loans').update({ status: 'active', disbursed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', loan.uuid ?? loan.raw?.id);
      if (loanErr) throw loanErr;

      toast({ title: 'Desembolso confirmado', description: 'El préstamo se marcó como activo y el voucher fue subido.' });
      setConfirmDisbursementModal({ open: false, loan: null });
      await reloadCurrentTab();
    } catch (err) {
      console.error('Error confirmando desembolso', err);
      toast({ title: 'Error', description: 'No se pudo confirmar el desembolso.', variant: 'destructive' });
    }
  };

  const handleSendReminder = async () => {
    const loan = reminderModal.loan as any;
    if (!loan?.user_id) {
      toast({ title: 'Error', description: 'No se encontro el usuario para enviar recordatorio.' });
      return;
    }
    try {
      const title = 'Recordatorio de pago';
      const message = 'Te recordamos que tu proxima cuota esta por vencer. Revisa tu calendario de pagos en tu cuenta.';
      const { error } = await supabase.from('notifications').insert([
        {
          user_id: loan.user_id,
          type: 'loan_payment_reminder',
          title,
          message,
          url: '/my-loans',
          channels: ['email'],
        },
      ]);
      if (error) throw error;
      toast({ title: 'Recordatorio enviado', description: 'La notificacion fue enviada al usuario.' });
      setReminderModal({ open: false, loan: null });
    } catch (err) {
      console.error('Error enviando recordatorio', err);
      toast({ title: 'Error', description: 'No se pudo enviar el recordatorio.' });
    }
  };

  const getSignatureStatusBadge = (status: string) => {
    switch (status) {
      case 'Firmado': return <Badge className="bg-success/20 text-success border-success whitespace-nowrap">{status}</Badge>;
      case 'Espera': return <Badge className="bg-warning/20 text-warning border-warning whitespace-nowrap">{status}</Badge>;
      case 'Error': return <Badge className="bg-danger/20 text-danger border-danger whitespace-nowrap">{status}</Badge>;
      default: return <Badge variant="outline" className="whitespace-nowrap">{status}</Badge>;
    }
  };

  const getConsentBadge = (rawStatus?: string) => {
    const status = (rawStatus || '').toString();
    const key = status.toLowerCase();
    switch (key) {
      case 'pending_consent':
      case 'pending-consent':
      case 'pendingconsent':
        return <Badge className="bg-warning/20 text-warning border-warning whitespace-nowrap">Pendiente</Badge>;
      case 'consent_files_uploaded':
      case 'consent-files-uploaded':
      case 'files_uploaded':
        return <Badge className="bg-info/20 text-info border-info whitespace-nowrap">Enviado</Badge>;
      case 'verified':
      case 'confirmed':
      case 'verified_consent':
        return <Badge className="bg-success/20 text-success border-success whitespace-nowrap">Verificado</Badge>;
      default:
        return <Badge variant="outline" className="whitespace-nowrap">{status || '—'}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Al día': return <Badge className="bg-success/20 text-success border-success whitespace-nowrap">{status}</Badge>;
      case 'Atrasado': return <Badge className="bg-warning/20 text-warning border-warning whitespace-nowrap">{status}</Badge>;
      case 'Urgente': return <Badge className="bg-danger/20 text-danger border-danger whitespace-nowrap">{status}</Badge>;
      case 'Liquidado': return <Badge className="bg-success/20 text-success border-success whitespace-nowrap">{status}</Badge>;
      case 'Cartera Vendida': return <Badge className="bg-muted text-muted-foreground whitespace-nowrap">{status}</Badge>;
      case 'Rechazado': return <Badge className="bg-danger/20 text-danger border-danger whitespace-nowrap">{status}</Badge>;
      default: return <Badge variant="outline" className="whitespace-nowrap">{status}</Badge>;
    }
  };

  const isColumnVisible = (columns: ColumnConfig[], key: string) =>
    columns.find(c => c.key === key)?.visible ?? true;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <main className="flex-1 overflow-x-hidden">
          <header className="border-b border-border bg-card fixed md:sticky top-0 z-10 w-full md:w-auto">
            <div className="flex items-center h-14 sm:h-16 px-4 sm:px-6 gap-3">
              <SidebarTrigger />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Gestión de Préstamos</h1>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 md:px-6 lg:p-8">
            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v);
              switch (v) {
                case 'pending': loadPending(1); break;
                case 'contract': loadContract(1); break;
                case 'disbursement': loadDisbursement(1); break;
                case 'active': loadActive(1); break;
                case 'overdue': loadOverdue(1); break;
                case 'history': loadHistory(1); break;
                default: break;
              }
            }} className="w-full">
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-4 sm:mb-6">
                <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:max-w-4xl sm:grid-cols-6">
                  <TabsTrigger value="pending" className="text-xs sm:text-sm whitespace-nowrap">Pendiente</TabsTrigger>
                  <TabsTrigger value="contract" className="text-xs sm:text-sm whitespace-nowrap">Firma</TabsTrigger>
                  <TabsTrigger value="disbursement" className="text-xs sm:text-sm whitespace-nowrap">Desembolso</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs sm:text-sm whitespace-nowrap">Activos</TabsTrigger>
                  <TabsTrigger value="overdue" className="text-xs sm:text-sm whitespace-nowrap">Atrasados</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs sm:text-sm whitespace-nowrap">Historial</TabsTrigger>
                </TabsList>
              </div>

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
                            {/* {isColumnVisible(pendingColumns, 'accountVerification') && <TableHead>Verificación cuenta</TableHead>} */}
                            {isColumnVisible(pendingColumns, 'ine') && <TableHead>INE</TableHead>}
                            {isColumnVisible(pendingColumns, 'consent') && <TableHead>Consentimiento</TableHead>}
                            {isColumnVisible(pendingColumns, 'curp') && <TableHead>CURP</TableHead>}
                            {isColumnVisible(pendingColumns, 'preApproval') && <TableHead>Pre-Aprob.</TableHead>}
                            {isColumnVisible(pendingColumns, 'actions') && <TableHead>Acciones</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingLoading ? renderSkeletonRows(pendingColumns) : (
                            pendingLoansData.filter(l =>
                              l.firstName.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                              l.lastName.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                              String(l.id).toLowerCase().includes(pendingSearch.toLowerCase())
                            ).map((loan) => (
                              <TableRow key={loan.id}>
                                {isColumnVisible(pendingColumns, 'id') && <TableCell className="font-medium whitespace-nowrap">{loan.id}</TableCell>}
                                {isColumnVisible(pendingColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                                {isColumnVisible(pendingColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                                {isColumnVisible(pendingColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                                {isColumnVisible(pendingColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                                {isColumnVisible(pendingColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                                {isColumnVisible(pendingColumns, 'membership') && <TableCell>{loan.membership}</TableCell>}
                                {/* {isColumnVisible(pendingColumns, 'accountVerification') && (
                                <TableCell>
                                  {loan.isAccountVerified ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  )}
                                </TableCell>
                              )} */}
                                {isColumnVisible(pendingColumns, 'ine') && (
                                  <TableCell>
                                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setIneCurpModal({ open: true, loan, type: 'ine' })}>
                                      {loan.ineNumber.slice(0, 10)}...
                                    </Button>
                                  </TableCell>
                                )}
                                {isColumnVisible(pendingColumns, 'consent') && (
                                  <TableCell>
                                    {getConsentBadge(loan.status_consent || loan.raw?.status_consent || loan.statusConsent)}

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
                                    {loan?.raw?.status === 'cancelled' || loan?.status === 'Rechazado' ? (
                                      getStatusBadge('Rechazado')
                                    ) : (
                                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning whitespace-nowrap">{loan.preApproval}</Badge>
                                    )}
                                  </TableCell>
                                )}
                                {isColumnVisible(pendingColumns, 'actions') && (
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="ghost" onClick={() => setDetailsModal({ open: true, loan })} title="Ver detalles">
                                        <Eye className="h-4 w-4" />
                                      </Button>
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
                            )))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">Mostrando {(pendingPage - 1) * pageSize + 1} - {Math.min(pendingPage * pageSize, pendingTotal)} de {pendingTotal}</div>
                      <div className="flex items-center gap-2">
                        {renderPagination(pendingPage, pendingTotal, (p) => loadPending(p))}
                      </div>
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
                            {isColumnVisible(contractColumns, 'consent') && <TableHead>Consentimiento</TableHead>}
                            {isColumnVisible(contractColumns, 'curp') && <TableHead>CURP</TableHead>}
                            {isColumnVisible(contractColumns, 'preApproval') && <TableHead>Pre-Aprob.</TableHead>}
                            {isColumnVisible(contractColumns, 'signatureStatus') && <TableHead>Estado Firma</TableHead>}
                            {isColumnVisible(contractColumns, 'resend') && <TableHead>Reenviar</TableHead>}
                            {isColumnVisible(contractColumns, 'attach') && <TableHead>Adjuntar</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contractLoading ? renderSkeletonRows(contractColumns) : (
                            contractLoansData.filter(l =>
                              l.firstName.toLowerCase().includes(contractSearch.toLowerCase()) ||
                              l.lastName.toLowerCase().includes(contractSearch.toLowerCase()) ||
                              String(l.id).toLowerCase().includes(contractSearch.toLowerCase())
                            ).map((loan) => (
                              <TableRow key={loan.id}>
                                {isColumnVisible(contractColumns, 'id') && <TableCell className="font-medium whitespace-nowrap">{loan.id}</TableCell>}
                                {isColumnVisible(contractColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                                {isColumnVisible(contractColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                                {isColumnVisible(contractColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                                {isColumnVisible(contractColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                                {isColumnVisible(contractColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                                {isColumnVisible(contractColumns, 'membership') && <TableCell>{loan.membership}</TableCell>}
                                {isColumnVisible(contractColumns, 'ine') && <TableCell>{loan.ineNumber.slice(0, 10)}...</TableCell>}
                                {isColumnVisible(contractColumns, 'consent') && (
                                  <TableCell>{getConsentBadge(loan.status_consent || loan.raw?.status_consent || loan.statusConsent)}</TableCell>
                                )}
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
                            )))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">Mostrando {(contractPage - 1) * pageSize + 1} - {Math.min(contractPage * pageSize, contractTotal)} de {contractTotal}</div>
                      <div className="flex items-center gap-2">
                        {renderPagination(contractPage, contractTotal, (p) => loadContract(p))}
                      </div>
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
                            {isColumnVisible(disbursementColumns, 'consent') && <TableHead>Consentimiento</TableHead>}
                            {isColumnVisible(disbursementColumns, 'ine') && <TableHead>INE</TableHead>}
                            {isColumnVisible(disbursementColumns, 'curp') && <TableHead>CURP</TableHead>}
                            {isColumnVisible(disbursementColumns, 'contractStatus') && <TableHead>Est. Contrato</TableHead>}
                            {isColumnVisible(disbursementColumns, 'disbursementStatus') && <TableHead>Est. Desembolso</TableHead>}
                            {isColumnVisible(disbursementColumns, 'actions') && <TableHead>Acciones</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {disbursementLoading ? renderSkeletonRows(disbursementColumns) : (
                            disbursementLoansData.filter(l =>
                              l.firstName.toLowerCase().includes(disbursementSearch.toLowerCase()) ||
                              l.lastName.toLowerCase().includes(disbursementSearch.toLowerCase()) ||
                              String(l.id).toLowerCase().includes(disbursementSearch.toLowerCase())
                            ).map((loan) => (
                              <TableRow key={loan.id}>
                                {isColumnVisible(disbursementColumns, 'id') && <TableCell className="font-medium whitespace-nowrap">{loan.id}</TableCell>}
                                {isColumnVisible(disbursementColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                                {isColumnVisible(disbursementColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                                {isColumnVisible(disbursementColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                                {isColumnVisible(disbursementColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                                {isColumnVisible(disbursementColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                                {isColumnVisible(disbursementColumns, 'bank') && <TableCell>{loan.bank}</TableCell>}
                                {isColumnVisible(disbursementColumns, 'accountNumber') && <TableCell>{loan.accountNumber}</TableCell>}
                                {isColumnVisible(disbursementColumns, 'consent') && (
                                  <TableCell>{getConsentBadge(loan.status_consent || loan.raw?.status_consent || loan.statusConsent)}</TableCell>
                                )}
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
                            )))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">Mostrando {(disbursementPage - 1) * pageSize + 1} - {Math.min(disbursementPage * pageSize, disbursementTotal)} de {disbursementTotal}</div>
                      <div className="flex items-center gap-2">
                        {renderPagination(disbursementPage, disbursementTotal, (p) => loadDisbursement(p))}
                      </div>
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
                            {isColumnVisible(activeColumns, 'consent') && <TableHead>Consentimiento</TableHead>}
                            {isColumnVisible(activeColumns, 'lastPaymentDate') && <TableHead>F. Últ. Pago</TableHead>}
                            {isColumnVisible(activeColumns, 'status') && <TableHead>Estado</TableHead>}
                            {isColumnVisible(activeColumns, 'actions') && <TableHead>Acciones</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeLoading ? renderSkeletonRows(activeColumns) : (
                            activeLoansData.filter(l =>
                              l.firstName.toLowerCase().includes(activeSearch.toLowerCase()) ||
                              l.lastName.toLowerCase().includes(activeSearch.toLowerCase()) ||
                              String(l.id).toLowerCase().includes(activeSearch.toLowerCase())
                            ).map((loan) => (
                              <TableRow key={loan.id}>
                                {isColumnVisible(activeColumns, 'id') && <TableCell className="font-medium whitespace-nowrap">{loan.id}</TableCell>}
                                {isColumnVisible(activeColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                                {isColumnVisible(activeColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                                {isColumnVisible(activeColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                                {isColumnVisible(activeColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                                {isColumnVisible(activeColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                                {isColumnVisible(activeColumns, 'paidInstallments') && <TableCell>{loan.paidInstallments}/{loan.installments}</TableCell>}
                                {isColumnVisible(activeColumns, 'ine') && <TableCell>{loan.ineNumber.slice(0, 10)}...</TableCell>}
                                {isColumnVisible(activeColumns, 'consent') && <TableCell>{getConsentBadge(loan.status_consent || loan.raw?.status_consent || loan.statusConsent)}</TableCell>}
                                {isColumnVisible(activeColumns, 'lastPaymentDate') && <TableCell>{loan.lastPaymentDate}</TableCell>}
                                {isColumnVisible(activeColumns, 'status') && <TableCell>{getStatusBadge(loan.status)}</TableCell>}
                                {isColumnVisible(activeColumns, 'actions') && (
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="ghost" onClick={() => setModifyModal({ open: true, loan })} title="Ver/Editar">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => setScheduleModal({ open: true, loan })} title="Ver Cronograma">
                                        <Calendar className="h-4 w-4" />
                                      </Button>
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
                                          <DropdownMenuItem onClick={() => setUpdateInstallmentsModal({ open: true, loan })}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Actualizar cuotas
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            )))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">Mostrando {(activePage - 1) * pageSize + 1} - {Math.min(activePage * pageSize, activeTotal)} de {activeTotal}</div>
                      <div className="flex items-center gap-2">
                        {renderPagination(activePage, activeTotal, (p) => loadActive(p))}
                      </div>
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
                            {isColumnVisible(overdueColumns, 'consent') && <TableHead>Consentimiento</TableHead>}
                            {isColumnVisible(overdueColumns, 'lastPaymentDate') && <TableHead>F. Últ. Pago</TableHead>}
                            {isColumnVisible(overdueColumns, 'status') && <TableHead>Estado</TableHead>}
                            {isColumnVisible(overdueColumns, 'actions') && <TableHead>Acciones</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overdueLoading ? renderSkeletonRows(overdueColumns) : (
                            overdueLoansData.filter(l =>
                              l.firstName.toLowerCase().includes(overdueSearch.toLowerCase()) ||
                              l.lastName.toLowerCase().includes(overdueSearch.toLowerCase()) ||
                              String(l.id).toLowerCase().includes(overdueSearch.toLowerCase())
                            ).map((loan) => (
                              <TableRow key={loan.id}>
                                {isColumnVisible(overdueColumns, 'id') && <TableCell className="font-medium whitespace-nowrap">{loan.id}</TableCell>}
                                {isColumnVisible(overdueColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                                {isColumnVisible(overdueColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                                {isColumnVisible(overdueColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                                {isColumnVisible(overdueColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                                {isColumnVisible(overdueColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                                {isColumnVisible(overdueColumns, 'paidInstallments') && <TableCell>{loan.paidInstallments}/{loan.installments}</TableCell>}
                                {isColumnVisible(overdueColumns, 'ine') && <TableCell>{loan.ineNumber.slice(0, 10)}...</TableCell>}
                                {isColumnVisible(overdueColumns, 'consent') && <TableCell>{getConsentBadge(loan.status_consent || loan.raw?.status_consent || loan.statusConsent)}</TableCell>}
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
                            )))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">Mostrando {(overduePage - 1) * pageSize + 1} - {Math.min(overduePage * pageSize, overdueTotal)} de {overdueTotal}</div>
                      <div className="flex items-center gap-2">
                        {renderPagination(overduePage, overdueTotal, (p) => loadOverdue(p))}
                      </div>
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
                            {isColumnVisible(historyColumns, 'consent') && <TableHead>Consentimiento</TableHead>}
                            {isColumnVisible(historyColumns, 'lastPaymentDate') && <TableHead>F. Últ. Pago</TableHead>}
                            {isColumnVisible(historyColumns, 'status') && <TableHead>Estado</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyLoading ? renderSkeletonRows(historyColumns) : (
                            historyLoansData.filter(l =>
                              l.firstName.toLowerCase().includes(historySearch.toLowerCase()) ||
                              l.lastName.toLowerCase().includes(historySearch.toLowerCase()) ||
                              String(l.id).toLowerCase().includes(historySearch.toLowerCase())
                            ).map((loan) => (
                              <TableRow key={loan.id}>
                                {isColumnVisible(historyColumns, 'id') && <TableCell className="font-medium whitespace-nowrap">{loan.id}</TableCell>}
                                {isColumnVisible(historyColumns, 'firstName') && <TableCell>{loan.firstName}</TableCell>}
                                {isColumnVisible(historyColumns, 'lastName') && <TableCell>{loan.lastName}</TableCell>}
                                {isColumnVisible(historyColumns, 'requestDate') && <TableCell>{loan.requestDate}</TableCell>}
                                {isColumnVisible(historyColumns, 'amount') && <TableCell className="font-semibold">${loan.amount.toLocaleString()}</TableCell>}
                                {isColumnVisible(historyColumns, 'installments') && <TableCell>{loan.installments}</TableCell>}
                                {isColumnVisible(historyColumns, 'paidInstallments') && <TableCell>{loan.paidInstallments}/{loan.installments}</TableCell>}
                                {isColumnVisible(historyColumns, 'ine') && <TableCell>{loan.ineNumber.slice(0, 10)}...</TableCell>}
                                {isColumnVisible(historyColumns, 'consent') && <TableCell>{getConsentBadge(loan.status_consent || loan.raw?.status_consent || loan.statusConsent)}</TableCell>}
                                {isColumnVisible(historyColumns, 'lastPaymentDate') && <TableCell>{loan.lastPaymentDate}</TableCell>}
                                {isColumnVisible(historyColumns, 'status') && <TableCell>{getStatusBadge(loan.status)}</TableCell>}
                              </TableRow>
                            )))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">Mostrando {(historyPage - 1) * pageSize + 1} - {Math.min(historyPage * pageSize, historyTotal)} de {historyTotal}</div>
                      <div className="flex items-center gap-2">
                        {renderPagination(historyPage, historyTotal, (p) => loadHistory(p))}
                      </div>
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

        <AlertDialog open={detailsModal.open} onOpenChange={(open) => setDetailsModal(prev => ({ ...prev, open }))}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Detalle de solicitud</AlertDialogTitle>
              <AlertDialogDescription>
                Informacion general y datos capturados por el cliente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {(() => {
              const loan = detailsModal.loan as any;
              const md = loan?.raw?.metadata ?? {};
              const personal = md.personalData ?? {};
              const deposit = md.depositData ?? {};
              const disbursement = md.disbursementData ?? {};
              const membership = md.membership ?? {};
              return (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-[11px] text-muted-foreground">Solicitud</p>
                      <p className="text-sm font-medium">{loan?.id ?? '-'}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-[11px] text-muted-foreground">Monto</p>
                      <p className="text-sm font-medium">${Number(loan?.amount ?? 0).toLocaleString()} MXN</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-[11px] text-muted-foreground">Plazo</p>
                      <p className="text-sm font-medium">{loan?.installments ?? '-'} cuotas</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Datos personales</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">Nombre</p>
                        <p className="text-sm font-medium">{`${personal.firstName ?? ''} ${personal.lastName ?? ''}`.trim() || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">Telefono</p>
                        <p className="text-sm font-medium">{personal.phone || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">Direccion</p>
                        <p className="text-sm font-medium">{personal.address || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">Fecha de nacimiento</p>
                        <p className="text-sm font-medium">{personal.birthDate || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">INE</p>
                        <p className="text-sm font-medium">{personal.ineKey || loan?.ineNumber || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">CURP</p>
                        <p className="text-sm font-medium">{personal.curp || loan?.curpNumber || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Cuenta bancaria</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">Banco</p>
                        <p className="text-sm font-medium">{deposit.bank || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">CLABE</p>
                        <p className="text-sm font-medium">{deposit.clabe || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Cuenta de desembolso</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">Banco</p>
                        <p className="text-sm font-medium">{disbursement.bank || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground">CLABE</p>
                        <p className="text-sm font-medium">{disbursement.clabe || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Membresia</p>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-[11px] text-muted-foreground">Detalle</p>
                      <p className="text-sm font-medium">
                        {membership?.name || membership?.title || membership?.membership_plan_id || loan?.membership || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
            <AlertDialogFooter>
              <AlertDialogCancel>Cerrar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-danger hover:bg-danger/90"
                onClick={() => {
                  const loan = detailsModal.loan as any;
                  setDetailsModal({ open: false, loan: null });
                  setRejectDialog({ open: true, loan });
                }}
              >
                Rechazar
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => {
                  const loan = detailsModal.loan as any;
                  setDetailsModal({ open: false, loan: null });
                  setApproveDialog({ open: true, loan });
                }}
              >
                Aprobar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
              <AlertDialogAction onClick={() => handleApproveLoan()}>
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
              <AlertDialogAction className="bg-danger hover:bg-danger/90" onClick={() => handleRejectLoan()}>
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
          onConfirm={(file) => handleConfirmDisbursement(file)}
        />

        <SendReminderModal
          open={reminderModal.open}
          onOpenChange={(open) => setReminderModal(prev => ({ ...prev, open }))}
          loan={reminderModal.loan}
          onConfirm={handleSendReminder}
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
        <PaymentScheduleModal
          open={scheduleModal.open}
          onOpenChange={(open) => setScheduleModal(prev => ({ ...prev, open }))}
          loan={scheduleModal.loan}
        />
      </div>
    </SidebarProvider>
  );
};

export default LoanManagement;
