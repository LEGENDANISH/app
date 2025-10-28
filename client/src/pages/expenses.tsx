import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { storage } from "@/lib/storage";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExpenseForm } from "@/components/expense-form";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Trash2,
  Upload,
} from "lucide-react";
import * as Icons from "lucide-react";
import { categoryConfig, type Expense } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { useLocation } from "wouter";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

export default function Expenses() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: () => storage.getUserProfile(),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses"],
    queryFn: () => storage.getAllExpenses(),
  });

  const filteredExpenses = expenses.filter((expense) => {
    const searchLower = search.toLowerCase();
    return (
      categoryConfig[expense.category]?.label.toLowerCase().includes(searchLower) ||
      expense.description.toLowerCase().includes(searchLower) ||
      expense.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      expense.amount.toString().includes(searchLower)
    );
  });

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

  const handleDeleteSelected = async () => {
    if (selectedExpenses.size === 0) return;
    
    if (confirm(`Delete ${selectedExpenses.size} expense(s)?`)) {
      await storage.deleteMultipleExpenses(Array.from(selectedExpenses));
      setSelectedExpenses(new Set());
      await queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    }
  };

  const handleExport = () => {
    const data = filteredExpenses.map((expense) => ({
      Date: format(parseISO(expense.date), "yyyy-MM-dd"),
      Category: categoryConfig[expense.category]?.label,
      Subcategory: expense.subcategory || "",
      Amount: expense.amount,
      "Payment Method": expense.paymentMethod,
      Description: expense.description,
      Tags: expense.tags.join(", "),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, `expenses-${format(new Date(), "yyyy-MM-dd")}.xlsx`);

    toast({
      title: "Exported successfully",
      description: `${filteredExpenses.length} expenses exported to Excel`,
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        let imported = 0;
        for (const row of jsonData) {
          const categoryEntry = Object.entries(categoryConfig).find(
            ([, config]) => config.label.toLowerCase() === row.Category?.toLowerCase()
          );

          if (categoryEntry && row.Amount && row.Date) {
            const expense: Expense = {
              id: crypto.randomUUID(),
              amount: parseFloat(row.Amount),
              category: categoryEntry[0] as any,
              subcategory: row.Subcategory || "",
              paymentMethod: row["Payment Method"] || "Cash",
              description: row.Description || "",
              tags: row.Tags ? row.Tags.split(",").map((t: string) => t.trim()) : [],
              date: row.Date,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await storage.addExpense(expense);
            imported++;
          }
        }

        toast({
          title: "Import successful",
          description: `${imported} expenses imported from Excel`,
        });

        await queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Please check your Excel file format",
          variant: "destructive",
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const toggleExpenseSelection = (id: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedExpenses(newSelected);
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">All Expenses</h1>
            <p className="text-sm text-muted-foreground">{expenses.length} total</p>
          </div>
          <div className="flex gap-2">
            <label htmlFor="import-file">
              <Button size="icon" variant="outline" asChild data-testid="button-import">
                <span>
                  <Upload className="w-5 h-5" />
                </span>
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <Button
              size="icon"
              variant="outline"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
            data-testid="input-search"
          />
        </div>

        {selectedExpenses.size > 0 && (
          <div className="mt-3 flex items-center justify-between p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">
              {selectedExpenses.size} selected
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteSelected}
              className="gap-2"
              data-testid="button-delete-selected"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {filteredExpenses.map((expense) => {
          const config = categoryConfig[expense.category];
          const IconComponent = Icons[config.icon as keyof typeof Icons] as any;
          const isSelected = selectedExpenses.has(expense.id);

          return (
            <Card
              key={expense.id}
              className={`hover-elevate cursor-pointer transition-all ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              data-testid={`card-expense-${expense.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleExpenseSelection(expense.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-2 cursor-pointer"
                    data-testid={`checkbox-expense-${expense.id}`}
                  />
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}15` }}
                    onClick={() => {
                      setEditingExpense(expense);
                      setShowExpenseForm(true);
                    }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: config.color }}
                    />
                  </div>
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => {
                      setEditingExpense(expense);
                      setShowExpenseForm(true);
                    }}
                  >
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
                    {expense.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {expense.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <p
                    className="font-bold text-lg"
                    onClick={() => {
                      setEditingExpense(expense);
                      setShowExpenseForm(true);
                    }}
                  >
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
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No expenses found</p>
            </CardContent>
          </Card>
        )}
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
