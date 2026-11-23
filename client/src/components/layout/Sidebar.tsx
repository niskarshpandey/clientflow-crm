import {
  LayoutDashboard,
  Users,
  ContactRound,
  FolderKanban,
  Settings,
  Workflow,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Leads", path: "/leads", icon: ContactRound },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white p-5">
      <div className="mb-10 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-600 p-2 text-white">
          <Workflow size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">ClientFlow</h1>
          <p className="text-xs text-slate-500">Business Workspace</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 pt-5">
        <p className="text-sm font-semibold text-slate-800">ClientFlow CRM</p>
        <p className="text-xs text-slate-500">Development Version</p>
      </div>
    </aside>
  );
}
