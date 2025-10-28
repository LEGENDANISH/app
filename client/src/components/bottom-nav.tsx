import { useLocation } from "wouter";
import { Home, BarChart3, CreditCard, Wallet } from "lucide-react";

export function BottomNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard", testId: "nav-dashboard" },
    { icon: BarChart3, label: "Analytics", path: "/analytics", testId: "nav-analytics" },
    { icon: CreditCard, label: "Subscriptions", path: "/subscriptions", testId: "nav-subscriptions" },
    { icon: Wallet, label: "Loans", path: "/loans", testId: "nav-loans" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors hover-elevate active-elevate-2 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={item.testId}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
