import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, FileText, Image, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { increscendoApiFetch } from "@/lib/increscendoApi";
import { useToast } from "@/hooks/use-toast";

interface ConsentRenewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: any | null;
  onSuccess?: () => void;
}

export const ConsentRenewModal = ({ open, onOpenChange, loan, onSuccess }: ConsentRenewModalProps) => {
  const [documents, setDocuments] = useState<{ ineFrontUrl?: string; ineBackUrl?: string; curpUrl?: string }>({});
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && loan?.user_id) {
      setLoadingDocs(true);
      supabase
        .from('users')
        .select('ine_front_url, ine_back_url, curp_url')
        .eq('id', loan.user_id)
        .single()
        .then(({ data }) => {
          if (data) {
            setDocuments({
              ineFrontUrl: data.ine_front_url,
              ineBackUrl: data.ine_back_url,
              curpUrl: data.curp_url
            });
          }
          setLoadingDocs(false);
        });
    }
  }, [open, loan?.user_id]);

  const handleRenew = async () => {
    if (!loan?.uuid) return;
    setRenewing(true);
    try {
      const res = await increscendoApiFetch('/belvo/consents/renew', {
        method: 'POST',
        body: JSON.stringify({ loan_id: loan.uuid }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Error ${res.status}`);
      }
      const data = await res.json();
      toast({
        title: "Consentimiento renovado",
        description: `Nuevo consent ID: ${data.consentId?.slice(0, 8)}...`,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Error al renovar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setRenewing(false);
    }
  };

  const openInNewTab = (url: string) => window.open(url, '_blank');

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Renovar Consentimiento</DialogTitle>
          <DialogDescription>
            {loan.firstName} {loan.lastName} - {loan.id}
          </DialogDescription>
        </DialogHeader>

        {loadingDocs ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Cargando documentos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                El consentimiento fue rechazado. Se mostrarán los documentos actuales del usuario y se enviarán nuevamente a Belvo para renovar el consentimiento.
              </p>
            </div>

            <Tabs defaultValue="ine-front" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ine-front">INE Frontal</TabsTrigger>
                <TabsTrigger value="ine-back">INE Trasera</TabsTrigger>
                <TabsTrigger value="curp">CURP</TabsTrigger>
              </TabsList>

              <TabsContent value="ine-front" className="space-y-3">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 min-h-[250px] max-h-[400px] flex items-center justify-center overflow-hidden">
                  {documents.ineFrontUrl ? (
                    <img
                      src={documents.ineFrontUrl}
                      alt="INE Frontal"
                      className="max-h-[380px] max-w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openInNewTab(documents.ineFrontUrl!)}
                    />
                  ) : (
                    <div className="text-center">
                      <Image className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">Sin imagen frontal</p>
                    </div>
                  )}
                </div>
                {documents.ineFrontUrl && (
                  <Button variant="outline" size="sm" onClick={() => openInNewTab(documents.ineFrontUrl!)}>
                    <Eye className="h-4 w-4 mr-2" /> Ver completo
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="ine-back" className="space-y-3">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 min-h-[250px] max-h-[400px] flex items-center justify-center overflow-hidden">
                  {documents.ineBackUrl ? (
                    <img
                      src={documents.ineBackUrl}
                      alt="INE Trasera"
                      className="max-h-[380px] max-w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openInNewTab(documents.ineBackUrl!)}
                    />
                  ) : (
                    <div className="text-center">
                      <Image className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">Sin imagen trasera</p>
                    </div>
                  )}
                </div>
                {documents.ineBackUrl && (
                  <Button variant="outline" size="sm" onClick={() => openInNewTab(documents.ineBackUrl!)}>
                    <Eye className="h-4 w-4 mr-2" /> Ver completo
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="curp" className="space-y-3">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 min-h-[250px] flex items-center justify-center">
                  {documents.curpUrl ? (
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto text-red-400 mb-2" />
                      <p className="text-sm font-medium mb-3">Documento CURP (PDF)</p>
                      <Button variant="outline" size="sm" onClick={() => openInNewTab(documents.curpUrl!)}>
                        <Eye className="h-4 w-4 mr-2" /> Ver PDF
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">Sin documento CURP</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={renewing}>
            Cancelar
          </Button>
          <Button onClick={handleRenew} disabled={renewing || loadingDocs}>
            {renewing ? (
              <>Enviando...</>
            ) : (
              <><RefreshCw className="h-4 w-4 mr-2" /> Reenviar documentos</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
