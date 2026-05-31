import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Clock, Send, CheckCircle2, Building2 } from "lucide-react";

const subjects = ["استفسار عام", "طلب دعم فني", "طلب عرض سعر", "شكوى", "أخرى"];

export default function PublicContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }
    setLoading(true);
    await base44.entities.SupportRequest.create({ ...form, status: "جديد" });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4" dir="rtl">
      {/* Logo / Brand */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <Building2 className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">إتقان ERP</h1>
        <p className="text-blue-300 text-sm">نظام إدارة الأعمال المتكامل</p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <Card className="bg-white/10 border-white/10 backdrop-blur-sm text-white">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="font-semibold text-sm text-blue-200">البريد الإلكتروني</p>
                <a href="mailto:support@etqan-erp.com" className="text-white text-sm hover:text-blue-300 transition-colors break-all">
                  support@etqan-erp.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/10 backdrop-blur-sm text-white">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <p className="font-semibold text-sm text-blue-200">الهاتف / واتساب</p>
                <a href="tel:+966500000000" className="text-white text-sm hover:text-green-300 transition-colors">
                  +966 50 000 0000
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/10 backdrop-blur-sm text-white">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <p className="font-semibold text-sm text-blue-200">ساعات العمل</p>
                <p className="text-white text-sm">الأحد – الخميس</p>
                <p className="text-blue-300 text-xs">9 صباحاً – 5 مساءً</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-auto">
            <a href="/" className="block text-center text-blue-300 hover:text-white text-sm transition-colors">
              ← العودة لتسجيل الدخول
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          <Card className="bg-white/95 shadow-2xl">
            <CardContent className="p-6">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-9 w-9 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">تم إرسال رسالتك بنجاح!</h2>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    سيتواصل معك فريق الدعم في أقرب وقت ممكن على بريدك الإلكتروني أو رقم هاتفك.
                  </p>
                  <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}>
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-2">
                    <h2 className="text-xl font-bold text-foreground">تواصل معنا</h2>
                    <p className="text-muted-foreground text-sm">أرسل استفسارك وسنرد عليك في أقرب وقت</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>الاسم الكامل <span className="text-destructive">*</span></Label>
                      <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="أدخل اسمك الكامل" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>البريد الإلكتروني <span className="text-destructive">*</span></Label>
                      <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="example@email.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>رقم الهاتف</Label>
                      <Input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+966 5X XXX XXXX" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>نوع الطلب <span className="text-destructive">*</span></Label>
                      <Select value={form.subject} onValueChange={v => set("subject", v)}>
                        <SelectTrigger><SelectValue placeholder="اختر نوع الطلب" /></SelectTrigger>
                        <SelectContent>
                          {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>الرسالة <span className="text-destructive">*</span></Label>
                    <Textarea
                      value={form.message}
                      onChange={e => set("message", e.target.value)}
                      placeholder="اكتب رسالتك هنا..."
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  {error && <p className="text-destructive text-sm bg-destructive/10 rounded-md px-3 py-2">{error}</p>}

                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Send className="h-4 w-4" />}
                    {loading ? "جاري الإرسال..." : "إرسال الرسالة"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}