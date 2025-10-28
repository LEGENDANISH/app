import { z } from "zod";

// User Profile Schema
export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  currency: z.string().default("₹"),
  currencySymbol: z.string().default("INR"),
  monthlyBudget: z.number().min(0).default(0),
  createdAt: z.string(),
  onboardingCompleted: z.boolean().default(false),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type InsertUserProfile = Omit<UserProfile, "id" | "createdAt">;

// Expense Categories
export const expenseCategories = [
  "food",
  "quickCommerce",
  "transportation",
  "entertainment",
  "outingSocial",
  "personalCare",
  "health",
  "stationery",
  "subscriptions",
  "loans",
  "travel",
  "utilities",
  "shopping",
  "education",
  "miscellaneous",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

// Subcategories mapping
export const subcategories: Record<ExpenseCategory, string[]> = {
  food: ["Breakfast", "Lunch", "Dinner", "Snacks", "Desserts", "Drinks"],
  quickCommerce: [
    "Swiggy Instamart",
    "Zepto",
    "Zomato",
    "BigBasket",
    "Flipkart Minutes",
    "JioMart",
    "Blinkit",
    "Dunzo",
  ],
  transportation: [
    "Ola",
    "Uber",
    "Public Transport",
    "Fuel",
    "Bike/Scooter Rental",
    "Parking",
  ],
  entertainment: ["Gaming", "Movies", "Events", "Books", "Music"],
  outingSocial: [
    "Restaurant Dining",
    "Cafes",
    "Weekend Trips",
    "Activities",
    "Friends Hangout",
    "Gifts",
  ],
  personalCare: [
    "Makeup",
    "Salon/Grooming",
    "Toiletries",
    "Clothing",
    "Footwear",
    "Accessories",
  ],
  health: [
    "Medicines",
    "Doctor Visits",
    "Lab Tests",
    "Vaccinations",
    "Gym/Fitness",
    "Yoga/Wellness",
  ],
  stationery: [
    "Writing Materials",
    "Notebooks",
    "Printing",
    "Office Supplies",
    "Tech Accessories",
  ],
  subscriptions: [
    "Phone Recharge",
    "YouTube Premium",
    "Spotify",
    "Netflix",
    "Disney+ Hotstar",
    "Amazon Prime",
    "Zepto Plus",
    "Zomato Gold",
    "Swiggy One",
    "Blinkit Plus",
  ],
  loans: ["Loaned to Friends", "Borrowed", "EMI"],
  travel: [
    "Movie Tickets",
    "Train Tickets",
    "Flight Tickets",
    "Bus Tickets",
    "Hotel Bookings",
    "Event Tickets",
  ],
  utilities: [
    "Electricity",
    "Water",
    "Internet/WiFi",
    "Landline",
    "Rent",
    "Maintenance",
  ],
  shopping: [
    "Electronics",
    "Home Appliances",
    "Furniture",
    "Gadgets",
    "General Shopping",
  ],
  education: [
    "Courses",
    "Books & Materials",
    "Tuition Fees",
    "Online Learning",
    "Certifications",
  ],
  miscellaneous: [
    "Donations",
    "Bank Charges",
    "Postal Services",
    "Repairs",
    "Household Items",
  ],
};

// Payment Methods
export const paymentMethods = [
  "Cash",
  "Card",
  "UPI",
  "Net Banking",
  "Wallet",
] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

// Expense Schema
export const expenseSchema = z.object({
  id: z.string(),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(expenseCategories),
  subcategory: z.string().optional(),
  paymentMethod: z.enum(paymentMethods),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  date: z.string(), // ISO date string
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertExpenseSchema = expenseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Expense = z.infer<typeof expenseSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// Budget Schema
export const budgetSchema = z.object({
  id: z.string(),
  type: z.enum(["monthly", "category", "weekly", "custom"]),
  amount: z.number().positive(),
  category: z.enum(expenseCategories).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdAt: z.string(),
});

export const insertBudgetSchema = budgetSchema.omit({
  id: true,
  createdAt: true,
});

export type Budget = z.infer<typeof budgetSchema>;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

// Subscription Schema
export const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive(),
  category: z.string().default("subscriptions"),
  renewalDate: z.string(), // ISO date string
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).default("monthly"),
  isActive: z.boolean().default(true),
  reminderDays: z.number().default(3),
  createdAt: z.string(),
});

export const insertSubscriptionSchema = subscriptionSchema.omit({
  id: true,
  createdAt: true,
});

export type Subscription = z.infer<typeof subscriptionSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Loan Schema
export const loanSchema = z.object({
  id: z.string(),
  type: z.enum(["loaned", "borrowed"]),
  personName: z.string().min(1, "Person name is required"),
  amount: z.number().positive(),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "paid"]).default("pending"),
  description: z.string().default(""),
  createdAt: z.string(),
  paidAt: z.string().optional(),
});

export const insertLoanSchema = loanSchema.omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export type Loan = z.infer<typeof loanSchema>;
export type InsertLoan = z.infer<typeof insertLoanSchema>;

// Saved Filter Schema
export const savedFilterSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  filters: z.object({
    categories: z.array(z.enum(expenseCategories)).optional(),
    paymentMethods: z.array(z.enum(paymentMethods)).optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    tags: z.array(z.string()).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
  createdAt: z.string(),
});

export const insertSavedFilterSchema = savedFilterSchema.omit({
  id: true,
  createdAt: true,
});

export type SavedFilter = z.infer<typeof savedFilterSchema>;
export type InsertSavedFilter = z.infer<typeof insertSavedFilterSchema>;

// Category Icons and Colors
export const categoryConfig: Record<
  ExpenseCategory,
  { icon: string; color: string; label: string }
> = {
  food: { icon: "UtensilsCrossed", color: "hsl(35, 91%, 62%)", label: "Food & Dining" },
  quickCommerce: { icon: "ShoppingCart", color: "hsl(280, 65%, 60%)", label: "Quick Commerce" },
  transportation: { icon: "Car", color: "hsl(221, 83%, 53%)", label: "Transportation" },
  entertainment: { icon: "Gamepad2", color: "hsl(340, 82%, 52%)", label: "Entertainment" },
  outingSocial: { icon: "Users", color: "hsl(142, 76%, 36%)", label: "Outing & Social" },
  personalCare: { icon: "Sparkles", color: "hsl(280, 65%, 60%)", label: "Personal Care" },
  health: { icon: "HeartPulse", color: "hsl(0, 84%, 42%)", label: "Health & Medical" },
  stationery: { icon: "PenTool", color: "hsl(221, 83%, 53%)", label: "Stationery & Office" },
  subscriptions: { icon: "CreditCard", color: "hsl(142, 76%, 36%)", label: "Subscriptions" },
  loans: { icon: "Wallet", color: "hsl(35, 91%, 62%)", label: "Loans & Lending" },
  travel: { icon: "Plane", color: "hsl(221, 83%, 53%)", label: "Travel & Tickets" },
  utilities: { icon: "Zap", color: "hsl(35, 91%, 62%)", label: "Utilities & Bills" },
  shopping: { icon: "ShoppingBag", color: "hsl(280, 65%, 60%)", label: "Shopping" },
  education: { icon: "GraduationCap", color: "hsl(142, 76%, 36%)", label: "Education" },
  miscellaneous: { icon: "MoreHorizontal", color: "hsl(240, 5%, 35%)", label: "Miscellaneous" },
};
