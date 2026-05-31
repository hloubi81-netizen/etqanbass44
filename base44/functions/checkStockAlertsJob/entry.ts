import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // جلب التنبيهات النشطة
    const alerts = await base44.asServiceRole.entities.StockAlert.filter({ is_active: true });
    if (!alerts.length) return Response.json({ created: 0, message: "لا توجد تنبيهات نشطة" });

    // جلب بيانات الفواتير والتحويلات
    const [allInvoices, allTransfers] = await Promise.all([
      base44.asServiceRole.entities.Invoice.filter({ status: "مرحّلة" }),
      base44.asServiceRole.entities.StockTransfer.list(),
    ]);

    // حساب الكمية الحالية لكل منتج
    function calcStock(productId, warehouseId) {
      let qty = 0;
      for (const inv of allInvoices) {
        const items = (inv.items || []).filter(i => i.product_id === productId);
        for (const item of items) {
          const baseQty = (item.quantity || 0) * (item.conversion_factor || 1);
          if (inv.pattern_type?.includes("مشتريات") && inv.warehouse_id === warehouseId) qty += baseQty;
          else if (inv.pattern_type?.includes("مبيعات") && inv.warehouse_id === warehouseId) qty -= baseQty;
          else if (inv.pattern_type?.includes("مرتجع مبيعات") && inv.warehouse_id === warehouseId) qty += baseQty;
          else if (inv.pattern_type?.includes("مرتجع مشتريات") && inv.warehouse_id === warehouseId) qty -= baseQty;
        }
      }
      for (const tr of allTransfers) {
        const items = (tr.items || []).filter(i => i.product_id === productId);
        for (const item of items) {
          const baseQty = (item.quantity || 0) * (item.conversion_factor || 1);
          if (tr.from_warehouse_id === warehouseId) qty -= baseQty;
          if (tr.to_warehouse_id === warehouseId) qty += baseQty;
        }
      }
      return Math.max(0, qty);
    }

    const today = new Date().toISOString().split("T")[0];
    const existingNotifs = await base44.asServiceRole.entities.Notification.filter({ type: "تنبيه مخزون" });
    const todayKeys = new Set(
      existingNotifs.filter(n => n.trigger_date === today).map(n => n.related_id)
    );

    const toCreate = [];
    for (const alert of alerts) {
      const currentStock = calcStock(alert.product_id, alert.warehouse_id);
      const alertKey = `${alert.product_id}-${alert.warehouse_id}`;
      if (currentStock <= alert.min_quantity && !todayKeys.has(alertKey)) {
        const level = currentStock === 0 ? "نفدت الكمية" : "وصل للحد الأدنى";
        toCreate.push({
          title: `⚠️ تنبيه مخزون: ${alert.product_name}`,
          message: `${level} في مستودع "${alert.warehouse_name}" — الكمية الحالية: ${currentStock} | الحد الأدنى: ${alert.min_quantity}${alert.reorder_quantity ? ` | كمية الطلب المقترحة: ${alert.reorder_quantity}` : ""}`,
          type: "تنبيه مخزون",
          related_module: "StockAlert",
          related_id: alertKey,
          is_read: false,
          trigger_date: today,
        });
      }
    }

    if (toCreate.length > 0) {
      await Promise.all(toCreate.map(n => base44.asServiceRole.entities.Notification.create(n)));
    }

    return Response.json({ created: toCreate.length, checked: alerts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});