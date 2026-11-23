import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LockKeyhole,
  Activity,
  Heart,
  ChevronLeft,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "PLATFORM",
    items: [
      { label: "Users", icon: Users },
      // { label: "Verification", icon: ShieldCheck },
      { label: "Moderation", icon: LockKeyhole },
      { label: "Content", icon: FileText },
      // { label: "Media Library", icon: Image },
    ],
  },
  {
    title: "ENGAGEMENT",
    items: [
      { label: "Notifications", icon: Bell },
      // { label: "Matches", icon: Heart },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "System Health", icon: Activity },
      { label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#0d0d10] border-r border-white/[0.07] flex flex-col shrink-0">
      <div className="h-20 px-6 flex items-center gap-3 border-b border-white/[0.07]">
        <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
          <Heart className="text-pink-400" size={21} />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">
            LovyDate
          </h1>
          <p className="text-[10px] text-zinc-500 tracking-[2px]">
            CONTROL CENTER
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-7">
        {navigation.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] font-semibold tracking-[1.5px] text-zinc-600 px-3 mb-3">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;


                return (
                  <NavLink
                    key={item.label}
                    to={
                      item.label === "Dashboard"
                        ? "/"
                        : `/${item.label.toLowerCase().replace(/\s+/g, "-")}`
                    }
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-pink-500/10 text-pink-400"
                          : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.07]">
        <div className="flex items-center justify-between px-2">
          <div>
            <p className="text-xs text-white font-medium">Management V2</p>
            <p className="text-[10px] text-zinc-500 mt-1">New control system</p>
          </div>
          <ChevronLeft size={16} className="text-zinc-600" />
        </div>
      </div>
    </aside>
  );
}
