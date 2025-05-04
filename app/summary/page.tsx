"use client";

import {
  PieChart,
  Users,
  DollarSign,
  Package,
  ClipboardList,
  ShoppingCart,
  UserCog,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/ui/dashboard-card";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SummaryPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const fetchData = async (col: string) => {
        try {
          const snapshot = await getDocs(collection(db, col));
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error(`שגיאה בטעינת ${col}:`, error);
          return [];
        }
      };

      const [clientsData, financesData, inventoryData, tasksData, ordersData, empData] = await Promise.all([
        fetchData("clients"),
        fetchData("finances"), // ← שינוי חשוב
        fetchData("inventory"),
        fetchData("tasks"),
        fetchData("orders"),
        fetchData("employees"),
      ]);

      setClients(clientsData);
      setTransactions(financesData); // ← גם כאן שינוי
      setInventory(inventoryData);
      setTasks(tasksData);
      setOrders(ordersData);
      setEmployees(empData);
    }

    fetchAll();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount);

  const activeClients = clients.filter(c => c.isActive).length;

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netIncome = totalIncome - totalExpense;

  const inventoryValue = inventory.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );
  const openTasks = tasks.filter(t => t.status === "open").length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const employeeCount = employees.length;

  const financialData = [
    { name: "הכנסות", value: totalIncome },
    { name: "הוצאות", value: totalExpense },
  ];

  const inventoryByCategory = inventory.reduce((acc: Record<string, number>, item) => {
    const category = item.category || "לא מוגדר";
    const value = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    acc[category] = (acc[category] || 0) + value;
    return acc;
  }, {});

  const inventoryPieData = Object.entries(inventoryByCategory).map(([name, value]) => ({ name, value }));

  const orderStatusData = [
    { name: "ממתינות", value: orders.filter(o => o.status === "pending").length },
    { name: "בטיפול", value: orders.filter(o => o.status === "processing").length },
    { name: "הושלמו", value: orders.filter(o => o.status === "completed").length },
  ];

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PieChart className="h-6 w-6" />
        <h1 className="text-2xl font-bold">סיכום כולל</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="לקוחות פעילים"
          value={activeClients}
          icon={<Users className="h-4 w-4" />}
          description={`מתוך ${clients.length} לקוחות`}
        />
        <DashboardCard
          title="הכנסות מול הוצאות"
          value={formatCurrency(netIncome)}
          icon={<DollarSign className="h-4 w-4" />}
          trend={netIncome >= 0 ? "up" : "down"}
          trendValue={`${Math.abs((netIncome / (totalIncome || 1)) * 100).toFixed(1)}%`}
        />
        <DashboardCard
          title="ערך מלאי זמין"
          value={formatCurrency(inventoryValue)}
          icon={<Package className="h-4 w-4" />}
          description={`סה"כ ${inventory.reduce((sum, i) => sum + Number(i.quantity || 0), 0)} פריטים`}
        />
        <DashboardCard
          title="משימות פתוחות"
          value={openTasks}
          icon={<ClipboardList className="h-4 w-4" />}
          description={`מתוך ${tasks.length} משימות סה"כ`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>הכנסות מול הוצאות</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {financialData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>התפלגות מלאי לפי קטגוריה</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={inventoryPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {inventoryPieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>סטטוס הזמנות</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="כמות הזמנות" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">הזמנות בטיפול</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">{pendingOrders > 0 ? "יש הזמנות לטיפול" : "אין הזמנות ממתינות לטיפול"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">עובדים</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount}</div>
            <p className="text-xs text-muted-foreground">
              סה"כ {formatCurrency(employees.reduce((sum, e) => sum + Number(e.monthlySalary || 0), 0))} בחודש
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">צפי הכנסות חודשי</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome / 3)}</div>
            <p className="text-xs text-muted-foreground">בהתבסס על ממוצע הכנסות</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
