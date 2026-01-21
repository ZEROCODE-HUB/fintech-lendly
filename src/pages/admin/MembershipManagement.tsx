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
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

type Plan = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  currency: string;
  duration_days: number | null;
  features: any;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

type Membership = {
  id: string;
  title: string;
  cost: number;
  currency: string;
  targetAudience: string;
  interestRate: number;
  renewalPeriod: string;
  benefits: string[];
  isActive: boolean;
};

const MembershipManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    if (!authService.isAdmin()) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta página",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [navigate, toast]);

  // fetch membership plans from DB
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from<Plan>('membership_plans').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const plans = data ?? [];
      const mapped: Membership[] = plans.map(p => {
        const features = p.features ?? {};
        const benefits = Array.isArray(features?.benefits) ? features.benefits : (Array.isArray(p.features) ? p.features : []);
        return {
          id: p.id,
          title: p.name,
          cost: Number(p.price ?? 0),
          currency: p.currency ?? 'MXN',
          targetAudience: features?.targetAudience ?? p.description ?? '',
          interestRate: Number(features?.interestRate ?? 0),
          renewalPeriod: p.duration_days ? String(p.duration_days) + 'd' : '30d',
          benefits,
          isActive: !!p.active
        };
      });
      setMemberships(mapped);
    } catch (err) {
      console.error('[MembershipManagement] fetchPlans error', err);
      toast({ title: 'Error', description: 'No se pudieron cargar las membresías', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

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

  const handleSubmit = async () => {
    if (!formData.title || !formData.cost || !formData.targetAudience) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const benefitsArray = formData.benefits.split(',').map(b => b.trim()).filter(b => b);
    try {
      if (editingMembership) {
        // update plan in DB
        const duration_days = formData.renewalPeriod.toLowerCase().includes('anual') ? 365 : 30;
        const features = { benefits: benefitsArray, interestRate: Number(formData.interestRate), targetAudience: formData.targetAudience };
        const { error } = await supabase.from('membership_plans').update({ name: formData.title, price: Number(formData.cost), currency: 'MXN', duration_days, features }).eq('id', editingMembership.id);
        if (error) throw error;
        toast({ title: 'Membresía actualizada', description: `${formData.title} actualizada` });
      } else {
        // create new plan
        const slug = formData.title.toLowerCase().replace(/\s+/g, '-');
        const duration_days = formData.renewalPeriod.toLowerCase().includes('anual') ? 365 : 30;
        const features = { benefits: benefitsArray, interestRate: Number(formData.interestRate), targetAudience: formData.targetAudience };
        const { data, error } = await supabase.from('membership_plans').insert([{ name: formData.title, slug, description: formData.targetAudience, price: Number(formData.cost), currency: 'MXN', duration_days, features }]).select().single();
        if (error) throw error;
        toast({ title: 'Membresía creada', description: `${formData.title} creada` });
      }
      await fetchPlans();
      setIsCreateOpen(false);
      resetForm();
    } catch (err) {
      console.error('[MembershipManagement] submit error', err);
      toast({ title: 'Error', description: 'Operación falló', variant: 'destructive' });
    }
  };

  const handleDelete = async (membershipId: string) => {
    try {
      const { error } = await supabase.from('membership_plans').delete().eq('id', membershipId);
      if (error) throw error;
      toast({ title: 'Membresía eliminada', description: 'El plan fue eliminado' });
      await fetchPlans();
    } catch (err) {
      console.error('[MembershipManagement] delete error', err);
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
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
              {loading ? (
                // show 6 shimmer cards
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={`skeleton-${i}`} className="shadow-soft transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-2/3">
                          <Skeleton className="h-6 w-40" />
                          <div className="mt-2"><Skeleton className="h-4 w-28" /></div>
                        </div>
                        <div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-1">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="border-t pt-3">
                        <Skeleton className="h-4 w-full" />
                        <div className="mt-2 space-y-2">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-12" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                memberships.map((membership) => (
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
                ))
              )}
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
