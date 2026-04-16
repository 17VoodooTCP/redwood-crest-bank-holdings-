import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import TransferPage from './pages/TransferPage';
import PaymentPage from './pages/PaymentPage';
import WireTransferPage from './pages/WireTransferPage';
import SettingsPage from './pages/SettingsPage';
import MessagesPage from './pages/MessagesPage';
import SecurityPage from './pages/SecurityPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StatementPage from './pages/StatementPage';
import CareersPage from './pages/info/CareersPage';
import InvestorRelationsPage from './pages/info/InvestorRelationsPage';
import PressReleasesPage from './pages/info/PressReleasesPage';
import CommunityPage from './pages/info/CommunityPage';
import PrivacyPolicyPage from './pages/info/PrivacyPolicyPage';
import SecurityCenterPage from './pages/info/SecurityCenterPage';
import TermsOfUsePage from './pages/info/TermsOfUsePage';
import AccessibilityPage from './pages/info/AccessibilityPage';
import CustomerServicePage from './pages/info/CustomerServicePage';
import ATMLocatorPage from './pages/info/ATMLocatorPage';
import ContactUsPage from './pages/info/ContactUsPage';
import FAQsPage from './pages/info/FAQsPage';
import ProductsPage from './pages/info/ProductsPage';
import TopNav from './components/TopNav';
import Footer from './components/Footer';
import SmartAssistant from './components/SmartAssistant';
import LiveChat from './components/LiveChat';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="min-h-screen bg-brand-light flex items-center justify-center text-brand-blue font-medium">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return (
    <div className="flex flex-col min-h-screen bg-brand-light w-full overflow-x-hidden">
      <TopNav />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 min-w-0">
         <Outlet />
      </main>
      <Footer />
      <SmartAssistant />
      <LiveChat />
    </div>
  );
};

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-800 font-medium">Loading Admin...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Outlet />
    </div>
  );
};

function App() {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transfer" element={<TransferPage />} />
          <Route path="pay" element={<PaymentPage />} />
          <Route path="wire" element={<WireTransferPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="statement/:accountId" element={<StatementPage />} />
        </Route>
        
        {/* Info pages — standalone with own nav */}
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/investor-relations" element={<InvestorRelationsPage />} />
        <Route path="/press" element={<PressReleasesPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/security-center" element={<SecurityCenterPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/customer-service" element={<CustomerServicePage />} />
        <Route path="/atm-locator" element={<ATMLocatorPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/faqs" element={<FAQsPage />} />
        <Route path="/products/:product" element={<ProductsPage />} />

        {/* Standalone Admin Portal — has its own internal auth */}
        <Route path="/admin" element={<div className="min-h-screen bg-gray-100"><AdminDashboard /></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
