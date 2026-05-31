import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Headphones, Send, CheckCircle2, Clock, AlertCircle,
  Mail, Phone, MessageSquare, RefreshCw, ChevronDown, ChevronUp, X
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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ subject: "", body: "", priority: "عادي" });

  useEffect(() => { init(); }, []);

  async function init() {
    const [me, allUsers] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.User.list().catch(() => [])
    ]);
    setUser(me);
    const admin = allUsers.find(u => u.role === "admin");
    if (admin) setAdminEmail(admin.email);
    if (me) {
      const tickets = await base44.entities.Message.filter(
        { sender_email: me.email, type: "support" }, "-created_date", 50
      ).catch(() => []);
      setMyTickets(tickets);
    }
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
    setShowForm(false);
    await init();
    setTimeout(() => setSent(false), 5000);
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Headphones className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">تواصل معنا</h1>
        <p className="text-muted-foreground text-sm">نحن هنا لمساعدتك — تواصل معنا عبر أي من القنوات التالية</p>
      </div>

      {/* Success banner */}
      {sent && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-sm text-green-800">تم إرسال طلبك بنجاح!</p>
            <p className="text-xs text-green-600">سيقوم المسؤول بمراجعته والرد عليك قريباً.</p>
          </div>
        </div>
      )}

      {/* Contact Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <a href="mailto:support@etqan-erp.com" className="block group">
          <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">البريد الإلكتروني</p>
                <p className="text-primary text-sm font-medium mt-0.5">support@etqan-erp.com</p>
                <p className="text-xs text-muted-foreground mt-0.5">نرد خلال 24 ساعة</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="tel:+966500000000" className="block group">
          <Card className="h-full hover:border-green-300 hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">الهاتف / واتساب</p>
                <p className="text-green-600 text-sm font-medium mt-0.5" dir="ltr">+966 50 000 0000</p>
                <p className="text-xs text-muted-foreground mt-0.5">الأحد – الخميس، 9ص – 5م</p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      {/* CTA to send inquiry */}
      {!showForm ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">هل لديك استفسار أو طلب دعم فني؟</p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            إرسال استفسار
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                إرسال استفسار جديد
              </p>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>الموضوع <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="مثال: مشكلة في الفواتير، طلب ميزة جديدة..."
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>الأولوية</Label>
                  <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
              </div>
              <div className="space-y-1.5">
                <Label>تفاصيل الاستفسار <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="اشرح مشكلتك أو طلبك بالتفصيل..."
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  rows={4}
                  className="resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                <Button type="submit" disabled={sending || !form.subject || !form.body} className="gap-2">
                  <Send className="h-4 w-4" />
                  {sending ? "جارٍ الإرسال..." : "إرسال"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Previous Tickets */}
      {myTickets.length > 0 && (
        <div>
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
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
                      <Badge className={cn("text-[10px] px-1.5 py-0", PRIORITY_COLORS[ticket.priority])}>
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
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
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