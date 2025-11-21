
import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Truck, Plus, XCircle, User, ChevronRight, Bell } from 'lucide-react';
import { PurchaseRequest, PurchaseOrder, PRStatus, Product, Partner } from '../types';
import * as api from '../services/mockDb';

export const Purchasing: React.FC = () => {
  const [activeView, setActiveView] = useState<'PR' | 'PO'>('PR');
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showPrModal, setShowPrModal] = useState(false);
  const [prForm, setPrForm] = useState({ requester: '', productId: '', quantity: 1 });

  // PO Generation Modal State
  const [showPoModal, setShowPoModal] = useState(false);
  const [selectedPrId, setSelectedPrId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');


  // Data Loading
  const loadData = async () => {
    setLoading(true);
    try {
      const [prData, poData, prodData, partnerData] = await Promise.all([
        api.getPurchaseRequests(),
        api.getPurchaseOrders(),
        api.getProducts(),
        api.getPartners()
      ]);
      setPrs(prData);
      setPos(poData);
      setProducts(prodData);
      setSuppliers(partnerData.filter(p => p.type === 'Supplier'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPR(prForm.requester, [{ productId: prForm.productId, quantity: prForm.quantity }]);
      setShowPrModal(false);
      setPrForm({ requester: '', productId: '', quantity: 1 });
      loadData();
    } catch (err) {
      alert('Failed to create PR');
    }
  };

  const handleApprovePR = async (id: string) => {
    if (window.confirm('Manager Approval: Approve this Purchase Request?')) {
      try {
        await api.approvePR(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openPoModal = (prId: string) => {
    setSelectedPrId(prId);
    setSelectedSupplierId('');
    setShowPoModal(true);
  };

  const handleGeneratePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrId || !selectedSupplierId) return;
    
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    try {
      await api.generatePO(selectedPrId, supplier.name);
      
      // Workflow: Notify Supplier
      alert(`✅ PO Created Successfully!\n\n📧 Notification sent to supplier: ${supplier.name} (${supplier.email})`);
      
      setShowPoModal(false);
      loadData();
      setActiveView('PO');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Purchasing Department</h2>
          <p className="text-slate-500">Manage PRs, Approvals, and Supplier Orders.</p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm">
          <button
            onClick={() => setActiveView('PR')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'PR' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Purchase Requests
          </button>
          <div className="w-px bg-slate-200 my-1 mx-1"></div>
          <button
            onClick={() => setActiveView('PO')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'PO' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Purchase Orders
          </button>
        </div>
      </div>

      {activeView === 'PR' && (
        <div className="space-y-6">
           <div className="flex justify-end">
            <button 
              onClick={() => setShowPrModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
            >
              <Plus size={18} className="mr-2" /> New Request (PR)
            </button>
           </div>

           <div className="grid grid-cols-1 gap-4">
            {prs.map(pr => (
              <div key={pr.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between transition-all hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${pr.status === PRStatus.Approved ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {pr.id}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        pr.status === PRStatus.Pending ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        pr.status === PRStatus.Approved ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {pr.status}
                      </span>
                    </h3>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1"><User size={14}/> {pr.requester}</span>
                      <span>Total: <b className="text-slate-700">${pr.totalCost}</b></span>
                      <span>Items: {pr.items.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 items-center">
                  {pr.status === PRStatus.Pending && (
                    <button 
                      onClick={() => handleApprovePR(pr.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  )}
                  {pr.status === PRStatus.Approved && (
                    <button 
                      onClick={() => openPoModal(pr.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm animate-pulse"
                    >
                      Generate PO <ChevronRight size={16} />
                    </button>
                  )}
                  {pr.status === PRStatus.ConvertedToPO && (
                     <span className="text-sm text-slate-400 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                        <Truck size={14} /> PO Created: {pr.poId}
                     </span>
                  )}
                </div>
              </div>
            ))}
            {prs.length === 0 && <p className="text-center text-slate-400 mt-10">No Purchase Requests found.</p>}
           </div>
        </div>
      )}

      {activeView === 'PO' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm font-semibold uppercase">
              <tr>
                <th className="px-6 py-4">PO ID</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Date Created</th>
                <th className="px-6 py-4 text-right">Total Cost</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pos.map(po => (
                <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600 font-medium">{po.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{po.supplier}</td>
                  <td className="px-6 py-4 text-slate-500">{po.date}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">${po.totalCost.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200 flex items-center justify-center w-fit mx-auto">
                      <Bell size={12} className="mr-1" /> {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-sm text-slate-400 hover:text-slate-600 underline decoration-slate-300">View Details</button>
                  </td>
                </tr>
              ))}
              {pos.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No Purchase Orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create PR Modal */}
      {showPrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 text-slate-800">New Purchase Request</h3>
            <form onSubmit={handleCreatePR} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Requester Name</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2"
                  value={prForm.requester} onChange={e => setPrForm({...prForm, requester: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                <select required className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={prForm.productId} onChange={e => setPrForm({...prForm, productId: e.target.value})}>
                  <option value="">Select a product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input required type="number" min="1" className="w-full border rounded-lg px-3 py-2"
                  value={prForm.quantity} onChange={e => setPrForm({...prForm, quantity: parseInt(e.target.value)})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowPrModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showPoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Generate Purchase Order</h3>
            <form onSubmit={handleGeneratePO} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Supplier</label>
                <select required className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)}>
                  <option value="">Choose Supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">Manage suppliers in the 'Partners' tab.</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowPoModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create & Send PO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
