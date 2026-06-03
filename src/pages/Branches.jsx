import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, GitBranch, Building2, Warehouse, X, Package, FolderTree, Settings } from "lucide-react";
import { toast } from "sonner";
import BranchAssignments from "@/components/branches/BranchAssignments";

const empty = {
  name: "", code: "", location: "", manager_name: "", phone: "",
  is_main: false, warehouse_ids: [], notes: "",
  cost_center_id: "", cost_center_name: "",
  allowed_product_ids: [], allowed_account_ids: []
};

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [data, wh, prods, accs, ccs] = await Promise.all([
      base44.entities.Branch.list(),
      base44.entities.Warehouse.list(),
      base44.entities.Product.list(),
      base44.entities.Account.list(),
      base44.entities.CostCenter.list(),
    ]);
    setBranches(data);
    setWarehouses(wh);
    setProducts(prods);
    setAccounts(accs);
    setCostCenters(ccs);
    setLoading(false);
  }

  function addWarehouse(whId) {
    if (!whId || form.warehouse_ids.includes(whId)) return;
    if (form.warehouse_ids.length >= 3) return toast.error("الحد الأقصى 3 مستودعات لكل فرع");
    setForm(f => ({ ...f, warehouse_ids: [...f.warehouse_ids, whId] }));
  }

  function removeWarehouse(whId) {
    setForm(f => ({ ...f, warehouse_ids: f.warehouse_ids.filter(id => id !== whId) }));
  }

  function openNew() {
    setForm({ ...empty, warehouse_ids: [], allowed_product_ids: [], allowed_account_ids: [] });
    setEditId(null);
    setOpen(true);
  }

  function openEdit(b) {
    setForm({
      ...b,
      warehouse_ids: b.warehouse_ids || [],
      allowed_product_ids: b.allowed_product_ids || [],
      allowed_account_ids: b.allowed_account_ids || [],
    });
    setEditId(b.id);
    setOpen(true);
  }

  async function save() {
    if (!form.name || !form.code) return toast.error("اسم الفرع والرمز مطلوبان");
    const data = {
      ...form,
      allowed_product_ids: form.allowed_product_ids || [],
      allowed_account_ids: form.allowed_account_ids || [],
    };
    if (editId) {
      await base44.entities.Branch.update(editId, data);
      toast.success("تم تحديث الفرع");
    } else {
      await base44.entities.Branch.create(data);
      toast.success("تم إضافة الفرع");
    }
    setOpen(false);
    load();
  }

  async function remove(id) {
    if (!confirm("هل أنت متأكد من حذف هذا الفرع؟")) return;
    await base44.entities.Branch.delete(id);
    toast.success("تم حذف الفرع");
    load();
  }

  if (loading) return (
    <div className="flex justify-center p-12">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الفروع والمعارض</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة فروع الشركة ومعارضها</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />إضافة فرع</Button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-card border rounded-xl p-16 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد فروع مضافة بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map(b => (
            <Card key={b.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GitBranch className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{b.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{b.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {b.is_main && <Badge variant="default" className="text-xs">رئيسي</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {b.location && <p className="text-muted-foreground">📍 {b.location}</p>}
                {b.manager_name && <p className="text-muted-foreground">👤 {b.manager_name}</p>}
                {b.phone && <p className="text-muted-foreground">📞 {b.phone}</p>}
                {b.cost_center_name && (
                  <p className="text-muted-foreground text-xs">🏷️ مركز التكلفة: {b.cost_center_name}</p>
                )}

                {/* Assigned products */}
                {b.allowed_product_ids?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">{b.allowed_product_ids.length} صنف مخصص</Badge>
                  </div>
                )}

                {/* Assigned accounts */}
                {b.allowed_account_ids?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">{b.allowed_account_ids.length} حساب مخصص</Badge>
                  </div>
                )}

                {b.warehouse_ids?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Warehouse className="h-3 w-3" />المستودعات:</p>
                    <div className="flex flex-wrap gap-1">
                      {b.warehouse_ids.map(wid => {
                        const wh = warehouses.find(w => w.id === wid);
                        return wh ? <Badge key={wid} variant="secondary" className="text-xs">{wh.name}</Badge> : null;
                      })}
                    </div>
                  </div>
                )}

                {b.notes && <p className="text-muted-foreground text-xs mt-2">{b.notes}</p>}

                <div className="flex gap-2 pt-3 border-t mt-3">
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEdit(b)}>
                    <Settings className="h-3 w-3" />تعديل وإعدادات
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive gap-1" onClick={() => remove(b.id)}>
                    <Trash2 className="h-3 w-3" />حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل الفرع وإعداداته" : "إضافة فرع جديد"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="info" className="flex-1 text-xs gap-1">
                <Building2 className="h-3.5 w-3.5" />بيانات الفرع
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex-1 text-xs gap-1">
                <Package className="h-3.5 w-3.5" />الأصناف والحسابات
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="info">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>اسم الفرع *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم الفرع" />
                </div>
                <div className="space-y-1.5">
                  <Label>الرمز *</Label>
                  <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="مثال: BR01" />
                </div>
                <div className="space-y-1.5">
                  <Label>الموقع</Label>
                  <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="المدينة/المنطقة" />
                </div>
                <div className="space-y-1.5">
                  <Label>مدير الفرع</Label>
                  <Input value={form.manager_name} onChange={e => setForm({ ...form, manager_name: e.target.value })} placeholder="اسم المدير" />
                </div>
                <div className="space-y-1.5">
                  <Label>الهاتف</Label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="رقم الهاتف" />
                </div>
                <div className="space-y-1.5 flex items-center gap-2 pt-5">
                  <input type="checkbox" id="is_main" checked={form.is_main} onChange={e => setForm({ ...form, is_main: e.target.checked })} className="h-4 w-4" />
                  <Label htmlFor="is_main">الفرع الرئيسي</Label>
                </div>

                {/* Cost Center */}
                <div className="col-span-2 space-y-1.5">
                  <Label>مركز التكلفة الافتراضي</Label>
                  <Select
                    value={form.cost_center_id || "none"}
                    onValueChange={v => {
                      const cc = costCenters.find(c => c.id === v);
                      setForm({ ...form, cost_center_id: v === "none" ? "" : v, cost_center_name: cc?.name || "" });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="اختر مركز التكلفة (اختياري)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— بدون مركز تكلفة —</SelectItem>
                      {costCenters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Warehouses */}
                <div className="col-span-2 space-y-1.5">
                  <Label className="flex items-center gap-1"><Warehouse className="h-3.5 w-3.5" />المستودعات المرتبطة (حتى 3)</Label>
                  <Select onValueChange={addWarehouse} value="">
                    <SelectTrigger disabled={form.warehouse_ids.length >= 3}>
                      <SelectValue placeholder={form.warehouse_ids.length >= 3 ? "وصلت للحد الأقصى" : "اختر مستودعاً لإضافته"} />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.filter(w => !form.warehouse_ids.includes(w.id)).map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.warehouse_ids.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.warehouse_ids.map(wid => {
                        const wh = warehouses.find(w => w.id === wid);
                        return wh ? (
                          <span key={wid} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                            {wh.name}
                            <button type="button" onClick={() => removeWarehouse(wid)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label>ملاحظات</Label>
                  <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="ملاحظات إضافية" />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Products & Accounts */}
            <TabsContent value="assignments">
              <BranchAssignments
                form={form}
                setForm={setForm}
                products={products}
                accounts={accounts}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 justify-end pt-3 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={save}>{editId ? "تحديث" : "حفظ"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}