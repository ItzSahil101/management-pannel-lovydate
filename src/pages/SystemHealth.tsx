
import {
  Server, Database, Wifi, Activity, Clock,
  Cpu, HardDrive, RefreshCw, AlertCircle
} from 'lucide-react'

const services = [
  { name: 'Backend API', description: 'LovyDate application server', icon: Server },
  { name: 'PostgreSQL', description: 'Primary application database', icon: Database },
  { name: 'Redis', description: 'Cache and session service', icon: Wifi },
  { name: 'Media Storage', description: 'Uploaded images and videos', icon: HardDrive },
]

const metrics = [
  { label: 'CPU Usage', value: '—', icon: Cpu },
  { label: 'Memory Usage', value: '—', icon: Activity },
  { label: 'Disk Usage', value: '—', icon: HardDrive },
  { label: 'API Response Time', value: '—', icon: Clock },
]

function SystemHealth() {
  return (
    <div className="p-6 lg:p-8 space-y-7 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">System / System Health</p>
          <h1 className="text-2xl font-semibold mt-1">System Health</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Monitor infrastructure and application performance.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 rounded-lg px-4 py-2.5 text-sm"
        >
          <RefreshCw size={15} /> Refresh Page
        </button>
      </div>

      <div className="bg-[#111114] border border-amber-500/20 rounded-xl p-5 flex gap-3">
        <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-300">Monitoring not connected</p>
          <p className="text-xs text-zinc-500 mt-1">
            Live infrastructure status will appear after secure backend monitoring is configured.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
            <div className="flex justify-between">
              <p className="text-sm text-zinc-400">{label}</p>
              <Icon size={18} className="text-pink-400" />
            </div>
            <p className="text-2xl font-semibold mt-4">{value}</p>
            <p className="text-xs text-zinc-600 mt-1">Awaiting live metrics</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
        <h2 className="font-semibold">Infrastructure Services</h2>
        <p className="text-xs text-zinc-500 mt-1">Connected service monitoring</p>

        <div className="mt-5 divide-y divide-white/[0.06]">
          {services.map(({ name, description, icon: Icon }) => (
            <div key={name} className="flex items-center justify-between py-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <Icon size={19} className="text-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{description}</p>
                </div>
              </div>
              <span className="text-xs text-zinc-500 bg-white/[0.05] px-3 py-1.5 rounded-full whitespace-nowrap">
                Not connected
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
        <h2 className="font-semibold">Recent System Events</h2>
        <p className="text-xs text-zinc-500 mt-1">Application logs and infrastructure events</p>
        <div className="h-40 flex flex-col items-center justify-center text-center">
          <Clock size={25} className="text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-400">No system events available</p>
          <p className="text-xs text-zinc-600 mt-1">Backend log integration is pending.</p>
        </div>
      </div>
    </div>
  )
}

export default SystemHealth
