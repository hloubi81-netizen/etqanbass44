import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Landmark, Wallet, RefreshCw, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Activity, CircleDollarSign,
  Building2, CreditCard, Banknote, AlertCircle, CheckCircle2,
  Clock, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Link } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";

const fmt = (n) => (n || 0).toLocaleString("ar-EG", { maximumFractionDigits: 0 });
const fmtFull = (n) => (n || 0).toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Keywords to identify banks and cashboxes in account names
const BANK_KEYWORDS = ["بنك", "bank", "مصرف", "مصرفي", "حساب بنكي", "تجاري", "الأهلي", "الراجحي", "ميسرة", "انتربنك", "الجزيرة", "فيصل"];
const CASH_KEYWORDS = ["خزينة", "صندوق", "كاش", "نقد", "نقدية", "cash", "صناديق", "خزن"];

function isBankAccount(acc) {
  const name = (acc.name || "").toLowerCase();
  return BANK_KEYWORDS.some(k => name.includes(k.toLowerCase()));
}

function isCashAccount(acc) {
  const name = (acc.name || "").toLowerCase();
  return CASH_KEYWORDS.some(k => name.includes(k.toLowerCase()));
}

function getBalance(acc) {
  // balance = debit_balance - credit_balance, or use balance field directly
  if (acc.balance !== undefined && acc.balance !== null) return acc.balance;
  return (acc.debit_balance || 0) - (acc.credit_balance || 0);
}

function BalanceCard({ icon: Icon, label, value, sub, color, trend, trendVal, loading }) {
  if (loading) return (
    <div className="h-28 rounded-xl bg-muted animate-pulse" />
  );
  const isPositive = value >= 0;
  return (
    <Card className={`overflow-hidden border-0 shadow-sm ${color}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium opacity-80 mb-1 truncate">{label}</p>
            <p className={`text-2xl font-bold ${isPositive ? "" : "text-red-600"}`}>{fmt(value)}</p>
            {sub && <p className="text-xs opacity-70 mt-1 truncate">{sub}</p>}
          </div>
          <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 ml-3">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/20">
            {trend >= 0
              ? <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
              : <TrendingDown className="h-3.5 w-3.5 text-red-300" />}
            <span className="text-xs opacity-80">{trend >= 0 ? "+" : ""}{fmt(trendVal)} هذا الشهر</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AccountRow({ acc, type, rank }) {
  const balance = getBalance(acc);
  const isPositive = balance >= 0;
  const pct = Math.min(Math.abs(balance) / 1000000 * 100, 100);
  const typeConfig = {
    bank: { color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-700", label: "بنك" },
    cash: { color: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-700", label: "خزينة" },
  };
  const cfg = typeConfig[type] || typeConfig.cash;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors group">
      <div className={`w-8 h-8 rounded-lg ${cfg.lightColor} flex items-center justify-center shrink-0`}>
        <span className={`text-xs font-bold ${cfg.textColor}`}>{rank}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-medium truncate">{acc.name}</p>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <Badge className={`text-[10px] px-1.5 py-0 ${cfg.lightColor} ${cfg.textColor} border-0`}>{cfg.label}</Badge>
            <span className={`text-sm font-bold ${isPositive ? "text-foreground" : "text-red-600"}`}>
              {isPositive ? "" : "-"}{fmt(Math.abs(balance))}
            </span>
          </div>
        </div>
        <Progress value={pct} className={`h-1.5 ${!isPositive ? "opacity-50" : ""}`} />
        {acc.account_number && (
          <p className="text-[10px] text-muted-foreground mt-1">رقم الحساب: {acc.account_number}</p>
        )}
      </div>
    </div>
  );
}

export default function LiquidityDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    const [accs, vcs] = await Promise.all([
      base44.entities.Account.list().catch(() => []),
      base44.entities.Voucher.list("-date", 500).catch(() => []),
    ]);

    setAccounts(accs);
    setVouchers(vcs);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Classify accounts
  const bankAccounts = accounts.filter(a => !a.is_parent && isBankAccount(a));
  const cashAccounts = accounts.filter(a => !a.is_parent && isCashAccount(a));

  // If no match found by keywords, fallback: try account numbers starting with common bank/cash codes
  const allLiquidAccounts = [...bankAccounts, ...cashAccounts];

  const totalBankBalance = bankAccounts.reduce((s, a) => s + getBalance(a), 0);
  const totalCashBalance = cashAccounts.reduce((s, a) => s + getBalance(a), 0);
  const totalLiquidity = totalBankBalance + totalCashBalance;

  // Sort by balance desc
  const sortedBanks = [...bankAccounts].sort((a, b) => getBalance(b) - getBalance(a));
  const sortedCash = [...cashAccounts].sort((a, b) => getBalance(b) - getBalance(a));

  // Monthly cash flow from vouchers
  const monthlyMap = {};
  vouchers.forEach(v => {
    if (!v.date) return;
    const month = v.date.substring(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { month, قبض: 0, دفع: 0, صافي: 0 };
    if (v.type === "سند قبض") monthlyMap[month]["قبض"] += v.amount || 0;
    if (v.type === "سند دفع") monthlyMap[month]["دفع"] += v.amount || 0;
  });
  Object.values(monthlyMap).forEach(m => { m["صافي"] = m["قبض"] - m["دفع"]; });
  const cashFlowData = Object.values(monthlyMap)
    .sort((a, b) => a.month > b.month ? 1 : -1)
    .slice(-6)
    .map(m => ({
      ...m,
      month: m.month.replace(/(\d{4})-(\d{2})/, (_, y, mo) => `${mo}/${y}`)
    }));

  // Recent vouchers
  const recentVouchers = vouchers.slice(0, 8);

  // This month stats
  const thisMonth = new Date().toISOString().substring(0, 7);
  const thisMonthVouchers = vouchers.filter(v => v.date?.startsWith(thisMonth));
  const monthReceipts = thisMonthVouchers.filter(v => v.type === "سند قبض").reduce((s, v) => s + (v.amount || 0), 0);
  const monthPayments = thisMonthVouchers.filter(v => v.type === "سند دفع").reduce((s, v) => s + (v.amount || 0), 0);
  const monthNet = monthReceipts - monthPayments;

  // Alerts: accounts with negative balance
  const negativeAccounts = allLiquidAccounts.filter(a => getBalance(a) < 0);

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            متابعة السيولة النقدية
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {lastUpdated ? `آخر تحديث: ${lastUpdated.toLocaleTimeString("ar-EG")}` : "جاري التحميل..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            تحديث لحظي
          </Button>
          <Link to="/accounts">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              دليل الحسابات
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert: Negative balances */}
      {!loading && negativeAccounts.length > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">تنبيه: أرصدة سالبة</p>
            <p className="text-xs text-red-600 mt-0.5">
              {negativeAccounts.map(a => a.name).join("، ")} — يرجى مراجعة هذه الحسابات
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard
          loading={loading}
          icon={CircleDollarSign}
          label="إجمالي السيولة المتاحة"
          value={totalLiquidity}
          sub={`${bankAccounts.length + cashAccounts.length} حساب مُتابَع`}
          color="bg-gradient-to-br from-blue-600 to-blue-800 text-white"
          trend={monthNet >= 0 ? 1 : -1}
          trendVal={monthNet}
        />
        <BalanceCard
          loading={loading}
          icon={Landmark}
          label="أرصدة البنوك"
          value={totalBankBalance}
          sub={`${bankAccounts.length} حساب بنكي`}
          color="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white"
        />
        <BalanceCard
          loading={loading}
          icon={Wallet}
          label="أرصدة الخزائن"
          value={totalCashBalance}
          sub={`${cashAccounts.length} خزينة`}
          color="bg-gradient-to-br from-emerald-600 to-teal-700 text-white"
        />
        <BalanceCard
          loading={loading}
          icon={Activity}
          label="صافي هذا الشهر"
          value={monthNet}
          sub={`قبض ${fmt(monthReceipts)} | دفع ${fmt(monthPayments)}`}
          color={monthNet >= 0
            ? "bg-gradient-to-br from-violet-600 to-purple-800 text-white"
            : "bg-gradient-to-br from-red-500 to-red-700 text-white"}
        />
      </div>

      {/* Bank Accounts + Cash Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Banks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Landmark className="h-4 w-4 text-blue-700" />
                </div>
                الحسابات البنكية
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-50 text-blue-700 border-0 text-xs">
                  {loading ? "..." : fmt(totalBankBalance)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : sortedBanks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <Landmark className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">لم يتم تصنيف حسابات بنكية</p>
                <p className="text-xs text-muted-foreground">أسماء الحسابات التي تحتوي على "بنك" أو "مصرف" ستظهر هنا</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sortedBanks.map((acc, i) => (
                  <AccountRow key={acc.id} acc={acc} type="bank" rank={i + 1} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cash */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-emerald-700" />
                </div>
                الخزائن النقدية
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs">
                  {loading ? "..." : fmt(totalCashBalance)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : sortedCash.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <Wallet className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">لم يتم تصنيف خزائن نقدية</p>
                <p className="text-xs text-muted-foreground">أسماء الحسابات التي تحتوي على "خزينة" أو "صندوق" ستظهر هنا</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sortedCash.map((acc, i) => (
                  <AccountRow key={acc.id} acc={acc} type="cash" rank={i + 1} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-violet-700" />
            </div>
            التدفقات النقدية — آخر 6 أشهر
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-52 rounded-lg bg-muted animate-pulse" />
          ) : cashFlowData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <Activity className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">لا توجد سندات مسجلة بعد</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cashFlowData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip formatter={(v, name) => [fmt(v), name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="قبض" stroke="#16a34a" fill="url(#recGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="دفع" stroke="#dc2626" fill="url(#payGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom: Monthly bar + Recent Vouchers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Monthly net */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-700" />
              </div>
              صافي التدفق الشهري
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-44 rounded-lg bg-muted animate-pulse" />
            ) : cashFlowData.length === 0 ? (
              <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">لا توجد بيانات</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={cashFlowData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="صافي" radius={[3, 3, 0, 0]}
                    fill="#7c3aed"
                    label={{ position: "top", fontSize: 9, formatter: (v) => v >= 0 ? `+${Math.round(v / 1000)}k` : `${Math.round(v / 1000)}k` }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Vouchers */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Banknote className="h-4 w-4 text-orange-700" />
                </div>
                آخر الحركات النقدية
              </CardTitle>
              <Link to="/vouchers/receipt" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                عرض الكل <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : recentVouchers.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">لا توجد حركات</div>
            ) : (
              <div className="space-y-1.5">
                {recentVouchers.map(v => {
                  const isReceipt = v.type === "سند قبض";
                  return (
                    <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isReceipt ? "bg-emerald-100" : "bg-red-100"}`}>
                        {isReceipt
                          ? <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                          : <ArrowDownRight className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{v.voucher_number} — {v.notes || v.type}</p>
                        <p className="text-[10px] text-muted-foreground">{v.date || "—"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isReceipt ? "text-emerald-600" : "text-red-600"}`}>
                          {isReceipt ? "+" : "-"}{fmt(v.amount)}
                        </p>
                        <Badge className={`text-[9px] px-1 py-0 ${isReceipt ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"} border-0`}>
                          {v.type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary strip */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "قبض هذا الشهر", val: monthReceipts, icon: ArrowUpRight, positive: true },
            { label: "دفع هذا الشهر", val: monthPayments, icon: ArrowDownRight, positive: false },
            { label: "عدد البنوك", val: bankAccounts.length, icon: Landmark, raw: true },
            { label: "عدد الخزائن", val: cashAccounts.length, icon: Wallet, raw: true },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.positive === true ? "bg-emerald-100" : s.positive === false ? "bg-red-100" : "bg-blue-100"}`}>
                <s.icon className={`h-4 w-4 ${s.positive === true ? "text-emerald-600" : s.positive === false ? "text-red-600" : "text-blue-600"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-base font-bold ${s.positive === true ? "text-emerald-600" : s.positive === false ? "text-red-600" : "text-foreground"}`}>
                  {s.raw ? s.val : fmt(s.val)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}