import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import * as api from '../services/mockDb';
import { Product, SalesOrder } from '../types';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([api.getProducts(), api.getSalesOrders()]);
      setProducts(p);
      setOrders(s);
      setLoading(false);
    };
    load();
  }, []);

  // Metrics
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const lowStockItems = products.filter(p => p.stock < 10).length;

  // Chart Data
  const stockData = products.map(p => ({ name: p.sku, stock: p.stock }));
  
  const categoryData = products.reduce((acc, curr) => {
    const found = acc.find(i => i.name === curr.category);
    if (found) found.value += 1;
    else acc.push({ name: curr.category, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Executive Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12%</span>
          </div>
          <p className="text-sm text-slate-500">Total Revenue</p>
          <h3 className="text-2xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Package size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-500">Inventory Value</p>
          <h3 className="text-2xl font-bold text-slate-800">${totalStockValue.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <ShoppingCart size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-500">Active Orders</p>
          <h3 className="text-2xl font-bold text-slate-800">{orders.length}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
             {lowStockItems > 0 && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Action Needed</span>}
          </div>
          <p className="text-sm text-slate-500">Low Stock Alerts</p>
          <h3 className="text-2xl font-bold text-slate-800">{lowStockItems} Items</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Level Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6">Current Stock Levels</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="stock" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-6">Product Categories</h3>
          <div className="h-80 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm text-slate-500">
            {categoryData.map((entry, index) => (
               <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  {entry.name}
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
