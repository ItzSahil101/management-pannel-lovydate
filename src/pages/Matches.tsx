
import { useMemo, useState } from 'react'
import { Heart, Search, Users, MessageCircle, Eye } from 'lucide-react'

type Match = {
  id: number
  userOne: string
  userTwo: string
  date: string
  status: 'Active' | 'Inactive' | 'Reported'
  messages: number
}

const sampleMatches: Match[] = [
  { id: 1, userOne: 'Aarav Sharma', userTwo: 'Priya Karki', date: 'Today', status: 'Active', messages: 24 },
  { id: 2, userOne: 'Rohan Thapa', userTwo: 'Sita Rai', date: 'Yesterday', status: 'Active', messages: 12 },
  { id: 3, userOne: 'Nischal Gurung', userTwo: 'Anisha KC', date: 'Nov 19', status: 'Inactive', messages: 3 },
  { id: 4, userOne: 'Suman Lama', userTwo: 'Asha Shrestha', date: 'Nov 18', status: 'Reported', messages: 8 },
  { id: 5, userOne: 'Bibek Karki', userTwo: 'Samiksha Rai', date: 'Nov 17', status: 'Active', messages: 41 },
]

function Matches() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Match | null>(null)

  const filtered = useMemo(() => sampleMatches.filter(match => {
    const query = `${match.userOne} ${match.userTwo}`.toLowerCase()
    return query.includes(search.toLowerCase()) &&
      (filter === 'All' || match.status === filter)
  }), [search, filter])

  const statusStyle = {
    Active: 'bg-emerald-500/10 text-emerald-400',
    Inactive: 'bg-zinc-500/10 text-zinc-400',
    Reported: 'bg-red-500/10 text-red-400',
  }

  return (
    <div className="p-6 lg:p-8 space-y-7 text-white">
      <div>
        <p className="text-sm text-zinc-500">Engagement / Matches</p>
        <h1 className="text-2xl font-semibold mt-1">Matches Management</h1>
        <p className="text-sm text-zinc-500 mt-2">Monitor connections and matching activity across LovyDate.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Matches', icon: Heart },
          { label: 'Active Matches', icon: Users },
          { label: 'Messages Exchanged', icon: MessageCircle },
          { label: 'Reported Matches', icon: Eye },
        ].map(({ label, icon: Icon }) => (
          <div key={label} className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
            <div className="flex justify-between">
              <p className="text-sm text-zinc-400">{label}</p>
              <Icon size={18} className="text-pink-400" />
            </div>
            <p className="text-2xl font-semibold mt-4">—</p>
            <p className="text-xs text-zinc-600 mt-1">Live data pending</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="font-semibold">Match Records</h2>
            <p className="text-xs text-zinc-500 mt-1">Browse platform connection records</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="bg-[#09090b] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-pink-500"
              />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-sm">
              {['All', 'Active', 'Inactive', 'Reported'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="text-xs text-zinc-500 border-b border-white/[0.07]">
                <th className="py-4 font-medium">USER ONE</th>
                <th className="py-4 font-medium">USER TWO</th>
                <th className="py-4 font-medium">MATCH DATE</th>
                <th className="py-4 font-medium">MESSAGES</th>
                <th className="py-4 font-medium">STATUS</th>
                <th className="py-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(match => (
                <tr key={match.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                  <td className="py-4 text-sm font-medium">{match.userOne}</td>
                  <td className="py-4 text-sm font-medium">{match.userTwo}</td>
                  <td className="py-4 text-sm text-zinc-500">{match.date}</td>
                  <td className="py-4 text-sm text-zinc-400">{match.messages}</td>
                  <td className="py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyle[match.status]}`}>{match.status}</span>
                  </td>
                  <td className="py-4 text-right">
                    <button onClick={() => setSelected(match)} className="p-2 text-zinc-400 hover:text-pink-400 rounded-lg hover:bg-pink-500/10" title="View match">
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm text-zinc-500">No matches found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#151518] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Match Details</h2>
              <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="flex items-center justify-center gap-5 py-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 mx-auto"><Users size={22} /></div>
                <p className="text-sm mt-2">{selected.userOne}</p>
              </div>
              <Heart size={22} className="text-pink-500" />
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 mx-auto"><Users size={22} /></div>
                <p className="text-sm mt-2">{selected.userTwo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-zinc-500">Match date</p><p className="text-sm mt-1">{selected.date}</p></div>
              <div><p className="text-xs text-zinc-500">Status</p><p className="text-sm mt-1">{selected.status}</p></div>
              <div><p className="text-xs text-zinc-500">Messages</p><p className="text-sm mt-1">{selected.messages}</p></div>
            </div>
            <p className="text-xs text-zinc-500 mt-6">Preview only — sample records, not connected to live match data.</p>
            <button onClick={() => setSelected(null)} className="w-full mt-5 bg-pink-600 hover:bg-pink-500 rounded-lg py-2.5 text-sm font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Matches
