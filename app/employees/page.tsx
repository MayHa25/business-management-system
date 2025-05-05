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
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

import { UserCog, Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Employee } from "@/lib/constants";
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
import { useToast } from "@/hooks/use-toast";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeShifts, setActiveShifts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUserId(user.uid);

      const q = query(collection(db, "employees"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Employee[];
      setEmployees(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedShifts = localStorage.getItem("activeShifts");
      if (storedShifts) {
        setActiveShifts(JSON.parse(storedShifts));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeShifts", JSON.stringify(activeShifts));
    }
  }, [activeShifts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  };

  const handleDelete = async (employee: Employee) => {
    await deleteDoc(doc(db, "employees", employee.id));
    setEmployees(employees.filter(e => e.id !== employee.id));
    toast({ title: "עובד נמחק בהצלחה", description: `${employee.name} הוסר מרשימת העובדים` });
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!userId) return;

    const dataToSave = {
      name: formData.get("name"),
      position: formData.get("position"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      salaryType: formData.get("salaryType"),
      monthlySalary: formData.get("salaryType") === "monthly" ? Number(formData.get("monthlySalary")) : 0,
      hourlyRate: formData.get("salaryType") === "hourly" ? Number(formData.get("hourlyRate")) : 0,
    };

    if (selectedEmployee) {
      const ref = doc(db, "employees", selectedEmployee.id);
      await updateDoc(ref, { ...dataToSave, userId });
      setEmployees(employees.map(e => e.id === selectedEmployee.id ? { ...e, ...dataToSave } : e));
      toast({ title: "עובד עודכן בהצלחה", description: `הפרטים של ${dataToSave.name} עודכנו` });

      if (dataToSave.salaryType === "monthly") {
        await addDoc(collection(db, "finances"), {
          date: new Date().toISOString().split('T')[0],
          type: "expense",
          category: "משכורת",
          amount: dataToSave.monthlySalary,
          description: `שכר חודשי עבור ${dataToSave.name}`,
          userId,
        });
      }
    } else {
      const newEmployee: Omit<Employee, "id"> = {
        ...dataToSave,
        userId,
      };
      const docRef = await addDoc(collection(db, "employees"), newEmployee);
      setEmployees([...employees, { id: docRef.id, ...newEmployee }]);
      toast({ title: "עובד נוסף בהצלחה", description: `${dataToSave.name} נוסף לרשימת העובדים` });

      if (dataToSave.salaryType === "monthly") {
        await addDoc(collection(db, "finances"), {
          date: new Date().toISOString().split('T')[0],
          type: "expense",
          category: "משכורת",
          amount: dataToSave.monthlySalary,
          description: `שכר חודשי עבור ${dataToSave.name}`,
          userId,
        });
      }
    }

    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleToggleShift = async (employee: Employee) => {
    const isActive = !!activeShifts[employee.id];
    if (isActive) {
      const startTime = activeShifts[employee.id];
      const endTime = Date.now();
      const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
      const earned = Number((employee.hourlyRate || 0) * hoursWorked);

      await addDoc(collection(db, "finances"), {
        date: new Date().toISOString().split('T')[0],
        type: "expense",
        category: "משכורת",
        amount: earned,
        description: `משכורת לפי שעה עבור ${employee.name}`,
        userId,
      });

      toast({ title: "משמרת הסתיימה", description: `${employee.name} עבד/ה ${hoursWorked.toFixed(2)} שעות` });

      const newActive = { ...activeShifts };
      delete newActive[employee.id];
      setActiveShifts(newActive);
    } else {
      setActiveShifts({ ...activeShifts, [employee.id]: Date.now() });
    }
  };

  const columns = [
    { header: "שם מלא", accessorKey: "name" as keyof Employee },
    { header: "תפקיד", accessorKey: "position" as keyof Employee },
    { header: "טלפון", accessorKey: "phone" as keyof Employee },
    { header: "אימייל", accessorKey: "email" as keyof Employee },
    { header: "סוג שכר", accessorKey: "salaryType" as keyof Employee },
    {
      header: "שכר",
      accessorKey: "monthlySalary" as keyof Employee,
      cell: (employee: Employee) => (
        employee.salaryType === "monthly"
          ? formatCurrency(employee.monthlySalary)
          : formatCurrency(employee.hourlyRate || 0) + " לשעה"
      )
    },
    {
      header: "משמרת",
      accessorKey: "shift" as keyof Employee,
      cell: (employee: Employee) => (
        employee.salaryType === "hourly" ? (
          <div className="flex flex-col gap-1">
            <Button
              className="text-xs"
              variant="outline"
              onClick={() => handleToggleShift(employee)}
            >
              {activeShifts[employee.id] ? `סיים משמרת (${Math.floor((Date.now() - activeShifts[employee.id]) / 1000 / 60)} דק')` : "התחל משמרת"}
            </Button>
            {activeShifts[employee.id] && (
              <span className="text-xs text-gray-500">
                {Math.floor((Date.now() - activeShifts[employee.id]) / 1000)} שניות פעילות
              </span>
            )}
          </div>
        ) : null
      )
    },
  ];

  const actionColumn = (employee: Employee) => (
    <div className="flex space-x-2 justify-end">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(employee)}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          <h1 className="text-xl font-bold">ניהול עובדים</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0b3d2e] hover:bg-[#0b3d2e]/90" onClick={() => setSelectedEmployee(null)}>
              <Plus className="h-4 w-4 ml-2" /> הוספת עובד
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? 'עריכת עובד' : 'הוספת עובד חדש'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave(formData);
            }} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">שם מלא</Label>
                  <Input id="name" name="name" defaultValue={selectedEmployee?.name} placeholder="הזן שם מלא" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">תפקיד</Label>
                  <Input id="position" name="position" defaultValue={selectedEmployee?.position} placeholder="הזן תפקיד" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">טלפון</Label>
                  <Input id="phone" name="phone" defaultValue={selectedEmployee?.phone} placeholder="הזן מספר טלפון" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input id="email" name="email" type="email" defaultValue={selectedEmployee?.email} placeholder="הזן כתובת אימייל" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salaryType">סוג שכר</Label>
                  <Select name="salaryType" defaultValue={selectedEmployee?.salaryType || "monthly"}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג שכר" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">חודשי</SelectItem>
                      <SelectItem value="hourly">שעתי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthlySalary">שכר חודשי</Label>
                  <Input id="monthlySalary" name="monthlySalary" type="number" defaultValue={selectedEmployee?.monthlySalary} placeholder="הזן שכר חודשי" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hourlyRate">שכר לשעה</Label>
                  <Input id="hourlyRate" name="hourlyRate" type="number" defaultValue={selectedEmployee?.hourlyRate} placeholder="הזן שכר לשעה" />
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

      <div className="bg-white rounded-lg p-4 border shadow-sm mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-1">סה"כ הוצאות שכר חודשיות</h3>
        <p className="text-xl font-bold text-[#0b3d2e]">
          {formatCurrency(employees.filter(e => e.salaryType === "monthly").reduce((sum, employee) => sum + employee.monthlySalary, 0))}
        </p>
      </div>

      <DataTable
        data={employees}
        columns={columns}
        actionColumn={actionColumn}
        searchable={true}
        searchKeys={["name", "position", "email"]}
        emptyMessage="לא נמצאו עובדים"
      />
    </div>
  );
}
