"use client";

import { useState } from "react";
import { DollarSign, Plus, Pencil, Trash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DUMMY_TRANSACTIONS, FinancialTransaction } from "@/lib/constants";
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
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(DUMMY_TRANSACTIONS);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === "all") return true;
    return transaction.type === filterType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  };

  const handleDelete = (transaction: FinancialTransaction) => {
    setTransactions(transactions.filter(t => t.id !== transaction.id));
    toast({
      title: "תנועה נמחקה בהצלחה",
      description: `התנועה הוסרה מהרשימה`,
    });
  };

  const handleEdit = (transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleSave = (formData: any) => {
    if (selectedTransaction) {
      // Edit existing transaction
      setTransactions(transactions.map(transaction => 
        transaction.id === selectedTransaction.id 
          ? { ...transaction, ...formData }
          : transaction
      ));
      toast({
        title: "תנועה עודכנה בהצלחה",
        description: `פרטי התנועה עודכנו`,
      });
    } else {
      // Add new transaction
      const newTransaction: FinancialTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
      };
      setTransactions([...transactions, newTransaction]);
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
                    <Input 
                      id="date" 
                      name="date"
                      type="date" 
                      className="pr-10"
                      defaultValue={selectedTransaction?.date}
                    />
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
                  <Input 
                    id="category" 
                    name="category"
                    defaultValue={selectedTransaction?.category}
                    placeholder="הזן קטגוריה" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">סכום</Label>
                  <Input 
                    id="amount" 
                    name="amount"
                    type="number"
                    defaultValue={selectedTransaction?.amount}
                    placeholder="הזן סכום" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">תיאור</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    defaultValue={selectedTransaction?.description}
                    placeholder="הזן תיאור" 
                  />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">סה"כ הכנסות</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(transactions
              .filter(t => t.type === "income")
              .reduce((sum, t) => sum + t.amount, 0)
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">סה"כ הוצאות</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(transactions
              .filter(t => t.type === "expense")
              .reduce((sum, t) => sum + t.amount, 0)
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">יתרה</h3>
          <p className="text-2xl font-bold">
            {formatCurrency(transactions.reduce((sum, t) => 
              t.type === "income" ? sum + t.amount : sum - t.amount, 0
            ))}
          </p>
        </div>
      </div>

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