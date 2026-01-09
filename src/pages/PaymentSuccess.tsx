import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, ArrowLeft } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showContent, setShowContent] = useState(false);

  const amount = searchParams.get("amount") || "0";
  const folio = searchParams.get("folio") || "INC-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = currentDate.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadReceipt = () => {
    // Simulate download - in production would generate PDF
    const receiptData = `
      COMPROBANTE DE PAGO
      ═══════════════════════════════
      Folio: ${folio}
      Monto: $${parseInt(amount).toLocaleString()} MXN
      Concepto: Pago de Cuotas - Increscendo Fintech
      Fecha: ${formattedDate}
      Hora: ${formattedTime}
      ═══════════════════════════════
      Gracias por tu pago.
    `;
    
    const blob = new Blob([receiptData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprobante-${folio}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-md transition-all duration-700 ease-out ${
          showContent 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div 
            className={`rounded-full bg-success/10 p-4 transition-all duration-500 delay-200 ${
              showContent ? "scale-100" : "scale-0"
            }`}
          >
            <div 
              className={`rounded-full bg-success/20 p-4 transition-all duration-500 delay-300 ${
                showContent ? "scale-100" : "scale-0"
              }`}
            >
              <CheckCircle2 
                className={`h-16 w-16 text-success transition-all duration-500 delay-400 ${
                  showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-2">
          ¡Pago Realizado con Éxito!
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Tu transacción ha sido procesada correctamente.
        </p>

        {/* Transaction Summary Card */}
        <Card className="shadow-medium border-success/20 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-success to-success/60" />
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Folio</span>
              <span className="font-mono font-semibold text-foreground">{folio}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Monto</span>
              <span className="text-xl font-bold text-success">
                ${parseInt(amount).toLocaleString()} MXN
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Concepto</span>
              <span className="font-medium text-foreground text-right text-sm">
                Pago de Cuotas - Increscendo Fintech
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-muted-foreground">Fecha</span>
              <span className="font-medium text-foreground">
                {formattedDate}, {formattedTime}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={() => navigate("/my-loans")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a Mis Préstamos
          </Button>
          <Button
            variant="ghost"
            onClick={handleDownloadReceipt}
            className="w-full text-primary hover:text-primary/80 hover:bg-primary/5"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Comprobante
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
