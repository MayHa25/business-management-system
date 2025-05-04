"use client";

import { 
  PieChart, 
  Users, 
  DollarSign, 
  Package, 
  ClipboardList,
  ShoppingCart, 
  UserCog,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { 
  DUMMY_CLIENTS, 
  DUMMY_TRANSACTIONS, 
  DUMMY_INVENTORY, 
  DUMMY_TASKS, 
  DUMMY_ORDERS, 
  DUMMY_EMPLOYEES 
} from "@/lib/constants";
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

export default function SummaryPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  };

  // Calculate metrics
  const activeClients = DUMMY_CLIENTS.filter(client => client.isActive).length;
  const totalIncome = DUMMY_TRANSACTIONS
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = DUMMY_TRANSACTIONS
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpense;
  const inventoryValue = DUMMY_INVENTORY.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const openTasks = DUMMY_TASKS.filter(task => task.status === "open").length;
  const pendingOrders = DUMMY_ORDERS.filter(order => order.status === "pending").length;
  const employeeCount = DUMMY_EMPLOYEES.length;

  // Financial data for charts
  const financialData = [
    { name: "הכנסות", value: totalIncome },
    { name: "הוצאות", value: totalExpense },
  ];

  // Inventory by category for pie chart
  const inventoryByCategory = DUMMY_INVENTORY.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.quantity * item.unitPrice;
    return acc;
  }, {} as Record<string, number>);

  const inventoryPieData = Object.entries(inventoryByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Order status data for bar chart
  const orderStatusData = [
    { name: "ממתינות", value: DUMMY_ORDERS.filter(o => o.status === "pending").length },
    { name: "בטיפול", value: DUMMY_ORDERS.filter(o => o.status === "processing").length },
    { name: "הושלמו", value: DUMMY_ORDERS.filter(o => o.status === "completed").length },
  ];

  // Chart colors
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

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
          description="מתוך סך הכל של לקוחות"
        />
        <DashboardCard
          title="הכנסות מול הוצאות"
          value={formatCurrency(netIncome)}
          icon={<DollarSign className="h-4 w-4" />}
          trend={netIncome > 0 ? "up" : "down"}
          trendValue={`${Math.abs((netIncome / totalIncome) * 100).toFixed(1)}%`}
        />
        <DashboardCard
          title="ערך מלאי זמין"
          value={formatCurrency(inventoryValue)}
          icon={<Package className="h-4 w-4" />}
          description={`סה"כ ${DUMMY_INVENTORY.reduce((sum, item) => sum + item.quantity, 0)} פריטים`}
        />
        <DashboardCard
          title="משימות פתוחות"
          value={openTasks}
          icon={<ClipboardList className="h-4 w-4" />}
          description={`מתוך ${DUMMY_TASKS.length} משימות סה"כ`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>הכנסות מול הוצאות</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>התפלגות מלאי לפי קטגוריה</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={inventoryPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {inventoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend verticalAlign="bottom" height={36} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>סטטוס הזמנות</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={orderStatusData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
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
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">הזמנות בטיפול</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">{pendingOrders > 0 ? "יש הזמנות לטיפול" : "אין הזמנות ממתינות לטיפול"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">עובדים</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount}</div>
            <p className="text-xs text-muted-foreground">סה"כ {formatCurrency(DUMMY_EMPLOYEES.reduce((sum, e) => sum + e.monthlySalary, 0))} בחודש</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
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