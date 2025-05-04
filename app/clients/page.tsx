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

import { useRouter } from "next/navigation";
import { Users, Plus, Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Client } from "@/lib/constants";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.uid);

      const q = query(collection(db, "clients"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Client[];
      setClients(data);
    });

    return () => unsubscribe();
  }, [router]);

  const filteredClients = clients.filter(client => {
    if (filterStatus === "all") return true;
    return filterStatus === "active" ? client.isActive : !client.isActive;
  });

  const handleDelete = async (client: Client) => {
    await deleteDoc(doc(db, "clients", client.id));
    setClients(clients.filter(c => c.id !== client.id));
    toast({
      title: "לקוח נמחק בהצלחה",
      description: `${client.name} הוסר מרשימת הלקוחות`,
    });
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!userId) return;

    if (selectedClient) {
      const ref = doc(db, "clients", selectedClient.id);
      await updateDoc(ref, {
        ...formData,
        dateAdded: selectedClient.dateAdded,
        userId,
      });
      setClients(clients.map(client =>
        client.id === selectedClient.id ? { ...client, ...formData } : client
      ));
      toast({
        title: "לקוח עודכן בהצלחה",
        description: `הפרטים של ${formData.name} עודכנו`,
      });
    } else {
      const newClient: Omit<Client, "id"> = {
        dateAdded: new Date().toISOString().split("T")[0],
        userId,
        ...formData,
      };
      const docRef = await addDoc(collection(db, "clients"), newClient);
      setClients([...clients, { id: docRef.id, ...newClient }]);
      toast({
        title: "לקוח נוסף בהצלחה",
        description: `${formData.name} נוסף לרשימת הלקוחות`,
      });
    }

    setIsDialogOpen(false);
    setSelectedClient(null);
  };

  const columns = [
    {
      header: "שם מלא",
      accessorKey: "name" as keyof Client,
    },
    {
      header: "טלפון",
      accessorKey: "phone" as keyof Client,
    },
    {
      header: "אימייל",
      accessorKey: "email" as keyof Client,
    },
    {
      header: "תאריך הוספה",
      accessorKey: "dateAdded" as keyof Client,
    },
    {
      header: "סטטוס",
      accessorKey: "isActive" as keyof Client,
      cell: (client: Client) => (
        <Badge variant={client.isActive ? "default" : "outline"}>
          {client.isActive ? "פעיל" : "לא פעיל"}
        </Badge>
      ),
    },
  ];

  const actionColumn = (client: Client) => (
    <div className="flex space-x-2 justify-end">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(client)}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h1 className="text-xl font-bold">ניהול לקוחות</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0b3d2e] hover:bg-[#0b3d2e]/90" onClick={() => setSelectedClient(null)}>
              <Plus className="h-4 w-4 ml-2" /> הוספת לקוח
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedClient ? "עריכת לקוח" : "הוספת לקוח חדש"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSave({
                  name: formData.get("name"),
                  phone: formData.get("phone"),
                  email: formData.get("email"),
                  isActive: formData.get("status") === "active",
                });
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">שם מלא</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedClient?.name}
                    placeholder="הזן שם מלא"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={selectedClient?.phone}
                    placeholder="הזן מספר טלפון"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedClient?.email}
                    placeholder="הזן כתובת אימייל"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">סטטוס</Label>
                  <Select
                    name="status"
                    defaultValue={selectedClient?.isActive ? "active" : "inactive"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סטטוס" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">פעיל</SelectItem>
                      <SelectItem value="inactive">לא פעיל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ביטול
                </Button>
                <Button type="submit" className="bg-[#0b3d2e] hover:bg-[#0b3d2e]/90">
                  שמירה
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" onValueChange={(value) => setFilterStatus(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="active">פעילים</TabsTrigger>
          <TabsTrigger value="inactive">לא פעילים</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable
            data={filteredClients}
            columns={columns}
            actionColumn={actionColumn}
            searchable={true}
            searchKeys={["name", "phone", "email"]}
            emptyMessage="לא נמצאו לקוחות"
          />
        </TabsContent>
        <TabsContent value="active">
          <DataTable
            data={filteredClients}
            columns={columns}
            actionColumn={actionColumn}
            searchable={true}
            searchKeys={["name", "phone", "email"]}
            emptyMessage="לא נמצאו לקוחות פעילים"
          />
        </TabsContent>
        <TabsContent value="inactive">
          <DataTable
            data={filteredClients}
            columns={columns}
            actionColumn={actionColumn}
            searchable={true}
            searchKeys={["name", "phone", "email"]}
            emptyMessage="לא נמצאו לקוחות לא פעילים"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
