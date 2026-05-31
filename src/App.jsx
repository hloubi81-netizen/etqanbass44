import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import { SubscriptionProvider } from './hooks/useSubscription.jsx';
import { LangProvider } from './hooks/useLang.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { CurrencyProvider } from './hooks/useCurrency.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Groups = lazy(() => import('./pages/Groups'));
const Products = lazy(() => import('./pages/Products'));
const Warehouses = lazy(() => import('./pages/Warehouses'));
const CostCenters = lazy(() => import('./pages/CostCenters'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Currencies = lazy(() => import('./pages/Currencies'));
const InvoicePatterns = lazy(() => import('./pages/InvoicePatterns'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Vouchers = lazy(() => import('./pages/Vouchers'));
const StockTransfers = lazy(() => import('./pages/StockTransfers'));
const InventoryCount = lazy(() => import('./pages/InventoryCount'));
const ProductMovement = lazy(() => import('./pages/reports/ProductMovement'));
const AccountStatement = lazy(() => import('./pages/reports/AccountStatement'));
const Ledger = lazy(() => import('./pages/reports/Ledger'));
const TrialBalance = lazy(() => import('./pages/reports/TrialBalance'));
const Users = lazy(() => import('./pages/Users'));
const FinancialDashboard = lazy(() => import('./pages/financial/FinancialDashboard'));
const Branches = lazy(() => import('./pages/Branches'));
const BranchReport = lazy(() => import('./pages/reports/BranchReport'));
const CostManagement = lazy(() => import('./pages/costs/CostManagement'));
const CostReport = lazy(() => import('./pages/costs/CostReport'));
const SubscriptionManagement = lazy(() => import('./pages/SubscriptionManagement'));
const IncomeStatement = lazy(() => import('./pages/financial/IncomeStatement'));
const POS = lazy(() => import('./pages/pos/POS'));
const POSHistory = lazy(() => import('./pages/pos/POSHistory'));
const Employees = lazy(() => import('./pages/hr/Employees'));
const Attendance = lazy(() => import('./pages/hr/Attendance'));
const Payroll = lazy(() => import('./pages/hr/Payroll'));
const BalanceSheet = lazy(() => import('./pages/financial/BalanceSheet'));
const AdvancedReports = lazy(() => import('./pages/reports/AdvancedReports'));
const FixedAssets = lazy(() => import('./pages/assets/FixedAssets'));
const CashFlow = lazy(() => import('./pages/financial/CashFlow'));
const Settings = lazy(() => import('./pages/Settings'));
const LeaveRequests = lazy(() => import('./pages/hr/LeaveRequests'));
const BankReconciliation = lazy(() => import('./pages/accounting/BankReconciliation'));
const StockAlerts = lazy(() => import('./pages/inventory/StockAlerts'));
const ExpiryTracking = lazy(() => import('./pages/inventory/ExpiryTracking'));
const BarcodeManagement = lazy(() => import('./pages/inventory/BarcodeManagement'));
const ActivityLogPage = lazy(() => import('./pages/reports/ActivityLog'));
const PurchaseOrders = lazy(() => import('./pages/orders/PurchaseOrders'));
const BudgetManagement = lazy(() => import('./pages/budget/BudgetManagement'));
const CRM = lazy(() => import('./pages/crm/CRM'));
const NotificationsCenter = lazy(() => import('./pages/notifications/NotificationsCenter'));
const CustomReports = lazy(() => import('./pages/reports/CustomReports'));
const SalesDashboard = lazy(() => import('./pages/reports/SalesDashboard'));
const LoyaltyProgram = lazy(() => import('./pages/loyalty/LoyaltyProgram'));
const TaxReport = lazy(() => import('./pages/reports/TaxReport'));
const About = lazy(() => import('./pages/About'));
const UserGuide = lazy(() => import('./pages/UserGuide'));
const Contact = lazy(() => import('./pages/Contact'));
const Messages = lazy(() => import('./pages/Messages'));
const PublicContact = lazy(() => import('./pages/PublicContact'));
const SupportRequests = lazy(() => import('./pages/SupportRequests'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/products" element={<Products />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/cost-centers" element={<CostCenters />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/currencies" element={<Currencies />} />
        <Route path="/invoice-patterns" element={<InvoicePatterns />} />
        <Route path="/invoices/:type" element={<Invoices />} />
        <Route path="/vouchers/:type" element={<Vouchers />} />
        <Route path="/transfers" element={<StockTransfers />} />
        <Route path="/inventory-count" element={<InventoryCount />} />
        <Route path="/reports/product-movement" element={<ProductMovement />} />
        <Route path="/reports/client-movement" element={<ProductMovement />} />
        <Route path="/reports/supplier-movement" element={<ProductMovement />} />
        <Route path="/reports/client-statement" element={<AccountStatement />} />
        <Route path="/reports/supplier-statement" element={<AccountStatement />} />
        <Route path="/reports/ledger" element={<Ledger />} />
        <Route path="/reports/trial-balance" element={<TrialBalance />} />
        <Route path="/users" element={<Users />} />
        <Route path="/financial/dashboard" element={<FinancialDashboard />} />
        <Route path="/financial/income-statement" element={<IncomeStatement />} />
        <Route path="/financial/balance-sheet" element={<BalanceSheet />} />
        <Route path="/financial/cash-flow" element={<CashFlow />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/reports/branches" element={<BranchReport />} />
        <Route path="/costs/management" element={<CostManagement />} />
        <Route path="/costs/report" element={<CostReport />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/pos/history" element={<POSHistory />} />
        <Route path="/hr/employees" element={<Employees />} />
        <Route path="/hr/attendance" element={<Attendance />} />
        <Route path="/hr/payroll" element={<Payroll />} />
        <Route path="/reports/advanced" element={<AdvancedReports />} />
        <Route path="/assets" element={<FixedAssets />} />
        <Route path="/subscriptions" element={<SubscriptionManagement />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/hr/leaves" element={<LeaveRequests />} />
        <Route path="/accounting/bank-reconciliation" element={<BankReconciliation />} />
        <Route path="/inventory/stock-alerts" element={<StockAlerts />} />
        <Route path="/inventory/expiry" element={<ExpiryTracking />} />
        <Route path="/inventory/barcode" element={<BarcodeManagement />} />
        <Route path="/reports/activity-log" element={<ActivityLogPage />} />
        <Route path="/orders" element={<PurchaseOrders />} />
        <Route path="/budget" element={<BudgetManagement />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/notifications" element={<NotificationsCenter />} />
        <Route path="/reports/custom" element={<CustomReports />} />
        <Route path="/reports/sales-dashboard" element={<SalesDashboard />} />
        <Route path="/loyalty" element={<LoyaltyProgram />} />
        <Route path="/reports/tax" element={<TaxReport />} />
        <Route path="/user-guide" element={<UserGuide />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/messages" element={<Messages />} />
      </Route>
      <Route path="/support-requests" element={<SupportRequests />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <LangProvider>
      <CurrencyProvider>
      <SubscriptionProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/contact-us" element={<Suspense fallback={<PageLoader />}><PublicContact /></Suspense>} />
            <Route path="*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
      </SubscriptionProvider>
      </CurrencyProvider>
      </LangProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App