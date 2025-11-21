# 🌐 ERP Web System

A **Production-Ready Web ERP System** designed to manage your business efficiently.  
This ERP covers modules for **Inventory, Purchasing, Sales, Warehouse, Accounting, HRM/Payroll, and Reporting**.  
The system provides a complete workflow from purchase requests to sales invoices, employee payroll, and analytics dashboards.

---

## 📝 Features

### 1. Dashboard
- Overview of KPIs: sales, pending orders, stock alerts
- Charts and graphs for sales and inventory trends
- Quick links to create PR, PO, SO, and invoices
- Notifications for approvals and pending tasks

### 2. User & Role Management
- Create, edit, and delete users
- Assign roles and permissions (RBAC)
- Audit logs and activity tracking
- Password reset and account lock

### 3. Inventory Management
- Add, edit, and delete products / SKUs
- Multi-warehouse stock tracking
- Stock adjustments and transfer between warehouses
- Alerts for low stock
- Inventory history and reports

### 4. Purchasing
- Create Purchase Requests (PR)
- Approve PRs and convert to Purchase Orders (PO)
- Track PO status (Pending, Approved, Delivered)
- Supplier management
- Goods receipt and automatic stock updates

### 5. Sales
- Create quotations and convert to Sales Orders (SO)
- Delivery Order (DO) and Invoice generation
- Customer management
- Track order status and payments

### 6. Warehouse / WMS
- Put-away, Picking, Packing, Dispatch
- Barcode / QR code support
- Multi-warehouse management
- Stock movement tracking

### 7. Finance / Accounting
- General Ledger, AR, AP
- Automatic posting from SO/PO
- Tax calculation, VAT, and month-end closing
- Financial reports: Profit & Loss, Balance Sheet

### 8. HRM / Payroll
- Employee management
- Attendance and leave tracking
- Payroll calculation and payslip generation
- Approval workflow for leave and overtime

### 9. Reporting & Analytics
- Standard and custom reports
- Export to Excel or PDF
- Interactive charts and drill-down
- Role-based report access

---

## ⚙️ Installation

### Prerequisites
- Node.js >= 18
- NPM or Yarn
- Database: MySQL / PostgreSQL
- Optional: Docker

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/erp-web-system.git
cd erp-web-system

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database and API settings

# Run migrations (create DB tables)
npm run migrate

# Start the development server
npm run dev
