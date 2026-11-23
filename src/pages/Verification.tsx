
import { useState } from 'react'
import {
  Eye,
  X,
  User,
} from 'lucide-react'

const requests = [
  { id: 'VER001', name: 'Alex Morgan', email: 'alex@example.com', type: 'Face Verification', status: 'Pending', date: 'Nov 21, 2026' },
  { id: 'VER002', name: 'Jamie Wilson', email: 'jamie@example.com', type: 'Face Verification', status: 'Pending', date: 'Nov 21, 2026' },
  { id: 'VER003', name: 'Taylor Smith', email: 'taylor@example.com', type: 'Face Verification', status: 'Approved', date: 'Nov 20, 2026' },
  { id: 'VER004', name: 'Jordan Lee', email: 'jordan@example.com', type: 'Face Verification', status: 'Rejected', date: 'Nov 19, 2026' },
]

type Request = typeof requests[number]
type Filter = 'All' | 'Pending' | 'Approved' | 'Rejected'

export default function Verification() {
  const [filter, setFilter] = useState<Filter>('All')
  const [selected, setSelected] = useState<Request | null>(null)

  const counts = {
    All: requests.length,
    Pending: requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  }

  const filtered = requests.filter(
    r => filter === 'All' || r.status === filter
  )

  return (
    <div className="p-6 md:p-8 space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-white">Verification Center</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Review account verification requests.
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {(Object.keys(counts) as Filter[]).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`p-5 rounded-xl border text-left ${
              filter === status
                ? 'border-pink-500/40 bg-pink-500/[0.06]'
                : 'border-white/[0.07] bg-[#111115]'
            }`}
          >
            <p className="text-sm text-zinc-400">{status} Requests</p>
            <p className="text-2xl font-bold text-white mt-2">
              {counts[status]}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-[#111115] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/[0.07]">
          <h2 className="text-white font-semibold">Verification Requests</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {filtered.length} requests found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-xs text-zinc-500 border-b border-white/[0.07]">
                <th className="px-5 py-4">USER</th>
                <th className="px-5 py-4">TYPE</th>
                <th className="px-5 py-4">DATE</th>
                <th className="px-5 py-4">STATUS</th>
                <th className="px-5 py-4">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(request => (
                <tr key={request.id} className="border-b border-white/[0.05]">
                  <td className="px-5 py-4">
                    <p className="text-sm text-white">{request.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{request.email}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-400">
                    {request.type}
                  </td>

                  <td className="px-5 py-4 text-xs text-zinc-400">
                    {request.date}
                  </td>

                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      request.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-400'
                        : request.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                    }`}>
                      {request.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelected(request)}
                      className="flex items-center gap-2 text-xs text-zinc-400 hover:text-pink-400"
                    >
                      <Eye size={15} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#151519] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Verification Details</h2>
              <button onClick={() => setSelected(null)}>
                <X className="text-zinc-400" />
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center py-5 bg-white/[0.02] rounded-xl">
              <User size={40} className="text-zinc-500" />
              <p className="text-white font-medium mt-3">{selected.name}</p>
              <p className="text-xs text-zinc-500 mt-1">{selected.email}</p>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-sm text-zinc-400">
                Request ID: <span className="text-white">{selected.id}</span>
              </p>
              <p className="text-sm text-zinc-400">
                Type: <span className="text-white">{selected.type}</span>
              </p>
              <p className="text-sm text-zinc-400">
                Status: <span className="text-white">{selected.status}</span>
              </p>
            </div>

            <p className="text-xs text-amber-400 mt-5">
              Actual verification evidence will be available after backend integration.
            </p>

            <button
              onClick={() => setSelected(null)}
              className="w-full mt-5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg py-2.5 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-amber-400">
        Preview mode: Sample requests only. No real verification decisions are made.
      </p>
    </div>
  )
}
