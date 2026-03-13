import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import AuthPage from "./pages/AuthPage";
import { useNotifications } from "./hooks/useNotifications";
import { setStoreUid, syncFromCloud } from "./lib/store";

const queryClient = new QueryClient();

// Key to remember if user chose to skip login
const SKIP_AUTH_KEY = "dawaa_skip_auth";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  useNotifications();

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto min-h-[100dvh] bg-background relative overflow-x-hidden">
      {children}
      <BottomNav />
    </div>
  );
};

const AppRoutes = () => {
  return (
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
  );
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Operation timed out"));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

const AuthGate = () => {
  const { user, loading } = useAuth();
  const [skipped, setSkipped] = useState(() => localStorage.getItem(SKIP_AUTH_KEY) === "true");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    console.log("[AuthGate] loading =", loading, "user =", user?.uid ?? null, "skipped =", skipped);
  }, [loading, user, skipped]);

  useEffect(() => {
    let cancelled = false;

    const runSync = async () => {
      if (!user) {
        console.log("[AuthGate] no user -> skip cloud sync");
        setStoreUid(null);
        setSyncing(false);
        return;
      }

      try {
        console.log("[AuthGate] start cloud sync for uid:", user.uid);
        setStoreUid(user.uid);
        setSyncing(true);

        await withTimeout(syncFromCloud(user.uid), 10000);

        console.log("[AuthGate] cloud sync completed");
      } catch (err) {
        console.error("[AuthGate] cloud sync failed:", err);
      } finally {
        if (!cancelled) {
          setSyncing(false);
        }
      }
    };

    runSync();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || syncing) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">
          {loading ? "جارٍ التحقق من تسجيل الدخول..." : "جارٍ مزامنة البيانات..."}
        </p>
      </div>
    );
  }

  if (!user && !skipped) {
    return (
      <AuthPage
        onSkip={() => {
          localStorage.setItem(SKIP_AUTH_KEY, "true");
          setSkipped(true);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <AuthGate />
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
