"use client";

import { useState, useEffect } from "react";
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
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FinancialTransaction[];
      setTransactions(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType === "all") return true;
    return transaction.type === filterType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(amount);
  };

  const handleDelete = async (transaction: FinancialTransaction) => {
    await deleteDoc(doc(db, "finances", transaction.id));
    setTransactions(transactions.filter((t) => t.id !== transaction.id));
    toast({
      title: "תנועה נמחקה בהצלחה",
      description: `התנועה הוסרה מהרשימה`,
    });
  };

  const handleEdit = (transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!userId) return;

    if (selectedTransaction) {
      const ref = doc(db, "finances", selectedTransaction.id);
      await updateDoc(ref, {
        ...formData,
        userId,
      });
      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransaction.id ? { ...t, ...formData } : t
        )
      );
      toast({
        title: "תנועה עודכנה בהצלחה",
        description: `פרטי התנועה עודכנו`,
      });
    } else {
      const newTransaction: Omit<FinancialTransaction, "id"> = {
        userId,
        ...formData,
      };
      const docRef = await addDoc(collection(db, "finances"), newTransaction);
      setTransactions([...transactions, { id: docRef.id, ...newTransaction }]);
      toast({
        title: "תנועה נוספה בהצלחה",
        description: `התנועה נוספה לרשימה`,
      });
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
      cell: (transaction: FinancialTransaction) => (
        <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
          {transaction.type === "income" ? "הכנסה" : "הוצאה"}
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
      cell: (transaction: FinancialTransaction) => (
        <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
          {formatCurrency(transaction.amount)}
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
      <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
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
        {/* ... כל הקוד הקיים של הדיאלוג נשמר ללא שינוי */}
      </div>

      {/* ... שאר האלמנטים נשמרים ללא שינוי */}

      <Tabs defaultValue="all" onValueChange={(value) => setFilterType(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="income">הכנסות</TabsTrigger>
          <TabsTrigger value="expense">הוצאות</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable
            data={filteredTransactions}
            columns={columns}
            actionColumn={actionColumn}
            searchable={true}
            searchKeys={["category", "description"]}
            emptyMessage="לא נמצאו תנועות פיננסיות"
          />
        </TabsContent>
        <TabsContent value="income">
          <DataTable
            data={filteredTransactions}
            columns={columns}
            actionColumn={actionColumn}
            searchable={true}
            searchKeys={["category", "description"]}
            emptyMessage="לא נמצאו הכנסות"
          />
        </TabsContent>
        <TabsContent value="expense">
          <DataTable
            data={filteredTransactions}
            columns={columns}
            actionColumn={actionColumn}
            searchable={true}
            searchKeys={["category", "description"]}
            emptyMessage="לא נמצאו הוצאות"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
