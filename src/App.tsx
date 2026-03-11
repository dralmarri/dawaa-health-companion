import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";
import HomePage from "./pages/HomePage";
import MedicationsPage from "./pages/MedicationsPage";
import AddMedicationPage from "./pages/AddMedicationPage";
import BloodPressurePage from "./pages/BloodPressurePage";
import AppointmentsPage from "./pages/AppointmentsPage";
import LabTestsPage from "./pages/LabTestsPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import EmergencyContactPage from "./pages/EmergencyContactPage";
import NotFound from "./pages/NotFound";
import { useNotifications } from "./hooks/useNotifications";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  useNotifications();
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background relative">
      {children}
      <BottomNav />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
            <Route path="/medications" element={<AppLayout><MedicationsPage /></AppLayout>} />
            <Route path="/medications/add" element={<AddMedicationPage />} />
            <Route path="/blood-pressure" element={<AppLayout><BloodPressurePage /></AppLayout>} />
            <Route path="/appointments" element={<AppLayout><AppointmentsPage /></AppLayout>} />
            <Route path="/lab-tests" element={<AppLayout><LabTestsPage /></AppLayout>} />
            <Route path="/history" element={<AppLayout><HistoryPage /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicyPage /></AppLayout>} />
            <Route path="/terms-of-use" element={<AppLayout><TermsOfUsePage /></AppLayout>} />
            <Route path="/emergency-contact" element={<EmergencyContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
