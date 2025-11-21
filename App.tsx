
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Purchasing } from './pages/Purchasing';
import { Sales } from './pages/Sales';
import { Accounting } from './pages/Accounting';
import { Partners } from './pages/Partners';
import { HRM } from './pages/HRM';
import { Manufacturing } from './pages/Manufacturing';
import { UserRole } from './types';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.Admin);

  // Reset tab to dashboard if the role changes and the current tab is no longer accessible
  useEffect(() => {
    // Simple access control logic - strict redirect if role drops privileges
    if (currentUserRole !== UserRole.Admin) {
       // (Simplified for demo: In a real app, check `allowed` array from sidebar config)
       if (currentTab === 'accounting' && currentUserRole !== UserRole.Accounting) setCurrentTab('dashboard');
       if (currentTab === 'hrm' && currentUserRole !== UserRole.HR) setCurrentTab('dashboard');
       if (currentTab === 'manufacturing' && currentUserRole !== UserRole.Production) setCurrentTab('dashboard');
    }
  }, [currentUserRole]);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': 
        return (currentUserRole === UserRole.Admin || currentUserRole === UserRole.Inventory || currentUserRole === UserRole.Production) 
          ? <Inventory /> 
          : <div className="p-8 text-red-500">Access Denied</div>;
      case 'purchasing': 
        return (currentUserRole === UserRole.Admin || currentUserRole === UserRole.Purchasing) 
          ? <Purchasing /> 
          : <div className="p-8 text-red-500">Access Denied</div>;
      case 'sales': 
        return (currentUserRole === UserRole.Admin || currentUserRole === UserRole.Sales) 
          ? <Sales /> 
          : <div className="p-8 text-red-500">Access Denied</div>;
      case 'partners': 
        return (currentUserRole === UserRole.Admin || currentUserRole === UserRole.Sales || currentUserRole === UserRole.Purchasing) 
          ? <Partners /> 
          : <div className="p-8 text-red-500">Access Denied</div>;
      case 'accounting': 
        return (currentUserRole === UserRole.Admin || currentUserRole === UserRole.Accounting) 
          ? <Accounting /> 
          : <div className="p-8 text-red-500">Access Denied</div>;
      case 'hrm': 
        return (currentUserRole === UserRole.Admin || currentUserRole === UserRole.HR) 
          ? <HRM /> 
          : <div className="p-8 text-red-500">Access Denied</div>;
      case 'manufacturing': 
        return (currentUserRole === UserRole.Admin || currentUserRole === UserRole.Production) 
          ? <Manufacturing /> 
          : <div className="p-8 text-red-500">Access Denied</div>;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        currentUserRole={currentUserRole}
        onRoleChange={setCurrentUserRole}
      />
      <main className="flex-1 ml-64 transition-all duration-300">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
