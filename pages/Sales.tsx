
import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, Check, AlertTriangle, FileText, Truck, DollarSign, CreditCard } from 'lucide-react';
import { SalesOrder, Product, SalesStatus, Partner, PaymentStatus } from '../types';
import * as api from '../services/mockDb';

export const Sales: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Partner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Form
  const [customerId, setCustomerId] = useState('');
  const [selectedProdId, setSelectedProdId] = useState('');
  const [qty, setQty] = useState(1);

  const loadData = async () => {
    const [salesData, prodData, partnerData] = await Promise.all([
      api.getSalesOrders(), 
      api.getProducts(),
      api.getPartners()
    ]);
    setOrders(salesData);
    setProducts(prodData);
    setCustomers(partnerData.filter(p => p.type === 'Customer'));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Metrics
  const outstandingDebt = orders
    .filter(o => (o.status === SalesStatus.Invoice || o.status === SalesStatus.Completed) && o.paymentStatus !== PaymentStatus.Paid)
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (!selectedCustomer) {
      setError("Please select a valid customer.");
      return;
    }

    try {
      await api.createSalesOrder(selectedCustomer.name, [{ productId: selectedProdId, quantity: qty }]);
      setShowModal(false);
      setCustomerId('');
      setSelectedProdId('');
      setQty(1);
      loadData(); // Refresh to show new order and updated stock
    } catch (err: any) {
      setError(err.message); // Handles "Out-of-stock" exception
    }
  };

  const handleAdvanceStatus = async (id: string) => {
    try {
      await api.advanceSalesStatus(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReceivePayment = async (id: string) => {
    if(!window.confirm("Confirm receipt of payment? This will clear the debt and record income.")) return;
    
    setProcessingId(id);
    try {
      await api.receivePayment(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status: SalesStatus) => {
    switch(status) {
      case SalesStatus.Quotation: return <FileText size={16} />;
      case SalesStatus.SalesOrder: return <ShoppingBag size={16} />;
      case SalesStatus.DeliveryOrder: return <Truck size={16} />;
      case SalesStatus.Invoice: return <FileText size={16} />;
      case SalesStatus.Completed: return <Check size={16} />;
      default: return <FileText size={16} />;
    }
  };

  // Helper to determine progress bar width
  const getProgress = (status: SalesStatus) => {
    const steps = [SalesStatus.Quotation, SalesStatus.SalesOrder, SalesStatus.DeliveryOrder, SalesStatus.Invoice, SalesStatus.Completed];
    const idx = steps.indexOf(status);
    return `${((idx + 1) / steps.length) * 100}%`;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales & Distribution</h2>
          <p className="text-slate-500">Manage quotations, orders, deliveries, and invoicing.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md shadow-indigo-200 flex items-center"
        >
          <ShoppingBag size={18} className="mr-2" /> New Order
        </button>
      </div>

      {/* Outstanding Debt Card */}
      <div className="mb-8 bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
             <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Accounts Receivable</h3>
            <p className="text-slate-500 text-sm">Total Unpaid Invoices</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-orange-600">${outstandingDebt.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{order.customerName}</h3>
                <p className="text-sm text-slate-500 font-mono">{order.id} • {order.date}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">${order.totalAmount.toFixed(2)}</div>
                <div className="flex justify-end mt-1">
                  {/* Payment Status Badge */}
                  <span className={`flex items-center px-2 py-1 rounded text-xs font-bold border ${
                    order.paymentStatus === PaymentStatus.Paid 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {order.paymentStatus === PaymentStatus.Paid ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase mb-2">
                <span>Quote</span>
                <span>Sales Order</span>
                <span>Delivery</span>
                <span>Invoice</span>
                <span>Done</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500 ease-in-out" style={{ width: getProgress(order.status) }}></div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="p-2 bg-white rounded shadow-sm text-indigo-600">{getStatusIcon(order.status)}</span>
                Current Stage: {order.status}
              </div>
              
              <div className="flex gap-2">
                {/* Record Payment Button - Only visible if Invoiced/Completed AND Unpaid */}
                {(order.status === SalesStatus.Invoice || order.status === SalesStatus.Completed) && order.paymentStatus !== PaymentStatus.Paid && (
                   <button
                     onClick={() => handleReceivePayment(order.id)}
                     disabled={processingId === order.id}
                     className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center shadow-sm"
                   >
                     <CreditCard size={16} className="mr-2" /> 
                     {processingId === order.id ? 'Processing...' : 'Receive Payment'}
                   </button>
                )}

                {order.status !== SalesStatus.Completed && (
                  <button 
                    onClick={() => handleAdvanceStatus(order.id)}
                    className="bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center group"
                  >
                    Next Stage <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
           <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
             <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500">No active sales orders.</p>
           </div>
        )}
      </div>

      {/* New Sales Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Create Sales Order (Quotation)</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded flex items-center text-sm">
                <AlertTriangle size={16} className="mr-2 flex-shrink-0" /> 
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                <select required className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">Select Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Manage customers in the 'Partners' tab.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
                <select required className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={selectedProdId} onChange={e => setSelectedProdId(e.target.value)}>
                  <option value="">Choose item...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock === 0}>
                      {p.name} (${p.price}) - {p.stock > 0 ? `In Stock: ${p.stock}` : 'Out of Stock'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input required type="number" min="1" className="w-full border rounded-lg px-3 py-2"
                  value={qty} onChange={e => setQty(parseInt(e.target.value))} />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Generate Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
