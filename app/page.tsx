import Link from "next/link";
import {
  Users,
  DollarSign,
  Package,
  ClipboardList,
  ShoppingCart,
  UserCog,
  PieChart,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const modules = [
  {
    title: "לקוחות",
    description: "ניהול לקוחות, פרטי קשר והיסטוריה",
    icon: <Users className="h-6 w-6 text-[#0b3d2e]" />,
    href: "/clients",
  },
  {
    title: "פיננסים",
    description: "מעקב אחר הכנסות והוצאות",
    icon: <DollarSign className="h-6 w-6 text-[#0b3d2e]" />,
    href: "/finances",
  },
  {
    title: "מלאי",
    description: "ניהול מלאי, מוצרים וספקים",
    icon: <Package className="h-6 w-6 text-[#0b3d2e]" />,
    href: "/inventory",
  },
  {
    title: "משימות",
    description: "מעקב אחר משימות ומטלות",
    icon: <ClipboardList className="h-6 w-6 text-[#0b3d2e]" />,
    href: "/tasks",
  },
  {
    title: "הזמנות",
    description: "ניהול הזמנות ומכירות",
    icon: <ShoppingCart className="h-6 w-6 text-[#0b3d2e]" />,
    href: "/orders",
  },
  {
    title: "עובדים",
    description: "ניהול עובדים ומשכורות",
    icon: <UserCog className="h-6 w-6 text-[#0b3d2e]" />,
    href: "/employees",
  },
  {
    title: "סיכום",
    description: "מבט כולל ודוחות",
    icon: <PieChart className="h-6 w-6 text-[#0b3d2e]" />,
    href: "/summary",
  },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 mt-8 text-[#0b3d2e]">ברוך הבא למערכת ניהול העסק שלך</h1>
        <p className="text-gray-600">נהל את העסק שלך בקלות עם כל הכלים במקום אחד</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Card key={module.href} className="overflow-hidden transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-md bg-gray-100">{module.icon}</div>
              </div>
              <CardTitle className="mt-2">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={module.href}>
                <Button 
                  variant="outline" 
                  className="w-full justify-between group hover:bg-[#0b3d2e] hover:text-white"
                >
                  <span>כניסה למודול</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 bg-[#0b3d2e]/5 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 text-[#0b3d2e]">טיפים מהירים</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>הוסף לקוחות חדשים דרך מודול הלקוחות</li>
          <li>עקוב אחר הכנסות והוצאות במודול הפיננסי</li>
          <li>נהל את המלאי שלך כדי למנוע מחסור</li>
          <li>השתמש במודול המשימות כדי לעקוב אחר מטלות יומיות</li>
          <li>צפה בדוחות במודול הסיכום לקבלת תמונה מקיפה של העסק</li>
        </ul>
      </div>
    </div>
  );
}