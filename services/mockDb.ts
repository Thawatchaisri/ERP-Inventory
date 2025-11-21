
import { Product, PurchaseRequest, SalesOrder, ProductStatus, PRStatus, SalesStatus, PurchaseOrder, Transaction, Partner, PaymentStatus, Employee, BOM, ProductionOrder } from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', sku: 'LAP-001', name: 'Gaming Laptop X1', category: 'Electronics', price: 1500, cost: 1000, stock: 10, status: ProductStatus.Active, type: 'Finished Good' },
  { id: '2', sku: 'MOU-002', name: 'Wireless Mouse', category: 'Accessories', price: 50, cost: 20, stock: 100, status: ProductStatus.Active, type: 'Finished Good' },
  { id: '3', sku: 'CHAIR-003', name: 'Ergo Chair', category: 'Furniture', price: 300, cost: 150, stock: 5, status: ProductStatus.Active, type: 'Finished Good' },
  // Raw Materials for Manufacturing Demo
  { id: 'RM-001', sku: 'WOOD-OAK', name: 'Oak Wood Plank', category: 'Raw Material', price: 0, cost: 20, stock: 50, status: ProductStatus.Active, type: 'Raw Material' },
  { id: 'RM-002', sku: 'MET-ALU', name: 'Aluminum Base', category: 'Raw Material', price: 0, cost: 30, stock: 30, status: ProductStatus.Active, type: 'Raw Material' },
  { id: 'RM-003', sku: 'SCR-SET', name: 'Screw Set (x10)', category: 'Raw Material', price: 0, cost: 5, stock: 200, status: ProductStatus.Active, type: 'Raw Material' },
];

const INITIAL_PARTNERS: Partner[] = [
  { id: '1', name: 'Tech Solutions Inc.', type: 'Customer', email: 'contact@techsol.com', phone: '02-123-4567', address: '123 Tech Park' },
  { id: '2', name: 'Global Supplies Co.', type: 'Supplier', email: 'sales@globalsupplies.com', phone: '02-987-6543', address: '456 Warehouse District' },
  { id: '3', name: 'Retail King', type: 'Customer', email: 'purchasing@retailking.com', phone: '02-555-8888', address: '789 Mall Avenue' },
  { id: '4', name: 'Chip Makers Ltd.', type: 'Supplier', email: 'orders@chipmakers.com', phone: '02-444-3333', address: '101 Silicon Valley' },
];

const INITIAL_PRS: PurchaseRequest[] = [
  { 
    id: 'PR-2023-001', 
    requester: 'John Doe', 
    date: '2023-10-01', 
    items: [{ productId: '2', productName: 'Wireless Mouse', quantity: 50, cost: 20 }], 
    totalCost: 1000, 
    status: PRStatus.Pending 
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Sarah Connor', position: 'HR Manager', department: 'Human Resources', salary: 5000, status: 'Active', joinedDate: '2022-01-15' },
  { id: 'EMP-002', name: 'Tony Stark', position: 'Lead Engineer', department: 'Engineering', salary: 12000, status: 'Active', joinedDate: '2021-05-20' },
];

const INITIAL_BOMS: BOM[] = [
  { 
    id: 'BOM-001', 
    name: 'Ergo Chair Assembly', 
    productId: '3', // Ergo Chair
    components: [
      { productId: 'RM-001', quantity: 2 }, // 2 Wood Planks
      { productId: 'RM-002', quantity: 1 }, // 1 Base
      { productId: 'RM-003', quantity: 4 }, // 4 Screw Sets
    ]
  }
];

const INITIAL_SALES: SalesOrder[] = [];
const INITIAL_POS: PurchaseOrder[] = [];
const INITIAL_EXPENSES: Transaction[] = [
  { id: 'TX-001', date: '2023-10-05', description: 'Office Rent', type: 'Expense', amount: 2000, category: 'Rent' },
  { id: 'TX-002', date: '2023-10-10', description: 'Internet Bill', type: 'Expense', amount: 100, category: 'Utilities' }
];

// Storage Keys
const KEYS = {
  PRODUCTS: 'erp_products',
  PARTNERS: 'erp_partners',
  PRS: 'erp_prs',
  POS: 'erp_pos',
  SALES: 'erp_sales',
  EXPENSES: 'erp_expenses',
  EMPLOYEES: 'erp_employees',
  BOMS: 'erp_boms',
  PROD_ORDERS: 'erp_prod_orders',
};

// --- Generic LocalStorage Helpers ---
const getData = <T>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultData;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultData;
  }
};

const setData = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Inventory Service ---

export const getProducts = async (): Promise<Product[]> => {
  await delay(300);
  return getData<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  await delay(500);
  const products = getData<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  
  if (!product.name || product.name.trim() === '') {
    throw new Error('Product name is mandatory.');
  }
  if (products.some((p) => p.sku === product.sku)) {
    throw new Error(`SKU '${product.sku}' already exists.`);
  }

  const newProduct: Product = { ...product, id: Math.random().toString(36).substr(2, 9) };
  products.push(newProduct);
  setData(KEYS.PRODUCTS, products);
  return newProduct;
};

export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'sku'>>): Promise<Product> => {
  await delay(400);
  const products = getData<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');

  const updatedProduct = { ...products[index], ...updates };
  products[index] = updatedProduct;
  setData(KEYS.PRODUCTS, products);
  return updatedProduct;
};

export const adjustStock = async (id: string, adjustment: number): Promise<void> => {
  await delay(300);
  const products = getData<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Product not found');

  const newStock = products[index].stock + adjustment;
  if (newStock < 0) throw new Error('Insufficient stock for this operation');

  products[index].stock = newStock;
  setData(KEYS.PRODUCTS, products);
};

// --- Partner Service ---

export const getPartners = async (): Promise<Partner[]> => {
  await delay(300);
  return getData<Partner[]>(KEYS.PARTNERS, INITIAL_PARTNERS);
};

export const addPartner = async (partner: Omit<Partner, 'id'>): Promise<Partner> => {
  await delay(400);
  const partners = getData<Partner[]>(KEYS.PARTNERS, INITIAL_PARTNERS);
  const newPartner = { ...partner, id: Date.now().toString() };
  partners.push(newPartner);
  setData(KEYS.PARTNERS, partners);
  return newPartner;
};

// --- Purchasing Service ---

export const getPurchaseRequests = async (): Promise<PurchaseRequest[]> => {
  await delay(300);
  return getData<PurchaseRequest[]>(KEYS.PRS, INITIAL_PRS);
};

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  await delay(300);
  return getData<PurchaseOrder[]>(KEYS.POS, INITIAL_POS);
};

export const createPR = async (requester: string, items: { productId: string; quantity: number }[]): Promise<PurchaseRequest> => {
  await delay(500);
  const products = getData<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const prs = getData<PurchaseRequest[]>(KEYS.PRS, INITIAL_PRS);

  const enrichedItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ID ${item.productId} not found`);
    return {
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      cost: product.cost,
    };
  });

  const totalCost = enrichedItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
  const newPR: PurchaseRequest = {
    id: `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    requester,
    date: new Date().toISOString().split('T')[0],
    items: enrichedItems,
    totalCost,
    status: PRStatus.Pending,
  };

  prs.unshift(newPR);
  setData(KEYS.PRS, prs);
  return newPR;
};

export const approvePR = async (id: string): Promise<void> => {
  await delay(400);
  const prs = getData<PurchaseRequest[]>(KEYS.PRS, INITIAL_PRS);
  const pr = prs.find((p) => p.id === id);
  if (!pr) throw new Error('PR not found');
  pr.status = PRStatus.Approved;
  setData(KEYS.PRS, prs);
};

export const generatePO = async (prId: string, supplier: string): Promise<PurchaseOrder> => {
  await delay(600);
  const prs = getData<PurchaseRequest[]>(KEYS.PRS, INITIAL_PRS);
  const pr = prs.find((p) => p.id === prId);
  if (!pr) throw new Error('PR not found');
  
  pr.status = PRStatus.ConvertedToPO;
  const pos = getData<PurchaseOrder[]>(KEYS.POS, INITIAL_POS);
  const newPO: PurchaseOrder = {
    id: `PO-${Math.floor(Math.random() * 10000)}`,
    prId: pr.id,
    supplier,
    date: new Date().toISOString().split('T')[0],
    totalCost: pr.totalCost,
    status: 'Sent',
  };
  pr.poId = newPO.id;
  pos.unshift(newPO);
  setData(KEYS.PRS, prs);
  setData(KEYS.POS, pos);
  return newPO;
};

// --- Sales Service ---

export const getSalesOrders = async (): Promise<SalesOrder[]> => {
  await delay(300);
  return getData<SalesOrder[]>(KEYS.SALES, INITIAL_SALES);
};

export const createSalesOrder = async (customerName: string, items: { productId: string; quantity: number }[]): Promise<SalesOrder> => {
  await delay(500);
  const products = getData<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const sales = getData<SalesOrder[]>(KEYS.SALES, INITIAL_SALES);

  const enrichedItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product not found`);
    if (product.stock < item.quantity) {
      throw new Error(`Out of Stock Exception: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
    }
    product.stock -= item.quantity;
    enrichedItems.push({
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      price: product.price,
    });
    totalAmount += product.price * item.quantity;
  }

  const newSO: SalesOrder = {
    id: `SO-${Date.now().toString().slice(-6)}`,
    customerName,
    date: new Date().toISOString().split('T')[0],
    items: enrichedItems,
    totalAmount,
    status: SalesStatus.Quotation,
    paymentStatus: PaymentStatus.Pending
  };

  sales.unshift(newSO);
  setData(KEYS.SALES, sales);
  setData(KEYS.PRODUCTS, products);
  return newSO;
};

export const advanceSalesStatus = async (id: string): Promise<SalesStatus> => {
  await delay(300);
  const sales = getData<SalesOrder[]>(KEYS.SALES, INITIAL_SALES);
  const so = sales.find((s) => s.id === id);
  if (!so) throw new Error('Sales Order not found');

  switch (so.status) {
    case SalesStatus.Quotation: so.status = SalesStatus.SalesOrder; break;
    case SalesStatus.SalesOrder: so.status = SalesStatus.DeliveryOrder; break;
    case SalesStatus.DeliveryOrder: so.status = SalesStatus.Invoice; break;
    case SalesStatus.Invoice: so.status = SalesStatus.Completed; break;
    default: break;
  }
  setData(KEYS.SALES, sales);
  return so.status;
};

export const receivePayment = async (id: string): Promise<SalesOrder> => {
  await delay(500);
  const sales = getData<SalesOrder[]>(KEYS.SALES, INITIAL_SALES);
  const so = sales.find((s) => s.id === id);
  
  if (!so) throw new Error('Sales Order not found');
  if (so.status !== SalesStatus.Invoice && so.status !== SalesStatus.Completed) throw new Error('Can only pay invoiced orders.');
  if (so.paymentStatus === PaymentStatus.Paid) throw new Error('Already paid.');

  so.paymentStatus = PaymentStatus.Paid;
  const expenses = getData<Transaction[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
  expenses.unshift({
    id: `TX-PAY-${so.id}`,
    date: new Date().toISOString().split('T')[0],
    description: `Payment Received - ${so.customerName}`,
    type: 'Income',
    amount: so.totalAmount,
    category: 'Sales',
    referenceId: so.id
  });

  setData(KEYS.SALES, sales);
  setData(KEYS.EXPENSES, expenses);
  return so;
};

// --- Accounting Service ---

export const getFinancialTransactions = async (): Promise<Transaction[]> => {
  await delay(400);
  const pos = getData<PurchaseOrder[]>(KEYS.POS, INITIAL_POS);
  const ledger = getData<Transaction[]>(KEYS.EXPENSES, INITIAL_EXPENSES);

  const poTransactions: Transaction[] = pos.map(p => ({
    id: `TX-PO-${p.id}`,
    date: p.date,
    description: `Supplier Payment - ${p.supplier}`,
    type: 'Expense',
    amount: p.totalCost,
    category: 'Procurement',
    referenceId: p.id
  }));

  return [...ledger, ...poTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addOperationalExpense = async (expense: Omit<Transaction, 'id' | 'type'>): Promise<Transaction> => {
  await delay(400);
  const expenses = getData<Transaction[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
  const newTx: Transaction = { ...expense, id: `TX-${Date.now()}`, type: 'Expense' };
  expenses.unshift(newTx);
  setData(KEYS.EXPENSES, expenses);
  return newTx;
};

// --- HRM Service (New) ---

export const getEmployees = async (): Promise<Employee[]> => {
  await delay(300);
  return getData<Employee[]>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
};

export const addEmployee = async (emp: Omit<Employee, 'id'>): Promise<Employee> => {
  await delay(300);
  const employees = getData<Employee[]>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  const newEmp = { ...emp, id: `EMP-${Math.floor(Math.random() * 1000)}` };
  employees.push(newEmp);
  setData(KEYS.EMPLOYEES, employees);
  return newEmp;
};

export const runPayroll = async (): Promise<number> => {
  await delay(800);
  const employees = getData<Employee[]>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  const activeEmployees = employees.filter(e => e.status === 'Active');
  
  if (activeEmployees.length === 0) throw new Error("No active employees.");
  
  const totalSalary = activeEmployees.reduce((acc, e) => acc + e.salary, 0);
  
  // Automatically record expense
  const expenses = getData<Transaction[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
  expenses.unshift({
    id: `TX-PAYROLL-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    description: `Monthly Payroll (${activeEmployees.length} employees)`,
    type: 'Expense',
    amount: totalSalary,
    category: 'Payroll'
  });
  
  setData(KEYS.EXPENSES, expenses);
  return totalSalary;
};

// --- Manufacturing Service (New) ---

export const getBOMs = async (): Promise<BOM[]> => {
  await delay(300);
  return getData<BOM[]>(KEYS.BOMS, INITIAL_BOMS);
};

export const createBOM = async (bom: Omit<BOM, 'id'>): Promise<BOM> => {
  await delay(400);
  const boms = getData<BOM[]>(KEYS.BOMS, INITIAL_BOMS);
  const newBOM = { ...bom, id: `BOM-${Math.floor(Math.random()*1000)}` };
  boms.push(newBOM);
  setData(KEYS.BOMS, boms);
  return newBOM;
};

export const getProductionOrders = async (): Promise<ProductionOrder[]> => {
  await delay(300);
  return getData<ProductionOrder[]>(KEYS.PROD_ORDERS, []);
};

export const createProductionOrder = async (bomId: string, quantity: number): Promise<ProductionOrder> => {
  await delay(300);
  const boms = getData<BOM[]>(KEYS.BOMS, INITIAL_BOMS);
  const orders = getData<ProductionOrder[]>(KEYS.PROD_ORDERS, []);
  
  if(!boms.find(b => b.id === bomId)) throw new Error("Invalid BOM");

  const newOrder: ProductionOrder = {
    id: `PO-MFG-${Date.now()}`,
    bomId,
    quantity,
    status: 'Planned',
    date: new Date().toISOString().split('T')[0]
  };
  
  orders.unshift(newOrder);
  setData(KEYS.PROD_ORDERS, orders);
  return newOrder;
};

export const completeProduction = async (orderId: string): Promise<void> => {
  await delay(600);
  const orders = getData<ProductionOrder[]>(KEYS.PROD_ORDERS, []);
  const order = orders.find(o => o.id === orderId);
  if (!order) throw new Error("Order not found");
  if (order.status === 'Completed') throw new Error("Already completed");

  const boms = getData<BOM[]>(KEYS.BOMS, INITIAL_BOMS);
  const bom = boms.find(b => b.id === order.bomId);
  if (!bom) throw new Error("BOM definition missing");

  const products = getData<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);

  // 1. Validation Phase: Check Raw Materials
  for (const component of bom.components) {
    const rawMat = products.find(p => p.id === component.productId);
    if (!rawMat) throw new Error(`Raw material ${component.productId} missing`);
    const requiredQty = component.quantity * order.quantity;
    if (rawMat.stock < requiredQty) {
      throw new Error(`Insufficient Raw Material: ${rawMat.name}. Need ${requiredQty}, Have ${rawMat.stock}`);
    }
  }

  // 2. Execution Phase: Deduct RM, Add FG
  for (const component of bom.components) {
    const rawMat = products.find(p => p.id === component.productId)!;
    rawMat.stock -= (component.quantity * order.quantity);
  }

  const finishedGood = products.find(p => p.id === bom.productId);
  if (!finishedGood) throw new Error("Finished Good product missing");
  finishedGood.stock += order.quantity;

  // 3. Update Order Status
  order.status = 'Completed';

  setData(KEYS.PRODUCTS, products);
  setData(KEYS.PROD_ORDERS, orders);
};
