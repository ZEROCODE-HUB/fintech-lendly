import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Chatbot } from "@/components/Chatbot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

const LoanRequest = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [estimatedPayment, setEstimatedPayment] = useState(0);

  const calculatePayment = (amount: string) => {
    const principal = parseFloat(amount) || 0;
    const monthlyRate = 0.05; // 5% example rate
    const months = 12;
    const payment = principal > 0 ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1) : 0;
    setEstimatedPayment(payment);
  };

  const handleAmountChange = (value: string) => {
    setLoanAmount(value);
    calculatePayment(value);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Solicitar Préstamo</h1>
            </div>
          </header>

          <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Membership Status Alert */}
            <Card className="border-success bg-accent">
              <CardContent className="flex items-center gap-4 py-4">
                <CheckCircle2 className="h-8 w-8 text-success flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-lg">Membresía Premium Activa</p>
                  <p className="text-sm text-muted-foreground">Tienes acceso a tasas preferenciales y montos más altos</p>
                </div>
                <Badge className="bg-success text-success-foreground">Verificado</Badge>
              </CardContent>
            </Card>

            {/* Loan Calculator */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Calculadora de Préstamo
                </CardTitle>
                <CardDescription>
                  Ingresa el monto deseado y visualiza tus pagos mensuales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto del Préstamo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="10000"
                      value={loanAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pl-7 text-lg font-semibold"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[5000, 10000, 15000, 20000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmountChange(amount.toString())}
                      >
                        ${amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                {loanAmount && (
                  <div className="bg-gradient-accent rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pago Mensual Estimado</span>
                      <span className="text-3xl font-bold text-primary">
                        ${estimatedPayment.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Plazo</p>
                        <p className="font-semibold">12 meses</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tasa Anual</p>
                        <p className="font-semibold">60%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total a Pagar</p>
                        <p className="font-semibold">${(estimatedPayment * 12).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Form */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Detalles de la Solicitud</CardTitle>
                <CardDescription>Completa la información para procesar tu préstamo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="purpose">Destino del Préstamo</Label>
                  <Select>
                    <SelectTrigger id="purpose">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Negocio</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="medical">Médico</SelectItem>
                      <SelectItem value="home">Hogar</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (Opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Cuéntanos más sobre el propósito de tu préstamo..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Método de Pago Preferido</Label>
                  <Select>
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Selecciona un método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Tarjeta de Crédito/Débito</SelectItem>
                      <SelectItem value="bank">Transferencia Bancaria</SelectItem>
                      <SelectItem value="auto">Débito Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Información Importante</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Tu solicitud será revisada en un plazo de 24-48 horas</li>
                      <li>• Debes tener una membresía activa para solicitar préstamos</li>
                      <li>• Los términos finales pueden variar según tu historial crediticio</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.history.back()}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1"
                    disabled={!loanAmount}
                  >
                    Enviar Solicitud
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Chatbot />
      </div>
    </SidebarProvider>
  );
};

export default LoanRequest;
