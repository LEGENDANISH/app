import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingDown, Wallet } from "lucide-react";
import { storage } from "@/lib/storage";
import type { UserProfile } from "@shared/schema";

const currencies = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [monthlyBudget, setMonthlyBudget] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = async () => {
    const currencyData = currencies.find((c) => c.code === currency);
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name,
      currency: currencyData?.symbol || "₹",
      currencySymbol: currency,
      monthlyBudget: parseFloat(monthlyBudget) || 0,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
    };

    await storage.setUserProfile(profile);
    setLocation("/dashboard");
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-chart-3/20 p-6">
        <div className="text-center space-y-6 animate-in fade-in-0 zoom-in-95 duration-1000">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
            <Wallet className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
            ExpenseWise
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Track Smarter, Save Better
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8 space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold" data-testid="text-onboarding-title">
              {step === 0 && "Welcome! What's your name?"}
              {step === 1 && "Choose your currency"}
              {step === 2 && "Set your monthly budget"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {step === 0 && "Let's personalize your experience"}
              {step === 1 && "We'll use this for all transactions"}
              {step === 2 && "Optional, but helps track spending"}
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="space-y-6">
            {step === 0 && (
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  data-testid="input-name"
                  className="h-12 text-base"
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" className="h-12" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name} ({curr.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                    {currencies.find((c) => c.code === currency)?.symbol}
                  </span>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="50000"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="pl-8 h-12 text-base"
                    data-testid="input-budget"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You can always change this later in settings
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 h-11"
                data-testid="button-back"
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => {
                if (step < 2) {
                  setStep(step + 1);
                } else {
                  handleComplete();
                }
              }}
              disabled={step === 0 && !name}
              className="flex-1 h-11 gap-2"
              data-testid="button-continue"
            >
              {step === 2 ? "Get Started" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
