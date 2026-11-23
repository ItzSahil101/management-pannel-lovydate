
import { useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'

export default function ModulePage() {
  const location = useLocation()

  const title = location.pathname
    .split('/')
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'Module'

  return (
    <div className="p-6 md:p-8">
      <div className="bg-[#111115] border border-white/[0.07] rounded-xl p-8 min-h-[350px] flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4">
          <Construction size={25} className="text-pink-400" />
        </div>

        <h1 className="text-2xl font-bold text-white">{title}</h1>

        <p className="text-sm text-zinc-500 mt-2">
          This management module is under development.
        </p>
      </div>
    </div>
  )
}
