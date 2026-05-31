import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Headphones, Send, CheckCircle2, Clock, AlertCircle,
  Mail, Phone, MessageSquare, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRIORITY_COLORS = {
  "عادي": "bg-secondary text-secondary-foreground",
  "متوسط": "bg-yellow-100 text-yellow-800",
  "عاجل": "bg-red-100 text-red-700"
};

const STATUS_ICONS = {
  "جديد": <Clock className="h-3.5 w-3.5 text-blue-500" />,
  "قيد المعالجة": <RefreshCw className="h-3.5 w-3.5 text-yellow-500" />,
  "تم الحل": <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
};

export default function Contact() {
  const [user, setUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    body: "",
    priority: "عادي"
  });

  useEffect(() => { init(); }, []);

  async function init() {
    setLoading(true);
    const [me, allUsers] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.User.list().catch(() => [])
    ]);
    setUser(me);

    // Find admin email
    const admin = allUsers.find(u => u.role === "admin");
    if (admin) setAdminEmail(admin.email);

    if (me) {
      const tickets = await base44.entities.Message.filter(
        { sender_email: me.email, type: "support" },
        "-created_date", 50
      ).catch(() => []);
      setMyTickets(tickets);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.subject || !form.body) return;
    if (!adminEmail) return toast.error("لم يتم العثور على مسؤول النظام");
    setSending(true);
    await base44.entities.Message.create({
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      recipient_email: adminEmail,
      recipient_name: "المسؤول",
      subject: form.subject,
      body: form.body,
      is_read: false,
      type: "support",
      priority: form.priority,
      status: "جديد"
    });
    setSending(false);
    setSent(true);
    setForm({ subject: "", body: "", priority: "عادي" });
    await init();
    setTimeout(() => setSent(false), 4000);
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
          <Headphones className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">الدعم الفني والتواصل</h1>
          <p className="text-sm text-muted-foreground">أرسل استفساراتك مباشرةً إلى مسؤول النظام</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                إرسال طلب دعم جديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <CheckCircle2 className="h-14 w-14 text-green-500" />
                  <p className="font-semibold text-lg">تم إرسال طلبك بنجاح!</p>
                  <p className="text-sm text-muted-foreground">سيقوم المسؤول بمراجعة طلبك والرد عليك قريباً.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <Label>موضوع الاستفسار <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="مثال: مشكلة في الفواتير، طلب ميزة جديدة..."
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>الأولوية</Label>
                      <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="عادي">عادي</SelectItem>
                          <SelectItem value="متوسط">متوسط</SelectItem>
                          <SelectItem value="عاجل">عاجل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>المرسِل</Label>
                      <Input value={user?.full_name || user?.email || "—"} disabled className="bg-muted" />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>تفاصيل الاستفسار <span className="text-destructive">*</span></Label>
                      <Textarea
                        placeholder="اشرح مشكلتك أو طلبك بالتفصيل..."
                        value={form.body}
                        onChange={e => setForm({ ...form, body: e.target.value })}
                        rows={5}
                        className="resize-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={sending || !form.subject || !form.body} className="gap-2">
                      <Send className="h-4 w-4" />
                      {sending ? "جارٍ الإرسال..." : "إرسال الطلب"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="font-semibold text-sm mb-1">قنوات التواصل الأخرى</p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                  <a href="mailto:support@etqan-erp.com" className="text-xs text-primary hover:underline font-medium">
                    support@etqan-erp.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">الهاتف / واتساب</p>
                  <a href="tel:+966500000000" className="text-xs text-green-600 hover:underline font-medium">
                    +966 50 000 0000
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ساعات الدعم</p>
                  <p className="text-xs font-medium">الأحد – الخميس، 9ص – 5م</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick tips */}
          <Card>
            <CardContent className="p-4">
              <p className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                نصائح لطلب أسرع
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>اذكر اسم الصفحة أو الميزة التي تواجه مشكلة فيها</li>
                <li>أضف رقم الفاتورة أو السجل إن وجد</li>
                <li>حدد الخطوات التي أدت إلى المشكلة</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Tickets */}
      {myTickets.length > 0 && (
        <div>
          <h2 className="font-bold text-base mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            طلباتي السابقة ({myTickets.length})
          </h2>
          <div className="space-y-2">
            {myTickets.map(ticket => (
              <Card key={ticket.id} className="overflow-hidden">
                <button
                  className="w-full text-right p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">{ticket.subject}</p>
                      <Badge className={cn("text-[10px] px-1.5", PRIORITY_COLORS[ticket.priority])}>
                        {ticket.priority}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {STATUS_ICONS[ticket.status || "جديد"]}
                        {ticket.status || "جديد"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmt(ticket.created_date)}</p>
                  </div>
                  {expandedId === ticket.id
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  }
                </button>
                {expandedId === ticket.id && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3 whitespace-pre-wrap bg-muted/20">
                    {ticket.body}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}