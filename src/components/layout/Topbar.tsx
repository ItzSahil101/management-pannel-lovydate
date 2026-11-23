
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
} from 'lucide-react'

export default function Topbar() {
  return (
    <header className="h-20 border-b border-white/[0.07] bg-[#0d0d10] px-6 md:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-zinc-400">
          <Menu size={21} />
        </button>

        <div>
          <h2 className="text-white font-semibold text-lg">
            Dashboard
          </h2>
          <p className="text-xs text-zinc-500">
            Welcome to LovyDate Control Center
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-[#17171c] border border-white/[0.07] rounded-lg px-3 py-2 w-64">
          <Search size={17} className="text-zinc-500" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent outline-none text-sm text-white placeholder:text-zinc-600 w-full"
          />
          <span className="text-[10px] text-zinc-600">⌘ K</span>
        </div>

        <button className="relative text-zinc-400 hover:text-white">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500" />
        </button>

        <div className="h-9 w-px bg-white/[0.08]" />

        <button className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-500/15 border border-pink-500/20 flex items-center justify-center text-pink-400 font-semibold text-sm">
            SA
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-sm text-white font-medium">Super Admin</p>
            <p className="text-[11px] text-zinc-500">Platform Owner</p>
          </div>

          <ChevronDown size={15} className="text-zinc-500" />
        </button>
      </div>
    </header>
  )
}
