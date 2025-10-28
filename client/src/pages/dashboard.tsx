import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { storage } from "@/lib/storage";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expense-form";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Download,
  Filter,
  Settings as SettingsIcon,
} from "lucide-react";
import * as Icons from "lucide-react";
import { categoryConfig, type Expense, type ExpenseCategory } from "@shared/schema";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

type TimePeriod = "7days" | "14days" | "30days" | "custom";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30days");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: () => storage.getUserProfile(),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses"],
    queryFn: () => storage.getAllExpenses(),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["/api/budgets"],
    queryFn: () => storage.getAllBudgets(),
  });

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (timePeriod) {
      case "7days":
        return { start: subDays(now, 7), end: now };
      case "14days":
        return { start: subDays(now, 14), end: now };
      case "30days":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [timePeriod]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) =>
      isWithinInterval(parseISO(expense.date), dateRange)
    );
  }, [expenses, dateRange]);

  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach((expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);
  }, [filteredExpenses]);

  const monthlyBudget = profile?.monthlyBudget || 0;
  const budgetPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  const handleSaveExpense = async (data: any) => {
    const expense: Expense = {
      ...data,
      id: editingExpense?.id || crypto.randomUUID(),
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingExpense) {
      await storage.updateExpense(expense);
    } else {
      await storage.addExpense(expense);
    }

    await queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-primary/10 to-background/95 backdrop-blur-md border-b px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-greeting">
              Hello, {profile?.name || "User"}!
            </h1>
            <p className="text-sm text-muted-foreground">Track your spending</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLocation("/settings")}
              className="rounded-full"
              data-testid="button-settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: "7days" as TimePeriod, label: "7 Days" },
            { key: "14days" as TimePeriod, label: "14 Days" },
            { key: "30days" as TimePeriod, label: "This Month" },
          ].map((period) => (
            <Button
              key={period.key}
              variant={timePeriod === period.key ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod(period.key)}
              className="whitespace-nowrap"
              data-testid={`button-period-${period.key}`}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Spent</p>
                <p className="text-3xl font-bold" data-testid="text-total-spent">
                  {profile?.currency}
                  {totalSpent.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <Wallet className="w-10 h-10 opacity-80" />
            </div>
            
            {monthlyBudget > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-90">vs Budget</span>
                  <span className="font-semibold">
                    {budgetPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      budgetPercentage > 90
                        ? "bg-destructive"
                        : budgetPercentage > 70
                        ? "bg-yellow-400"
                        : "bg-white"
                    }`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {categoryTotals.map(([category, amount]) => {
            const config = categoryConfig[category as ExpenseCategory];
            const IconComponent = Icons[config.icon as keyof typeof Icons] as any;

            return (
              <Card key={category} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: config.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {config.label}
                      </p>
                      <p className="font-semibold truncate" data-testid={`text-category-${category}`}>
                        {profile?.currency}
                        {amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/expenses")}
            data-testid="button-view-all"
          >
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {filteredExpenses.slice(0, 5).map((expense) => {
            const config = categoryConfig[expense.category];
            const IconComponent = Icons[config.icon as keyof typeof Icons] as any;

            return (
              <Card
                key={expense.id}
                className="hover-elevate cursor-pointer"
                onClick={() => {
                  setEditingExpense(expense);
                  setShowExpenseForm(true);
                }}
                data-testid={`card-expense-${expense.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: config.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{config.label}</p>
                        {expense.subcategory && (
                          <Badge variant="secondary" className="text-xs">
                            {expense.subcategory}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(expense.date), "MMM dd, yyyy")} • {expense.paymentMethod}
                      </p>
                      {expense.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {expense.description}
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-lg">
                      {profile?.currency}{expense.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredExpenses.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No expenses yet</p>
                <p className="text-sm text-muted-foreground">
                  Tap the + button to add your first expense
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-2xl"
          onClick={() => {
            setEditingExpense(null);
            setShowExpenseForm(true);
          }}
          data-testid="button-add-expense"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <ExpenseForm
        open={showExpenseForm}
        onOpenChange={(open) => {
          setShowExpenseForm(open);
          if (!open) setEditingExpense(null);
        }}
        onSubmit={handleSaveExpense}
        defaultValues={editingExpense}
        currency={profile?.currency || "₹"}
      />
    </div>
  );
}
