import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, MessageSquare, Clock, Eye, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const statusColors = {
  "جديد": "bg-blue-100 text-blue-700",
  "قيد المعالجة": "bg-amber-100 text-amber-700",
  "تم الرد": "bg-green-100 text-green-700"
};

export default function SupportRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("الكل");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await base44.entities.SupportRequest.list("-created_date");
    setRequests(data);
    setLoading(false);
  }

  function openRequest(req) {
    setSelected(req);
    setAdminNotes(req.admin_notes || "");
  }

  async function saveStatus(status) {
    setSaving(true);
    await base44.entities.SupportRequest.update(selected.id, { status, admin_notes: adminNotes });
    setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, status, admin_notes: adminNotes } : r));
    setSelected(s => ({ ...s, status, admin_notes: adminNotes }));
    toast.success("تم الحفظ");
    setSaving(false);
  }

  async function deleteRequest(id) {
    if (!confirm("هل تريد حذف هذا الطلب؟")) return;
    await base44.entities.SupportRequest.delete(id);
    setRequests(prev => prev.filter(r => r.id !== id));
    setSelected(null);
    toast.success("تم الحذف");
  }

  const filtered = filterStatus === "الكل" ? requests : requests.filter(r => r.status === filterStatus);
  const newCount = requests.filter(r => r.status === "جديد").length;

  return (
    <div className="p-4 md:p-6 space-y-4" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">طلبات التواصل والدعم</h1>
          {newCount > 0 && <p className="text-sm text-muted-foreground">{newCount} طلب جديد غير مقروء</p>}
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["الكل", "جديد", "قيد المعالجة", "تم الرد"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground"><MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>لا توجد طلبات</p></CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(req => (
            <Card key={req.id} className={`cursor-pointer hover:shadow-md transition-shadow border-r-4 ${req.status === "جديد" ? "border-r-blue-500" : req.status === "قيد المعالجة" ? "border-r-amber-500" : "border-r-green-500"}`}
              onClick={() => openRequest(req)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm truncate">{req.name}</p>
                      <Badge className={`text-xs ${statusColors[req.status]}`}>{req.status}</Badge>
                      <Badge variant="outline" className="text-xs">{req.subject}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{req.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{req.email}</span>
                      {req.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{req.phone}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(req.created_date), "yyyy/MM/dd HH:mm")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={e => { e.stopPropagation(); openRequest(req); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={e => { e.stopPropagation(); deleteRequest(req.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              تفاصيل الطلب
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs">الاسم</p>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs">نوع الطلب</p>
                  <Badge variant="outline">{selected.subject}</Badge>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs">البريد الإلكتروني</p>
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline break-all">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">رقم الهاتف</p>
                    <a href={`tel:${selected.phone}`} className="text-primary hover:underline">{selected.phone}</a>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">الرسالة</p>
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-medium">ملاحظات المسؤول</p>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="أضف ملاحظاتك هنا..."
                  className="resize-none min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium ml-auto">تغيير الحالة:</p>
                {["جديد", "قيد المعالجة", "تم الرد"].map(s => (
                  <Button
                    key={s}
                    size="sm"
                    variant={selected.status === s ? "default" : "outline"}
                    disabled={saving}
                    onClick={() => saveStatus(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}