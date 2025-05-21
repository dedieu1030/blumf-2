
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { NotificationsPanel } from "@/components/NotificationsPanel";

const Notifications = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <>
      <Header 
        title="Notifications" 
        description="Gérez vos notifications"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      <NotificationsPanel open={panelOpen} onOpenChange={setPanelOpen} />
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
};

export default Notifications;
