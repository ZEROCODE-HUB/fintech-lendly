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
import CouponManagement from "./pages/admin/CouponManagement";
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
          <Route path="/service-selection" element={<RequireAuth allowedRoles={["client"]}><ServiceSelection /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth allowedRoles={["client"]}><Dashboard /></RequireAuth>} />
          <Route path="/loan-request" element={<RequireAuth allowedRoles={["client"]}><LoanRequest /></RequireAuth>} />
          <Route path="/loan-process" element={<RequireAuth allowedRoles={["client"]}><LoanProcess /></RequireAuth>} />
          <Route path="/my-loans" element={<RequireAuth allowedRoles={["client"]}><MyLoans /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth allowedRoles={["client"]}><History /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth allowedRoles={["client","admin"]}><Notifications /></RequireAuth>} />
          <Route path="/payment-methods" element={<RequireAuth allowedRoles={["client"]}><PaymentMethods /></RequireAuth>} />
          <Route path="/memberships" element={<RequireAuth allowedRoles={["client"]}><Memberships /></RequireAuth>} />
          <Route path="/membership-checkout" element={<RequireAuth allowedRoles={["client"]}><MembershipCheckout /></RequireAuth>} />
          <Route path="/payment-success" element={<RequireAuth allowedRoles={["client"]}><PaymentSuccess /></RequireAuth>} />
          <Route path="/payment-error" element={<RequireAuth allowedRoles={["client"]}><PaymentError /></RequireAuth>} />
          <Route path="/mi-cuenta" element={<RequireAuth allowedRoles={["client", "admin"]}><MyAccount /></RequireAuth>} />
          <Route path="/admin/dashboard" element={<RequireAuth allowedRoles={["admin"]}><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/loans" element={<RequireAuth allowedRoles={["admin"]}><LoanManagement /></RequireAuth>} />
          <Route path="/admin/clients" element={<RequireAuth allowedRoles={["admin"]}><ClientManagement /></RequireAuth>} />
          <Route path="/admin/config" element={<RequireAuth allowedRoles={["admin"]}><SystemConfig /></RequireAuth>} />
          <Route path="/admin/memberships" element={<RequireAuth allowedRoles={["admin"]}><MembershipManagement /></RequireAuth>} />
          <Route path="/admin/coupons" element={<RequireAuth allowedRoles={["admin"]}><CouponManagement /></RequireAuth>} />
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
