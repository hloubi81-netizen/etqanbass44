import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, BarChart3, Package, Users, FileText, Building2, CreditCard, Star, Zap, Shield, Globe } from "lucide-react";

const plans = [
  {
    id: "trial",
    name: "الباقة الشاملة المجانية",
    nameEn: "Free Trial",
    price: "مجاناً",
    duration: "3 أشهر",
    badge: "ابدأ الآن",
    badgeColor: "bg-emerald-500",
    highlight: true,
    features: [
      "جميع الميزات مفعّلة بالكامل",
      "محاسبة مالية متكاملة",
      "إدارة المخازن والمنتجات",
      "الفواتير والسندات",
      "نقطة البيع (POS)",
      "إدارة الموارد البشرية",
      "التقارير المتقدمة",
      "إدارة الفروع",
      "مراكز التكلفة",
      "حتى 10 مستخدمين",
    ],
    cta: "ابدأ تجربتك المجانية",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "basic",
    name: "الباقة الأساسية",
    nameEn: "Basic",
    price: "700",
    duration: "شهرياً",
    badge: null,
    highlight: false,
    features: [
      "المحاسبة المالية",
      "الفواتير والسندات",
      "إدارة المخازن",
      "تقارير أساسية",
      "حتى 3 مستخدمين",
      "فرع واحد",
    ],
    cta: "اختر الباقة الأساسية",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "advanced",
    name: "الباقة المتقدمة",
    nameEn: "Advanced",
    price: "900",
    duration: "شهرياً",
    badge: "الأكثر شيوعاً",
    badgeColor: "bg-blue-500",
    highlight: false,
    features: [
      "جميع ميزات الأساسية",
      "نقطة البيع (POS)",
      "إدارة الموارد البشرية",
      "مراكز التكلفة",
      "التقارير المتقدمة",
      "حتى 5 مستخدمين",
      "حتى 3 فروع",
    ],
    cta: "اختر الباقة المتقدمة",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "enterprise",
    name: "باقة الشركات",
    nameEn: "Enterprise",
    price: "1500",
    duration: "شهرياً",
    badge: null,
    highlight: false,
    features: [
      "جميع الميزات بدون حدود",
      "مستخدمون غير محدودون",
      "فروع غير محدودة",
      "دعم فني مخصص",
      "تخصيص كامل للنظام",
      "تقارير مخصصة",
      "API كامل",
    ],
    cta: "تواصل معنا",
    color: "from-orange-500 to-red-500",
  },
];

const features = [
  { icon: BarChart3, title: "تقارير مالية شاملة", desc: "ميزانية، أرباح وخسائر، تدفقات نقدية" },
  { icon: Package, title: "إدارة المخازن", desc: "تتبع المنتجات والمستودعات بدقة" },
  { icon: FileText, title: "الفواتير والسندات", desc: "مبيعات، مشتريات، مرتجعات" },
  { icon: Users, title: "الموارد البشرية", desc: "الموظفون، الحضور، الرواتب" },
  { icon: Building2, title: "إدارة الفروع", desc: "متابعة أداء كل فرع بشكل منفصل" },
  { icon: CreditCard, title: "نقطة البيع", desc: "واجهة POS سهلة وسريعة" },
];

export default function Landing() {

  const handleLogin = () => {
    base44.auth.loginWithProvider('sso', '/');
  };

  const handleRegister = () => {
    base44.auth.loginWithProvider('sso', '/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg leading-none">ETQAN ERP</span>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">نظام الإدارة المالية</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">الباقات</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">المميزات</a>
            <Button onClick={handleLogin} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              دخول النظام
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            🎉 تجربة مجانية شاملة لمدة 3 أشهر
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            نظام إدارة متكامل
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              لأعمالك التجارية
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            ETQAN ERP نظام محاسبي وإداري شامل يغطي المحاسبة المالية، المخازن، المبيعات، الموارد البشرية وأكثر — كل ما تحتاجه في مكان واحد.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-base px-8 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
              onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Star className="w-5 h-5" />
              ابدأ تجربتك المجانية
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 gap-2"
              onClick={handleLogin}
            >
              <ArrowLeft className="w-5 h-5" />
              دخول النظام
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { label: "وحدة في النظام", value: "20+" },
              { label: "تقرير متقدم", value: "50+" },
              { label: "دعم فني", value: "24/7" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">كل ما تحتاجه في مكان واحد</h2>
            <p className="text-muted-foreground">منظومة متكاملة تغطي جميع احتياجات إدارة أعمالك</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
              🎁 ابدأ مجاناً لمدة 3 أشهر
            </Badge>
            <h2 className="text-3xl font-bold mb-3">باقات تناسب كل الأعمال</h2>
            <p className="text-muted-foreground">اختر الباقة المناسبة لك أو ابدأ بالتجربة المجانية الشاملة</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  plan.highlight
                    ? "border-2 border-emerald-400 dark:border-emerald-600 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30"
                    : "border-border/60"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute top-4 left-4 ${plan.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    {plan.id === "trial" ? (
                      <div>
                        <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{plan.price}</span>
                        <span className="text-muted-foreground text-sm mr-2">لمدة {plan.duration}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-black">{plan.price}</span>
                        <span className="text-muted-foreground text-sm mr-2">ج.م / {plan.duration}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-4 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 text-white"
                        : ""
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={handleRegister}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">لماذا ETQAN ERP؟</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "أمان عالي", desc: "بيانات مشفرة وصلاحيات متدرجة لكل مستخدم" },
              { icon: Globe, title: "وصول من أي مكان", desc: "يعمل على جميع الأجهزة بدون تثبيت" },
              { icon: Zap, title: "سريع وموثوق", desc: "أداء عالٍ مع وقت تشغيل 99.9%" },
            ].map((t) => (
              <div key={t.title} className="flex flex-col items-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <t.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-10 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-3">ابدأ الآن مجاناً</h2>
          <p className="text-blue-100 mb-8 text-lg">
            جرّب جميع ميزات النظام مجاناً لمدة 3 أشهر كاملة بدون أي التزامات
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-blue-50 text-base px-10 font-bold"
            onClick={handleLogin}
          >
            سجّل الآن — مجاناً
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">ETQAN ERP</span>
          </div>
          <p>© 2025 ETQAN ERP. جميع الحقوق محفوظة.</p>
          <Button variant="outline" size="sm" onClick={handleLogin}>
            دخول النظام
          </Button>
        </div>
      </footer>
    </div>
  );
}