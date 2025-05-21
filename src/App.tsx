
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { SearchBar } from "./components/SearchBar";
import Dashboard from "./pages/Dashboard";
import Invoicing from "./pages/Invoicing";
import Invoices from "./pages/Invoices";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import ProductsServices from "./pages/ProductsServices";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import StripeCallback from "./pages/StripeCallback";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Auth from "./pages/Auth";
import { NotificationsProvider } from "./context/NotificationsContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useIsMobile } from "./hooks/use-mobile";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NotificationBell } from "./components/NotificationBell";
import { LanguageSelector } from "./components/LanguageSelector";
import { MobileNavigation } from "./components/MobileNavigation";
import { QuickAction } from "./components/QuickAction";

const queryClient = new QueryClient();

// Composant de mise en page principale pour les pages authentifiées
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto md:ml-64">
        {/* Search bar container - ajusté pour une meilleure utilisation de l'espace sur mobile */}
        <div className={`sticky top-0 z-10 bg-background px-4 py-8 flex items-center gap-1.5 ${isMobile ? 'border-b' : ''}`}>
          {/* Flexible search bar container that fills available space but respects other elements */}
          <div className={`flex-grow ${isMobile ? 'max-w-[60%]' : ''}`}>
            <SearchBar placeholder="Rechercher dans l'application..." />
          </div>
          
          {/* Tightly grouped action buttons without excessive margins on mobile */}
          <div className="flex items-center gap-1.5 shrink-0">
            <QuickAction />
            
            {!isMobile && <LanguageSelector />}
            
            <NotificationBell />
            
            {/* Menu button moved to the far right on mobile */}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 ml-0.5 border border-input"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </div>
  );
};

// Composant de routage qui détermine si on doit afficher le layout principal
// ou simplement la page d'authentification
const AppRoutes = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    );
  }
  
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/invoicing" element={<ProtectedRoute><Invoicing /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/clients/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsServices /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="/stripe/callback" element={<StripeCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NotificationsProvider>
          <AppContent />
        </NotificationsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
