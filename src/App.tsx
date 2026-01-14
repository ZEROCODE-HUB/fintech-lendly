import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RequireAuth from "./components/RequireAuth";
import ServiceSelection from "./pages/ServiceSelection";
import LoanRequest from "./pages/LoanRequest";
import LoanProcess from "./pages/LoanProcess";
import MyLoans from "./pages/MyLoans";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import PaymentMethods from "./pages/PaymentMethods";
import Memberships from "./pages/Memberships";
import MembershipCheckout from "./pages/MembershipCheckout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentError from "./pages/PaymentError";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LoanManagement from "./pages/admin/LoanManagement";
import ClientManagement from "./pages/admin/ClientManagement";
import SystemConfig from "./pages/admin/SystemConfig";
import MembershipManagement from "./pages/admin/MembershipManagement";
import MyAccount from "./pages/MyAccount";
import UsuarioNuevoMarketing from "./pages/UsuarioNuevoMarketing";
import NotFound from "./pages/NotFound";
import AvisoLegal from "./pages/AvisoLegal";
import PoliticasPrivacidad from "./pages/PoliticasPrivacidad";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PrivacidadEmpleo from "./pages/PrivacidadEmpleo";
import TipsSeguridad from "./pages/TipsSeguridad";
import BolsaTrabajo from "./pages/BolsaTrabajo";
import CentroAyuda from "./pages/CentroAyuda";
import Contacto from "./pages/Contacto";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/service-selection" element={<RequireAuth><ServiceSelection /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/loan-request" element={<RequireAuth><LoanRequest /></RequireAuth>} />
          <Route path="/loan-process" element={<RequireAuth><LoanProcess /></RequireAuth>} />
          <Route path="/my-loans" element={<RequireAuth><MyLoans /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/payment-methods" element={<RequireAuth><PaymentMethods /></RequireAuth>} />
          <Route path="/memberships" element={<RequireAuth><Memberships /></RequireAuth>} />
          <Route path="/membership-checkout" element={<RequireAuth><MembershipCheckout /></RequireAuth>} />
          <Route path="/payment-success" element={<RequireAuth><PaymentSuccess /></RequireAuth>} />
          <Route path="/payment-error" element={<RequireAuth><PaymentError /></RequireAuth>} />
          <Route path="/mi-cuenta" element={<RequireAuth><MyAccount /></RequireAuth>} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/loans" element={<LoanManagement />} />
          <Route path="/admin/clients" element={<ClientManagement />} />
          <Route path="/admin/config" element={<SystemConfig />} />
          <Route path="/admin/memberships" element={<MembershipManagement />} />
          <Route path="/usuario-nuevo-marketing" element={<UsuarioNuevoMarketing />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
          <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
          <Route path="/privacidad-empleo" element={<PrivacidadEmpleo />} />
          <Route path="/tips-seguridad" element={<TipsSeguridad />} />
          <Route path="/bolsa-trabajo" element={<BolsaTrabajo />} />
          <Route path="/centro-ayuda" element={<CentroAyuda />} />
          <Route path="/contacto" element={<Contacto />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
