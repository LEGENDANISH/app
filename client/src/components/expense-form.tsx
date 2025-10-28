import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { CategorySelector } from "./category-selector";
import { insertExpenseSchema, paymentMethods, categoryConfig, type ExpenseCategory } from "@shared/schema";
import * as Icons from "lucide-react";
import { Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  defaultValues?: any;
  currency: string;
}

export function ExpenseForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  currency,
}: ExpenseFormProps) {
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const form = useForm({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: defaultValues || {
      amount: 0,
      category: "food" as ExpenseCategory,
      subcategory: "",
      paymentMethod: "UPI",
      description: "",
      tags: [],
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const selectedCategory = form.watch("category");
  const tags = form.watch("tags") || [];

  const handleSubmit = (data: any) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      form.setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    form.setValue("tags", tags.filter((t: string) => t !== tag));
  };

  const IconComponent = Icons[categoryConfig[selectedCategory]?.icon as keyof typeof Icons] as any;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[90vh] rounded-t-3xl p-0 flex flex-col"
        >
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>
              {defaultValues ? "Edit Expense" : "Add Expense"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                            {currency}
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="pl-10 h-14 text-xl font-semibold"
                            data-testid="input-amount"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-14 justify-start gap-3"
                          onClick={() => setShowCategorySelector(true)}
                          data-testid="button-select-category"
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: `${categoryConfig[selectedCategory]?.color}15`,
                            }}
                          >
                            <IconComponent
                              className="w-5 h-5"
                              style={{ color: categoryConfig[selectedCategory]?.color }}
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">
                              {categoryConfig[selectedCategory]?.label}
                            </div>
                            {form.watch("subcategory") && (
                              <div className="text-xs text-muted-foreground">
                                {form.watch("subcategory")}
                              </div>
                            )}
                          </div>
                        </Button>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12" data-testid="select-payment">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="date"
                            {...field}
                            className="pl-10 h-12"
                            data-testid="input-date"
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
                          placeholder="Add notes about this expense..."
                          {...field}
                          className="resize-none"
                          rows={3}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Tags (Optional)</FormLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="pl-9 h-11"
                        data-testid="input-tag"
                      />
                    </div>
                    <Button type="button" onClick={addTag} variant="secondary" data-testid="button-add-tag">
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag: string) => (
                        <div
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                            data-testid={`button-remove-tag-${tag}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 left-0 right-0 bg-background pt-4 pb-6 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-12"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 h-12" data-testid="button-save-expense">
                    Save Expense
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      <CategorySelector
        open={showCategorySelector}
        onOpenChange={setShowCategorySelector}
        onSelect={(category, subcategory) => {
          form.setValue("category", category);
          form.setValue("subcategory", subcategory || "");
          setShowCategorySelector(false);
        }}
        selectedCategory={selectedCategory}
      />
    </>
  );
}
