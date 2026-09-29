import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
