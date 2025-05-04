"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3,
  Users,
  DollarSign,
  Package,
  ClipboardList,
  ShoppingCart,
  UserCog,
  PieChart,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: "דשבורד",
    href: "/",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "לקוחות",
    href: "/clients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "פיננסים",
    href: "/finances",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    title: "מלאי",
    href: "/inventory",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "משימות",
    href: "/tasks",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "הזמנות",
    href: "/orders",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: "עובדים",
    href: "/employees",
    icon: <UserCog className="h-5 w-5" />,
  },
  {
    title: "סיכום",
    href: "/summary",
    icon: <PieChart className="h-5 w-5" />,
  },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "סגור תפריט" : "פתח תפריט"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <div className="font-bold text-lg text-[#0b3d2e]">ניהול עסק</div>
        <Button variant="ghost" size="icon" aria-label="התנתק">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar for desktop / Mobile menu */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex w-full flex-col border-r bg-background md:w-64 md:translate-x-0 md:static",
          isOpen ? "translate-x-0" : "translate-x-full",
          "transition-transform duration-300 ease-in-out md:transition-none"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <div className="font-bold text-xl text-[#0b3d2e]">ניהול עסק</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="md:hidden"
            aria-label="סגור תפריט"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <ul className="flex flex-col gap-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-[#0b3d2e] transition-colors",
                    pathname === item.href ? "bg-[#0b3d2e] text-white hover:bg-[#0b3d2e]/90 hover:text-white" : ""
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => {}}
          >
            <LogOut className="h-4 w-4" />
            <span>התנתק</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}