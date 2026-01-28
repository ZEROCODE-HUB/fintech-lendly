import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/utils/auth";
import { supabase } from "@/lib/supabase";

type Coupon = {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  active: boolean;
  max_redemptions: number | null;
  redeemed_count?: number;
  starts_at?: string | null;
  ends_at?: string | null;
};

const CouponManagement = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: "", discount_percent: "", discount_amount: "", max_redemptions: "" });

  useEffect(() => {
    if (!authService.isAdmin()) {
      toast({ title: 'Acceso denegado', description: 'No tienes permisos para acceder', variant: 'destructive' });
      return;
    }
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons(data ?? []);
    } catch (err) {
      console.error('[CouponManagement] fetch', err);
      toast({ title: 'Error', description: 'No se pudieron cargar los cupones', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.code) return toast({ title: 'Código requerido', variant: 'destructive' });
    try {
      const payload: any = { code: form.code.toUpperCase().trim(), active: true };
      if (form.discount_percent) payload.discount_percent = Number(form.discount_percent);
      if (form.discount_amount) payload.discount_amount = Number(form.discount_amount);
      if (form.max_redemptions) payload.max_redemptions = Number(form.max_redemptions);
      const { error } = await supabase.from('coupons').insert([payload]);
      if (error) throw error;
      toast({ title: 'Cupón creado' });
      setIsOpen(false);
      setForm({ code: "", discount_percent: "", discount_amount: "", max_redemptions: "" });
      await fetchCoupons();
    } catch (err) {
      console.error('[CouponManagement] create', err);
      toast({ title: 'Error', description: 'No se pudo crear el cupón', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Eliminado' });
      await fetchCoupons();
    } catch (err) {
      console.error('[CouponManagement] delete', err);
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
              <h1 className="text-2xl font-bold">Gestión de Cupones</h1>
            </div>
          </header>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">Crea y administra cupones de descuento</p>
              <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setEditing(null); setForm({ code: "", discount_percent: "", discount_amount: "", max_redemptions: "" }); } setIsOpen(open); }}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditing(null); setForm({ code: "", discount_percent: "", discount_amount: "", max_redemptions: "" }); setIsOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cupón
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Cupón' : 'Nuevo Cupón'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="code">Código</Label>
                      <Input id="code" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label>Descuento %</Label>
                        <Input value={form.discount_percent} onChange={(e) => {
                          const val = e.target.value;
                          // if percent entered, clear amount to enforce exclusivity
                          setForm((prev) => ({ ...prev, discount_percent: val, discount_amount: val ? "" : prev.discount_amount }));
                        }} type="number" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Descuento monto</Label>
                        <Input value={form.discount_amount} onChange={(e) => {
                          const val = e.target.value;
                          // if amount entered, clear percent to enforce exclusivity
                          setForm((prev) => ({ ...prev, discount_amount: val, discount_percent: val ? "" : prev.discount_percent }));
                        }} type="number" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Máx. usos</Label>
                      <Input value={form.max_redemptions} onChange={(e) => setForm({...form, max_redemptions: e.target.value})} type="number" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsOpen(false); setEditing(null); }}>Cancelar</Button>
                    <Button onClick={async () => {
                      // Validate mutually-exclusive fields
                      if (form.discount_percent && form.discount_amount) {
                        return toast({ title: 'Error', description: 'Usa sólo porcentaje o monto, no ambos', variant: 'destructive' });
                      }
                      if (editing) {
                        // update
                        try {
                          const payload: any = { code: form.code.toUpperCase().trim() };
                          if (form.discount_percent) payload.discount_percent = Number(form.discount_percent);
                          else payload.discount_percent = null;
                          if (form.discount_amount) payload.discount_amount = Number(form.discount_amount);
                          else payload.discount_amount = null;
                          if (form.max_redemptions) payload.max_redemptions = Number(form.max_redemptions);
                          else payload.max_redemptions = null;
                          const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id);
                          if (error) throw error;
                          toast({ title: 'Cupón actualizado' });
                          setIsOpen(false);
                          setEditing(null);
                          setForm({ code: "", discount_percent: "", discount_amount: "", max_redemptions: "" });
                          await fetchCoupons();
                        } catch (err) {
                          console.error('[CouponManagement] update', err);
                          toast({ title: 'Error', description: 'No se pudo actualizar el cupón', variant: 'destructive' });
                        }
                      } else {
                        // create
                        await handleCreate();
                      }
                    }}>{editing ? 'Guardar Cambios' : 'Crear Cupón'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell>Cargando...</TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.code}</TableCell>
                        <TableCell>{c.discount_percent ? `${c.discount_percent}%` : c.discount_amount ? `$${c.discount_amount}` : '-'}</TableCell>
                        <TableCell>{c.max_redemptions ?? '∞'}</TableCell>
                        <TableCell>{c.active ? 'Sí' : 'No'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="icon" onClick={() => {
                              setEditing(c);
                              setForm({ code: c.code, discount_percent: c.discount_percent ? String(c.discount_percent) : "", discount_amount: c.discount_amount ? String(c.discount_amount) : "", max_redemptions: c.max_redemptions ? String(c.max_redemptions) : "" });
                              setIsOpen(true);
                            }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CouponManagement;
