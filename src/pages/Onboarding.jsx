import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, Phone, Mail, MapPin, Hash, FileText,
  Calendar, DollarSign, Warehouse, AlertTriangle,
  User, Percent, CheckCircle2, ChevronLeft, ChevronRight
} from "lucide-react";

const steps = [
  { id: 1, title: "معلومات الشركة", icon: Building2 },
  { id: 2, title: "الإعدادات المالية", icon: DollarSign },
  { id: 3, title: "المخزون ونقاط البيع", icon: Warehouse },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    company_phone: "",
    company_email: "",
    company_address: "",
    company_tax_number: "",
    company_commercial_register: "",
    fiscal_year_start: "01-01",
    default_currency: "SAR",
    decimal_places: 2,
    default_warehouse: "المستودع الرئيسي",
    low_stock_threshold: 10,
    pos_cashier_name: "",
    pos_tax_rate: 15,
    onboarding_completed: true,
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const isStepValid = () => {
    if (currentStep === 1) return form.company_name.trim() !== "";
    if (currentStep === 2) return form.fiscal_year_start !== "" && form.default_currency !== "";
    if (currentStep === 3) return form.default_warehouse.trim() !== "" && form.pos_cashier_name.trim() !== "";
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    // Save AppSettings
    await base44.entities.AppSettings.create(form);

    // Create free trial subscription (3 months)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 3);
    const fmt = (d) => d.toISOString().split("T")[0];

    await base44.entities.Subscription.create({
      client_name: form.company_name,
      plan: "basic",
      start_date: fmt(today),
      end_date: fmt(endDate),
      is_active: true,
      features: {
        accounting: true,
        invoices: true,
        vouchers: true,
        warehouses: true,
        costs: false,
        branches: false,
        reports: true,
        financial: true,
        users: true,
      },
      notes: "باقة تجريبية مجانية لمدة 3 أشهر",
    });

    setSaving(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4 border border-blue-400/30">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">مرحبًا بك في إتقان ERP</h1>
          <p className="text-blue-300 text-sm">أكمل إعداد نظامك في دقيقتين لتبدأ العمل فورًا</p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all
                ${currentStep === step.id ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40" :
                  currentStep > step.id ? "bg-green-500 text-white" : "bg-white/10 text-white/50"}`}>
                {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <span className={`text-xs hidden sm:block ${currentStep === step.id ? "text-white font-medium" : "text-white/40"}`}>
                {step.title}
              </span>
              {idx < steps.length - 1 && (
                <div className={`w-8 h-px mx-1 ${currentStep > step.id ? "bg-green-500" : "bg-white/20"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> معلومات الشركة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-white/70 text-xs mb-1.5 block">اسم الشركة *</Label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={form.company_name} onChange={e => update("company_name", e.target.value)}
                      placeholder="شركة إتقان للتقنية"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={form.company_phone} onChange={e => update("company_phone", e.target.value)}
                      placeholder="+966 5X XXX XXXX"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={form.company_email} onChange={e => update("company_email", e.target.value)}
                      placeholder="info@company.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-white/70 text-xs mb-1.5 block">العنوان</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={form.company_address} onChange={e => update("company_address", e.target.value)}
                      placeholder="المدينة، الحي، الشارع"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">الرقم الضريبي</Label>
                  <div className="relative">
                    <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={form.company_tax_number} onChange={e => update("company_tax_number", e.target.value)}
                      placeholder="3XXXXXXXXX3"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">السجل التجاري</Label>
                  <div className="relative">
                    <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={form.company_commercial_register} onChange={e => update("company_commercial_register", e.target.value)}
                      placeholder="XXXXXXXXXX"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" /> الإعدادات المالية
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">بداية السنة المالية</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <select value={form.fiscal_year_start} onChange={e => update("fiscal_year_start", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-md h-9 pr-9 pl-3 text-sm focus:outline-none focus:border-blue-400">
                      <option value="01-01">1 يناير</option>
                      <option value="04-01">1 أبريل</option>
                      <option value="07-01">1 يوليو</option>
                      <option value="10-01">1 أكتوبر</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">العملة الافتراضية</Label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <select value={form.default_currency} onChange={e => update("default_currency", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-md h-9 pr-9 pl-3 text-sm focus:outline-none focus:border-blue-400">
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="AED">درهم إماراتي (AED)</option>
                      <option value="KWD">دينار كويتي (KWD)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="EGP">جنيه مصري (EGP)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">عدد الخانات العشرية</Label>
                  <select value={form.decimal_places} onChange={e => update("decimal_places", +e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-md h-9 px-3 text-sm focus:outline-none focus:border-blue-400">
                    <option value={0}>0 خانات</option>
                    <option value={1}>1 خانة</option>
                    <option value={2}>2 خانتان</option>
                    <option value={3}>3 خانات</option>
                  </select>
                </div>
              </div>

              {/* Trial info box */}
              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-green-300 font-medium text-sm">الباقة التجريبية المجانية</p>
                  <p className="text-green-400/70 text-xs mt-0.5">عند إتمام الإعداد، سيتم تفعيل باقتك التجريبية المجانية لمدة <strong>3 أشهر</strong> كاملة مع الوصول الكامل إلى الميزات الأساسية.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-blue-400" /> المخزون ونقاط البيع
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">اسم المستودع الافتراضي *</Label>
                  <div className="relative">
                    <Warehouse className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={form.default_warehouse} onChange={e => update("default_warehouse", e.target.value)}
                      placeholder="المستودع الرئيسي"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">حد تنبيه المخزون المنخفض</Label>
                  <div className="relative">
                    <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input type="number" value={form.low_stock_threshold} onChange={e => update("low_stock_threshold", +e.target.value)}
                      placeholder="10"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">اسم الكاشير الافتراضي *</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={form.pos_cashier_name} onChange={e => update("pos_cashier_name", e.target.value)}
                      placeholder="الكاشير الرئيسي"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">نسبة ضريبة نقاط البيع (%)</Label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input type="number" value={form.pos_tax_rate} onChange={e => update("pos_tax_rate", +e.target.value)}
                      placeholder="15"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-9 focus:border-blue-400" />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 text-xs font-medium mb-2">ملخص الإعدادات:</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-white/60">
                  <span>الشركة:</span><span className="text-white/80">{form.company_name}</span>
                  <span>العملة:</span><span className="text-white/80">{form.default_currency}</span>
                  <span>السنة المالية:</span><span className="text-white/80">{form.fiscal_year_start}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1}
              className="text-white/60 hover:text-white hover:bg-white/10 gap-2">
              <ChevronRight className="w-4 h-4" /> السابق
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={() => setCurrentStep(s => s + 1)} disabled={!isStepValid()}
                className="bg-blue-600 hover:bg-blue-500 text-white gap-2 px-6">
                التالي <ChevronLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={!isStepValid() || saving}
                className="bg-green-600 hover:bg-green-500 text-white gap-2 px-6">
                {saving ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> جارٍ الحفظ...</span>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> بدء العمل</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">يمكنك تعديل هذه الإعدادات لاحقًا من صفحة الإعدادات</p>
      </div>
    </div>
  );
}