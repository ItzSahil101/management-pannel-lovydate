
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  description: string
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <div className="bg-[#111115] border border-white/[0.07] rounded-xl p-5 hover:border-pink-500/30 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
          <Icon size={19} className="text-pink-400" />
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {value}
        </h3>
        <span className="text-xs text-emerald-400 font-medium">
          {change}
        </span>
      </div>

      <p className="text-xs text-zinc-500 mt-2">{description}</p>
    </div>
  )
}
