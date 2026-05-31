import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { checkStockAlerts } from "@/utils/inventoryEngine";

/**
 * Hook مشترك لجلب عدد الإشعارات غير المقروءة وفحص تنبيهات المخزون تلقائياً
 */
export function useStockNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    const notifs = await base44.entities.Notification.list().catch(() => []);
    setUnreadCount(notifs.filter((n) => !n.is_read).length);
  }, []);

  // فحص تنبيهات المخزون وتحديث العداد
  const runStockCheck = useCallback(async () => {
    const [allInvoices, allTransfers] = await Promise.all([
      base44.entities.Invoice.filter({ status: "مرحّلة" }).catch(() => []),
      base44.entities.StockTransfer.list().catch(() => []),
    ]);
    await checkStockAlerts(null, allInvoices, allTransfers).catch(() => {});
    await refresh();
  }, [refresh]);

  useEffect(() => {
    // جلب فوري للعداد عند التحميل
    refresh();
    // فحص المخزون بعد ثانيتين (لتجنب إبطاء التحميل الأولي)
    const timer = setTimeout(() => runStockCheck(), 2000);
    // إعادة الفحص كل 5 دقائق
    const interval = setInterval(() => runStockCheck(), 5 * 60 * 1000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  return { unreadCount, refresh, runStockCheck };
}