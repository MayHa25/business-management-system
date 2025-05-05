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
import { db, auth } from "@/lib/firebase";
import { Package, Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { InventoryItem } from "@/lib/constants";
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

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUserId(user.uid);

      const q = query(collection(db, "inventory"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InventoryItem[];
      setInventory(data);
    });

    return () => unsubscribe();
  }, []);

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  const filteredInventory = filterCategory
    ? inventory.filter(item => item.category === filterCategory)
    : inventory;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  };

  const handleDelete = async (item: InventoryItem) => {
    await deleteDoc(doc(db, "inventory", item.id));
    setInventory(inventory.filter(i => i.id !== item.id));
    toast({
      title: "פריט נמחק בהצלחה",
      description: `${item.name} הוסר מהמלאי`,
    });
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!userId) return;

    if (selectedItem) {
      const ref = doc(db, "inventory", selectedItem.id);
      await updateDoc(ref, { ...formData, userId });
      setInventory(inventory.map(item =>
        item.id === selectedItem.id ? { ...item, ...formData } : item
      ));
      toast({
        title: "פריט עודכן בהצלחה",
        description: `הפרטים של ${formData.name} עודכנו`,
      });
    } else {
      const newItem: Omit<InventoryItem, "id"> = {
        ...formData,
        userId,
      };
      const docRef = await addDoc(collection(db, "inventory"), newItem);
      setInventory([...inventory, { id: docRef.id, ...newItem }]);

      // ✅ הוספת תנועה פיננסית אוטומטית עבור רכישת מלאי
      await addDoc(collection(db, "finances"), {
        userId,
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        category: "מלאי",
        amount: newItem.unitPrice * newItem.quantity,
        description: `רכישת מלאי: ${newItem.name}`,
      });

      toast({
        title: "פריט נוסף בהצלחה",
        description: `${formData.name} נוסף למלאי`,
      });
    }
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const columns = [
    {
      header: "שם פריט",
      accessorKey: "name" as keyof InventoryItem,
    },
    {
      header: "קטגוריה",
      accessorKey: "category" as keyof InventoryItem,
      cell: (item: InventoryItem) => (
        <Badge variant="outline">{item.category}</Badge>
      ),
    },
    {
      header: "כמות במלאי",
      accessorKey: "quantity" as keyof InventoryItem,
      cell: (item: InventoryItem) => (
        <span className={item.quantity <= 2 ? "text-red-600 font-medium" : ""}>
          {item.quantity}
        </span>
      ),
    },
    {
      header: "מחיר ליחידה",
      accessorKey: "unitPrice" as keyof InventoryItem,
      cell: (item: InventoryItem) => formatCurrency(item.unitPrice),
    },
    {
      header: "ספק",
      accessorKey: "supplier" as keyof InventoryItem,
    },
  ];

  const actionColumn = (item: InventoryItem) => (
    <div className="flex space-x-2 justify-end">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h1 className="text-xl font-bold">ניהול מלאי</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0b3d2e] hover:bg-[#0b3d2e]/90" onClick={() => setSelectedItem(null)}>
              <Plus className="h-4 w-4 ml-2" /> הוספת פריט
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedItem ? 'עריכת פריט' : 'הוספת פריט למלאי'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave({
                name: formData.get('name'),
                category: formData.get('category'),
                quantity: Number(formData.get('quantity')),
                unitPrice: Number(formData.get('unitPrice')),
                supplier: formData.get('supplier'),
              });
            }} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">שם פריט</Label>
                  <Input id="name" name="name" defaultValue={selectedItem?.name} placeholder="הזן שם פריט" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">קטגוריה</Label>
                  <Input id="category" name="category" defaultValue={selectedItem?.category} placeholder="הזן קטגוריה" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">כמות</Label>
                  <Input id="quantity" name="quantity" type="number" defaultValue={selectedItem?.quantity} placeholder="הזן כמות" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">מחיר ליחידה</Label>
                  <Input id="unitPrice" name="unitPrice" type="number" defaultValue={selectedItem?.unitPrice} placeholder="הזן מחיר" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supplier">ספק</Label>
                  <Input id="supplier" name="supplier" defaultValue={selectedItem?.supplier} placeholder="הזן ספק" />
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

      <div className="flex justify-between items-center mb-4">
        <div>
          <Label htmlFor="category-filter">סינון לפי קטגוריה</Label>
          <Select onValueChange={value => setFilterCategory(value === "all" ? null : value)}>
            <SelectTrigger className="w-[180px] mt-1">
              <SelectValue placeholder="כל הקטגוריות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">סה"כ שווי מלאי</h3>
          <p className="text-xl font-bold text-[#0b3d2e]">
            {formatCurrency(inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}
          </p>
        </div>
      </div>

      <DataTable 
        data={filteredInventory} 
        columns={columns} 
        actionColumn={actionColumn}
        searchable={true}
        searchKeys={["name", "supplier"]}
        emptyMessage="לא נמצאו פריטים במלאי"
      />
    </div>
  );
}
