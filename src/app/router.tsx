import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PrivateLayout, PublicLayout, AdminLayout, AuthLayout } from '@/components/layouts/Layouts';
import { RequireAuth, RequireGuest, RoleGuard, PageLoader } from '@/components/guards';

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const wrapSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
);

const AuthPage = React.lazy(() => import('@/pages/Auth'));

const Index = React.lazy(() => import('@/pages/Index'));
const ServiceSelection = React.lazy(() => import('@/pages/ServiceSelection'));
const LoanRequest = React.lazy(() => import('@/pages/LoanRequest'));
const LoanProcess = React.lazy(() => import('@/pages/LoanProcess'));
const MyLoans = React.lazy(() => import('@/pages/MyLoans'));
const History = React.lazy(() => import('@/pages/History'));
const Notifications = React.lazy(() => import('@/pages/Notifications'));
const PaymentMethods = React.lazy(() => import('@/pages/PaymentMethods'));
const Memberships = React.lazy(() => import('@/pages/Memberships'));
const MembershipCheckout = React.lazy(() => import('@/pages/MembershipCheckout'));
const PaymentSuccess = React.lazy(() => import('@/pages/PaymentSuccess'));
const PaymentError = React.lazy(() => import('@/pages/PaymentError'));
const MyAccount = React.lazy(() => import('@/pages/MyAccount'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const ClientManagement = React.lazy(() => import('@/pages/admin/ClientManagement'));
const LoanManagement = React.lazy(() => import('@/pages/admin/LoanManagement'));
const SystemConfig = React.lazy(() => import('@/pages/admin/SystemConfig'));
const MembershipManagement = React.lazy(() => import('@/pages/admin/MembershipManagement'));
const CouponManagement = React.lazy(() => import('@/pages/admin/CouponManagement'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const AvisoLegal = React.lazy(() => import('@/pages/AvisoLegal'));
const PoliticasPrivacidad = React.lazy(() => import('@/pages/PoliticasPrivacidad'));
const TerminosCondiciones = React.lazy(() => import('@/pages/TerminosCondiciones'));
const PrivacidadEmpleo = React.lazy(() => import('@/pages/PrivacidadEmpleo'));
const TipsSeguridad = React.lazy(() => import('@/pages/TipsSeguridad'));
const BolsaTrabajo = React.lazy(() => import('@/pages/BolsaTrabajo'));
const CentroAyuda = React.lazy(() => import('@/pages/CentroAyuda'));
const Contacto = React.lazy(() => import('@/pages/Contacto'));
const CancelacionTerminos = React.lazy(() => import('@/pages/CancelacionTerminos'));
const ProntipagosSSO = React.lazy(() => import('@/pages/ProntipagosSSO'));
const UsuarioNuevoMarketing = React.lazy(() => import('@/pages/UsuarioNuevoMarketing'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'));

const RequireAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RequireAuth loadingComponent={<LoadingFallback />}>{children}</RequireAuth>
);

const RequireGuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RequireGuest loadingComponent={<LoadingFallback />}>{children}</RequireGuest>
);

const RoleGuardRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => (
  <RoleGuard allowedRoles={allowedRoles} loadingComponent={<LoadingFallback />}>{children}</RoleGuard>
);

export const router = createBrowserRouter([
  { path: 'forgot-password', element: wrapSuspense(<ForgotPassword />) },
  { path: 'reset-password', element: wrapSuspense(<ResetPassword />) },
  {
    element: <AuthLayout />,
    children: [
      { path: 'auth', element: <RequireGuestRoute><AuthPage /></RequireGuestRoute> },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: wrapSuspense(<Index />) },
      { path: 'usuario-nuevo-marketing', element: wrapSuspense(<UsuarioNuevoMarketing />) },
      { path: 'prontipagos-sso', element: wrapSuspense(<ProntipagosSSO />) },
    ],
  },
  { path: 'aviso-legal', element: wrapSuspense(<AvisoLegal />) },
  { path: 'politicas-privacidad', element: wrapSuspense(<PoliticasPrivacidad />) },
  { path: 'terminos-y-condiciones', element: wrapSuspense(<TerminosCondiciones />) },
  { path: 'privacidad-empleo', element: wrapSuspense(<PrivacidadEmpleo />) },
  { path: 'tips-seguridad', element: wrapSuspense(<TipsSeguridad />) },
  { path: 'bolsa-trabajo', element: wrapSuspense(<BolsaTrabajo />) },
  { path: 'centro-ayuda', element: wrapSuspense(<CentroAyuda />) },
  { path: 'contacto', element: wrapSuspense(<Contacto />) },
  { path: 'terminos-cancelacion', element: wrapSuspense(<CancelacionTerminos />) },
  {
    element: <PrivateLayout />,
    children: [
      { path: 'service-selection', element: <RequireAuthRoute><Suspense fallback={<LoadingFallback />}><ServiceSelection /></Suspense></RequireAuthRoute> },
      { path: 'dashboard', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><DashboardPage /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'loan-request', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><LoanRequest /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'loan-process', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><LoanProcess /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'my-loans', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><MyLoans /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'history', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><History /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'notifications', element: <RequireAuthRoute><Suspense fallback={<LoadingFallback />}><Notifications /></Suspense></RequireAuthRoute> },
      { path: 'payment-methods', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><PaymentMethods /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'memberships', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><Memberships /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'membership-checkout', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><MembershipCheckout /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'payment-success', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><PaymentSuccess /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'payment-error', element: <RequireAuthRoute><RoleGuardRoute allowedRoles={['client']} fallbackPath="/admin/dashboard"><Suspense fallback={<LoadingFallback />}><PaymentError /></Suspense></RoleGuardRoute></RequireAuthRoute> },
      { path: 'mi-cuenta', element: <RequireAuthRoute><Suspense fallback={<LoadingFallback />}><MyAccount /></Suspense></RequireAuthRoute> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: 'admin/dashboard', element: <RoleGuardRoute allowedRoles={['admin']}><Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense></RoleGuardRoute> },
      { path: 'admin/loans', element: <RoleGuardRoute allowedRoles={['admin']}><Suspense fallback={<LoadingFallback />}><LoanManagement /></Suspense></RoleGuardRoute> },
      { path: 'admin/clients', element: <RoleGuardRoute allowedRoles={['admin']}><Suspense fallback={<LoadingFallback />}><ClientManagement /></Suspense></RoleGuardRoute> },
      { path: 'admin/config', element: <RoleGuardRoute allowedRoles={['admin']}><Suspense fallback={<LoadingFallback />}><SystemConfig /></Suspense></RoleGuardRoute> },
      { path: 'admin/memberships', element: <RoleGuardRoute allowedRoles={['admin']}><Suspense fallback={<LoadingFallback />}><MembershipManagement /></Suspense></RoleGuardRoute> },
      { path: 'admin/coupons', element: <RoleGuardRoute allowedRoles={['admin']}><Suspense fallback={<LoadingFallback />}><CouponManagement /></Suspense></RoleGuardRoute> },
    ],
  },
  { path: '*', element: wrapSuspense(<NotFound />) },
]);

export default router;