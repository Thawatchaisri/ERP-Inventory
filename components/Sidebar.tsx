
import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, PieChart, Users, Contact, HardHat, Briefcase } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUserRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, currentUserRole, onRoleChange }) => {
  
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowed: Object.values(UserRole) },
    { id: 'inventory', label: 'Inventory', icon: Package, allowed: [UserRole.Admin, UserRole.Inventory, UserRole.Production] },
    { id: 'purchasing', label: 'Purchasing', icon: ShoppingCart, allowed: [UserRole.Admin, UserRole.Purchasing] },
    { id: 'sales', label: 'Sales', icon: TrendingUp, allowed: [UserRole.Admin, UserRole.Sales] },
    { id: 'manufacturing', label: 'Manufacturing', icon: HardHat, allowed: [UserRole.Admin, UserRole.Production] },
    { id: 'hrm', label: 'HR & Payroll', icon: Briefcase, allowed: [UserRole.Admin, UserRole.HR] },
    { id: 'partners', label: 'Partners', icon: Contact, allowed: [UserRole.Admin, UserRole.Sales, UserRole.Purchasing] },
    { id: 'accounting', label: 'Accounting', icon: PieChart, allowed: [UserRole.Admin, UserRole.Accounting] },
  ];

  const visibleMenuItems = allMenuItems.filter(item => item.allowed.includes(currentUserRole));

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col shadow-xl fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">Srichai ERP</h1>
        <p className="text-xs text-slate-400 mt-1">Global Enterprise Solution</p>
      </div>
      
      {/* Menu Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-6 py-3.5 transition-all duration-200 group ${
                isActive 
                  ? 'bg-emerald-600 text-white border-r-4 border-emerald-300' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={`mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Role Switcher (Mock Auth) */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center mb-2 text-slate-400 text-xs uppercase font-bold">
          <Users size={12} className="mr-2" /> Signed in as:
        </div>
        <select 
          className="w-full bg-slate-800 text-slate-200 text-sm rounded px-2 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
          value={currentUserRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
        >
          {Object.values(UserRole).map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
