import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storage } from "@/lib/storage";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, CheckCircle2, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { insertLoanSchema, type Loan } from "@shared/schema";
import { format, parseISO } from "date-fns";

export default function Loans() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: () => storage.getUserProfile(),
  });

  const { data: loans = [] } = useQuery({
    queryKey: ["/api/loans"],
    queryFn: () => storage.getAllLoans(),
  });

  const loanedOut = loans.filter((l) => l.type === "loaned" && l.status === "pending");
  const borrowed = loans.filter((l) => l.type === "borrowed" && l.status === "pending");
  
  const totalLoaned = loanedOut.reduce((sum, loan) => sum + loan.amount, 0);
  const totalBorrowed = borrowed.reduce((sum, loan) => sum + loan.amount, 0);

  const form = useForm({
    resolver: zodResolver(insertLoanSchema),
    defaultValues: editingLoan || {
      type: "loaned" as const,
      personName: "",
      amount: 0,
      dueDate: "",
      status: "pending" as const,
      description: "",
    },
  });

  const handleSubmit = async (data: any) => {
    const loan: Loan = {
      ...data,
      id: editingLoan?.id || crypto.randomUUID(),
      createdAt: editingLoan?.createdAt || new Date().toISOString(),
      paidAt: data.status === "paid" ? new Date().toISOString() : undefined,
    };

    if (editingLoan) {
      await storage.updateLoan(loan);
    } else {
      await storage.addLoan(loan);
    }

    await queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
    setShowForm(false);
    setEditingLoan(null);
    form.reset();
  };

  const markAsPaid = async (loan: Loan) => {
    await storage.updateLoan({
      ...loan,
      status: "paid",
      paidAt: new Date().toISOString(),
    });
    await queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
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
            <h1 className="text-2xl font-bold">Loans & Lending</h1>
            <p className="text-sm text-muted-foreground">Track money flow</p>
          </div>
          <Button
            size="icon"
            onClick={() => {
              setEditingLoan(null);
              form.reset();
              setShowForm(true);
            }}
            className="rounded-full"
            data-testid="button-add-loan"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary to-chart-1 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 opacity-90" />
                <p className="text-xs opacity-90">You Lent</p>
              </div>
              <p className="text-2xl font-bold" data-testid="text-total-loaned">
                {profile?.currency}{totalLoaned.toLocaleString("en-IN")}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {loanedOut.length} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive to-chart-5 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 opacity-90" />
                <p className="text-xs opacity-90">You Owe</p>
              </div>
              <p className="text-2xl font-bold" data-testid="text-total-borrowed">
                {profile?.currency}{totalBorrowed.toLocaleString("en-IN")}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {borrowed.length} pending
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Money Lent Out
          </h2>
          <div className="space-y-3">
            {loanedOut.map((loan) => (
              <Card
                key={loan.id}
                className="hover-elevate cursor-pointer"
                onClick={() => {
                  setEditingLoan(loan);
                  form.reset(loan);
                  setShowForm(true);
                }}
                data-testid={`card-loan-${loan.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{loan.personName}</p>
                      {loan.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {loan.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(loan.createdAt), "MMM dd, yyyy")}
                        {loan.dueDate && ` • Due: ${format(parseISO(loan.dueDate), "MMM dd")}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">
                        +{profile?.currency}{loan.amount.toLocaleString("en-IN")}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsPaid(loan);
                        }}
                        data-testid={`button-mark-paid-${loan.id}`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark Paid
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {loanedOut.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    No pending loans lent out
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-destructive" />
            Money Borrowed
          </h2>
          <div className="space-y-3">
            {borrowed.map((loan) => (
              <Card
                key={loan.id}
                className="hover-elevate cursor-pointer"
                onClick={() => {
                  setEditingLoan(loan);
                  form.reset(loan);
                  setShowForm(true);
                }}
                data-testid={`card-borrowed-${loan.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{loan.personName}</p>
                      {loan.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {loan.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(loan.createdAt), "MMM dd, yyyy")}
                        {loan.dueDate && ` • Due: ${format(parseISO(loan.dueDate), "MMM dd")}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-destructive">
                        -{profile?.currency}{loan.amount.toLocaleString("en-IN")}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsPaid(loan);
                        }}
                        data-testid={`button-mark-repaid-${loan.id}`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark Repaid
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {borrowed.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    No pending borrowed amounts
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {loans.filter((l) => l.status === "paid").length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Completed</h2>
            <div className="space-y-2">
              {loans
                .filter((l) => l.status === "paid")
                .map((loan) => (
                  <Card key={loan.id} className="opacity-60" data-testid={`card-completed-${loan.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{loan.personName}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Settled
                          </Badge>
                        </div>
                        <p className={`font-bold ${loan.type === "loaned" ? "text-primary" : "text-destructive"}`}>
                          {loan.type === "loaned" ? "+" : "-"}
                          {profile?.currency}{loan.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>
              {editingLoan ? "Edit Loan" : "Add Loan"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12" data-testid="select-loan-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="loaned">I Lent Money</SelectItem>
                          <SelectItem value="borrowed">I Borrowed Money</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Person Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className="h-12"
                          data-testid="input-person-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                            {profile?.currency}
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="pl-10 h-12"
                            data-testid="input-loan-amount"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ""}
                            className="pl-10 h-12"
                            data-testid="input-due-date"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Purpose or notes..."
                          {...field}
                          className="resize-none"
                          rows={3}
                          data-testid="input-loan-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {editingLoan && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12" data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid/Settled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="sticky bottom-0 left-0 right-0 bg-background pt-4 pb-6 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-12"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 h-12" data-testid="button-save-loan">
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
