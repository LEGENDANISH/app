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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, CreditCard, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { insertSubscriptionSchema, type Subscription } from "@shared/schema";
import { format, parseISO, addDays, addMonths, addYears, differenceInDays } from "date-fns";

export default function Subscriptions() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: () => storage.getUserProfile(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["/api/subscriptions"],
    queryFn: () => storage.getAllSubscriptions(),
  });

  const activeSubscriptions = subscriptions.filter((s) => s.isActive);
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
    const monthly = sub.frequency === "monthly" ? sub.amount :
                    sub.frequency === "yearly" ? sub.amount / 12 :
                    sub.frequency === "weekly" ? sub.amount * 4 :
                    sub.amount * 30;
    return sum + monthly;
  }, 0);

  const form = useForm({
    resolver: zodResolver(insertSubscriptionSchema),
    defaultValues: editingSub || {
      name: "",
      amount: 0,
      category: "subscriptions",
      renewalDate: format(new Date(), "yyyy-MM-dd"),
      frequency: "monthly" as const,
      isActive: true,
      reminderDays: 3,
    },
  });

  const handleSubmit = async (data: any) => {
    const subscription: Subscription = {
      ...data,
      id: editingSub?.id || crypto.randomUUID(),
      createdAt: editingSub?.createdAt || new Date().toISOString(),
    };

    if (editingSub) {
      await storage.updateSubscription(subscription);
    } else {
      await storage.addSubscription(subscription);
    }

    await queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    setShowForm(false);
    setEditingSub(null);
    form.reset();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this subscription?")) {
      await storage.deleteSubscription(id);
      await queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    }
  };

  const handleToggleActive = async (sub: Subscription) => {
    await storage.updateSubscription({ ...sub, isActive: !sub.isActive });
    await queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
  };

  const getDaysUntilRenewal = (renewalDate: string) => {
    return differenceInDays(parseISO(renewalDate), new Date());
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
            <h1 className="text-2xl font-bold">Subscriptions</h1>
            <p className="text-sm text-muted-foreground">
              {activeSubscriptions.length} active
            </p>
          </div>
          <Button
            size="icon"
            onClick={() => {
              setEditingSub(null);
              form.reset();
              setShowForm(true);
            }}
            className="rounded-full"
            data-testid="button-add-subscription"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card className="bg-gradient-to-br from-chart-2 to-chart-3 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 opacity-90" />
              <p className="text-sm opacity-90">Monthly Cost</p>
            </div>
            <p className="text-3xl font-bold" data-testid="text-total-monthly">
              {profile?.currency}{totalMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm opacity-75 mt-1">
              {profile?.currency}{(totalMonthly * 12).toLocaleString("en-IN", { maximumFractionDigits: 0 })} per year
            </p>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-3">Active Subscriptions</h2>
          <div className="space-y-3">
            {activeSubscriptions.map((sub) => {
              const daysUntil = getDaysUntilRenewal(sub.renewalDate);
              const isUpcoming = daysUntil <= sub.reminderDays && daysUntil >= 0;

              return (
                <Card
                  key={sub.id}
                  className={`hover-elevate cursor-pointer ${
                    isUpcoming ? "ring-2 ring-yellow-500" : ""
                  }`}
                  onClick={() => {
                    setEditingSub(sub);
                    form.reset(sub);
                    setShowForm(true);
                  }}
                  data-testid={`card-subscription-${sub.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{sub.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {sub.frequency} • {format(parseISO(sub.renewalDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {profile?.currency}{sub.amount.toLocaleString("en-IN")}
                        </p>
                        {isUpcoming && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Renews in {daysUntil}d
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Switch
                        checked={sub.isActive}
                        onCheckedChange={() => handleToggleActive(sub)}
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`switch-active-${sub.id}`}
                      />
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sub.id);
                        }}
                        data-testid={`button-delete-${sub.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {activeSubscriptions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">No active subscriptions</p>
                  <p className="text-sm text-muted-foreground">
                    Tap the + button to add one
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {subscriptions.filter((s) => !s.isActive).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Inactive Subscriptions</h2>
            <div className="space-y-3">
              {subscriptions
                .filter((s) => !s.isActive)
                .map((sub) => (
                  <Card key={sub.id} className="opacity-60" data-testid={`card-subscription-inactive-${sub.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{sub.name}</p>
                        <p className="font-bold">
                          {profile?.currency}{sub.amount}
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
              {editingSub ? "Edit Subscription" : "Add Subscription"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Netflix, Spotify, etc."
                          {...field}
                          className="h-12"
                          data-testid="input-subscription-name"
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
                            data-testid="input-subscription-amount"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12" data-testid="select-frequency">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="renewalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Renewal Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="date"
                            {...field}
                            className="pl-10 h-12"
                            data-testid="input-renewal-date"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-subscription-active"
                          />
                        </FormControl>
                        <Label>Active</Label>
                      </FormItem>
                    )}
                  />
                </div>

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
                  <Button type="submit" className="flex-1 h-12" data-testid="button-save-subscription">
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
