import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Users, CreditCard, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/utils/auth";
import { defaultMemberships, Membership } from "@/data/memberships";

const MembershipManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memberships, setMemberships] = useState<Membership[]>(defaultMemberships);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    cost: '',
    targetAudience: '',
    interestRate: '42',
    renewalPeriod: 'Anual',
    benefits: ''
  });

  // Check if user is admin
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.email !== 'admin@gmail.com') {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta página",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [navigate, toast]);

  const resetForm = () => {
    setFormData({
      title: '',
      cost: '',
      targetAudience: '',
      interestRate: '42',
      renewalPeriod: 'Anual',
      benefits: ''
    });
    setEditingMembership(null);
  };

  const handleCreateOpen = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleEditOpen = (membership: Membership) => {
    setFormData({
      title: membership.title,
      cost: membership.cost.toString(),
      targetAudience: membership.targetAudience,
      interestRate: membership.interestRate.toString(),
      renewalPeriod: membership.renewalPeriod,
      benefits: membership.benefits.join(', ')
    });
    setEditingMembership(membership);
    setIsCreateOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.cost || !formData.targetAudience) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const benefitsArray = formData.benefits.split(',').map(b => b.trim()).filter(b => b);

    if (editingMembership) {
      // Update existing membership
      setMemberships(prev => prev.map(m => 
        m.id === editingMembership.id 
          ? {
              ...m,
              title: formData.title,
              cost: parseFloat(formData.cost),
              targetAudience: formData.targetAudience,
              interestRate: parseFloat(formData.interestRate),
              renewalPeriod: formData.renewalPeriod,
              benefits: benefitsArray
            }
          : m
      ));
      toast({
        title: "Membresía actualizada",
        description: `${formData.title} ha sido actualizada correctamente`
      });
    } else {
      // Create new membership
      const newMembership: Membership = {
        id: `membership-${Date.now()}`,
        title: formData.title,
        cost: parseFloat(formData.cost),
        currency: 'MXN',
        targetAudience: formData.targetAudience,
        interestRate: parseFloat(formData.interestRate),
        renewalPeriod: formData.renewalPeriod,
        benefits: benefitsArray,
        isActive: true
      };
      setMemberships(prev => [...prev, newMembership]);
      toast({
        title: "Membresía creada",
        description: `${formData.title} ha sido creada correctamente`
      });
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const handleDelete = (membershipId: string) => {
    setMemberships(prev => prev.filter(m => m.id !== membershipId));
    toast({
      title: "Membresía eliminada",
      description: "La membresía ha sido eliminada correctamente"
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Gestión de Membresías</h1>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-hero rounded-lg p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Administrar Membresías</h2>
                  <p className="text-white/90">Crea, edita y gestiona los planes de membresía</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={handleCreateOpen}
                      className="bg-white text-primary hover:bg-white/90 shadow-lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Membresía
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMembership ? 'Editar Membresía' : 'Nueva Membresía'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingMembership 
                          ? 'Modifica los detalles de la membresía' 
                          : 'Completa los datos para crear una nueva membresía'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="Ej: Membresía Premium"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="cost">Costo (MXN) *</Label>
                          <Input
                            id="cost"
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({...formData, cost: e.target.value})}
                            placeholder="100"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="interestRate">Tasa de Interés (%)</Label>
                          <Input
                            id="interestRate"
                            type="number"
                            value={formData.interestRate}
                            onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                            placeholder="42"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="targetAudience">Público Objetivo *</Label>
                        <Input
                          id="targetAudience"
                          value={formData.targetAudience}
                          onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                          placeholder="Ej: Persona Natural"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="benefits">Beneficios (separados por coma)</Label>
                        <Textarea
                          id="benefits"
                          value={formData.benefits}
                          onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                          placeholder="Ej: Descuentos, Promociones, Atención preferencial"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSubmit}>
                        {editingMembership ? 'Guardar Cambios' : 'Crear Membresía'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Memberships Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {memberships.map((membership) => (
                <Card key={membership.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{membership.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3" />
                          {membership.targetAudience}
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        Activo
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pricing */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary">
                        ${membership.cost.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">MXN / {membership.renewalPeriod}</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Percent className="h-4 w-4" />
                        <span>Tasa: {membership.interestRate}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>Renovación: {membership.renewalPeriod}</span>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Beneficios:</p>
                      <ul className="space-y-1">
                        {membership.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleEditOpen(membership)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar membresía?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente "{membership.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(membership.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {memberships.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay membresías</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primera membresía para comenzar
                </p>
                <Button onClick={handleCreateOpen}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Membresía
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MembershipManagement;
