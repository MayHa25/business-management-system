export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateAdded: string;
  isActive: boolean;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  userId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
}

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  status: 'open' | 'closed';
  repeat?: "none" | "daily" | "weekly" | "monthly" | "yearly" ;
}

export interface Order {
  id: string;
  orderNumber: string;
  client: string;
  orderDate: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed';
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  monthlySalary: number;
  salaryType?: "monthly" | "hourly";
  hourlyRate?: number;
  userId: string;
}

export const DUMMY_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'ישראל ישראלי',
    phone: '050-1234567',
    email: 'israel@example.com',
    dateAdded: '2023-01-15',
    isActive: true,
  },
  {
    id: '2',
    name: 'מיכל לוי',
    phone: '052-7654321',
    email: 'michal@example.com',
    dateAdded: '2023-02-20',
    isActive: true,
  },
  {
    id: '3',
    name: 'דוד כהן',
    phone: '054-9876543',
    email: 'david@example.com',
    dateAdded: '2023-03-10',
    isActive: false,
  },
  {
    id: '4',
    name: 'רות אברהם',
    phone: '053-5557777',
    email: 'ruth@example.com',
    dateAdded: '2023-04-05',
    isActive: true,
  },
  {
    id: '5',
    name: 'יוסף אלוני',
    phone: '058-4441111',
    email: 'yosef@example.com',
    dateAdded: '2023-05-12',
    isActive: true,
  },
];

export const DUMMY_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: '1',
    date: '2023-06-01',
    type: 'income',
    category: 'מכירות',
    amount: 5000,
    description: 'תשלום עבור פרויקט עיצוב',
    userId: 'demo-user'
  },
  {
    id: '2',
    date: '2023-06-05',
    type: 'expense',
    category: 'ציוד משרדי',
    amount: 750,
    description: 'רכישת מדפסת חדשה',
    userId: 'demo-user'
  },
  {
    id: '3',
    date: '2023-06-10',
    type: 'income',
    category: 'שירותים',
    amount: 3200,
    description: 'ייעוץ עסקי ללקוח',
    userId: 'demo-user'
  },
  {
    id: '4',
    date: '2023-06-15',
    type: 'expense',
    category: 'שכירות',
    amount: 4500,
    description: 'שכירות משרד חודשית',
    userId: 'demo-user'
  },
  {
    id: '5',
    date: '2023-06-20',
    type: 'income',
    category: 'מכירות',
    amount: 6800,
    description: 'פרויקט פיתוח אתר',
    userId: 'demo-user'
  },
];

export const DUMMY_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'מחשב נייד',
    category: 'אלקטרוניקה',
    quantity: 5,
    unitPrice: 3500,
    supplier: 'טכנולוגיות בע"מ',
  },
  {
    id: '2',
    name: 'כיסא משרדי',
    category: 'ריהוט',
    quantity: 10,
    unitPrice: 750,
    supplier: 'ריהוט איכותי בע"מ',
  },
  {
    id: '3',
    name: 'מדפסת לייזר',
    category: 'אלקטרוניקה',
    quantity: 3,
    unitPrice: 1200,
    supplier: 'טכנולוגיות בע"מ',
  },
  {
    id: '4',
    name: 'שולחן עבודה',
    category: 'ריהוט',
    quantity: 7,
    unitPrice: 1800,
    supplier: 'ריהוט איכותי בע"מ',
  },
  {
    id: '5',
    name: 'טאבלט',
    category: 'אלקטרוניקה',
    quantity: 4,
    unitPrice: 2200,
    supplier: 'אלקטרוניקה פלוס',
  },
];

export const DUMMY_TASKS: Task[] = [
  {
    id: '1',
    name: 'פגישה עם לקוח חדש',
    dueDate: '2023-07-15',
    status: 'open',
  },
  {
    id: '2',
    name: 'הגשת דוח מס',
    dueDate: '2023-07-20',
    status: 'open',
  },
  {
    id: '3',
    name: 'עדכון אתר אינטרנט',
    dueDate: '2023-07-10',
    status: 'closed',
  },
  {
    id: '4',
    name: 'הכנת הצעת מחיר',
    dueDate: '2023-07-18',
    status: 'open',
  },
  {
    id: '5',
    name: 'תשלום לספקים',
    dueDate: '2023-07-05',
    status: 'closed',
  },
];

export const DUMMY_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2023-001',
    client: 'ישראל ישראלי',
    orderDate: '2023-06-05',
    totalAmount: 12500,
    status: 'completed',
  },
  {
    id: '2',
    orderNumber: 'ORD-2023-002',
    client: 'מיכל לוי',
    orderDate: '2023-06-12',
    totalAmount: 8700,
    status: 'processing',
  },
  {
    id: '3',
    orderNumber: 'ORD-2023-003',
    client: 'דוד כהן',
    orderDate: '2023-06-18',
    totalAmount: 4300,
    status: 'pending',
  },
  {
    id: '4',
    orderNumber: 'ORD-2023-004',
    client: 'רות אברהם',
    orderDate: '2023-06-22',
    totalAmount: 15200,
    status: 'processing',
  },
  {
    id: '5',
    orderNumber: 'ORD-2023-005',
    client: 'יוסף אלוני',
    orderDate: '2023-06-28',
    totalAmount: 9600,
    status: 'pending',
  },
];

export const DUMMY_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'אביב גולן',
    position: 'מנהל פרויקטים',
    phone: '050-9876543',
    email: 'aviv@example.com',
    monthlySalary: 15000,
    userId: "demo-user-id",
  },
  {
    id: '2',
    name: 'נועה שמיר',
    position: 'מעצבת גרפית',
    phone: '052-1234567',
    email: 'noa@example.com',
    monthlySalary: 12000,
    userId: "demo-user-id",
  },
  {
    id: '3',
    name: 'יובל כהן',
    position: 'מפתח',
    phone: '054-5556666',
    email: 'yuval@example.com',
    monthlySalary: 18000,
    userId: "demo-user-id",
  },
  {
    id: '4',
    name: 'שירה לוי',
    position: 'מנהלת שיווק',
    phone: '053-7778888',
    email: 'shira@example.com',
    monthlySalary: 14000,
    userId: "demo-user-id",
  },
  {
    id: '5',
    name: 'עומר דוד',
    position: 'איש מכירות',
    phone: '058-3332222',
    email: 'omer@example.com',
    monthlySalary: 10000,
    userId: "demo-user-id",
  },
];