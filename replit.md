# ExpenseWise - Expense Tracker App

## Overview
ExpenseWise is a comprehensive mobile-first expense tracking application that helps users monitor, analyze, and optimize their spending habits with beautiful visualizations and smart insights. All data is stored locally on the device using IndexedDB.

## Key Features

### Core Functionality
- **No Login Required**: Fully offline-first, data stored locally
- **Onboarding Flow**: Name, currency selection, monthly budget setup
- **Dashboard**: Time period filters (7/14/30 days), spending summary, top categories
- **Expense Management**: Add/edit/delete expenses with categories, subcategories, tags
- **14+ Categories**: Food, Quick Commerce, Transportation, Entertainment, Health, Subscriptions, Loans, etc.
- **Excel Import/Export**: Full support for .xlsx, .xls, .csv files
- **Dark Mode**: Beautiful light and dark themes with smooth transitions

### Advanced Features
- **Analytics**: Spending trends, category breakdowns, budget progress charts
- **Smart Insights**: Spending patterns, peak days, category comparisons
- **Subscriptions Tracker**: Renewal reminders, monthly cost calculations
- **Loans Manager**: Track money lent to friends and borrowed amounts
- **Search & Filter**: Find expenses by amount, category, tags, payment method
- **Budget Management**: Monthly budgets with real-time progress tracking

## Tech Stack

### Frontend
- **React** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **Shadcn UI** components
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **LocalForage** for IndexedDB storage
- **XLSX** for Excel import/export

### Storage
- **LocalForage** (IndexedDB) for local data persistence
- No backend required - fully client-side

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── theme-toggle.tsx
│   │   ├── bottom-nav.tsx
│   │   ├── category-selector.tsx
│   │   └── expense-form.tsx
│   ├── lib/
│   │   ├── storage.ts       # LocalForage storage layer
│   │   ├── theme-provider.tsx
│   │   └── queryClient.ts
│   ├── pages/
│   │   ├── onboarding.tsx   # User setup flow
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── analytics.tsx    # Charts and insights
│   │   ├── expenses.tsx     # All expenses list
│   │   ├── subscriptions.tsx
│   │   ├── loans.tsx
│   │   └── settings.tsx
│   ├── App.tsx
│   └── index.css
shared/
└── schema.ts               # Data models and types
```

## Data Models

### User Profile
- Name, currency, monthly budget
- Onboarding completion status

### Expense
- Amount, category, subcategory
- Payment method, description, tags
- Date, created/updated timestamps

### Budget
- Type (monthly/category/weekly/custom)
- Amount, date range

### Subscription
- Name, amount, renewal date
- Frequency, active status
- Reminder settings

### Loan
- Type (loaned/borrowed)
- Person name, amount, due date
- Status (pending/paid)

## Design System

### Colors
- **Primary**: Green (#10b981) for positive actions
- **Charts**: Multi-color palette for category visualization
- **Dark Mode**: Optimized dark theme with proper contrast

### Typography
- **Font**: Inter for clean, modern look
- **Scale**: Mobile-optimized sizes (12px - 48px)

### Layout
- **Mobile-First**: Optimized for touch interactions
- **Bottom Navigation**: Easy thumb access
- **Cards**: Rounded corners, subtle shadows
- **Spacing**: Consistent 4px/8px/16px/24px grid

## User Journey

1. **Onboarding** → Name + Currency + Budget
2. **Dashboard** → View spending summary
3. **Add Expense** → FAB button → Category selection
4. **Analytics** → View charts and insights
5. **Manage** → Edit/delete expenses
6. **Export** → Download Excel report

## Recent Changes
- Initial implementation with full feature set
- Onboarding flow with 3-step setup
- Dashboard with time period filters
- Expense management with category selector
- Analytics with charts (Line, Pie, Bar)
- Subscriptions tracker with renewal reminders
- Loans manager for lending tracking
- Settings with theme toggle
- Excel import/export functionality
- Local storage using IndexedDB

## User Preferences
- Clean, minimal, modern UI
- Mobile-first responsive design
- No authentication required
- All data stored locally
- Excel export capability
- Dark mode support
