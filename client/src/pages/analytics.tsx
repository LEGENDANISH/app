import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { storage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { categoryConfig, type ExpenseCategory } from "@shared/schema";
import { format, parseISO, startOfMonth, eachDayOfInterval, endOfMonth } from "date-fns";

export default function Analytics() {
  const [, setLocation] = useLocation();

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: () => storage.getUserProfile(),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses"],
    queryFn: () => storage.getAllExpenses(),
  });

  const currentMonth = useMemo(() => {
    const now = new Date();
    return expenses.filter((expense) => {
      const expenseDate = parseISO(expense.date);
      return (
        expenseDate >= startOfMonth(now) &&
        expenseDate <= endOfMonth(now)
      );
    });
  }, [expenses]);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    currentMonth.forEach((expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({
        name: categoryConfig[category as ExpenseCategory]?.label || category,
        value: amount,
        color: categoryConfig[category as ExpenseCategory]?.color || "#888",
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonth]);

  const dailyData = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({
      start: startOfMonth(now),
      end: endOfMonth(now),
    });

    return days.map((day) => {
      const dayExpenses = currentMonth.filter(
        (expense) => format(parseISO(expense.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      );
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      return {
        date: format(day, "MMM dd"),
        amount: total,
      };
    });
  }, [currentMonth]);

  const totalSpent = currentMonth.reduce((sum, expense) => sum + expense.amount, 0);
  const avgDaily = totalSpent / new Date().getDate();
  const monthlyBudget = profile?.monthlyBudget || 0;
  const remaining = monthlyBudget - totalSpent;

  const insights = useMemo(() => {
    const insights: string[] = [];
    
    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      insights.push(`Your highest spending is on ${topCategory.name} (${profile?.currency}${topCategory.value.toLocaleString("en-IN")})`);
    }

    if (monthlyBudget > 0) {
      const percentage = (totalSpent / monthlyBudget) * 100;
      if (percentage > 90) {
        insights.push("⚠️ You've spent over 90% of your monthly budget!");
      } else if (percentage > 70) {
        insights.push("You're at 70% of your monthly budget. Keep an eye on spending!");
      } else {
        insights.push(`You're doing great! ${(100 - percentage).toFixed(0)}% of budget remaining.`);
      }
    }

    if (avgDaily > 0) {
      insights.push(`Your average daily spending is ${profile?.currency}${avgDaily.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`);
    }

    return insights;
  }, [categoryData, totalSpent, monthlyBudget, avgDaily, profile]);

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Spending insights</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
              <p className="text-2xl font-bold" data-testid="text-analytics-total">
                {profile?.currency}{totalSpent.toLocaleString("en-IN")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Avg Daily</p>
              </div>
              <p className="text-2xl font-bold">
                {profile?.currency}{avgDaily.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>

          {monthlyBudget > 0 && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Budget</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {profile?.currency}{monthlyBudget.toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                  <p className={`text-2xl font-bold ${remaining < 0 ? "text-destructive" : ""}`}>
                    {profile?.currency}{remaining.toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Smart Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-muted/50 text-sm"
                data-testid={`text-insight-${index}`}
              >
                {insight}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) =>
                    `${profile?.currency}${value.toLocaleString("en-IN")}`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `${profile?.currency}${value.toLocaleString("en-IN")}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) =>
                    `${profile?.currency}${value.toLocaleString("en-IN")}`
                  }
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
