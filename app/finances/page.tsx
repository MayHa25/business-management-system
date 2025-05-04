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

import { DollarSign, Plus, Pencil, Trash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FinancialTransaction } from "@/lib/constants";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUserId(user.uid);

      const q = query(collection(db, "finances"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FinancialTransaction[];
      setTransactions(data);
    });

    return () => unsubscribe();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === "all") return true;
    return transaction.type === filterType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount);
  };

  const handleDelete = async (transaction: FinancialTransaction) => {
    if (!transaction.id) return;
    await deleteDoc(doc(db, "finances", transaction.id));
    setTransactions(transactions.filter(t => t.id !== transaction.id));
    toast({ title: "תנועה נמחקה בהצלחה", description: "התנועה הוסרה מהרשימה" });
  };

  const handleSave = async (formData: any) => {
    if (!userId) return;

    if (selectedTransaction) {
      const ref = doc(db, "finances", selectedTransaction.id);
      await updateDoc(ref, {
        ...formData,
        userId,
      });
      setTransactions(transactions.map(transaction =>
        transaction.id === selectedTransaction.id ? { ...transaction, ...formData } : transaction
      ));
      toast({ title: "תנועה עודכנה בהצלחה", description: "פרטי התנועה עודכנו" });
    } else {
      const newTransaction: Omit<FinancialTransaction, "id"> = {
        ...formData,
        userId,
      };
      const docRef = await addDoc(collection(db, "finances"), newTransaction);
      setTransactions([...transactions, { id: docRef.id, ...newTransaction }]);
      toast({ title: "תנועה נוספה בהצלחה", description: "התנועה נוספה לרשימה" });
    }
    setIsDialogOpen(false);
    setSelectedTransaction(null);
  };

  const columns = [
    {
      header: "תאריך",
      accessorKey: "date" as keyof FinancialTransaction,
    },
    {
      header: "סוג תנועה",
      accessorKey: "type" as keyof FinancialTransaction,
      cell: (row: FinancialTransaction) => (
        <Badge variant={row.type === "income" ? "default" : "destructive"}>
          {row.type === "income" ? "הכנסה" : "הוצאה"}
        </Badge>
      ),
    },
    {
      header: "קטגוריה",
      accessorKey: "category" as keyof FinancialTransaction,
    },
    {
      header: "סכום",
      accessorKey: "amount" as keyof FinancialTransaction,
      cell: (row: FinancialTransaction) => (
        <span className={row.type === "income" ? "text-green-600" : "text-red-600"}>
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: "תיאור",
      accessorKey: "description" as keyof FinancialTransaction,
    },
  ];

  const actionColumn = (transaction: FinancialTransaction) => (
    <div className="flex space-x-2 justify-end">
      <Button variant="ghost" size="icon" onClick={() => setSelectedTransaction(transaction)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction)}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          <h1 className="text-xl font-bold">ניהול פיננסי</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0b3d2e] hover:bg-[#0b3d2e]/90" onClick={() => setSelectedTransaction(null)}>
              <Plus className="h-4 w-4 ml-2" /> הוספת תנועה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedTransaction ? 'עריכת תנועה' : 'הוספת תנועה פיננסית'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave({
                date: formData.get('date'),
                type: formData.get('type'),
                category: formData.get('category'),
                amount: Number(formData.get('amount')),
                description: formData.get('description'),
              });
            }} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">תאריך</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="date" name="date" type="date" className="pr-10" defaultValue={selectedTransaction?.date} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">סוג תנועה</Label>
                  <Select name="type" defaultValue={selectedTransaction?.type}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג תנועה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">הכנסה</SelectItem>
                      <SelectItem value="expense">הוצאה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">קטגוריה</Label>
                  <Input id="category" name="category" defaultValue={selectedTransaction?.category} placeholder="הזן קטגוריה" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">סכום</Label>
                  <Input id="amount" name="amount" type="number" defaultValue={selectedTransaction?.amount} placeholder="הזן סכום" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">תיאור</Label>
                  <Textarea id="description" name="description" defaultValue={selectedTransaction?.description} placeholder="הזן תיאור" />
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

      <Tabs defaultValue="all" onValueChange={(value) => setFilterType(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="income">הכנסות</TabsTrigger>
          <TabsTrigger value="expense">הוצאות</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable data={filteredTransactions} columns={columns} actionColumn={actionColumn} searchable={true} searchKeys={["category", "description"]} emptyMessage="לא נמצאו תנועות פיננסיות" />
        </TabsContent>
        <TabsContent value="income">
          <DataTable data={filteredTransactions} columns={columns} actionColumn={actionColumn} searchable={true} searchKeys={["category", "description"]} emptyMessage="לא נמצאו הכנסות" />
        </TabsContent>
        <TabsContent value="expense">
          <DataTable data={filteredTransactions} columns={columns} actionColumn={actionColumn} searchable={true} searchKeys={["category", "description"]} emptyMessage="לא נמצאו הוצאות" />
        </TabsContent>
      </Tabs>
    </div>
  );
}