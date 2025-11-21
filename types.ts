
export enum ProductStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum PRStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  ConvertedToPO = 'Converted To PO',
}

export enum SalesStatus {
  Quotation = 'Quotation',
  SalesOrder = 'Sales Order',
  DeliveryOrder = 'Delivery Order',
  Invoice = 'Invoice',
  Completed = 'Completed',
}

export enum PaymentStatus {
  Pending = 'Unpaid',
  Paid = 'Paid',
}

export enum UserRole {
  Admin = 'Admin',
  Inventory = 'Inventory Manager',
  Purchasing = 'Purchasing Manager',
  Sales = 'Sales Manager',
  Accounting = 'Accountant',
  HR = 'HR Manager',
  Production = 'Production Manager'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  status: ProductStatus;
  type?: 'Raw Material' | 'Finished Good'; // Added for Manufacturing
}

export interface Partner {
  id: string;
  name: string;
  type: 'Customer' | 'Supplier';
  email: string;
  phone: string;
  address: string;
}

export interface PurchaseRequest {
  id: string;
  requester: string;
  date: string;
  items: { productId: string; productName: string; quantity: number; cost: number }[];
  totalCost: number;
  status: PRStatus;
  poId?: string;
}

export interface PurchaseOrder {
  id: string;
  prId: string;
  supplier: string; 
  date: string;
  totalCost: number;
  status: 'Pending' | 'Sent' | 'Completed';
}

export interface SalesOrder {
  id: string;
  customerName: string; 
  date: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  totalAmount: number;
  status: SalesStatus;
  paymentStatus: PaymentStatus;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: number;
  category: string; 
  referenceId?: string; 
}

// --- HRM Types ---
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  status: 'Active' | 'Terminated';
  joinedDate: string;
}

// --- Manufacturing Types ---
export interface BOM {
  id: string;
  name: string;
  productId: string; // The Finished Good
  components: { productId: string; quantity: number }[]; // Raw Materials needed
}

export interface ProductionOrder {
  id: string;
  bomId: string;
  quantity: number;
  status: 'Planned' | 'Completed';
  date: string;
}
