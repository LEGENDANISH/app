import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { BottomNav } from "@/components/bottom-nav";
import { storage } from "@/lib/storage";

import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Expenses from "@/pages/expenses";
import Subscriptions from "@/pages/subscriptions";
import Loans from "@/pages/loans";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      const profile = await storage.getUserProfile();
      
      if (!profile || !profile.onboardingCompleted) {
        setLocation("/");
      } else if (location === "/") {
        setLocation("/dashboard");
      }
      
      setIsLoading(false);
    };

    checkOnboarding();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/40" />
          </div>
        </div>
      </div>
    );
  }

  const showBottomNav = ["/dashboard", "/analytics", "/subscriptions", "/loans"].includes(location);

  return (
    <>
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/subscriptions" component={Subscriptions} />
        <Route path="/loans" component={Loans} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="expensewise-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
