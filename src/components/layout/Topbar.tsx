
import {
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 sm:h-20 border-b border-white/[0.07] bg-[#0d0d10] pl-16 pr-4 sm:pl-20 sm:pr-6 md:px-8 flex items-center justify-between sticky top-0 z-20 min-w-0">
      {/* Page title */}
      <div className="min-w-0">
        <h2 className="text-white font-semibold text-base sm:text-lg truncate">
          Dashboard
        </h2>

        <p className="hidden xs:block text-xs text-zinc-500 truncate">
          Welcome to LovyDate Control Center
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[#17171c] border border-white/[0.07] rounded-lg px-3 py-2 w-48 lg:w-64">
          <Search size={17} className="text-zinc-500 shrink-0" />

          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent outline-none text-sm text-white placeholder:text-zinc-600 w-full min-w-0"
          />

          <span className="text-[10px] text-zinc-600 whitespace-nowrap">
            ⌘ K
          </span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-zinc-400 hover:text-white transition-colors p-1"
        >
          <Bell size={20} />

          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-pink-500" />
        </button>

        <div className="h-8 w-px bg-white/[0.08]" />

        {/* Admin profile */}
        <button
          type="button"
          className="flex items-center gap-2 sm:gap-3 min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-pink-500/15 border border-pink-500/20 flex items-center justify-center text-pink-400 font-semibold text-xs sm:text-sm">
            SA
          </div>

          <div className="hidden sm:block text-left min-w-0">
            <p className="text-sm text-white font-medium whitespace-nowrap">
              Super Admin
            </p>

            <p className="text-[11px] text-zinc-500 whitespace-nowrap">
              Platform Owner
            </p>
          </div>

          <ChevronDown
            size={15}
            className="text-zinc-500 hidden sm:block shrink-0"
          />
        </button>
      </div>
    </header>
  );
}
