import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ServiceSelection from "./pages/ServiceSelection";
import LoanRequest from "./pages/LoanRequest";
import MyLoans from "./pages/MyLoans";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import PaymentMethods from "./pages/PaymentMethods";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LoanManagement from "./pages/admin/LoanManagement";
import ClientManagement from "./pages/admin/ClientManagement";
import SystemConfig from "./pages/admin/SystemConfig";
import NotFound from "./pages/NotFound";

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
          <Route path="/service-selection" element={<ServiceSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loan-request" element={<LoanRequest />} />
          <Route path="/my-loans" element={<MyLoans />} />
          <Route path="/history" element={<History />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/loans" element={<LoanManagement />} />
          <Route path="/admin/clients" element={<ClientManagement />} />
          <Route path="/admin/config" element={<SystemConfig />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
