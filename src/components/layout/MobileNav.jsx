import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, FileText, Settings, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "الرئيسية", icon: LayoutDashboard, to: "/" },
  { label: "نقطة البيع", icon: ShoppingCart,  to: "/pos" },
  { label: "الفواتير",  icon: FileText,        to: "/invoices/sales" },
  { label: "المواد",    icon: Package,         to: "/products" },
  { label: "الإعدادات", icon: Settings,        to: "/settings" },
];

export default function MobileNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-card border-t border-border flex lg:hidden safe-bottom">
      {NAV_ITEMS.map(({ label, icon: NavIcon, to }) => {
        const active = pathname === to || (to !== "/" && pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors relative",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <NavIcon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
            <span>{label}</span>
            {active && (
              <span className="absolute bottom-0 h-0.5 w-8 bg-primary rounded-t-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}