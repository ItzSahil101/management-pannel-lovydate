
import {
  Users, UserPlus, Activity, Heart,
  TrendingUp, MessageCircle, Eye
} from 'lucide-react'

const metrics = [
  { label: 'Total Users', value: '—', change: 'Live data pending', icon: Users },
  { label: 'New Registrations', value: '—', change: 'Live data pending', icon: UserPlus },
  { label: 'Daily Active Users', value: '—', change: 'Live data pending', icon: Activity },
  { label: 'Total Matches', value: '—', change: 'Live data pending', icon: Heart },
]

const engagement = [
  { label: 'Profile Views', value: '—', icon: Eye },
  { label: 'Messages Sent', value: '—', icon: MessageCircle },
  { label: 'Likes Given', value: '—', icon: Heart },
  { label: 'Engagement Rate', value: '—', icon: TrendingUp },
]

function Analytics() {
  return (
    <div className="p-6 lg:p-8 space-y-7 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Overview / Analytics</p>
          <h1 className="text-2xl font-semibold mt-1">Platform Analytics</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Understand LovyDate growth and user engagement.
          </p>
        </div>
        <select className="bg-[#111114] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-300">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>All time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-zinc-400">{label}</p>
              <Icon size={19} className="text-pink-400" />
            </div>
            <p className="text-2xl font-semibold mt-4">{value}</p>
            <p className="text-xs text-zinc-500 mt-2">{change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">User Growth</h2>
              <p className="text-xs text-zinc-500 mt-1">New registrations over time</p>
            </div>
            <UserPlus size={19} className="text-pink-400" />
          </div>
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <TrendingUp size={30} className="text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-400">Analytics data not connected</p>
            <p className="text-xs text-zinc-600 mt-1">Registration trends will appear here.</p>
          </div>
        </div>

        <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">User Activity</h2>
              <p className="text-xs text-zinc-500 mt-1">Daily active users over time</p>
            </div>
            <Activity size={19} className="text-pink-400" />
          </div>
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <Activity size={30} className="text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-400">Analytics data not connected</p>
            <p className="text-xs text-zinc-600 mt-1">Activity trends will appear here.</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
        <h2 className="font-semibold">Engagement Overview</h2>
        <p className="text-xs text-zinc-500 mt-1">How users interact with LovyDate</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
          {engagement.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Icon size={18} className="text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="font-semibold mt-1">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-600">
        Analytics preview — real metrics will be loaded from the LovyDate backend after API integration.
      </p>
    </div>
  )
}

export default Analytics
