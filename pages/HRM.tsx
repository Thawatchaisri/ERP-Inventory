
import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Plus, UserPlus, Briefcase, CheckCircle, X } from 'lucide-react';
import { Employee } from '../types';
import * as api from '../services/mockDb';

export const HRM: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);

  // Payroll Summary Modal State
  const [showPayrollSummary, setShowPayrollSummary] = useState(false);
  const [payrollResult, setPayrollResult] = useState<{ count: number; total: number } | null>(null);

  const [form, setForm] = useState({
    name: '',
    position: '',
    department: '',
    salary: 0,
  });

  const loadData = async () => {
    setLoading(true);
    const data = await api.getEmployees();
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addEmployee({
        ...form,
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0]
      });
      setShowModal(false);
      setForm({ name: '', position: '', department: '', salary: 0 });
      loadData();
    } catch (err) {
      alert('Failed to add employee');
    }
  };

  const handleRunPayroll = async () => {
    if (!window.confirm("Confirm Payroll Run for this month?\nThis will record an expense in Accounting.")) return;
    
    setIsProcessingPayroll(true);
    try {
      const activeCount = employees.filter(e => e.status === 'Active').length;
      const totalPaid = await api.runPayroll();
      
      // Show beautiful summary instead of alert
      setPayrollResult({ count: activeCount, total: totalPaid });
      setShowPayrollSummary(true);
      
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessingPayroll(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Human Capital Management</h2>
          <p className="text-slate-500">Employee Database & Payroll Processing</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRunPayroll}
            disabled={isProcessingPayroll}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
          >
            <DollarSign size={18} className="mr-2" /> {isProcessingPayroll ? 'Processing...' : 'Run Payroll'}
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
          >
            <UserPlus size={18} className="mr-2" /> Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Users size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{employees.length}</div>
            <div className="text-sm text-slate-500">Total Employees</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full"><CheckCircle size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{employees.filter(e => e.status === 'Active').length}</div>
            <div className="text-sm text-slate-500">Active Staff</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><DollarSign size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              ${employees.filter(e => e.status === 'Active').reduce((acc, e) => acc + e.salary, 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">Monthly Payroll Cost</div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-sm uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Position</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4 text-right">Salary</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-slate-500 text-sm">{emp.id}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{emp.name}</td>
                <td className="px-6 py-4 text-slate-600">{emp.position}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{emp.department}</span>
                </td>
                <td className="px-6 py-4 text-right font-mono">${emp.salary.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-slate-800">New Employee Onboarding</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2"
                  value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                  <option value="">Select Dept...</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Salary</label>
                <input required type="number" min="0" className="w-full border rounded-lg px-3 py-2"
                  value={form.salary} onChange={e => setForm({...form, salary: parseFloat(e.target.value)})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Success Modal */}
      {showPayrollSummary && payrollResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Payroll Complete!</h3>
            <p className="text-slate-500 mb-6">
              Salaries have been processed and expenses recorded in Accounting.
            </p>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100">
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Employees Paid:</span>
                <span className="font-bold text-slate-800">{payrollResult.count}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-500">Total Payout:</span>
                <span className="font-bold text-emerald-600 text-lg">${payrollResult.total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowPayrollSummary(false)}
              className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-900 transition-colors font-medium"
            >
              Close & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
