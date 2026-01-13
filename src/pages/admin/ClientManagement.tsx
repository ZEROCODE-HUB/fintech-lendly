import { useState, useMemo } from "react";
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

const ClientManagement = () => {
  // Data state
  const [clients, setClients] = useState<Client[]>(clientsMockData);
  const [memberships, setMemberships] = useState<ClientMembership[]>(membershipsMockData);
  
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

  const handleExportClients = () => {
    console.log("Exportar clientes a Excel");
  };

  const handleExportMemberships = () => {
    console.log("Exportar membresías a Excel");
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

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
                      <Button onClick={() => setAddUserOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Agregar Usuario
                      </Button>
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
                          {filteredClients.map((client) => (
                            <TableRow key={client.id}>
                              {isColumnVisible(clientColumns, "id") && <TableCell className="font-medium">{client.id}</TableCell>}
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
                          {filteredMemberships.map((membership) => (
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
          onConfirm={(data) => {
            const newClient: Client = {
              id: `CLI-${String(clients.length + 1).padStart(3, "0")}`,
              role: data.role || "Usuario",
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
              birthDate: data.birthDate || "",
              registrationDate: new Date().toISOString().split("T")[0],
              ine: data.ine || "",
              curp: data.curp || "",
              membership: data.membership || "",
              membershipStatus: "Activa",
              totalLoans: 0,
              activeLoans: 0,
            };
            setClients([...clients, newClient]);
          }} 
        />
        <ModifyClientModal 
          open={modifyClientOpen} 
          onOpenChange={setModifyClientOpen} 
          client={selectedClient}
          onConfirm={(updated) => {
            setClients(clients.map(c => c.id === updated.id ? updated : c));
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
          onConfirm={(data) => {
            const client = clients.find(c => c.id === data.clientId);
            if (client) {
              const newMembership: ClientMembership = {
                id: `MEM-${String(memberships.length + 1).padStart(3, "0")}`,
                clientId: data.clientId,
                firstName: client.firstName,
                lastName: client.lastName,
                ine: client.ine,
                membershipType: data.membershipType,
                activationDate: data.activationDate,
                expirationDate: new Date(new Date(data.activationDate).setFullYear(new Date(data.activationDate).getFullYear() + 1)).toISOString().split("T")[0],
                renewalCount: 0,
                status: "Activa",
                paymentHistory: [],
              };
              setMemberships([...memberships, newMembership]);
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
          onConfirm={() => {
            if (selectedMembership) {
              setMemberships(memberships.map(m => 
                m.id === selectedMembership.id ? { ...m, status: "Vencida" } : m
              ));
            }
          }}
        />
      </div>
    </SidebarProvider>
  );
};

export default ClientManagement;
