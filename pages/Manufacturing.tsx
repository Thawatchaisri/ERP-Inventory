
import React, { useEffect, useState } from 'react';
import { HardHat, Layers, Play, CheckCircle, AlertTriangle, PackageOpen } from 'lucide-react';
import { BOM, Product, ProductionOrder } from '../types';
import * as api from '../services/mockDb';

export const Manufacturing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BOM' | 'Production'>('Production');
  const [boms, setBoms] = useState<BOM[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedBomId, setSelectedBomId] = useState('');
  const [orderQty, setOrderQty] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    const [bomData, orderData, prodData] = await Promise.all([
      api.getBOMs(),
      api.getProductionOrders(),
      api.getProducts()
    ]);
    setBoms(bomData);
    setOrders(orderData);
    setProducts(prodData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || id;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProductionOrder(selectedBomId, orderQty);
      setShowOrderModal(false);
      setOrderQty(1);
      loadData();
    } catch (err) {
      alert('Failed to create order');
    }
  };

  const handleCompleteProduction = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await api.completeProduction(orderId);
      alert("✅ Production Completed! Stock updated.");
      loadData();
    } catch (err: any) {
      alert(`❌ Production Failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manufacturing Plant</h2>
          <p className="text-slate-500">Production Planning & Control (PP)</p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm">
          <button
            onClick={() => setActiveTab('Production')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'Production' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Production Orders
          </button>
          <div className="w-px bg-slate-200 my-1 mx-1"></div>
          <button
            onClick={() => setActiveTab('BOM')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'BOM' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Bill of Materials (BOM)
          </button>
        </div>
      </div>

      {activeTab === 'BOM' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {boms.map(bom => (
            <div key={bom.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Layers size={20}/></div>
                <div>
                   <h3 className="font-bold text-slate-800">{bom.name}</h3>
                   <p className="text-xs text-slate-500">Output: {getProductName(bom.productId)}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Raw Materials Required (Per Unit)</h4>
                <ul className="space-y-2">
                  {bom.components.map((comp, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-700">{getProductName(comp.productId)}</span>
                      <span className="font-mono font-bold text-slate-600">x{comp.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Production' && (
        <div className="space-y-6">
           <div className="flex justify-end">
             <button 
               onClick={() => setShowOrderModal(true)}
               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
             >
               <Play size={18} className="mr-2" /> Plan New Order
             </button>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-slate-50 text-slate-600 text-sm font-semibold uppercase">
                 <tr>
                   <th className="px-6 py-4">Order ID</th>
                   <th className="px-6 py-4">Item to Produce</th>
                   <th className="px-6 py-4 text-right">Quantity</th>
                   <th className="px-6 py-4 text-center">Status</th>
                   <th className="px-6 py-4 text-center">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {orders.map(order => {
                   const bom = boms.find(b => b.id === order.bomId);
                   const productName = bom ? getProductName(bom.productId) : 'Unknown';
                   
                   return (
                     <tr key={order.id} className="hover:bg-slate-50">
                       <td className="px-6 py-4 font-mono text-slate-500">{order.id}</td>
                       <td className="px-6 py-4 font-medium text-slate-800">
                         {productName}
                         <div className="text-xs text-slate-400 font-normal">Via {bom?.name}</div>
                       </td>
                       <td className="px-6 py-4 text-right font-bold">{order.quantity}</td>
                       <td className="px-6 py-4 text-center">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                           order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                         }`}>
                           {order.status}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-center">
                         {order.status === 'Planned' && (
                           <button 
                             onClick={() => handleCompleteProduction(order.id)}
                             disabled={processingId === order.id}
                             className="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1 mx-auto"
                           >
                             {processingId === order.id ? 'Building...' : <><HardHat size={12} /> Execute</>}
                           </button>
                         )}
                         {order.status === 'Completed' && <CheckCircle size={18} className="mx-auto text-emerald-500" />}
                       </td>
                     </tr>
                   );
                 })}
                 {orders.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No production orders scheduled.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
             <h3 className="text-xl font-bold mb-4 text-slate-800">Create Production Order</h3>
             <form onSubmit={handleCreateOrder} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Select BOM (Recipe)</label>
                 <select required className="w-full border rounded-lg px-3 py-2 bg-white"
                   value={selectedBomId} onChange={e => setSelectedBomId(e.target.value)}>
                   <option value="">Choose Product to Manufacture...</option>
                   {boms.map(b => (
                     <option key={b.id} value={b.id}>{b.name} ({getProductName(b.productId)})</option>
                   ))}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Quantity to Produce</label>
                 <input required type="number" min="1" className="w-full border rounded-lg px-3 py-2"
                   value={orderQty} onChange={e => setOrderQty(parseInt(e.target.value))} />
               </div>
               <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-yellow-800 flex items-start">
                 <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0"/>
                 Running this order will deduce Raw Materials from the Inventory immediately upon completion.
               </div>
               <div className="flex justify-end gap-3 mt-6">
                 <button type="button" onClick={() => setShowOrderModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Schedule Order</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};
