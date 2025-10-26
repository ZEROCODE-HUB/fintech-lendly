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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Filter, Eye, Edit, Trash2, FileText, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ClientManagement = () => {
  const { toast } = useToast();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const clients = [
    { 
      id: "CLI-001", 
      name: "María González", 
      email: "maria.g@email.com", 
      phone: "55-1234-5678", 
      membership: "Premium",
      status: "Activo",
      totalLoans: 3,
      activeLoans: 1,
      joinDate: "2024-01-15"
    },
    { 
      id: "CLI-002", 
      name: "Carlos Ramírez", 
      email: "carlos.r@email.com", 
      phone: "55-8765-4321", 
      membership: "Básico",
      status: "Activo",
      totalLoans: 2,
      activeLoans: 1,
      joinDate: "2024-03-20"
    },
    { 
      id: "CLI-003", 
      name: "Ana López", 
      email: "ana.l@email.com", 
      phone: "55-9876-5432", 
      membership: "Premium",
      status: "Inactivo",
      totalLoans: 1,
      activeLoans: 0,
      joinDate: "2024-05-10"
    },
  ];

  const memberships = [
    { id: "MEM-001", client: "María González", type: "Premium", startDate: "2024-01-15", endDate: "2025-01-15", status: "Activa", amount: 999 },
    { id: "MEM-002", client: "Carlos Ramírez", type: "Básico", startDate: "2024-03-20", endDate: "2025-03-20", status: "Activa", amount: 499 },
    { id: "MEM-003", client: "Ana López", type: "Premium", startDate: "2024-05-10", endDate: "2024-11-10", status: "Vencida", amount: 999 },
  ];

  const handleView = (client: any) => {
    setSelectedClient(client);
    setViewDialogOpen(true);
  };

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleDelete = (client: any) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const confirmEdit = () => {
    toast({
      title: "Cliente Actualizado",
      description: "La información del cliente ha sido actualizada exitosamente.",
    });
    setEditDialogOpen(false);
  };

  const confirmDelete = () => {
    toast({
      title: "Cliente Eliminado",
      description: "El cliente ha sido eliminado del sistema.",
      variant: "destructive",
    });
    setDeleteDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === "Activo" || status === "Activa") {
      return <Badge className="bg-success/20 text-success border-success">{status}</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground border-muted-foreground">{status}</Badge>;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
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
              <Input placeholder="Buscar clientes..." className="pl-10" />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="clients" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="clients">Base de Datos</TabsTrigger>
                <TabsTrigger value="memberships">Membresías</TabsTrigger>
              </TabsList>

              {/* Clients Database */}
              <TabsContent value="clients" className="mt-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Base de Datos de Clientes</CardTitle>
                    <CardDescription>Información completa de todos los usuarios registrados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Membresía</TableHead>
                          <TableHead>Préstamos</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.id}</TableCell>
                            <TableCell className="font-semibold">{client.name}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                client.membership === "Premium" 
                                  ? "border-primary text-primary" 
                                  : "border-muted-foreground text-muted-foreground"
                              }>
                                {client.membership}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>Total: {client.totalLoans}</p>
                                <p className="text-muted-foreground">Activos: {client.activeLoans}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(client.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleView(client)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(client)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(client)}>
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

              {/* Memberships */}
              <TabsContent value="memberships" className="mt-6">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Gestión de Membresías</CardTitle>
                    <CardDescription>Administra las suscripciones y pagos de membresías</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Inicio</TableHead>
                          <TableHead>Vencimiento</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {memberships.map((membership) => (
                          <TableRow key={membership.id}>
                            <TableCell className="font-medium">{membership.id}</TableCell>
                            <TableCell>{membership.client}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                membership.type === "Premium" 
                                  ? "border-primary text-primary" 
                                  : "border-muted-foreground text-muted-foreground"
                              }>
                                {membership.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{membership.startDate}</TableCell>
                            <TableCell>{membership.endDate}</TableCell>
                            <TableCell className="font-semibold">${membership.amount} MXN</TableCell>
                            <TableCell>{getStatusBadge(membership.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {membership.status === "Vencida" ? (
                                  <Button size="sm" variant="ghost" className="text-success">
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="ghost" className="text-danger">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* View Client Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Información del Cliente</DialogTitle>
              <DialogDescription>Detalles completos del perfil</DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ID de Cliente</Label>
                    <p className="font-semibold">{selectedClient.id}</p>
                  </div>
                  <div>
                    <Label>Nombre Completo</Label>
                    <p className="font-semibold">{selectedClient.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-semibold">{selectedClient.email}</p>
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <p className="font-semibold">{selectedClient.phone}</p>
                  </div>
                  <div>
                    <Label>Membresía</Label>
                    <p className="font-semibold">{selectedClient.membership}</p>
                  </div>
                  <div>
                    <Label>Fecha de Registro</Label>
                    <p className="font-semibold">{selectedClient.joinDate}</p>
                  </div>
                  <div>
                    <Label>Total de Préstamos</Label>
                    <p className="font-semibold">{selectedClient.totalLoans}</p>
                  </div>
                  <div>
                    <Label>Préstamos Activos</Label>
                    <p className="font-semibold">{selectedClient.activeLoans}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>Actualiza la información del cliente</DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nombre Completo</Label>
                  <Input id="edit-name" defaultValue={selectedClient.name} />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" defaultValue={selectedClient.email} />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input id="edit-phone" defaultValue={selectedClient.phone} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmEdit}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Client Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar Cliente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Toda la información del cliente será eliminada permanentemente.
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
      </div>
    </SidebarProvider>
  );
};

export default ClientManagement;
