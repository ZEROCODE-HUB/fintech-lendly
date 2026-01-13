import { PendingLoan, ContractLoan, DisbursementLoan, ActiveLoan, OverdueLoan, HistoryLoan } from '@/types/loans';

export const pendingLoans: PendingLoan[] = [
  { id: "PREST-001", firstName: "María", lastName: "González López", requestDate: "2024-12-10", amount: 15000, installments: 12, membership: "Gold Anual", ineNumber: "GOML850315MDFRRS09", curpNumber: "GOML850315MDFRRS09", preApproval: "En Revisión", ineFront: "/placeholder.svg", ineBack: "/placeholder.svg", curpPdf: "/placeholder.svg", isAccountVerified: true },
  { id: "PREST-002", firstName: "Carlos", lastName: "Ramírez Pérez", requestDate: "2024-12-09", amount: 25000, installments: 18, membership: "Platinum", ineNumber: "RAPC901220HDFRRS05", curpNumber: "RAPC901220HDFRRS05", preApproval: "En Revisión", isAccountVerified: false },
  { id: "PREST-003", firstName: "Ana", lastName: "López Torres", requestDate: "2024-12-08", amount: 10000, installments: 6, membership: "Silver", ineNumber: "LOTA880512MDFRRS03", curpNumber: "LOTA880512MDFRRS03", preApproval: "En Revisión", isAccountVerified: true },
  { id: "PREST-004", firstName: "Roberto", lastName: "Hernández Díaz", requestDate: "2024-12-07", amount: 30000, installments: 24, membership: "Gold Anual", ineNumber: "HEDR750628HDFRRS07", curpNumber: "HEDR750628HDFRRS07", preApproval: "En Revisión", isAccountVerified: false },
];

export const contractLoans: ContractLoan[] = [
  { id: "PREST-010", firstName: "Laura", lastName: "Sánchez Morales", requestDate: "2024-12-05", amount: 20000, installments: 12, membership: "Platinum", ineNumber: "SAML920415MDFRRS01", curpNumber: "SAML920415MDFRRS01", preApproval: "Aprobado", signatureStatus: "Espera", address: "Av. Reforma 123, CDMX", birthDate: "1992-04-15", phone: "5512345678", bank: "BBVA", accountNumber: "0123456789" },
  { id: "PREST-011", firstName: "Pedro", lastName: "García Ruiz", requestDate: "2024-12-04", amount: 18000, installments: 10, membership: "Gold Anual", ineNumber: "GARP881123HDFRRS04", curpNumber: "GARP881123HDFRRS04", preApproval: "Aprobado", signatureStatus: "Firmado", address: "Calle 5 de Mayo 456, Guadalajara", birthDate: "1988-11-23", phone: "3312345678", bank: "Santander", accountNumber: "9876543210" },
  { id: "PREST-012", firstName: "Sofía", lastName: "Martínez Vega", requestDate: "2024-12-03", amount: 22000, installments: 15, membership: "Platinum", ineNumber: "MAVS951008MDFRRS06", curpNumber: "MAVS951008MDFRRS06", preApproval: "Aprobado", signatureStatus: "Error", address: "Blvd. Independencia 789, Monterrey", birthDate: "1995-10-08", phone: "8112345678", bank: "Banorte", accountNumber: "1122334455" },
];

export const disbursementLoans: DisbursementLoan[] = [
  { id: "PREST-020", firstName: "Miguel", lastName: "Flores Castillo", requestDate: "2024-12-01", amount: 35000, installments: 24, membership: "Platinum", ineNumber: "FOCM870305HDFRRS08", curpNumber: "FOCM870305HDFRRS08", contractStatus: "Firmado", disbursementStatus: "Pendiente", bank: "BBVA", accountNumber: "1234567890" },
  { id: "PREST-021", firstName: "Elena", lastName: "Vargas Luna", requestDate: "2024-11-30", amount: 28000, installments: 18, membership: "Gold Anual", ineNumber: "VALE900720MDFRRS02", curpNumber: "VALE900720MDFRRS02", contractStatus: "Firmado", disbursementStatus: "Pendiente", bank: "Santander", accountNumber: "0987654321" },
];

export const activeLoans: ActiveLoan[] = [
  { id: "PREST-030", firstName: "Juan", lastName: "Pérez Mendoza", requestDate: "2024-08-15", amount: 20000, installments: 12, paidInstallments: 4, membership: "Gold Anual", ineNumber: "PEMJ850612HDFRRS01", curpNumber: "PEMJ850612HDFRRS01", lastPaymentDate: "2024-12-01", status: "Al día" },
  { id: "PREST-031", firstName: "Carmen", lastName: "Ortiz Salazar", requestDate: "2024-09-01", amount: 15000, installments: 10, paidInstallments: 3, membership: "Silver", ineNumber: "OISC930825MDFRRS03", curpNumber: "OISC930825MDFRRS03", lastPaymentDate: "2024-12-05", status: "Al día" },
  { id: "PREST-032", firstName: "Fernando", lastName: "Reyes Navarro", requestDate: "2024-07-20", amount: 30000, installments: 18, paidInstallments: 5, membership: "Platinum", ineNumber: "RENF780930HDFRRS05", curpNumber: "RENF780930HDFRRS05", lastPaymentDate: "2024-11-28", status: "Al día" },
];

export const overdueLoans: OverdueLoan[] = [
  { id: "PREST-040", firstName: "Roberto", lastName: "García Luna", requestDate: "2024-06-10", amount: 25000, installments: 15, paidInstallments: 4, membership: "Gold Anual", ineNumber: "GALR800115HDFRRS07", curpNumber: "GALR800115HDFRRS07", lastPaymentDate: "2024-10-15", status: "Atrasado" },
  { id: "PREST-041", firstName: "Patricia", lastName: "Jiménez Cruz", requestDate: "2024-05-20", amount: 18000, installments: 12, paidInstallments: 3, membership: "Silver", ineNumber: "JICP910420MDFRRS09", curpNumber: "JICP910420MDFRRS09", lastPaymentDate: "2024-09-01", status: "Urgente" },
  { id: "PREST-042", firstName: "Andrés", lastName: "Moreno Ríos", requestDate: "2024-04-15", amount: 40000, installments: 24, paidInstallments: 5, membership: "Platinum", ineNumber: "MORA850718HDFRRS02", curpNumber: "MORA850718HDFRRS02", lastPaymentDate: "2024-10-01", status: "Atrasado" },
];

export const historyLoans: HistoryLoan[] = [
  { id: "PREST-050", firstName: "Isabel", lastName: "Torres Medina", requestDate: "2023-12-01", amount: 12000, installments: 12, paidInstallments: 12, membership: "Silver", ineNumber: "TOMI881205MDFRRS04", curpNumber: "TOMI881205MDFRRS04", lastPaymentDate: "2024-11-15", status: "Liquidado" },
  { id: "PREST-051", firstName: "Raúl", lastName: "Delgado Soto", requestDate: "2023-10-15", amount: 20000, installments: 15, paidInstallments: 8, membership: "Gold Anual", ineNumber: "DESR790322HDFRRS06", curpNumber: "DESR790322HDFRRS06", lastPaymentDate: "2024-06-01", status: "Cartera Vendida" },
  { id: "PREST-052", firstName: "Mónica", lastName: "Cervantes Gil", requestDate: "2024-01-10", amount: 25000, installments: 10, paidInstallments: 10, membership: "Platinum", ineNumber: "CEGM920810MDFRRS08", curpNumber: "CEGM920810MDFRRS08", lastPaymentDate: "2024-10-20", status: "Liquidado" },
];
