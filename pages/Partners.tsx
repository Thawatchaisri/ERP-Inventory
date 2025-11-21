
import React, { useEffect, useState } from 'react';
import { Plus, Search, Phone, Mail, MapPin, User, Truck, X } from 'lucide-react';
import { Partner } from '../types';
import * as api from '../services/mockDb';

export const Partners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    type: 'Customer',
    email: '',
    phone: '',
    address: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getPartners();
      setPartners(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addPartner({
        name: form.name,
        type: form.type as 'Customer' | 'Supplier',
        email: form.email,
        phone: form.phone,
        address: form.address
      });
      setShowModal(false);
      setForm({ name: '', type: 'Customer', email: '', phone: '', address: '' });
      loadData();
    } catch (err) {
      alert('Failed to add partner');
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
       <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Partners Management</h2>
          <p className="text-slate-500">CRM for Customers and SRM for Suppliers.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" /> Add Partner
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search partners..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? <p className="text-slate-500">Loading...</p> : filteredPartners.map(partner => (
          <div key={partner.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${partner.type === 'Customer' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                   {partner.type === 'Customer' ? <User size={20} /> : <Truck size={20} />}
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800">{partner.name}</h3>
                   <span className={`text-xs px-2 py-0.5 rounded-full ${partner.type === 'Customer' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                     {partner.type}
                   </span>
                 </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Mail size={16} /> {partner.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} /> {partner.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} /> {partner.address}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Add New Partner</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input required type="email" className="w-full border rounded-lg px-3 py-2"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2"
                    value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows={3}
                  value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
