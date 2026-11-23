import { Outlet } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Sidebar: desktop par visible */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Top navigation */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Workspace Overview
            </h2>
            <p className="text-xs text-slate-500">
              Manage your business in one place
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Search size={20} className="cursor-pointer text-slate-500" />

            <Bell size={20} className="cursor-pointer text-slate-500" />

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              CF
            </div>
          </div>
        </header>

        {/* Current page renders here */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
