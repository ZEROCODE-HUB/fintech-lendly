import { useState, useMemo, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, MoreHorizontal, Edit, Trash2, Image, FileText, History, XCircle } from "lucide-react";
import { LoanTableFilters } from "@/components/admin/loans/LoanTableFilters";
import { Client, ClientMembership, ClientColumnConfig } from "@/types/clients";
import { clientsMockData, membershipsMockData, defaultClientColumns, defaultMembershipColumns } from "@/data/clientsMockData";
import { AddUserModal, ModifyClientModal, DeleteClientModal, ViewPhotoModal, ViewDocumentsModal } from "@/components/admin/clients/modals/ClientModals";
import { AddMembershipModal, ViewHistoryModal, ExpireMembershipModal } from "@/components/admin/clients/modals/MembershipModals";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ClientManagement = () => {
  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [memberships, setMemberships] = useState<ClientMembership[]>([]);
  const [planOptions, setPlanOptions] = useState<{ id: string; name: string }[]>([]);
  const [loadingClients, setLoadingClients] = useState<boolean>(true);
  const [loadingMemberships, setLoadingMemberships] = useState<boolean>(true);
  const [clientPage, setClientPage] = useState<number>(1);
  const [clientPageSize, setClientPageSize] = useState<number>(10);
  const [clientTotal, setClientTotal] = useState<number>(0);
  
  // Column config
  const [clientColumns, setClientColumns] = useState(defaultClientColumns);
  const [membershipColumns, setMembershipColumns] = useState(defaultMembershipColumns);
  
  // Filter state
  const [clientSearch, setClientSearch] = useState("");
  const [clientSortOrder, setClientSortOrder] = useState("date-desc");
  
  const [membershipSearch, setMembershipSearch] = useState("");
  const [membershipSortOrder, setMembershipSortOrder] = useState("date-desc");
  
  // Modal state - Clients
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [modifyClientOpen, setModifyClientOpen] = useState(false);
  const [deleteClientOpen, setDeleteClientOpen] = useState(false);
  const [viewPhotoOpen, setViewPhotoOpen] = useState(false);
  const [viewDocumentsOpen, setViewDocumentsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modal state - Memberships
  const [addMembershipOpen, setAddMembershipOpen] = useState(false);
  const [viewHistoryOpen, setViewHistoryOpen] = useState(false);
  const [expireMembershipOpen, setExpireMembershipOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<ClientMembership | null>(null);

  // Load clients, memberships and membership plans from DB
  useEffect(() => {
    const fetchData = async () => {
      setLoadingClients(true);
      setLoadingMemberships(true);
      try {
        const from = (clientPage - 1) * clientPageSize;
        const to = from + clientPageSize - 1;

        const [usersRes, userMembershipsRes, plansRes] = await Promise.all([
          supabase
            .from('users')
            .select('id, role, email, first_name, last_name, phone, address, birth_date, curp, ine_key, created_at, ine_front_url, ine_back_url, curp_url', { count: 'exact' })
            .eq('role', 'client')
            .order('created_at', { ascending: false })
            .range(from, to),
          supabase
            .from('user_memberships')
            .select('id, user_id, status, started_at, expires_at, created_at, membership_plans(name), users(first_name, last_name, ine_key)'),
          supabase
            .from('membership_plans')
            .select('id, name')
            .eq('active', true),
        ]);

        console.log('[ClientManagement] usersRes', usersRes);
        console.log('[ClientManagement] userMembershipsRes', userMembershipsRes);
        console.log('[ClientManagement] plansRes', plansRes);

        if (usersRes.error) throw usersRes.error;
        if (userMembershipsRes.error) throw userMembershipsRes.error;
        if (plansRes.error) throw plansRes.error;

        const users = usersRes.data ?? [];
        const userMemberships = userMembershipsRes.data ?? [];
        const plans = plansRes.data ?? [];

        setClientTotal(usersRes.count ?? 0);

        // Map membership by user for quick lookup in clients table
        type MembershipSummary = { membership: string; membershipStatus: string; rawStatus: string };
        const statusLabel = (s: string): string => {
          if (s === 'active') return 'Activa';
          if (s === 'expired') return 'Vencida';
          if (s === 'pending') return 'Pendiente';
          if (s === 'canceled') return 'Cancelada';
          return s;
        };
        const statusPriority = (s: string): number => {
          if (s === 'active') return 3;
          if (s === 'pending') return 2;
          if (s === 'expired') return 1;
          return 0;
        };

        const membershipByUser = new Map<string, MembershipSummary>();

        const mappedMemberships: ClientMembership[] = (userMemberships as any[]).map((m) => {
          const user = m.users || {};
          const plan = m.membership_plans || {};
          const rawStatus = m.status as string;
          const displayStatus = statusLabel(rawStatus);

          const current = membershipByUser.get(m.user_id as string);
          if (!current || statusPriority(rawStatus) > statusPriority(current.rawStatus)) {
            membershipByUser.set(m.user_id as string, {
              membership: plan.name ?? '',
              membershipStatus: displayStatus,
              rawStatus,
            });
          }

          return {
            id: m.id as string,
            clientId: m.user_id as string,
            firstName: user.first_name ?? '',
            lastName: user.last_name ?? '',
            ine: user.ine_key ?? '',
            membershipType: plan.name ?? '',
            activationDate: (m.started_at || m.created_at || '').slice(0, 10),
            expirationDate: (m.expires_at || '').slice(0, 10),
            renewalCount: 0,
            status: displayStatus,
            paymentHistory: [],
          };
        });

        console.log('[ClientManagement] mappedMemberships', mappedMemberships);

        const mappedClients: Client[] = (users as any[]).map((u) => {
          const membership = membershipByUser.get(u.id as string);
          return {
            id: u.id as string,
            role: u.role === 'admin' ? 'Admin' : 'Usuario',
            firstName: u.first_name ?? '',
            lastName: u.last_name ?? '',
            email: u.email ?? '',
            phone: u.phone ?? '',
            address: u.address ?? '',
            birthDate: u.birth_date ?? '',
            registrationDate: (u.created_at || '').slice(0, 10),
            ine: u.ine_key ?? '',
            curp: u.curp ?? '',
            photoUrl: undefined,
            ineFrontUrl: u.ine_front_url ?? undefined,
            ineBackUrl: u.ine_back_url ?? undefined,
            curpUrl: u.curp_url ?? undefined,
            membership: membership?.membership ?? '',
            membershipStatus: membership?.membershipStatus ?? 'Sin membresía',
            totalLoans: 0,
            activeLoans: 0,
          };
        });

        console.log('[ClientManagement] mappedClients', mappedClients);

        setClients(mappedClients);
        setMemberships(mappedMemberships);
        setPlanOptions(plans.map((p: any) => ({ id: p.id as string, name: p.name as string })));
      } catch (err) {
        console.error('[ClientManagement] Error loading clients/memberships', err);
      } finally {
        setLoadingClients(false);
        setLoadingMemberships(false);
      }
    };

    fetchData();
  }, [clientPage, clientPageSize]);

  // Filtered and sorted clients
  const filteredClients = useMemo(() => {
    let result = [...clients];
    if (clientSearch) {
      const search = clientSearch.toLowerCase();
      result = result.filter(c => 
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.id.toLowerCase().includes(search)
      );
    }
    // Parse sort order
    const [field, order] = clientSortOrder.split("-");
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      if (field === "date") {
        aVal = a.registrationDate;
        bVal = b.registrationDate;
      } else if (field === "name") {
        aVal = a.firstName;
        bVal = b.firstName;
      } else {
        aVal = a[field as keyof Client] || "";
        bVal = b[field as keyof Client] || "";
      }
      if (order === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return result;
  }, [clients, clientSearch, clientSortOrder]);

  // Filtered and sorted memberships
  const filteredMemberships = useMemo(() => {
    let result = [...memberships];
    if (membershipSearch) {
      const search = membershipSearch.toLowerCase();
      result = result.filter(m => 
        m.firstName.toLowerCase().includes(search) ||
        m.lastName.toLowerCase().includes(search) ||
        m.ine.toLowerCase().includes(search)
      );
    }
    const [field, order] = membershipSortOrder.split("-");
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      if (field === "date") {
        aVal = a.activationDate;
        bVal = b.activationDate;
      } else if (field === "name") {
        aVal = a.firstName;
        bVal = b.firstName;
      } else {
        aVal = a[field as keyof ClientMembership] || "";
        bVal = b[field as keyof ClientMembership] || "";
      }
      if (order === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return result;
  }, [memberships, membershipSearch, membershipSortOrder]);

  const handleExportClients = async () => {
    try {
      const XLSX = await import("xlsx");

      // Build query for all matching clients (ignoring pagination but respecting search & sort)
      let query = supabase
        .from("users")
        .select(
          "id, role, email, first_name, last_name, phone, address, birth_date, curp, ine_key, created_at, ine_front_url, ine_back_url, curp_url",
        )
        .eq("role", "client");

      if (clientSearch) {
        const search = clientSearch.trim();
        if (search) {
          query = query.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,id.ilike.%${search}%`,
          );
        }
      }

      const [field, order] = clientSortOrder.split("-");
      if (field === "date") {
        query = query.order("created_at", { ascending: order === "asc" });
      } else if (field === "name") {
        query = query.order("first_name", { ascending: order === "asc" });
      }

      const { data, error } = await query;
      if (error) throw error;

      const users = (data ?? []) as any[];

      // Build membership summary per user from current memberships state
      const membershipSummary = new Map<
        string,
        { membership: string; membershipStatus: string; priority: number }
      >();
      const statusRank = (status: string): number => {
        if (status === "Activa" || status === "Activo") return 3;
        if (status === "Pendiente") return 2;
        if (status === "Vencida") return 1;
        return 0;
      };

      memberships.forEach((m) => {
        const current = membershipSummary.get(m.clientId);
        const rank = statusRank(m.status);
        if (!current || rank > current.priority) {
          membershipSummary.set(m.clientId, {
            membership: m.membershipType,
            membershipStatus: m.status,
            priority: rank,
          });
        }
      });

      const allClients: Client[] = users.map((u) => {
        const membership = membershipSummary.get(u.id as string);
        return {
          id: u.id as string,
          role: u.role === "admin" ? "Admin" : "Usuario",
          firstName: u.first_name ?? "",
          lastName: u.last_name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
          address: u.address ?? "",
          birthDate: u.birth_date ?? "",
          registrationDate: (u.created_at || "").slice(0, 10),
          ine: u.ine_key ?? "",
          curp: u.curp ?? "",
          membership: membership?.membership ?? "",
          membershipStatus: membership?.membershipStatus ?? "Sin membresía",
          totalLoans: 0,
          activeLoans: 0,
        };
      });

      const visibleColumns = clientColumns.filter((c) => c.visible);
      const rows = allClients.map((client) => {
        const row: Record<string, any> = {};
        visibleColumns.forEach((col) => {
          let value: any = "";
          switch (col.key) {
            case "id":
              value = String(client.id).split("-")[0];
              break;
            case "loans":
              value = `Total: ${client.totalLoans}, Activos: ${client.activeLoans}`;
              break;
            default:
              value = (client as any)[col.key];
          }
          row[col.label] = value;
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
      XLSX.writeFile(workbook, "clientes.xlsx");
    } catch (err) {
      console.error("[ClientManagement] Error exporting clients", err);
    }
  };

  const handleExportMemberships = async () => {
    try {
      const XLSX = await import("xlsx");

      const visibleColumns = membershipColumns.filter((c) => c.visible);
      const rows = filteredMemberships.map((m) => {
        const row: Record<string, any> = {};
        visibleColumns.forEach((col) => {
          let value: any = "";
          switch (col.key) {
            default:
              value = (m as any)[col.key];
          }
          row[col.label] = value;
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Membresias");
      XLSX.writeFile(workbook, "membresias.xlsx");
    } catch (err) {
      console.error("[ClientManagement] Error exporting memberships", err);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Activa" || status === "Activo") {
      return <Badge className="bg-success/20 text-success border-success">{status}</Badge>;
    }
    if (status === "Vencida") {
      return <Badge className="bg-danger/20 text-danger border-danger">{status}</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground border-muted-foreground">{status}</Badge>;
  };

  const getMembershipBadge = (type: string) => {
    const colors: Record<string, string> = {
      "Premier": "border-primary text-primary bg-primary/10",
      "Premium": "border-accent-foreground text-accent-foreground bg-accent/50",
      "Básico": "border-muted-foreground text-muted-foreground",
    };
    return <Badge variant="outline" className={colors[type] || ""}>{type}</Badge>;
  };

  const isColumnVisible = (columns: typeof defaultClientColumns, key: string) => 
    columns.find(c => c.key === key)?.visible ?? false;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 overflow-x-hidden">
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center h-14 sm:h-16 px-4 sm:px-6 gap-3">
              <SidebarTrigger />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Gestión de Clientes</h1>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 md:px-6 lg:p-8 space-y-4 sm:space-y-6">
            <Tabs defaultValue="clients" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="clients">Clientes</TabsTrigger>
                <TabsTrigger value="memberships">Membresías</TabsTrigger>
              </TabsList>

              {/* Clients Tab */}
              <TabsContent value="clients" className="mt-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Base de Datos de Clientes</CardTitle>
                        <CardDescription>Información completa de todos los usuarios registrados</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => setAddUserOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Agregar Usuario
                        </Button>
                        <Button variant="outline" onClick={async () => {
                          try {
                            const { data, error } = await supabase.functions.invoke('create-user', {
                              body: { email: `test-invoke+${Date.now()}@example.com`, first_name: 'InvokeTest' },
                            });
                            console.log('[TestEdge] data:', data, 'error:', error);
                            if (error) throw error;
                            alert('Test invoke done - ver consola');
                          } catch (err) {
                            console.error('[TestEdge] invoke error', err);
                            alert('Invoke error: ' + (err?.message || String(err)));
                          }
                        }}>
                          Test Edge
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <LoanTableFilters
                      searchTerm={clientSearch}
                      onSearchChange={setClientSearch}
                      searchPlaceholder="Buscar por nombre, email, ID..."
                      sortOrder={clientSortOrder}
                      onSortChange={setClientSortOrder}
                      sortOptions={[
                        { value: "date-desc", label: "F. Reg. (más reciente)" },
                        { value: "date-asc", label: "F. Reg. (más antigua)" },
                        { value: "name-asc", label: "Nombre (A-Z)" },
                        { value: "name-desc", label: "Nombre (Z-A)" },
                      ]}
                      columns={clientColumns}
                      onColumnsChange={setClientColumns}
                      showExport
                      onExport={handleExportClients}
                    />
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isColumnVisible(clientColumns, "id") && <TableHead>ID</TableHead>}
                            {isColumnVisible(clientColumns, "role") && <TableHead>Rol</TableHead>}
                            {isColumnVisible(clientColumns, "firstName") && <TableHead>Nombres</TableHead>}
                            {isColumnVisible(clientColumns, "lastName") && <TableHead>Apellidos</TableHead>}
                            {isColumnVisible(clientColumns, "email") && <TableHead>Email</TableHead>}
                            {isColumnVisible(clientColumns, "phone") && <TableHead>Teléfono</TableHead>}
                            {isColumnVisible(clientColumns, "address") && <TableHead>Dirección</TableHead>}
                            {isColumnVisible(clientColumns, "birthDate") && <TableHead>F. Nac.</TableHead>}
                            {isColumnVisible(clientColumns, "registrationDate") && <TableHead>F. Reg.</TableHead>}
                            {isColumnVisible(clientColumns, "ine") && <TableHead>INE</TableHead>}
                            {isColumnVisible(clientColumns, "curp") && <TableHead>CURP</TableHead>}
                            {isColumnVisible(clientColumns, "membership") && <TableHead>Membresía</TableHead>}
                            {isColumnVisible(clientColumns, "membershipStatus") && <TableHead>Est. Memb.</TableHead>}
                            {isColumnVisible(clientColumns, "loans") && <TableHead>Préstamos</TableHead>}
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingClients && (
                            Array.from({ length: clientPageSize }).map((_, index) => (
                              <TableRow key={`skeleton-${index}`}>
                                {isColumnVisible(clientColumns, "id") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "role") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "firstName") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "lastName") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "email") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-36" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "phone") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "address") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-40" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "birthDate") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "registrationDate") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "ine") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "curp") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "membership") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "membershipStatus") && (
                                  <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                  </TableCell>
                                )}
                                {isColumnVisible(clientColumns, "loans") && (
                                  <TableCell>
                                    <Skeleton className="h-10 w-20" />
                                  </TableCell>
                                )}
                                <TableCell>
                                  <Skeleton className="h-8 w-8" />
                                </TableCell>
                              </TableRow>
                            ))
                          )}

                          {!loadingClients && filteredClients.map((client) => (
                            <TableRow key={client.id}>
                              {isColumnVisible(clientColumns, "id") && (
                                <TableCell className="font-medium">
                                  {String(client.id).split("-")[0]}
                                </TableCell>
                              )}
                              {isColumnVisible(clientColumns, "role") && <TableCell><Badge variant="outline">{client.role}</Badge></TableCell>}
                              {isColumnVisible(clientColumns, "firstName") && <TableCell className="font-semibold">{client.firstName}</TableCell>}
                              {isColumnVisible(clientColumns, "lastName") && <TableCell>{client.lastName}</TableCell>}
                              {isColumnVisible(clientColumns, "email") && <TableCell>{client.email}</TableCell>}
                              {isColumnVisible(clientColumns, "phone") && <TableCell>{client.phone}</TableCell>}
                              {isColumnVisible(clientColumns, "address") && <TableCell className="max-w-[150px] truncate">{client.address}</TableCell>}
                              {isColumnVisible(clientColumns, "birthDate") && <TableCell>{client.birthDate}</TableCell>}
                              {isColumnVisible(clientColumns, "registrationDate") && <TableCell>{client.registrationDate}</TableCell>}
                              {isColumnVisible(clientColumns, "ine") && <TableCell className="font-mono text-xs">{client.ine}</TableCell>}
                              {isColumnVisible(clientColumns, "curp") && <TableCell className="font-mono text-xs">{client.curp}</TableCell>}
                              {isColumnVisible(clientColumns, "membership") && <TableCell>{getMembershipBadge(client.membership)}</TableCell>}
                              {isColumnVisible(clientColumns, "membershipStatus") && <TableCell>{getStatusBadge(client.membershipStatus)}</TableCell>}
                              {isColumnVisible(clientColumns, "loans") && (
                                <TableCell>
                                  <div className="text-sm">
                                    <p>Total: {client.totalLoans}</p>
                                    <p className="text-muted-foreground">Activos: {client.activeLoans}</p>
                                  </div>
                                </TableCell>
                              )}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setSelectedClient(client); setModifyClientOpen(true); }}>
                                      <Edit className="h-4 w-4 mr-2" /> Modificar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedClient(client); setDeleteClientOpen(true); }}>
                                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedClient(client); setViewPhotoOpen(true); }}>
                                      <Image className="h-4 w-4 mr-2" /> Ver Foto
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedClient(client); setViewDocumentsOpen(true); }}>
                                      <FileText className="h-4 w-4 mr-2" /> Ver Documentos
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination & page size */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Mostrar</span>
                        <Select
                          value={String(clientPageSize)}
                          onValueChange={(value) => {
                            setClientPageSize(Number(value));
                            setClientPage(1);
                          }}
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                        <span>por página</span>
                        <span className="ml-2">
                          {clientTotal > 0
                            ? `Mostrando ${(clientPage - 1) * clientPageSize + 1}-${
                                (clientPage - 1) * clientPageSize + filteredClients.length
                              } de ${clientTotal}`
                            : "Sin clientes"}
                        </span>
                      </div>

                      {clientTotal > 0 && (
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                className={clientPage === 1 ? "pointer-events-none opacity-50" : ""}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (clientPage > 1) setClientPage(clientPage - 1);
                                }}
                              />
                            </PaginationItem>

                            {Array.from({ length: Math.max(1, Math.ceil(clientTotal / clientPageSize)) }).map(
                              (_, index) => {
                                const page = index + 1;
                                const totalPages = Math.max(1, Math.ceil(clientTotal / clientPageSize));

                                // Mostrar siempre primera, última, actual y vecinas, con puntos suspensivos
                                if (
                                  page === 1 ||
                                  page === totalPages ||
                                  Math.abs(page - clientPage) <= 1
                                ) {
                                  return (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        href="#"
                                        isActive={page === clientPage}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setClientPage(page);
                                        }}
                                      >
                                        {page}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                }

                                // Insertar elipsis una sola vez entre bloques
                                if (page === 2 && clientPage > 3) {
                                  return (
                                    <PaginationItem key="start-ellipsis">
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  );
                                }
                                if (page === totalPages - 1 && clientPage < totalPages - 2) {
                                  return (
                                    <PaginationItem key="end-ellipsis">
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  );
                                }

                                return null;
                              },
                            )}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                className={
                                  clientPage >= Math.max(1, Math.ceil(clientTotal / clientPageSize))
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  const totalPages = Math.max(1, Math.ceil(clientTotal / clientPageSize));
                                  if (clientPage < totalPages) setClientPage(clientPage + 1);
                                }}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Memberships Tab */}
              <TabsContent value="memberships" className="mt-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Gestión de Membresías</CardTitle>
                        <CardDescription>Administra las suscripciones de los clientes</CardDescription>
                      </div>
                      <Button onClick={() => setAddMembershipOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Agregar Membresía
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <LoanTableFilters
                      searchTerm={membershipSearch}
                      onSearchChange={setMembershipSearch}
                      searchPlaceholder="Buscar por nombre, INE..."
                      sortOrder={membershipSortOrder}
                      onSortChange={setMembershipSortOrder}
                      sortOptions={[
                        { value: "date-desc", label: "F. Activ. (más reciente)" },
                        { value: "date-asc", label: "F. Activ. (más antigua)" },
                        { value: "name-asc", label: "Nombre (A-Z)" },
                        { value: "name-desc", label: "Nombre (Z-A)" },
                      ]}
                      columns={membershipColumns}
                      onColumnsChange={setMembershipColumns}
                      showExport
                      onExport={handleExportMemberships}
                    />
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isColumnVisible(membershipColumns, "firstName") && <TableHead>Nombre</TableHead>}
                            {isColumnVisible(membershipColumns, "lastName") && <TableHead>Apellidos</TableHead>}
                            {isColumnVisible(membershipColumns, "ine") && <TableHead>INE</TableHead>}
                            {isColumnVisible(membershipColumns, "membershipType") && <TableHead>Membresía</TableHead>}
                            {isColumnVisible(membershipColumns, "activationDate") && <TableHead>F. Activación</TableHead>}
                            {isColumnVisible(membershipColumns, "expirationDate") && <TableHead>F. Expiración</TableHead>}
                            {isColumnVisible(membershipColumns, "renewalCount") && <TableHead>Conteo Renov.</TableHead>}
                            {isColumnVisible(membershipColumns, "status") && <TableHead>Estado</TableHead>}
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!loadingMemberships && filteredMemberships.map((membership) => (
                            <TableRow key={membership.id}>
                              {isColumnVisible(membershipColumns, "firstName") && <TableCell className="font-semibold">{membership.firstName}</TableCell>}
                              {isColumnVisible(membershipColumns, "lastName") && <TableCell>{membership.lastName}</TableCell>}
                              {isColumnVisible(membershipColumns, "ine") && <TableCell className="font-mono text-xs">{membership.ine}</TableCell>}
                              {isColumnVisible(membershipColumns, "membershipType") && <TableCell>{getMembershipBadge(membership.membershipType)}</TableCell>}
                              {isColumnVisible(membershipColumns, "activationDate") && <TableCell>{membership.activationDate}</TableCell>}
                              {isColumnVisible(membershipColumns, "expirationDate") && <TableCell>{membership.expirationDate}</TableCell>}
                              {isColumnVisible(membershipColumns, "renewalCount") && <TableCell className="text-center">{membership.renewalCount}</TableCell>}
                              {isColumnVisible(membershipColumns, "status") && <TableCell>{getStatusBadge(membership.status)}</TableCell>}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setSelectedMembership(membership); setViewHistoryOpen(true); }}>
                                      <History className="h-4 w-4 mr-2" /> Ver Historial
                                    </DropdownMenuItem>
                                    {membership.status === "Activa" && (
                                      <DropdownMenuItem onClick={() => { setSelectedMembership(membership); setExpireMembershipOpen(true); }}>
                                        <XCircle className="h-4 w-4 mr-2" /> Vencer
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
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

        {/* Client Modals */}
        <AddUserModal
          open={addUserOpen}
          onOpenChange={setAddUserOpen}
          onConfirm={async (data) => {
            try {
              const payload: any = {
                email: data.email,
                password: (data as any).password || undefined,
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                address: data.address,
                birth_date: data.birthDate || null,
                curp: data.curp,
                ine_key: data.ine,
                role: data.role === 'Admin' ? 'admin' : 'client',
              };

              // Preferir usar supabase.functions.invoke si está disponible
              let fnResponse: any = null;
              try {
                // Ensure the caller is authenticated: supabase.functions.invoke will send the
                // Authorization header (user access token) automatically only if a session exists.
                const { data: sessionData } = await supabase.auth.getSession();
                const session = (sessionData as any)?.session;
                if (!session) {
                  throw new Error('Usuario no autenticado. Inicia sesión antes de crear usuarios.');
                }

                const { data: fnData, error: fnError } = await supabase.functions.invoke('create-user', {
                  body: payload,
                });

                if (fnError) {
                  // Attach more context to the thrown error for easier debugging
                  const enriched = new Error(`Edge function error: ${fnError.message || String(fnError)}`);
                  (enriched as any).original = fnError;
                  throw enriched;
                }

                fnResponse = fnData;
              } catch (fnErr) {
                console.error('[ClientManagement] Edge function error', fnErr);
                throw fnErr;
              }

              if (fnResponse?.error) {
                throw new Error(fnResponse.error);
              }

              const profileRow = fnResponse.profile || fnResponse.user || (fnResponse.data && fnResponse.data.profile) || {};
              const userId = profileRow.id || (fnResponse.user && fnResponse.user.id) || '';

              const row: any = profileRow || {};

              const newClient: Client = {
                id: (row.id as string) || userId || `local-${Date.now()}`,
                role: (row.role === 'admin' ? 'Admin' : 'Usuario') || (payload.role === 'admin' ? 'Admin' : 'Usuario'),
                firstName: row.first_name ?? (data.firstName || ''),
                lastName: row.last_name ?? (data.lastName || ''),
                email: row.email ?? (data.email || ''),
                phone: row.phone ?? (data.phone || ''),
                address: row.address ?? (data.address || ''),
                birthDate: row.birth_date ?? (data.birthDate || ''),
                registrationDate: (row.created_at || new Date().toISOString()).slice(0, 10),
                ine: row.ine_key ?? (data.ine || ''),
                curp: row.curp ?? (data.curp || ''),
                photoUrl: undefined,
                ineFrontUrl: undefined,
                ineBackUrl: undefined,
                curpUrl: undefined,
                membership: '',
                membershipStatus: 'Sin membresía',
                totalLoans: 0,
                activeLoans: 0,
              };

              setClients((prev) => [newClient, ...prev]);
            } catch (err) {
              console.error('[ClientManagement] Error creating client from admin', err);
              throw err;
            }
          }}
        />
        <ModifyClientModal 
          open={modifyClientOpen} 
          onOpenChange={setModifyClientOpen} 
          client={selectedClient}
          plans={planOptions}
          onConfirm={async (updated) => {
            try {
              const existing = clients.find((c) => c.id === updated.id);
              const payload: any = {
                first_name: updated.firstName,
                last_name: updated.lastName,
                email: updated.email,
                phone: updated.phone,
                address: updated.address,
                birth_date: updated.birthDate || null,
                ine_key: updated.ine,
                curp: updated.curp,
                role: updated.role === "Admin" ? "admin" : "client",
              };

              const { data, error } = await supabase
                .from("users")
                .update(payload)
                .eq("id", updated.id)
                .select(
                  "id, role, email, first_name, last_name, phone, address, birth_date, curp, ine_key, created_at",
                )
                .single();

              if (error) throw error;

              const newClient: Client = {
                id: data.id as string,
                role: data.role === "admin" ? "Admin" : "Usuario",
                firstName: data.first_name ?? "",
                lastName: data.last_name ?? "",
                email: data.email ?? "",
                phone: data.phone ?? "",
                address: data.address ?? "",
                birthDate: data.birth_date ?? "",
                registrationDate: (data.created_at || "").slice(0, 10),
                ine: data.ine_key ?? "",
                curp: data.curp ?? "",
                photoUrl: existing?.photoUrl,
                ineFrontUrl: (data as any).ine_front_url ?? existing?.ineFrontUrl,
                ineBackUrl: (data as any).ine_back_url ?? existing?.ineBackUrl,
                curpUrl: (data as any).curp_url ?? existing?.curpUrl,
                membership: existing?.membership ?? "",
                membershipStatus: existing?.membershipStatus ?? "Sin membresía",
                totalLoans: existing?.totalLoans ?? 0,
                activeLoans: existing?.activeLoans ?? 0,
              };

              setClients(clients.map((c) => (c.id === newClient.id ? newClient : c)));
            } catch (err) {
              console.error("[ClientManagement] Error updating client", err);
            }
          }}
        />
        <DeleteClientModal 
          open={deleteClientOpen} 
          onOpenChange={setDeleteClientOpen} 
          client={selectedClient}
          onConfirm={() => {
            if (selectedClient) {
              setClients(clients.filter(c => c.id !== selectedClient.id));
            }
          }}
        />
        <ViewPhotoModal 
          open={viewPhotoOpen} 
          onOpenChange={setViewPhotoOpen} 
          client={selectedClient}
        />
        <ViewDocumentsModal 
          open={viewDocumentsOpen} 
          onOpenChange={setViewDocumentsOpen} 
          client={selectedClient}
        />

        {/* Membership Modals */}
        <AddMembershipModal 
          open={addMembershipOpen} 
          onOpenChange={setAddMembershipOpen}
          clients={clients}
          plans={planOptions}
          onConfirm={async (data) => {
            try {
              const activation = new Date(data.activationDate);
              const expires = new Date(activation);
              expires.setFullYear(expires.getFullYear() + 1);

              const { error } = await supabase.from('user_memberships').insert({
                user_id: data.clientId,
                membership_plan_id: data.membershipPlanId,
                status: 'active',
                started_at: activation.toISOString(),
                expires_at: expires.toISOString(),
              });
              if (error) throw error;

              const client = clients.find((c) => c.id === data.clientId);
              const plan = planOptions.find((p) => p.id === data.membershipPlanId);
              if (client && plan) {
                const newMembership: ClientMembership = {
                  id: `local-${Date.now()}`,
                  clientId: client.id,
                  firstName: client.firstName,
                  lastName: client.lastName,
                  ine: client.ine,
                  membershipType: plan.name,
                  activationDate: data.activationDate,
                  expirationDate: expires.toISOString().slice(0, 10),
                  renewalCount: 0,
                  status: 'Activa',
                  paymentHistory: [],
                };
                setMemberships((prev) => [newMembership, ...prev]);
                setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, membership: plan.name, membershipStatus: 'Activa' } : c));
              }
            } catch (err) {
              console.error('[ClientManagement] Error creating membership', err);
            }
          }}
        />
        <ViewHistoryModal 
          open={viewHistoryOpen} 
          onOpenChange={setViewHistoryOpen} 
          membership={selectedMembership}
        />
        <ExpireMembershipModal 
          open={expireMembershipOpen} 
          onOpenChange={setExpireMembershipOpen} 
          membership={selectedMembership}
          onConfirm={async () => {
            if (!selectedMembership) return;
            try {
              const { error } = await supabase
                .from('user_memberships')
                .update({ status: 'expired' })
                .eq('id', selectedMembership.id);
              if (error) throw error;

              setMemberships((prev) => prev.map((m) => 
                m.id === selectedMembership.id ? { ...m, status: 'Vencida' } : m
              ));
              setClients((prev) => prev.map((c) => 
                c.id === selectedMembership.clientId ? { ...c, membershipStatus: 'Vencida' } : c
              ));
            } catch (err) {
              console.error('[ClientManagement] Error expiring membership', err);
            }
          }}
        />
      </div>
    </SidebarProvider>
  );
};

export default ClientManagement;
