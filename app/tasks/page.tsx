"use client";

import { useState } from "react";
import { ClipboardList, Plus, Check, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DUMMY_TASKS, Task } from "@/lib/constants";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(DUMMY_TASKS);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === "all") return true;
    return filterStatus === "open" ? task.status === "open" : task.status === "closed";
  });

  const handleDelete = (task: Task) => {
    setTasks(tasks.filter(t => t.id !== task.id));
    toast({
      title: "משימה נמחקה בהצלחה",
      description: `${task.name} הוסרה מרשימת המשימות`,
    });
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleSave = (formData: any) => {
    if (selectedTask) {
      // Edit existing task
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, ...formData }
          : task
      ));
      toast({
        title: "משימה עודכנה בהצלחה",
        description: `הפרטים של ${formData.name} עודכנו`,
      });
    } else {
      // Add new task
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        status: 'open',
        ...formData,
      };
      setTasks([...tasks, newTask]);
      toast({
        title: "משימה נוספה בהצלחה",
        description: `${formData.name} נוספה לרשימת המשימות`,
      });
    }
    setIsDialogOpen(false);
    setSelectedTask(null);
  };

  const markTaskAs = (id: string, status: 'open' | 'closed') => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
    toast({
      title: `משימה ${status === 'closed' ? 'הושלמה' : 'נפתחה מחדש'} בהצלחה`,
    });
  };

  const columns = [
    {
      header: "שם משימה",
      accessorKey: "name" as keyof Task,
    },
    {
      header: "תאריך יעד",
      accessorKey: "dueDate" as keyof Task,
    },
    {
      header: "סטטוס",
      accessorKey: "status" as keyof Task,
      cell: (task: Task) => (
        <Badge variant={task.status === "open" ? "default" : "outline"}>
          {task.status === "open" ? "פתוחה" : "סגורה"}
        </Badge>
      ),
    },
  ];

  const actionColumn = (task: Task) => (
    <div className="flex space-x-2 justify-end">
      {task.status === "open" ? (
        <Button variant="ghost" size="icon" onClick={() => markTaskAs(task.id, 'closed')}>
          <Check className="h-4 w-4 text-green-600" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" onClick={() => markTaskAs(task.id, 'open')}>
          <X className="h-4 w-4 text-red-600" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => handleDelete(task)}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          <h1 className="text-xl font-bold">ניהול משימות</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0b3d2e] hover:bg-[#0b3d2e]/90" onClick={() => setSelectedTask(null)}>
              <Plus className="h-4 w-4 ml-2" /> הוספת משימה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedTask ? 'עריכת משימה' : 'הוספת משימה חדשה'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSave({
                name: formData.get('name'),
                dueDate: formData.get('dueDate'),
              });
            }} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">שם משימה</Label>
                  <Input 
                    id="name" 
                    name="name"
                    defaultValue={selectedTask?.name}
                    placeholder="הזן שם משימה" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">תאריך יעד</Label>
                  <Input 
                    id="dueDate" 
                    name="dueDate"
                    type="date"
                    defaultValue={selectedTask?.dueDate}
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

      <Tabs defaultValue="all" onValueChange={(value) => setFilterStatus(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="open">פתוחות</TabsTrigger>
          <TabsTrigger value="closed">סגורות</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable 
            data={filteredTasks} 
            columns={columns} 
            actionColumn={actionColumn}
            searchable={true}
            searchKeys={["name"]}
            emptyMessage="לא נמצאו משימות"
          />
        </TabsContent>
        <TabsContent value="open">
          <DataTable 
            data={filteredTasks} 
            columns={columns} 
            actionColumn={actionColumn}
            searchable={true}
            searchKeys={["name"]}
            emptyMessage="לא נמצאו משימות פתוחות"
          />
        </TabsContent>
        <TabsContent value="closed">
          <DataTable 
            data={filteredTasks} 
            columns={columns} 
            actionColumn={actionColumn}
            searchable={true}
            searchKeys={["name"]}
            emptyMessage="לא נמצאו משימות סגורות"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}