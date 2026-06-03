import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, FolderTree, Search, X, Plus, Check } from "lucide-react";

/**
 * BranchAssignments - component to manage allowed products and accounts per branch
 * Props:
 *   form: branch form state
 *   setForm: state setter
 *   products: all products list
 *   accounts: all accounts list (leaf accounts)
 */
export default function BranchAssignments({ form, setForm, products, accounts }) {
  const [productSearch, setProductSearch] = useState("");
  const [accountSearch, setAccountSearch] = useState("");

  const allowedProducts = form.allowed_product_ids || [];
  const allowedAccounts = form.allowed_account_ids || [];

  const leafAccounts = useMemo(() => accounts.filter(a => !a.is_parent), [accounts]);

  const filteredProducts = useMemo(() =>
    products.filter(p => {
      const q = productSearch.toLowerCase();
      return !q || p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q);
    }),
    [products, productSearch]
  );

  const filteredAccounts = useMemo(() =>
    leafAccounts.filter(a => {
      const q = accountSearch.toLowerCase();
      return !q || a.name?.toLowerCase().includes(q) || a.account_number?.toLowerCase().includes(q);
    }),
    [leafAccounts, accountSearch]
  );

  function toggleProduct(id) {
    const current = allowedProducts.includes(id)
      ? allowedProducts.filter(x => x !== id)
      : [...allowedProducts, id];
    setForm(f => ({ ...f, allowed_product_ids: current }));
  }

  function toggleAccount(id) {
    const current = allowedAccounts.includes(id)
      ? allowedAccounts.filter(x => x !== id)
      : [...allowedAccounts, id];
    setForm(f => ({ ...f, allowed_account_ids: current }));
  }

  function selectAllProducts() {
    setForm(f => ({ ...f, allowed_product_ids: products.map(p => p.id) }));
  }

  function clearProducts() {
    setForm(f => ({ ...f, allowed_product_ids: [] }));
  }

  function selectAllAccounts() {
    setForm(f => ({ ...f, allowed_account_ids: leafAccounts.map(a => a.id) }));
  }

  function clearAccounts() {
    setForm(f => ({ ...f, allowed_account_ids: [] }));
  }

  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="products" className="flex-1 gap-1.5 text-xs">
          <Package className="h-3.5 w-3.5" />
          الأصناف المخصصة
          {allowedProducts.length > 0 && (
            <Badge className="bg-primary text-white text-[10px] px-1.5 py-0 ml-1">{allowedProducts.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="accounts" className="flex-1 gap-1.5 text-xs">
          <FolderTree className="h-3.5 w-3.5" />
          الحسابات المخصصة
          {allowedAccounts.length > 0 && (
            <Badge className="bg-primary text-white text-[10px] px-1.5 py-0 ml-1">{allowedAccounts.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Products Tab */}
      <TabsContent value="products" className="mt-3 space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
          <Package className="h-3.5 w-3.5 shrink-0" />
          <span>
            {allowedProducts.length === 0
              ? "كل الأصناف مسموح بها (لم يتم تحديد قيود)"
              : `${allowedProducts.length} صنف محدد من أصل ${products.length}`}
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="h-8 text-xs pr-8"
              placeholder="بحث في الأصناف..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="text-xs h-8 px-2" onClick={selectAllProducts}>الكل</Button>
          <Button variant="outline" size="sm" className="text-xs h-8 px-2 text-destructive" onClick={clearProducts}>مسح</Button>
        </div>

        <div className="border rounded-lg divide-y max-h-56 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">لا توجد أصناف</p>
          ) : filteredProducts.map(p => {
            const selected = allowedProducts.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProduct(p.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-right hover:bg-muted/40 transition-colors ${selected ? "bg-primary/5" : ""}`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-primary border-primary" : "border-border"}`}>
                  {selected && <Check className="h-2.5 w-2.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  {p.code && <p className="text-[10px] text-muted-foreground">{p.code}</p>}
                </div>
                {p.group_name && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">{p.group_name}</Badge>
                )}
              </button>
            );
          })}
        </div>
      </TabsContent>

      {/* Accounts Tab */}
      <TabsContent value="accounts" className="mt-3 space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
          <FolderTree className="h-3.5 w-3.5 shrink-0" />
          <span>
            {allowedAccounts.length === 0
              ? "كل الحسابات مسموح بها (لم يتم تحديد قيود)"
              : `${allowedAccounts.length} حساب محدد من أصل ${leafAccounts.length}`}
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="h-8 text-xs pr-8"
              placeholder="بحث في الحسابات..."
              value={accountSearch}
              onChange={e => setAccountSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="text-xs h-8 px-2" onClick={selectAllAccounts}>الكل</Button>
          <Button variant="outline" size="sm" className="text-xs h-8 px-2 text-destructive" onClick={clearAccounts}>مسح</Button>
        </div>

        <div className="border rounded-lg divide-y max-h-56 overflow-y-auto">
          {filteredAccounts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">لا توجد حسابات</p>
          ) : filteredAccounts.map(a => {
            const selected = allowedAccounts.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAccount(a.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-right hover:bg-muted/40 transition-colors ${selected ? "bg-primary/5" : ""}`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-primary border-primary" : "border-border"}`}>
                  {selected && <Check className="h-2.5 w-2.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-xs font-medium truncate">{a.name}</p>
                  {a.account_number && <p className="text-[10px] text-muted-foreground">{a.account_number}</p>}
                </div>
                {a.final_account && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{a.final_account}</Badge>
                )}
              </button>
            );
          })}
        </div>
      </TabsContent>
    </Tabs>
  );
}