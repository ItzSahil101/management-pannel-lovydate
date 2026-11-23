import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import api from "../lib/api";

type MediaItem = {
  sourceType?: string;
  id: string;
  userId: string;
  url: string;
  isPrimary: boolean;
  moderationStatus: string;
  createdAt: string;
  userName?: string | null;
  userEmail?: string | null;
  reportsCount: number;
};

type MediaResponse = {
  items: MediaItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-emerald-500/10 text-emerald-400";
    case "pending":
      return "bg-amber-500/10 text-amber-400";
    case "removed":
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-zinc-500/10 text-zinc-400";
  }
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchMedia = useCallback(
    async (cursor?: string, append = false) => {
      try {
        setLoading(true);
        setError("");

        const params: Record<string, string | number> = { limit: 25 };
        if (status !== "all") params.status = status;
        if (cursor) params.cursor = cursor;

        const response = await api.get("/content/photos", { params });
        const result: MediaResponse = response.data.data;

        const items = result.items || [];
        setMedia((previous) => (append ? [...previous, ...items] : items));
        setNextCursor(result.nextCursor || null);
        setHasMore(Boolean(result.hasMore));
      } catch (err: any) {
        setError(
          err.response?.data?.error?.message ||
            "Unable to load media. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [status],
  );

  useEffect(() => {
    setMedia([]);
    setNextCursor(null);
    fetchMedia();
  }, [fetchMedia]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return media.filter((item) =>
      `${item.id} ${item.userName || ""} ${item.userEmail || ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [media, search]);

  const pendingCount = media.filter(
    (item) => item.moderationStatus === "pending",
  ).length;

  const approvedCount = media.filter(
    (item) => item.moderationStatus === "approved",
  ).length;

  return (
    <div className="p-6 lg:p-8 space-y-7 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Platform / Media Library</p>
          <h1 className="text-2xl font-semibold mt-1">Media Library</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Browse uploaded profile and post photos, and manage their moderation status.
          </p>
        </div>

        <button
          onClick={() => fetchMedia()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-[#111115] text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Loaded Photos", value: media.length },
          { label: "Approved", value: approvedCount },
          { label: "Pending", value: pendingCount },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-[#111114] border border-white/[0.07] rounded-xl p-5"
          >
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="text-2xl font-semibold mt-4">{card.value}</p>
            <p className="text-xs text-zinc-600 mt-1">Current loaded results</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Uploaded Photos</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Live records from the production database
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users or IDs..."
                className="bg-[#09090b] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-pink-500 w-full"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
            <button onClick={() => fetchMedia()} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        <div className="overflow-x-auto mt-6">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="text-xs text-zinc-500 border-b border-white/[0.07]">
                <th className="py-4 font-medium">PHOTO</th>
                <th className="py-4 font-medium">OWNER</th>
                <th className="py-4 font-medium">UPLOAD DATE</th>
                <th className="py-4 font-medium">REPORTS</th>
                <th className="py-4 font-medium">STATUS</th>
                <th className="py-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/[0.05] hover:bg-white/[0.02]"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.url}
                        alt={item.sourceType === "post" ? "Post photo" : "Profile photo"}
                        className="w-11 h-11 rounded-lg object-cover bg-white/5"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.sourceType === "post" ? "Post photo" : "Profile photo"}</p>
                        <p className="text-xs text-zinc-500">
                          {item.isPrimary
                            ? "Primary photo"
                            : "Additional photo"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <p className="text-sm text-zinc-300">
                      {item.userName || "Unknown user"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.userEmail || ""}
                    </p>
                  </td>

                  <td className="py-4 text-sm text-zinc-400">
                    {formatDate(item.createdAt)}
                  </td>

                  <td className="py-4 text-sm text-zinc-400">
                    {item.reportsCount}
                  </td>

                  <td className="py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${statusStyle(item.moderationStatus)}`}
                    >
                      {item.moderationStatus}
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <button
                      onClick={() => setSelected(item)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-pink-400 hover:bg-pink-500/10"
                      title="View details"
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && !error && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm text-zinc-500"
                  >
                    No photos found.
                  </td>
                </tr>
              )}

              {loading && media.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm text-zinc-500"
                  >
                    <Loader2 size={18} className="animate-spin inline mr-2" />
                    Loading photos...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="p-4 border-t border-white/[0.06] flex justify-center">
            <button
              disabled={loading || !nextCursor}
              onClick={() => nextCursor && fetchMedia(nextCursor, true)}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load more photos"}
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#111114] shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Media Details
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Review uploaded profile and post media
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              {/* Image Preview */}
              <div>
                <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#09090b]">
                  <img
                    src={selected.url}
                    alt={selected.sourceType === "post" ? "Post photo preview" : "Profile photo preview"}
                    className="max-h-[380px] w-full object-contain"
                  />

                  <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                    <ImageIcon size={13} className="mr-2 inline" />
                    {selected.sourceType === "post" ? "Post Photo" : "Profile Photo"}
                  </div>
                </div>

                <p className="mt-3 break-all text-xs text-zinc-600">
                  Media ID: {selected.id}
                </p>
              </div>

              {/* Information */}
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Moderation status
                  </p>

                  <div className="mt-2 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                    <span className="text-sm text-zinc-300">
                      Current status
                    </span>
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${statusStyle(selected.moderationStatus)}`}
                    >
                      {selected.moderationStatus}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Owner information
                  </p>

                  <div className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <div>
                      <p className="text-xs text-zinc-500">Display name</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {selected.userName || "Unknown user"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">Email address</p>
                      <p className="mt-1 break-all text-sm text-zinc-300">
                        {selected.userEmail || "Unavailable"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">User ID</p>
                      <p className="mt-1 break-all font-mono text-xs text-zinc-400">
                        {selected.userId}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Upload information
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <p className="text-xs text-zinc-500">Photo type</p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {selected.sourceType === "post" ? "Post Photo" : selected.isPrimary ? "Primary Profile" : "Additional Profile"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <p className="text-xs text-zinc-500">Reports</p>
                      <p
                        className={`mt-2 text-sm font-semibold ${selected.reportsCount > 0 ? "text-red-400" : "text-white"}`}
                      >
                        {selected.reportsCount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <p className="text-xs text-zinc-500">Uploaded on</p>
                    <p className="mt-1 text-sm text-white">
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.07] bg-white/[0.015] px-6 py-4">
              <p className="text-xs text-zinc-600">
                LovyDate Admin · Media Review
              </p>

              <button
                onClick={() => setSelected(null)}
                className="rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-pink-500"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




