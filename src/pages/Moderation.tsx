import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Flag,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import api from "../lib/api";

type ReportStatus = "open" | "in_review" | "resolved" | "dismissed";
type Filter = "all" | ReportStatus;

type Report = {
  id: string;
  priority: string;
  category: string;
  status: ReportStatus;
  reason: string;
  details?: string | null;
  targetType: string;
  targetId?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  resolutionType?: string | null;
  resolutionNote?: string | null;
  reportedUserId: string;
  reporterUserId: string;
  reportedUserName?: string | null;
  reportedUserEmail?: string | null;
  reportedUserPhoto?: string | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  assignedAdminName?: string | null;
};

type ReportDetail = Report & {
  assignedAdminId?: string | null;
  reportedUserStatus?: string;
  reportedUserGender?: string | null;
  reportedUserDob?: string | null;
  reportedUserBio?: string | null;
  contextData?: {
    type: string;
    data: {
      content?: string;
      commentText?: string;
      createdAt?: string;
      photos?: string[];
    } | null;
  } | null;
  reportedUserPhotos?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    moderationStatus: string;
  }>;
  previousReports?: Array<{
    id: string;
    category: string;
    reason: string;
    status: string;
    createdAt: string;
  }>;
  previousRestrictions?: Array<{
    id: string;
    restrictionType: string;
    reason: string;
    isActive: boolean;
    createdAt: string;
  }>;
  notes?: Array<{
    id: string;
    note: string;
    createdAt: string;
    adminName?: string;
  }>;
};

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All reports" },
  { value: "open", label: "Open" },
  { value: "in_review", label: "In review" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function label(value?: string | null) {
  if (!value) return "Unknown";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusStyle(status: string) {
  switch (status) {
    case "open":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "in_review":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "resolved":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "dismissed":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-white/5 text-zinc-400 border-white/10";
  }
}

function priorityStyle(priority: string) {
  switch (priority.toLowerCase()) {
    case "critical":
      return "text-red-400 bg-red-500/10";
    case "high":
      return "text-orange-400 bg-orange-500/10";
    case "medium":
      return "text-amber-400 bg-amber-500/10";
    default:
      return "text-zinc-400 bg-white/5";
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  value: number;
  icon: typeof Flag;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border p-5 transition ${
        active
          ? "border-pink-500/40 bg-pink-500/[0.07]"
          : "border-white/[0.07] bg-[#111115] hover:border-white/15"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <Icon size={18} className="text-zinc-500" />
      </div>
      <p className="text-2xl font-semibold text-white mt-3">{value}</p>
    </button>
  );
}

export default function Moderation() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [action, setAction] = useState<
    "resolve" | "dismiss" | "escalate" | "note" | null
  >(null);
  const [actionText, setActionText] = useState("");
  const [resolutionType, setResolutionType] = useState("content_removed");

  const fetchReports = useCallback(
    async (cursor?: string, append = false) => {
      try {
        setLoading(true);
        setError("");

        const params: Record<string, string | number> = { limit: 25 };

        if (filter !== "all") params.status = filter;
        if (cursor) params.cursor = cursor;

        const response = await api.get("/reports", { params });
        const result = response.data.data;

        const items: Report[] = result.items || [];

        setReports((previous) => (append ? [...previous, ...items] : items));
        setNextCursor(result.nextCursor || null);
        setHasMore(Boolean(result.hasMore));
      } catch (err: any) {
        setError(
          err.response?.data?.error?.message ||
            "Unable to load reports. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    setReports([]);
    setNextCursor(null);
    fetchReports();
  }, [fetchReports]);

  async function openReport(report: Report) {
    setSelected(null);
    setAction(null);
    setDetailLoading(true);

    try {
      const response = await api.get(`/reports/${report.id}`);
      setSelected(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Unable to load report details.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function performAction() {
    if (!selected || !action) return;

    if (
      ["resolve", "dismiss", "escalate", "note"].includes(action) &&
      !actionText.trim()
    ) {
      setError("Please enter the required note or reason.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const id = selected.id;

      if (action === "resolve") {
        await api.post(`/reports/${id}/resolve`, {
          resolutionType,
          resolutionNote: actionText.trim(),
        });
      }

      if (action === "dismiss") {
        await api.post(`/reports/${id}/dismiss`, {
          note: actionText.trim(),
        });
      }

      if (action === "escalate") {
        await api.post(`/reports/${id}/escalate`, {
          reason: actionText.trim(),
        });
      }

      if (action === "note") {
        await api.post(`/reports/${id}/notes`, {
          note: actionText.trim(),
        });
      }

      if (action === "resolve" || action === "dismiss") {
        setSelected(null);
      } else {
        const response = await api.get(`/reports/${id}`);
        setSelected(response.data.data);
      }

      setAction(null);
      setActionText("");
      await fetchReports();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          "The action could not be completed.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function markInReview() {
    if (!selected) return;

    try {
      setActionLoading(true);
      setError("");

      await api.post(`/reports/${selected.id}/in-review`);

      const response = await api.get(`/reports/${selected.id}`);
      setSelected(response.data.data);
      await fetchReports();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Unable to update report status.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const visibleReports = reports.filter((report) => {
    const term = search.toLowerCase();
    return (
      !term ||
      report.id.toLowerCase().includes(term) ||
      report.reason?.toLowerCase().includes(term) ||
      report.reportedUserName?.toLowerCase().includes(term) ||
      report.reporterName?.toLowerCase().includes(term) ||
      report.reportedUserEmail?.toLowerCase().includes(term)
    );
  });

  const counts = {
    all: reports.length,
    open: reports.filter((r) => r.status === "open").length,
    in_review: reports.filter((r) => r.status === "in_review").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  return (
    <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 text-white overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-pink-400" size={22} />
            <h1 className="text-2xl font-bold">Content Moderation</h1>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Review reports and manage platform safety.
          </p>
        </div>

        <button
          onClick={() => fetchReports()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-[#111115] text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Loaded reports"
          value={counts.all}
          icon={Flag}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard
          title="Open"
          value={counts.open}
          icon={AlertTriangle}
          active={filter === "open"}
          onClick={() => setFilter("open")}
        />
        <StatCard
          title="In review"
          value={counts.in_review}
          icon={Clock3}
          active={filter === "in_review"}
          onClick={() => setFilter("in_review")}
        />
        <StatCard
          title="Resolved"
          value={counts.resolved}
          icon={CheckCircle2}
          active={filter === "resolved"}
          onClick={() => setFilter("resolved")}
        />
        <StatCard
          title="Dismissed"
          value={counts.dismissed}
          icon={X}
          active={filter === "dismissed"}
          onClick={() => setFilter("dismissed")}
        />
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-[#111115] overflow-hidden">
        <div className="p-5 border-b border-white/[0.07] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-semibold">Reported Content</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Showing {visibleReports.length} loaded reports
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports or users..."
              className="w-full rounded-lg border border-white/10 bg-[#09090c] py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-pink-500/50"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto p-4 border-b border-white/[0.05]">
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs transition ${
                filter === item.value
                  ? "bg-pink-500/15 text-pink-300 border border-pink-500/20"
                  : "bg-white/[0.03] text-zinc-400 border border-transparent hover:bg-white/[0.06]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-4">Report</th>
                <th className="px-5 py-4">Reported user</th>
                <th className="px-5 py-4">Category / reason</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    <Loader2 className="mx-auto animate-spin mb-3" size={22} />
                    Loading reports...
                  </td>
                </tr>
              ) : visibleReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Flag className="mx-auto text-zinc-600 mb-3" size={25} />
                    <p className="text-sm text-zinc-300">No reports found</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Try another filter or search term.
                    </p>
                  </td>
                </tr>
              ) : (
                visibleReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {report.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        By{" "}
                        {report.reporterName ||
                          report.reporterEmail ||
                          "Unknown"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm">
                        {report.reportedUserName || "Unknown user"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {report.reportedUserEmail || "No email"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm">{label(report.category)}</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[190px] truncate">
                        {report.reason}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs ${priorityStyle(report.priority)}`}
                      >
                        {label(report.priority)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs ${statusStyle(report.status)}`}
                      >
                        {label(report.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openReport(report)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:border-pink-500/30 hover:text-pink-300"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile report cards */}
        <div className="md:hidden divide-y divide-white/[0.06]">
          {loading && reports.length === 0 ? (
            <div className="py-14 text-center text-zinc-500">
              <Loader2 className="mx-auto animate-spin mb-3" size={22} />
              <p className="text-sm">Loading reports...</p>
            </div>
          ) : visibleReports.length === 0 ? (
            <div className="py-14 text-center">
              <Flag className="mx-auto text-zinc-600 mb-3" size={25} />
              <p className="text-sm text-zinc-300">No reports found</p>
              <p className="text-xs text-zinc-500 mt-1">
                Try another filter or search term.
              </p>
            </div>
          ) : (
            visibleReports.map((report) => (
              <div key={report.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Report #{report.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      By{" "}
                      {report.reporterName || report.reporterEmail || "Unknown"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] ${statusStyle(report.status)}`}
                  >
                    {label(report.status)}
                  </span>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-3 space-y-2">
                  <div>
                    <p className="text-[11px] text-zinc-500">Reported user</p>
                    <p className="text-sm font-medium break-words">
                      {report.reportedUserName || "Unknown user"}
                    </p>
                    <p className="text-xs text-zinc-500 break-all">
                      {report.reportedUserEmail || "No email"}
                    </p>
                  </div>

                  <div className="border-t border-white/[0.06] pt-2">
                    <p className="text-[11px] text-zinc-500">
                      Category / reason
                    </p>
                    <p className="text-sm">{label(report.category)}</p>
                    <p className="text-xs text-zinc-400 mt-1 break-words">
                      {report.reason}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-md px-2 py-1 text-xs ${priorityStyle(report.priority)}`}
                  >
                    {label(report.priority)} priority
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {formatDate(report.createdAt)}
                  </span>
                </div>

                <button
                  onClick={() => openReport(report)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-pink-500/20 bg-pink-500/10 px-3 py-2.5 text-sm text-pink-300 hover:bg-pink-500/15"
                >
                  <Eye size={15} /> Review report
                </button>
              </div>
            ))
          )}
        </div>

        {hasMore && (
          <div className="p-4 border-t border-white/[0.06] flex justify-center">
            <button
              disabled={loading || !nextCursor}
              onClick={() => nextCursor && fetchReports(nextCursor, true)}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load more reports"}
            </button>
          </div>
        )}
      </div>

      {detailLoading && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <Loader2 className="animate-spin" size={20} />
            Loading report details...
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-3 md:p-8">
          <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#111115] shadow-2xl my-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/[0.07] bg-[#111115] p-5 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <Flag size={17} className="text-pink-400" />
                  <h2 className="font-semibold">Report investigation</h2>
                </div>
                <p className="text-xs text-zinc-500 mt-1">ID: {selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px]">
              <div className="p-5 md:p-6 space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusStyle(selected.status)}`}
                  >
                    {label(selected.status)}
                  </span>
                  <span
                    className={`rounded-md px-3 py-1 text-xs ${priorityStyle(selected.priority)}`}
                  >
                    {label(selected.priority)} priority
                  </span>
                  <span className="rounded-md bg-white/5 px-3 py-1 text-xs text-zinc-400">
                    {label(selected.category)}
                  </span>
                </div>

                <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText size={16} className="text-pink-400" />
                    Report information
                  </h3>
                  <div>
                    <p className="text-xs text-zinc-500">Reason</p>
                    <p className="text-sm mt-1">{selected.reason}</p>
                  </div>
                  {selected.details && (
                    <div>
                      <p className="text-xs text-zinc-500">
                        Additional details
                      </p>
                      <p className="text-sm text-zinc-300 mt-1 whitespace-pre-wrap">
                        {selected.details}
                      </p>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-zinc-500">Target type</p>
                      <p className="text-sm mt-1">
                        {label(selected.targetType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Submitted</p>
                      <p className="text-sm mt-1">
                        {formatDate(selected.createdAt)}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-white/[0.07] p-4 space-y-3">
                  <h3 className="text-sm font-semibold">People involved</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <User size={18} className="text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-500">Reported user</p>
                        <p className="text-sm truncate">
                          {selected.reportedUserName || "Unknown"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {selected.reportedUserEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <Flag size={17} className="text-zinc-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-500">Reporter</p>
                        <p className="text-sm truncate">
                          {selected.reporterName || "Unknown"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {selected.reporterEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06]">
                    <p className="text-xs text-zinc-500">
                      Reported account status
                    </p>
                    <p className="text-sm mt-1">
                      {label(selected.reportedUserStatus)}
                    </p>
                  </div>
                  {selected.reportedUserBio && (
                    <div>
                      <p className="text-xs text-zinc-500">Profile bio</p>
                      <p className="text-sm text-zinc-300 mt-1">
                        {selected.reportedUserBio}
                      </p>
                    </div>
                  )}
                </section>

                {selected.contextData?.data && (
                  <section className="rounded-xl border border-white/[0.07] p-4 space-y-3">
                    <h3 className="text-sm font-semibold">Reported content</h3>
                    <p className="text-xs text-zinc-500">
                      {label(selected.contextData.type)}
                    </p>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                      {selected.contextData.data.content ||
                        selected.contextData.data.commentText ||
                        "No text content"}
                    </p>
                    {!!selected.contextData.data.photos?.length && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selected.contextData.data.photos.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt="Reported content"
                            className="w-full aspect-square object-cover rounded-lg border border-white/10"
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {!!selected.reportedUserPhotos?.length && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      Reported user's photos
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {selected.reportedUserPhotos.map((photo) => (
                        <div key={photo.id} className="relative">
                          <img
                            src={photo.url}
                            alt="User profile"
                            className="w-full aspect-square object-cover rounded-lg border border-white/10"
                          />
                          {photo.isPrimary && (
                            <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-1 text-[10px]">
                              Primary
                            </span>
                          )}
                          <span className="block text-[10px] text-zinc-500 mt-1">
                            {label(photo.moderationStatus)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!selected.previousReports?.length && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      Previous reports against this user
                    </h3>
                    <div className="space-y-2">
                      {selected.previousReports.map((report) => (
                        <div
                          key={report.id}
                          className="rounded-lg border border-white/[0.06] p-3 flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-sm">{label(report.category)}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {report.reason}
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-2 py-1 text-[10px] ${statusStyle(report.status)}`}
                          >
                            {label(report.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {!!selected.previousRestrictions?.length && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      Account restrictions
                    </h3>
                    {selected.previousRestrictions.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-white/[0.06] p-3 flex justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm">
                            {label(item.restrictionType)}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {item.reason}
                          </p>
                        </div>
                        <span
                          className={`text-xs ${item.isActive ? "text-amber-400" : "text-zinc-500"}`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ))}
                  </section>
                )}

                <section className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare size={16} className="text-pink-400" />
                      Internal notes
                    </h3>
                    <button
                      onClick={() => {
                        setAction("note");
                        setActionText("");
                      }}
                      className="text-xs text-pink-300 hover:text-pink-200"
                    >
                      + Add note
                    </button>
                  </div>
                  {selected.notes?.length ? (
                    selected.notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border border-white/[0.06] p-3"
                      >
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                          {note.note}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-2">
                          {note.adminName || "Admin"} ·{" "}
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500">
                      No internal notes yet.
                    </p>
                  )}
                </section>

                {selected.resolutionNote && (
                  <section className="rounded-lg border border-white/[0.07] p-4">
                    <p className="text-xs text-zinc-500">Resolution note</p>
                    <p className="text-sm mt-2">{selected.resolutionNote}</p>
                    {selected.resolutionType && (
                      <p className="text-xs text-zinc-500 mt-2">
                        Type: {label(selected.resolutionType)}
                      </p>
                    )}
                  </section>
                )}
              </div>

              <aside className="border-t lg:border-t-0 lg:border-l border-white/[0.07] bg-[#0d0d11] p-5 space-y-4">
                <h3 className="font-semibold text-sm">Review actions</h3>

                <div className="text-xs text-zinc-500">
                  Assigned to:{" "}
                  <span className="text-zinc-300">
                    {selected.assignedAdminName || "Unassigned"}
                  </span>
                </div>

                {selected.status === "open" && (
                  <button
                    disabled={actionLoading}
                    onClick={markInReview}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 py-2.5 text-sm text-blue-300 hover:bg-blue-500/15 disabled:opacity-50"
                  >
                    <Eye size={15} /> Mark in review
                  </button>
                )}

                {selected.status !== "resolved" &&
                  selected.status !== "dismissed" && (
                    <>
                      <button
                        onClick={() => {
                          setAction("resolve");
                          setActionText("");
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/20 py-2.5 text-sm text-emerald-300 hover:bg-emerald-500/20"
                      >
                        <CheckCircle2 size={15} /> Resolve report
                      </button>
                      <button
                        onClick={() => {
                          setAction("dismiss");
                          setActionText("");
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
                      >
                        <X size={15} /> Dismiss report
                      </button>
                      <button
                        onClick={() => {
                          setAction("escalate");
                          setActionText("");
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/10 py-2.5 text-sm text-orange-300 hover:bg-orange-500/15"
                      >
                        <ArrowUpRight size={15} /> Escalate report
                      </button>
                    </>
                  )}

                <div className="border-t border-white/[0.07] pt-4 space-y-2">
                  <p className="text-xs text-zinc-500">Reported account</p>
                  <p className="text-xs text-zinc-400 break-all">
                    {selected.reportedUserId}
                  </p>
                  <p className="text-xs text-zinc-500">Target ID</p>
                  <p className="text-xs text-zinc-400 break-all">
                    {selected.targetId || "—"}
                  </p>
                </div>
              </aside>
            </div>

            {action && (
              <div className="border-t border-white/[0.07] p-5 md:p-6 bg-[#0d0d11] rounded-b-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-sm">
                    {label(action)} report
                  </h3>
                  <button
                    onClick={() => setAction(null)}
                    className="text-zinc-500 hover:text-white"
                  >
                    <X size={17} />
                  </button>
                </div>

                {action === "resolve" && (
                  <div className="mb-3">
                    <label className="block text-xs text-zinc-400 mb-2">
                      Resolution type
                    </label>
                    <div className="relative">
                      <select
                        value={resolutionType}
                        onChange={(e) => setResolutionType(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-white/10 bg-[#151519] px-3 py-2.5 text-sm text-white outline-none"
                      >
                        <option value="content_removed">Content removed</option>
                        <option value="user_warned">User warned</option>
                        <option value="user_suspended">User suspended</option>
                        <option value="no_action">No further action</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500"
                      />
                    </div>
                  </div>
                )}

                <label className="block text-xs text-zinc-400 mb-2">
                  {action === "note"
                    ? "Internal note"
                    : action === "dismiss"
                      ? "Dismissal note"
                      : action === "escalate"
                        ? "Escalation reason"
                        : "Resolution note"}
                </label>
                <textarea
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  rows={3}
                  placeholder="Write a clear explanation..."
                  className="w-full rounded-lg border border-white/10 bg-[#151519] p-3 text-sm text-white outline-none resize-y focus:border-pink-500/40"
                />

                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setAction(null)}
                    className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={actionLoading || !actionText.trim()}
                    onClick={performAction}
                    className="rounded-lg bg-pink-500 px-5 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Confirm action
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
