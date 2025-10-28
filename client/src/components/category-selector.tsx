import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search } from "lucide-react";
import * as Icons from "lucide-react";
import { categoryConfig, subcategories, type ExpenseCategory } from "@shared/schema";

interface CategorySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (category: ExpenseCategory, subcategory?: string) => void;
  selectedCategory?: ExpenseCategory;
}

export function CategorySelector({
  open,
  onOpenChange,
  onSelect,
  selectedCategory,
}: CategorySelectorProps) {
  const [search, setSearch] = useState("");
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ExpenseCategory | null>(null);

  const categories = Object.entries(categoryConfig).filter(([, config]) =>
    config.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleCategoryClick = (category: ExpenseCategory) => {
    const subs = subcategories[category];
    if (subs && subs.length > 0) {
      setActiveCategory(category);
      setShowSubcategories(true);
    } else {
      onSelect(category);
      onOpenChange(false);
      setShowSubcategories(false);
    }
  };

  const handleSubcategoryClick = (subcategory: string) => {
    if (activeCategory) {
      onSelect(activeCategory, subcategory);
      onOpenChange(false);
      setShowSubcategories(false);
      setActiveCategory(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>
            {showSubcategories
              ? categoryConfig[activeCategory!]?.label
              : "Select Category"}
          </SheetTitle>
          {showSubcategories && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSubcategories(false);
                setActiveCategory(null);
              }}
              className="absolute left-4 top-6"
              data-testid="button-back-categories"
            >
              ← Back
            </Button>
          )}
        </SheetHeader>

        {!showSubcategories && (
          <div className="px-6 py-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11"
                data-testid="input-search-category"
              />
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-6 py-4">
          {!showSubcategories ? (
            <div className="grid grid-cols-3 gap-4">
              {categories.map(([key, config]) => {
                const IconComponent = Icons[config.icon as keyof typeof Icons] as any;
                const isSelected = selectedCategory === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryClick(key as ExpenseCategory)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all hover-elevate active-elevate-2 ${
                      isSelected
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "bg-card"
                    }`}
                    data-testid={`button-category-${key}`}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <IconComponent
                        className="w-7 h-7"
                        style={{ color: config.color }}
                      />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-left"
                onClick={() => handleSubcategoryClick("")}
                data-testid="button-subcategory-none"
              >
                No specific subcategory
              </Button>
              {activeCategory &&
                subcategories[activeCategory]?.map((sub) => (
                  <Button
                    key={sub}
                    variant="outline"
                    className="w-full justify-start h-12 text-left"
                    onClick={() => handleSubcategoryClick(sub)}
                    data-testid={`button-subcategory-${sub.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {sub}
                  </Button>
                ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
