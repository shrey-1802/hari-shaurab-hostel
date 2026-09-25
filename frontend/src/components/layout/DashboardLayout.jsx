import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Toast } from '../ui/Toast';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Fixed / Sidebar */}
        <Sidebar />
        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-[calc(100%-288px)]">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
};
