"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

import { ShoppingCart, Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Order } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "processing" | "completed">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUserId(user.uid);

      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];
      setOrders(data);

      const clientQ = query(collection(db, "clients"), where("userId", "==", user.uid));
      const clientSnapshot = await getDocs(clientQ);
      const clientData = clientSnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name }));
      setClients(clientData);
    });

    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount);
  };

  const handleDelete = async (order: Order) => {
    await deleteDoc(doc(db, "orders", order.id));
    setOrders(orders.filter((o) => o.id !== order.id));
    toast({ title: "הזמנה נמחקה", description: `הזמנה ${order.orderNumber} הוסרה.` });
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!userId) return;

    if (selectedOrder) {
      const ref = doc(db, "orders", selectedOrder.id);
      await updateDoc(ref, { ...formData, userId });
      setOrders(orders.map((o) => (o.id === selectedOrder.id ? { ...o, ...formData } : o)));
      toast({ title: "הזמנה עודכנה", description: `הזמנה ${formData.orderNumber} עודכנה.` });
    } else {
      const newOrder: Omit<Order, "id"> = {
        orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
        userId,
        ...formData,
      };
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      setOrders([...orders, { id: docRef.id, ...newOrder }]);
      toast({ title: "הזמנה נוספה", description: `הזמנה ${newOrder.orderNumber} נוספה.` });
    }

    setIsDialogOpen(false);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <Badge variant="outline">ממתינה</Badge>;
      case "processing": return <Badge variant="secondary">בטיפול</Badge>;
      case "completed": return <Badge variant="default">הושלמה</Badge>;
      default: return null;
    }
  };

  const columns = [
    { header: "מספר הזמנה", accessorKey: "orderNumber" as keyof Order },
    { header: "לקוח", accessorKey: "client" as keyof Order },
    { header: "תאריך הזמנה", accessorKey: "orderDate" as keyof Order },
    {
      header: "סכום סופי", accessorKey: "totalAmount" as keyof Order,
      cell: (order: Order) => formatCurrency(order.totalAmount),
    },
    {
      header: "סטטוס", accessorKey: "status" as keyof Order,
      cell: (order: Order) => getStatusBadge(order.status),
    },
  ];

  const actionColumn = (order: Order) => (
    <div className="flex space-x-2 justify-end">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(order)}><Pencil className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(order)}><Trash className="h-4 w-4" /></Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h1 className="text-xl font-bold">ניהול הזמנות</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0b3d2e] hover:bg-[#0b3d2e]/90" onClick={() => setSelectedOrder(null)}>
              <Plus className="h-4 w-4 ml-2" /> הוספת הזמנה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedOrder ? 'עריכת הזמנה' : 'הוספת הזמנה חדשה'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave({
                client: formData.get('client'),
                orderDate: formData.get('orderDate'),
                totalAmount: Number(formData.get('totalAmount')),
                status: formData.get('status'),
              });
            }} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">לקוח</Label>
                  <Select name="client" defaultValue={selectedOrder?.client}>
                    <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orderDate">תאריך הזמנה</Label>
                  <Input id="orderDate" name="orderDate" type="date" defaultValue={selectedOrder?.orderDate} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalAmount">סכום סופי</Label>
                  <Input id="totalAmount" name="totalAmount" type="number" defaultValue={selectedOrder?.totalAmount} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">סטטוס</Label>
                  <Select name="status" defaultValue={selectedOrder?.status}>
                    <SelectTrigger><SelectValue placeholder="בחר סטטוס" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">ממתינה</SelectItem>
                      <SelectItem value="processing">בטיפול</SelectItem>
                      <SelectItem value="completed">הושלמה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
                <Button type="submit" className="bg-[#0b3d2e] hover:bg-[#0b3d2e]/90">שמירה</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" onValueChange={(value) => setFilterStatus(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="pending">ממתינות</TabsTrigger>
          <TabsTrigger value="processing">בטיפול</TabsTrigger>
          <TabsTrigger value="completed">הושלמו</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable data={filteredOrders} columns={columns} actionColumn={actionColumn} searchable={true} searchKeys={["orderNumber", "client"]} emptyMessage="לא נמצאו הזמנות" />
        </TabsContent>
        <TabsContent value="pending">
          <DataTable data={filteredOrders} columns={columns} actionColumn={actionColumn} searchable={true} searchKeys={["orderNumber", "client"]} emptyMessage="לא נמצאו הזמנות ממתינות" />
        </TabsContent>
        <TabsContent value="processing">
          <DataTable data={filteredOrders} columns={columns} actionColumn={actionColumn} searchable={true} searchKeys={["orderNumber", "client"]} emptyMessage="לא נמצאו הזמנות בטיפול" />
        </TabsContent>
        <TabsContent value="completed">
          <DataTable data={filteredOrders} columns={columns} actionColumn={actionColumn} searchable={true} searchKeys={["orderNumber", "client"]} emptyMessage="לא נמצאו הזמנות שהושלמו" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
