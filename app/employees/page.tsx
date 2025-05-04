"use client";

import { useState } from "react";
import { UserCog, Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DUMMY_EMPLOYEES, Employee } from "@/lib/constants";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(DUMMY_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
  };

  const handleDelete = (employee: Employee) => {
    setEmployees(employees.filter(e => e.id !== employee.id));
    toast({
      title: "עובד נמחק בהצלחה",
      description: `${employee.name} הוסר מרשימת העובדים`,
    });
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleSave = (formData: any) => {
    if (selectedEmployee) {
      // Edit existing employee
      setEmployees(employees.map(employee => 
        employee.id === selectedEmployee.id 
          ? { ...employee, ...formData }
          : employee
      ));
      toast({
        title: "עובד עודכן בהצלחה",
        description: `הפרטים של ${formData.name} עודכנו`,
      });
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
      };
      setEmployees([...employees, newEmployee]);
      toast({
        title: "עובד נוסף בהצלחה",
        description: `${formData.name} נוסף לרשימת העובדים`,
      });
    }
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };

  const columns = [
    {
      header: "שם מלא",
      accessorKey: "name" as keyof Employee,
    },
    {
      header: "תפקיד",
      accessorKey: "position" as keyof Employee,
    },
    {
      header: "טלפון",
      accessorKey: "phone" as keyof Employee,
    },
    {
      header: "אימייל",
      accessorKey: "email" as keyof Employee,
    },
    {
      header: "שכר חודשי",
      accessorKey: "monthlySalary" as keyof Employee,
      cell: (employee: Employee) => formatCurrency(employee.monthlySalary),
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
              handleSave({
                name: formData.get('name'),
                position: formData.get('position'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                monthlySalary: Number(formData.get('monthlySalary')),
              });
            }} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">שם מלא</Label>
                  <Input 
                    id="name" 
                    name="name"
                    defaultValue={selectedEmployee?.name}
                    placeholder="הזן שם מלא" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">תפקיד</Label>
                  <Input 
                    id="position" 
                    name="position"
                    defaultValue={selectedEmployee?.position}
                    placeholder="הזן תפקיד" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">טלפון</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    defaultValue={selectedEmployee?.phone}
                    placeholder="הזן מספר טלפון" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    defaultValue={selectedEmployee?.email}
                    placeholder="הזן כתובת אימייל" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthlySalary">שכר חודשי</Label>
                  <Input 
                    id="monthlySalary" 
                    name="monthlySalary"
                    type="number"
                    defaultValue={selectedEmployee?.monthlySalary}
                    placeholder="הזן שכר חודשי" 
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

      <div className="bg-white rounded-lg p-4 border shadow-sm mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-1">סה"כ הוצאות שכר חודשיות</h3>
        <p className="text-xl font-bold text-[#0b3d2e]">
          {formatCurrency(employees.reduce((sum, employee) => sum + employee.monthlySalary, 0))}
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