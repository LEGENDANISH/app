# ExpenseWise Mobile App - Design Guidelines

## Design Approach

**Selected Approach:** Hybrid (Material Design Foundation + Expense Tracking App Patterns)

**Justification:** ExpenseWise is a data-intensive mobile application requiring robust information architecture and frequent user interactions. Material Design provides excellent patterns for mobile data management, while successful expense trackers (Wallet, Spendee, MoneyLover) offer proven UX patterns for financial applications.

**Key Design Principles:**
- **Glanceable Information**: Critical financial data visible at a glance
- **Touch-First Interactions**: Optimized tap targets, swipe gestures, and bottom-sheet patterns
- **Progressive Disclosure**: Complex features accessible without overwhelming the primary interface
- **Trust Through Clarity**: Transparent data hierarchy builds user confidence in financial tracking

---

## Typography

**Font Family:** System fonts for optimal performance and native feel
- **iOS:** SF Pro Display/Text
- **Android:** Roboto

**Type Scale:**
- **Hero Numbers:** 36-48px (bold) - Total spent, budget amounts
- **Section Headers:** 20-24px (semi-bold) - Dashboard sections, category names
- **Body Text:** 16px (regular) - Transaction descriptions, labels
- **Supporting Text:** 14px (regular) - Dates, metadata, tags
- **Captions:** 12px (medium) - Chart labels, category percentages

**Special Treatments:**
- **Currency Values:** Tabular numbers for alignment
- **Negative Amounts:** Red with minus symbol
- **Percentages:** Uppercase, medium weight for budget progress

---

## Layout System

**Spacing Scale:** Use units of 4, 8, 12, 16, 24, 32
- **Component Padding:** 16px standard, 24px for cards
- **Section Spacing:** 24-32px between major sections
- **List Item Padding:** 16px vertical, 16px horizontal
- **Screen Margins:** 16px horizontal on mobile

**Grid System:**
- **Single Column:** Primary layout for mobile
- **2-Column Grid:** Summary cards, category quick-views
- **Flexible Grid:** Category icons (3-4 columns), chart legends

**Safe Areas:** 
- Account for iOS notch/dynamic island with 44px top padding
- Bottom navigation 80px height + home indicator space

---

## Component Library

### Core Navigation
**Bottom Tab Bar** (Primary Navigation)
- **Height:** 80px (including safe area)
- **Icons:** 24px with labels below
- **Tabs:** Dashboard, Analytics, Add (+), Categories, Profile
- **Active State:** Icon color accent, 3px top border indicator

**Top App Bar**
- **Height:** 56px + safe area
- **Elements:** Back/menu icon (left), page title (center), actions (right)
- **Transparent Variant:** For scrollable content with blur effect

### Data Display

**Summary Cards**
- **Border Radius:** 16px
- **Shadow:** Elevation 2 (subtle)
- **Padding:** 20px
- **Content:** Icon (32px) + Label + Amount + Trend indicator
- **Layout:** 2-column grid for quick metrics

**Transaction List Items**
- **Height:** 72px
- **Structure:** Icon (40px circle) | Category + Description + Tags | Amount + Time
- **Divider:** 1px hairline between items
- **Swipe Actions:** Delete (red), Edit (blue), 80px width

**Category Cards**
- **Square Aspect:** Equal width/height
- **Icon:** 48px centered
- **Background:** Subtle gradient per category
- **Label:** 14px below icon
- **Active State:** Scale 0.95, deeper shadow

### Input Components

**Floating Action Button (FAB)**
- **Size:** 56px diameter
- **Position:** Bottom-right, 16px from edge
- **Icon:** Plus symbol, 24px
- **Shadow:** Elevation 6
- **Extended State:** Expands to show "Add Expense" on scroll up

**Form Fields**
- **Height:** 56px
- **Border Radius:** 12px
- **Border:** 1px solid, 2px on focus
- **Label:** Floating inside field
- **Icon Prefix:** 24px left-aligned for category/payment method

**Amount Input**
- **Display:** Large (32px) centered
- **Currency Symbol:** Prefix, same size
- **Numpad:** Custom with decimal point
- **Quick Amounts:** Chips below (₹50, ₹100, ₹500, ₹1000)

**Date/Time Picker**
- **Bottom Sheet:** Slides up from bottom
- **Quick Options:** Today, Yesterday, Custom
- **Calendar:** Month view with date selection
- **Height:** 60% of screen

### Data Visualization

**Charts (using Victory Native or React Native Chart Kit)**
- **Line Chart:** Spending trends, 200px height, gradient fill
- **Donut Chart:** Category breakdown, 180px diameter, center total
- **Bar Chart:** Category comparison, 160px height, rounded tops
- **Colors:** Category-specific, semi-transparent fills

**Progress Bars**
- **Height:** 12px
- **Border Radius:** 8px
- **Background:** Light gray (opacity 0.2)
- **Fill:** Gradient based on percentage
  - 0-70%: Green gradient
  - 70-90%: Yellow gradient
  - 90-100%: Red gradient
- **Label:** Percentage centered or right-aligned

### Feedback Elements

**Budget Alert Banners**
- **Height:** Auto, min 60px
- **Position:** Top of dashboard, dismissible
- **Icon:** 28px warning/info icon
- **Message:** 16px with action button
- **Background:** Alert color at 10% opacity

**Empty States**
- **Icon:** 80px illustration or emoji
- **Message:** 18px centered
- **Action Button:** Primary CTA below
- **Padding:** 48px vertical

**Toast Notifications**
- **Position:** Top with slide-down animation
- **Duration:** 3 seconds
- **Height:** 64px
- **Padding:** 16px
- **Icon + Message + Dismiss:** Left-to-right

### Modals & Bottom Sheets

**Bottom Sheets** (Preferred for mobile actions)
- **Border Radius:** 24px top corners
- **Handle:** 32px wide, 4px tall, centered, 12px from top
- **Max Height:** 90% of screen
- **Backdrop:** Black at 40% opacity
- **Scrollable:** For long content

**Category Selector**
- **Grid Layout:** 4 columns
- **Item Size:** 72px
- **Spacing:** 12px
- **Search Bar:** 48px at top
- **Recent Categories:** Top row, highlighted

---

## Dark Mode Strategy

**Color Adaptation:**
- **Background:** #121212 (pure dark) → #1E1E1E (surfaces)
- **Cards:** #2C2C2C with 1px subtle border
- **Text:** #FFFFFF (primary) → #B3B3B3 (secondary)
- **Charts:** Increase opacity, adjust gradients for visibility
- **Shadows:** Replace with subtle borders/highlights

**User Control:**
- **Toggle:** In Profile/Settings
- **Options:** Light, Dark, System Default
- **Persistence:** Save preference in local storage
- **Transition:** Smooth fade (300ms)

---

## Animations

**Use Sparingly:**
- **FAB Expand/Collapse:** 200ms ease-out
- **Bottom Sheet:** 300ms spring animation
- **Card Press:** Scale 0.98, 100ms
- **List Item Swipe:** Follow touch, reveal actions at 80px
- **Chart Entrance:** 500ms staggered fade-up
- **Page Transitions:** Native platform defaults

**Avoid:**
- Loading spinners (use skeleton screens)
- Excessive micro-interactions
- Decorative animations without purpose

---

## Platform-Specific Considerations

**iOS Patterns:**
- Swipe-to-delete on lists
- Native modal presentation styles
- SF Symbols for icons
- Haptic feedback on actions

**Android Patterns:**
- Material ripple effects on touch
- FAB as primary action
- Snackbar for confirmations
- Material Icons

**Cross-Platform Consistency:**
- Bottom navigation on both platforms
- Shared color system and spacing
- Unified card designs
- Consistent iconography style

---

## Accessibility

- **Touch Targets:** Minimum 44x44px for all interactive elements
- **Contrast Ratios:** WCAG AA compliant (4.5:1 for text)
- **Screen Reader:** Proper labels for all icons and actions
- **Font Scaling:** Support dynamic type sizes
- **Color Independence:** Don't rely solely on color for information (use icons + text)