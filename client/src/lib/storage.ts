import localforage from "localforage";
import type {
  UserProfile,
  Expense,
  Budget,
  Subscription,
  Loan,
  SavedFilter,
} from "@shared/schema";

// Initialize localforage instances
const userStore = localforage.createInstance({
  name: "expensewise",
  storeName: "users",
});

const expenseStore = localforage.createInstance({
  name: "expensewise",
  storeName: "expenses",
});

const budgetStore = localforage.createInstance({
  name: "expensewise",
  storeName: "budgets",
});

const subscriptionStore = localforage.createInstance({
  name: "expensewise",
  storeName: "subscriptions",
});

const loanStore = localforage.createInstance({
  name: "expensewise",
  storeName: "loans",
});

const filterStore = localforage.createInstance({
  name: "expensewise",
  storeName: "filters",
});

// User Profile
export const storage = {
  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    return await userStore.getItem<UserProfile>("profile");
  },

  async setUserProfile(profile: UserProfile): Promise<void> {
    await userStore.setItem("profile", profile);
  },

  // Expenses
  async getAllExpenses(): Promise<Expense[]> {
    const expenses: Expense[] = [];
    await expenseStore.iterate<Expense, void>((value) => {
      expenses.push(value);
    });
    return expenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  async getExpense(id: string): Promise<Expense | null> {
    return await expenseStore.getItem<Expense>(id);
  },

  async addExpense(expense: Expense): Promise<void> {
    await expenseStore.setItem(expense.id, expense);
  },

  async updateExpense(expense: Expense): Promise<void> {
    await expenseStore.setItem(expense.id, expense);
  },

  async deleteExpense(id: string): Promise<void> {
    await expenseStore.removeItem(id);
  },

  async deleteMultipleExpenses(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => expenseStore.removeItem(id)));
  },

  // Budgets
  async getAllBudgets(): Promise<Budget[]> {
    const budgets: Budget[] = [];
    await budgetStore.iterate<Budget, void>((value) => {
      budgets.push(value);
    });
    return budgets;
  },

  async addBudget(budget: Budget): Promise<void> {
    await budgetStore.setItem(budget.id, budget);
  },

  async updateBudget(budget: Budget): Promise<void> {
    await budgetStore.setItem(budget.id, budget);
  },

  async deleteBudget(id: string): Promise<void> {
    await budgetStore.removeItem(id);
  },

  // Subscriptions
  async getAllSubscriptions(): Promise<Subscription[]> {
    const subscriptions: Subscription[] = [];
    await subscriptionStore.iterate<Subscription, void>((value) => {
      subscriptions.push(value);
    });
    return subscriptions.sort((a, b) =>
      new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
    );
  },

  async addSubscription(subscription: Subscription): Promise<void> {
    await subscriptionStore.setItem(subscription.id, subscription);
  },

  async updateSubscription(subscription: Subscription): Promise<void> {
    await subscriptionStore.setItem(subscription.id, subscription);
  },

  async deleteSubscription(id: string): Promise<void> {
    await subscriptionStore.removeItem(id);
  },

  // Loans
  async getAllLoans(): Promise<Loan[]> {
    const loans: Loan[] = [];
    await loanStore.iterate<Loan, void>((value) => {
      loans.push(value);
    });
    return loans.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async addLoan(loan: Loan): Promise<void> {
    await loanStore.setItem(loan.id, loan);
  },

  async updateLoan(loan: Loan): Promise<void> {
    await loanStore.setItem(loan.id, loan);
  },

  async deleteLoan(id: string): Promise<void> {
    await loanStore.removeItem(id);
  },

  // Saved Filters
  async getAllFilters(): Promise<SavedFilter[]> {
    const filters: SavedFilter[] = [];
    await filterStore.iterate<SavedFilter, void>((value) => {
      filters.push(value);
    });
    return filters;
  },

  async addFilter(filter: SavedFilter): Promise<void> {
    await filterStore.setItem(filter.id, filter);
  },

  async deleteFilter(id: string): Promise<void> {
    await filterStore.removeItem(id);
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    await Promise.all([
      userStore.clear(),
      expenseStore.clear(),
      budgetStore.clear(),
      subscriptionStore.clear(),
      loanStore.clear(),
      filterStore.clear(),
    ]);
  },
};
