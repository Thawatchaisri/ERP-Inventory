import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Plus, Filter, PieChart } from 'lucide-react';
import { Transaction } from '../types';
import * as api from '../services/mockDb';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Accounting: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'General'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getFinancialTransactions();
      setTransactions(data);
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
      await api.addOperationalExpense({
        date: form.date,
        description: form.description,
        amount: Number(form.amount),
        category: form.category
      });
      setShowModal(false);
      setForm({ date: new Date().toISOString().split('T')[0], description: '', amount: 0, category: 'General' });
      loadData();
    } catch (err) {
      alert('Failed to record expense');
    }
  };

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Chart Data Preparation
  const chartData = transactions.slice(0, 10).reverse().map(t => ({
    name: t.date,
    amount: t.type === 'Income' ? t.amount : -t.amount,
    type: t.type
  }));

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Accounting</h2>
          <p className="text-slate-500">Overview of Cash Flow, Income, and Operational Expenses.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Record Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={24}/></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">INCOME</span>
          </div>
          <p className="text-slate-500 text-sm">Total Revenue</p>
          <h3 className="text-2xl font-bold text-slate-800">${totalIncome.toLocaleString()}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg"><TrendingDown size={24}/></div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">EXPENSE</span>
          </div>
          <p className="text-slate-500 text-sm">Total Expenses</p>
          <h3 className="text-2xl font-bold text-slate-800">${totalExpense.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className={`p-3 rounded-lg ${netProfit >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
              <DollarSign size={24}/>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">NET</span>
          </div>
          <p className="text-slate-500 text-sm">Net Profit</p>
          <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            ${netProfit.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Ledger */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Filter size={18} className="text-slate-400"/> General Ledger
            </h3>
            <span className="text-xs text-slate-500">Includes Sales & POs</span>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase sticky top-0">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-slate-500">{t.date}</td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-700">{t.description}</div>
                      {t.referenceId && <div className="text-xs text-slate-400">Ref: {t.referenceId}</div>}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        t.type === 'Income' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-right font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
             <PieChart size={18} className="text-slate-400"/> Recent Flow
           </h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" hide />
                 <YAxis />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="amount" fill="#64748b" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <p className="text-xs text-slate-400 text-center mt-4">Last 10 transactions visualized (Positive = Income)</p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Record Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" required className="w-full border rounded-lg px-3 py-2"
                  value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" required className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Office Supplies"
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Marketing">Marketing</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input type="number" min="0" step="0.01" required className="w-full border rounded-lg px-3 py-2"
                  value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value)})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};