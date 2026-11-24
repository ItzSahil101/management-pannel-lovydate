import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  UserRound,
  CalendarDays,
  MapPin,
  Mail,
  Clock3,
  Heart,
  MessageCircle,
  Images,
  Sparkles,
  X,
  Loader2,
  ChevronDown,
  ShieldAlert,
  Ban,
  ShieldCheck,
  UserX,
} from "lucide-react";
import api from "../lib/api";

type Status = "active" | "suspended" | "banned" | "deleted";
type Filter = "all" | Status;
type ActionType =
  | "warn"
  | "suspend"
  | "unsuspend"
  | "ban"
  | "unban"
  | "deactivate";

type User = {
  id: string;
  email: string;
  status: Status;
  displayName: string | null;
  createdAt: string;
  lastActiveAt?: string | null;
  primaryPhoto?: string | null;
  reportCount?: number;
  activeRestrictionsCount?: number;
};

type UserDetail = User & {
  updatedAt?: string;
  emailVerifiedAt?: string | null;
  isGoogleSignup?: boolean;
  dateOfBirth?: string | null;
  gender?: string | null;
  customGender?: string | null;
  relationshipGoal?: string | null;
  bio?: string | null;
  onboardingCompleted?: boolean;
  city?: string | null;
  countryCode?: string | null;
  photos?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    moderationStatus: string;
  }>;
  interests?: Array<{
    id: string;
    name: string;
    category?: string;
  }>;
  stats?: {
    likesSent: number;
    likesReceived: number;
    matches: number;
    messagesSent: number;
    feedPosts: number;
    reportsReceived: number;
    reportsSubmitted: number;
  };
};

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" },
  { value: "deleted", label: "Deleted" },
];

const actionOptions: {
  value: ActionType;
  label: string;
  description: string;
}[] = [
  {
    value: "warn",
    label: "Warn User",
    description: "Record a warning for this account.",
  },
  {
    value: "suspend",
    label: "Suspend Account",
    description: "Temporarily or permanently suspend account access.",
  },
  {
    value: "unsuspend",
    label: "Unsuspend Account",
    description: "Restore access to a suspended account.",
  },
  {
    value: "ban",
    label: "Permanently Ban Account",
    description: "Permanently block this account from accessing LovyDate.",
  },
  {
    value: "unban",
    label: "Remove Permanent Ban",
    description:
      "Remove the permanent ban and restore eligible account access.",
  },
  {
    value: "deactivate",
    label: "Deactivate Account",
    description: "Mark the account as deleted.",
  },
];

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function statusStyle(status: string) {
  if (status === "active") return "bg-emerald-500/10 text-emerald-400";
  if (status === "suspended") return "bg-amber-500/10 text-amber-400";
  if (status === "banned") return "bg-red-500/10 text-red-400";
  return "bg-red-500/10 text-red-400";
}

function getErrorMessage(err: any, fallback: string) {
  return (
    err.response?.data?.error?.message ||
    err.response?.data?.message ||
    fallback
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [actionType, setActionType] = useState<ActionType>("warn");
  const [actionReason, setActionReason] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      setError("");
      setUsers([]);
      setNextCursor(null);
      setHasMore(false);

      try {
        const params: Record<string, string | number> = {
          limit: 25,
          sort: "newest",
        };

        if (search.trim()) params.search = search.trim();
        if (filter !== "all") params.status = filter;

        const response = await api.get("/users", { params });

        if (cancelled) return;

        const result = response.data.data;
        setUsers(result.items || []);
        setNextCursor(result.nextCursor || null);
        setHasMore(Boolean(result.hasMore));
      } catch (err: any) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load users."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [search, filter]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    setError("");

    try {
      const params: Record<string, string | number> = {
        limit: 25,
        sort: "newest",
        cursor: nextCursor,
      };

      if (search.trim()) params.search = search.trim();
      if (filter !== "all") params.status = filter;

      const response = await api.get("/users", { params });
      const result = response.data.data;

      setUsers((previous) => [...previous, ...(result.items || [])]);
      setNextCursor(result.nextCursor || null);
      setHasMore(Boolean(result.hasMore));
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to load more users."));
    } finally {
      setLoadingMore(false);
    }
  };

  const openUser = async (user: User) => {
    setSelected(null);
    setDetailError("");
    setDetailLoading(true);

    setActionType("warn");
    setActionReason("");
    setActionMessage("");
    setInternalNote("");
    setDurationDays("");
    setActionError("");
    setActionSuccess("");

    try {
      const response = await api.get(`/users/${user.id}`);
      setSelected(response.data.data);
    } catch (err: any) {
      setDetailError(getErrorMessage(err, "Failed to load user details."));
    } finally {
      setDetailLoading(false);
    }
  };

  const submitUserAction = async () => {
    if (!selected || actionLoading) return;

    const reason = actionReason.trim();

    if (!reason) {
      setActionError("Please enter a reason for this action.");
      return;
    }

    if (
      actionType === "suspend" &&
      durationDays.trim() &&
      (!Number.isInteger(Number(durationDays)) || Number(durationDays) < 1)
    ) {
      setActionError("Duration must be a positive whole number of days.");
      return;
    }

    if (
      actionType === "suspend" &&
      durationDays.trim() &&
      Number(durationDays) > 36500
    ) {
      setActionError("Please enter a duration of 36500 days or less.");
      return;
    }

    const actionLabels: Record<ActionType, string> = {
      warn: "send a warning to",
      suspend: "suspend",
      unsuspend: "unsuspend",
      ban: "permanently ban",
      unban: "remove the permanent ban from",
      deactivate: "deactivate",
    };

    const confirmation =
      actionType === "warn"
        ? `Send a warning to ${selected.displayName || selected.email}?`
        : `Are you sure you want to ${actionLabels[actionType]} ${selected.displayName || selected.email}?`;

    if (!window.confirm(confirmation)) return;

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const payload: Record<string, string | number> = {
        reason,
      };

      if (actionType === "warn" && actionMessage.trim()) {
        payload.message = actionMessage.trim();
      }

      if (actionType === "suspend") {
        if (internalNote.trim()) {
          payload.internalNote = internalNote.trim();
        }

        if (durationDays.trim()) {
          payload.durationDays = Number(durationDays);
        }
      }

      await api.post(`/users/${selected.id}/${actionType}`, payload);

      let refreshedUser: UserDetail | null = null;

      try {
        const refreshed = await api.get(`/users/${selected.id}`);
        refreshedUser = refreshed.data.data;

        setSelected(refreshedUser);
        setUsers((previous) =>
          previous.map((user) =>
            user.id === selected.id
              ? { ...user, status: refreshedUser!.status }
              : user,
          ),
        );
      } catch {
        // The action succeeded even if refreshing the profile failed.
        // Keep the panel open and let the administrator reload the profile.
      }

      setActionSuccess(
        actionType === "warn"
          ? "Warning recorded successfully."
          : actionType === "suspend"
            ? "Account suspended successfully."
            : actionType === "unsuspend"
              ? "Account unsuspended successfully."
              : actionType === "ban"
                ? "Account permanently banned successfully."
                : actionType === "unban"
                  ? "Permanent ban removed successfully."
                  : "Account deactivated successfully.",
      );

      if (!refreshedUser) {
        setActionError(
          "The action succeeded, but the profile status could not be refreshed. Close and reopen this profile to see the latest status.",
        );
      }

      setActionReason("");
      setActionMessage("");
      setInternalNote("");
      setDurationDays("");
    } catch (err: any) {
      setActionError(getErrorMessage(err, "Action failed. Please try again."));
    } finally {
      setActionLoading(false);
    }
  };

  const availableActions = actionOptions.filter((action) => {
    if (selected?.status === "deleted") return false;

    if (selected?.status === "banned") {
      return action.value === "unban";
    }

    if (action.value === "unban") return false;
    if (action.value === "unsuspend") return selected?.status === "suspended";
    if (action.value === "suspend") return selected?.status === "active";

    if (action.value === "ban") {
      return selected?.status === "active" || selected?.status === "suspended";
    }

    return true;
  });

  const counts = {
    all: users.length,
    active: users.filter((user) => user.status === "active").length,
    suspended: users.filter((user) => user.status === "suspended").length,
    banned: users.filter((user) => user.status === "banned").length,
    deleted: users.filter((user) => user.status === "deleted").length,
  };

  return (
    <div className="p-6 md:p-8 space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Search and manage real LovyDate accounts.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {filters.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`text-left p-5 rounded-xl border transition-colors ${
              filter === item.value
                ? "border-pink-500/40 bg-pink-500/[0.06]"
                : "border-white/[0.07] bg-[#111115] hover:border-white/20"
            }`}
          >
            <p className="text-sm text-zinc-400">{item.label} Users</p>
            <p className="text-2xl font-bold text-white mt-2">
              {loading ? "—" : counts[item.value]}
            </p>
            <p className="text-[11px] text-zinc-600 mt-1">Loaded records</p>
          </button>
        ))}
      </div>

      <div className="bg-[#111115] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-white font-semibold">All Users</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {loading ? "Loading..." : `${users.length} users loaded`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#09090b] border border-white/[0.08] rounded-lg px-3 py-2 w-full sm:w-72">
            <Search size={17} className="text-zinc-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or ID..."
              className="bg-transparent outline-none text-sm text-white placeholder:text-zinc-600 w-full"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-400 border-b border-white/[0.07]">
            {error}
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-xs text-zinc-500 border-b border-white/[0.07]">
                <th className="px-5 py-4 font-medium">USER</th>
                <th className="px-5 py-4 font-medium">USER ID</th>
                <th className="px-5 py-4 font-medium">JOINED</th>
                <th className="px-5 py-4 font-medium">STATUS</th>
                <th className="px-5 py-4 font-medium">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-500">
                    <Loader2 className="animate-spin inline mr-2" size={17} />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-sm text-zinc-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/[0.05] hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm text-white font-medium">
                        {user.displayName || "Unnamed User"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 break-all">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400">
                      {user.id.slice(0, 8)}...{user.id.slice(-6)}
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusStyle(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openUser(user)}
                        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-pink-400"
                      >
                        <Eye size={15} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-white/[0.07]">
          {loading ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              <Loader2 className="animate-spin inline mr-2" size={17} />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              No users found.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="p-4 space-y-3 hover:bg-white/[0.02]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white break-words">
                      {user.displayName || "Unnamed User"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 break-all">
                      {user.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full capitalize ${statusStyle(user.status)}`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.05]">
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                      Joined
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => openUser(user)}
                    className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 text-xs font-medium transition"
                  >
                    <Eye size={14} />
                    View Profile
                  </button>
                </div>

                <p className="text-[10px] text-zinc-600 font-mono break-all">
                  ID: {user.id}
                </p>
              </div>
            ))
          )}
        </div>

        {hasMore && !loading && (
          <div className="p-5 flex justify-center border-t border-white/[0.07]">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 text-sm text-zinc-300 hover:text-pink-400 disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ChevronDown size={16} />
              )}
              {loadingMore ? "Loading..." : "Load more users"}
            </button>
          </div>
        )}
      </div>

      {detailLoading && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-pink-400" />
        </div>
      )}

      {detailError && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#151519] border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <p className="text-red-400 text-sm">{detailError}</p>
            <button
              onClick={() => setDetailError("")}
              className="mt-5 text-sm text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-6xl max-h-[94vh] overflow-y-auto bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#111116]/95 backdrop-blur-xl border-b border-white/[0.07] px-5 sm:px-8 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-pink-400 font-semibold">
                  LovyDate Administration
                </p>
                <h2 className="text-white text-lg font-semibold mt-1">
                  User Profile
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                disabled={actionLoading}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-8 space-y-7">
              {/* Profile hero */}
              <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#211321] via-[#17131d] to-[#111116] p-5 sm:p-7">
                <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/15 bg-white/[0.06] flex items-center justify-center">
                    {selected.primaryPhoto ||
                    selected.photos?.find((photo) => photo.isPrimary)?.url ? (
                      <img
                        src={
                          selected.primaryPhoto ||
                          selected.photos?.find((photo) => photo.isPrimary)
                            ?.url ||
                          ""
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserRound size={38} className="text-zinc-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {selected.displayName || "Unnamed User"}
                      </h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full capitalize font-semibold ${statusStyle(selected.status)}`}
                      >
                        {selected.status}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-400 mt-2 break-all flex items-center gap-2">
                      <Mail size={14} /> {selected.email}
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} /> Joined{" "}
                        {formatDate(selected.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {[selected.city, selected.countryCode]
                          .filter(Boolean)
                          .join(", ") || "Location unavailable"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 size={14} /> Last active{" "}
                        {formatDate(selected.lastActiveAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Account statistics */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">
                      Account Overview
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Live statistics from this account
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-white/[0.04] px-3 py-1.5 rounded-lg">
                    Account metrics
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                  {[
                    {
                      label: "Likes Sent",
                      value: selected.stats?.likesSent ?? 0,
                      icon: Heart,
                      color: "text-pink-400",
                      bg: "bg-pink-500/10",
                    },
                    {
                      label: "Likes Received",
                      value: selected.stats?.likesReceived ?? 0,
                      icon: Heart,
                      color: "text-rose-400",
                      bg: "bg-rose-500/10",
                    },
                    {
                      label: "Matches",
                      value: selected.stats?.matches ?? 0,
                      icon: Sparkles,
                      color: "text-purple-400",
                      bg: "bg-purple-500/10",
                    },
                    {
                      label: "Messages",
                      value: selected.stats?.messagesSent ?? 0,
                      icon: MessageCircle,
                      color: "text-blue-400",
                      bg: "bg-blue-500/10",
                    },
                    {
                      label: "Feed Posts",
                      value: selected.stats?.feedPosts ?? 0,
                      icon: Images,
                      color: "text-cyan-400",
                      bg: "bg-cyan-500/10",
                    },
                    {
                      label: "Reports",
                      value: selected.stats?.reportsReceived ?? 0,
                      icon: ShieldAlert,
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/[0.07] bg-[#141419] p-4 hover:border-white/15 transition"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg ${item.bg} ${item.color} flex items-center justify-center`}
                      >
                        <item.icon size={17} />
                      </div>
                      <p className="text-2xl font-bold text-white mt-3 tabular-nums">
                        {item.value.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Main profile content */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                {/* Left side */}
                <div className="xl:col-span-3 space-y-5">
                  {/* Personal information */}
                  <section className="rounded-2xl border border-white/[0.07] bg-[#141419] p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-white font-semibold">
                          Personal Information
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Profile and account details
                        </p>
                      </div>
                      <UserRound size={18} className="text-zinc-500" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                      {[
                        ["User ID", selected.id],
                        [
                          "Gender",
                          selected.gender ||
                            selected.customGender ||
                            "Not provided",
                        ],
                        ["Date of Birth", formatDate(selected.dateOfBirth)],
                        [
                          "Relationship Goal",
                          selected.relationshipGoal || "Not specified",
                        ],
                        [
                          "Signup Method",
                          selected.isGoogleSignup ? "Google" : "Email",
                        ],
                        [
                          "Email Verification",
                          selected.emailVerifiedAt
                            ? "Verified"
                            : "Not verified",
                        ],
                        [
                          "Onboarding",
                          selected.onboardingCompleted
                            ? "Completed"
                            : "Incomplete",
                        ],
                        [
                          "Active Restrictions",
                          String(selected.activeRestrictionsCount ?? 0),
                        ],
                        [
                          "Reports Submitted",
                          String(selected.stats?.reportsSubmitted ?? 0),
                        ],
                        ["Last Updated", formatDate(selected.updatedAt)],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                            {label}
                          </p>
                          <p className="text-sm text-zinc-200 mt-1.5 break-all">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {selected.bio && (
                      <div className="mt-6 pt-5 border-t border-white/[0.07]">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
                          About
                        </p>
                        <p className="text-sm leading-6 text-zinc-300 whitespace-pre-wrap">
                          {selected.bio}
                        </p>
                      </div>
                    )}
                  </section>

                  {/* Photos */}
                  <section className="rounded-2xl border border-white/[0.07] bg-[#141419] p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-white font-semibold">
                          Profile Photos
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          {selected.photos?.length ?? 0} uploaded photos
                        </p>
                      </div>
                      <Images size={18} className="text-zinc-500" />
                    </div>

                    {selected.photos?.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selected.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="group relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.07]"
                          >
                            <img
                              src={photo.url}
                              alt="User profile"
                              loading="lazy"
                              className="w-full aspect-[4/5] object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                              <div className="flex flex-wrap gap-1">
                                {photo.isPrimary && (
                                  <span className="text-[10px] bg-pink-500 text-white px-2 py-1 rounded-md">
                                    Primary
                                  </span>
                                )}
                                <span className="text-[10px] bg-black/60 text-zinc-200 px-2 py-1 rounded-md capitalize">
                                  {photo.moderationStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center rounded-xl border border-dashed border-white/10">
                        <Images size={25} className="mx-auto text-zinc-600" />
                        <p className="text-sm text-zinc-500 mt-3">
                          No profile photos available
                        </p>
                      </div>
                    )}
                  </section>

                  {/* Interests */}
                  <section className="rounded-2xl border border-white/[0.07] bg-[#141419] p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={17} className="text-pink-400" />
                      <h3 className="text-white font-semibold">Interests</h3>
                    </div>
                    {selected.interests?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selected.interests.map((interest) => (
                          <span
                            key={interest.id}
                            className="text-xs text-zinc-300 bg-white/[0.05] border border-white/[0.07] px-3 py-2 rounded-lg"
                          >
                            {interest.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">
                        No interests added yet.
                      </p>
                    )}
                  </section>
                </div>

                {/* Right side: moderation */}
                <div className="xl:col-span-2">
                  {selected.status !== "deleted" ? (
                    <section className="rounded-2xl border border-white/[0.07] bg-[#141419] p-5 sm:p-6 xl:sticky xl:top-24 space-y-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={18} className="text-pink-400" />
                          <h3 className="text-white font-semibold">
                            Moderation Centre
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1.5">
                          Manage account actions and record moderation
                          decisions.
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 flex items-center justify-between">
                        <span className="text-xs text-zinc-400">
                          Current account status
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full capitalize font-semibold ${statusStyle(selected.status)}`}
                        >
                          {selected.status}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-2">
                          Moderation action
                        </label>
                        <select
                          value={actionType}
                          onChange={(event) => {
                            setActionType(event.target.value as ActionType);
                            setActionError("");
                            setActionSuccess("");
                          }}
                          disabled={actionLoading}
                          className="w-full bg-[#0b0b10] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-pink-500/50"
                        >
                          {availableActions.map((action) => (
                            <option key={action.value} value={action.value}>
                              {action.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-zinc-500 mt-2">
                          {
                            actionOptions.find(
                              (item) => item.value === actionType,
                            )?.description
                          }
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-2">
                          Reason <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={actionReason}
                          onChange={(event) =>
                            setActionReason(event.target.value)
                          }
                          disabled={actionLoading}
                          rows={3}
                          maxLength={2000}
                          placeholder="Explain why this action is necessary..."
                          className="w-full bg-[#0b0b10] border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-pink-500/50 resize-y"
                        />
                      </div>

                      {actionType === "warn" && (
                        <div>
                          <label className="block text-xs text-zinc-400 mb-2">
                            Warning Message (Optional)
                          </label>
                          <textarea
                            value={actionMessage}
                            onChange={(event) =>
                              setActionMessage(event.target.value)
                            }
                            disabled={actionLoading}
                            rows={3}
                            maxLength={2000}
                            placeholder="Message shown to the user..."
                            className="w-full bg-[#0b0b10] border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-pink-500/50 resize-y"
                          />
                        </div>
                      )}

                      {actionType === "suspend" && (
                        <>
                          <div>
                            <label className="block text-xs text-zinc-400 mb-2">
                              Duration in Days (Optional)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="36500"
                              step="1"
                              value={durationDays}
                              onChange={(event) =>
                                setDurationDays(event.target.value)
                              }
                              disabled={actionLoading}
                              placeholder="Empty = no expiry date"
                              className="w-full bg-[#0b0b10] border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-pink-500/50"
                            />
                            <p className="text-xs text-zinc-500 mt-2">
                              Leave empty for a suspension without an expiry
                              date.
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-400 mb-2">
                              Internal Note (Optional)
                            </label>
                            <textarea
                              value={internalNote}
                              onChange={(event) =>
                                setInternalNote(event.target.value)
                              }
                              disabled={actionLoading}
                              rows={2}
                              maxLength={2000}
                              placeholder="Private administrator note..."
                              className="w-full bg-[#0b0b10] border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-pink-500/50 resize-y"
                            />
                          </div>
                        </>
                      )}

                      {actionType === "deactivate" && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
                          <p className="text-sm text-red-400 font-semibold">
                            Account deletion
                          </p>
                          <p className="text-xs text-zinc-400 mt-1.5 leading-5">
                            This marks the account as deleted and invalidates
                            its refresh tokens. This action is not reversible
                            through this panel.
                          </p>
                        </div>
                      )}

                      {actionType === "unsuspend" && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                          <p className="text-xs text-zinc-300 leading-5">
                            This removes the account suspension. Enter a reason
                            for the audit record.
                          </p>
                        </div>
                      )}

                      {actionType === "ban" && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
                          <p className="text-sm text-red-400 font-semibold">
                            Permanent account ban
                          </p>
                          <p className="text-xs text-zinc-400 mt-1.5 leading-5">
                            This permanently blocks account access until an
                            administrator removes the ban. The action is
                            recorded in the audit log.
                          </p>
                        </div>
                      )}

                      {actionType === "unban" && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                          <p className="text-xs text-zinc-300 leading-5">
                            This removes the permanent ban. Any remaining active
                            suspension will still prevent account access.
                          </p>
                        </div>
                      )}

                      {actionError && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                          {actionError}
                        </div>
                      )}

                      {actionSuccess && (
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
                          {actionSuccess}
                        </div>
                      )}

                      <button
                        onClick={submitUserAction}
                        disabled={actionLoading || !actionReason.trim()}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${
                          actionType === "deactivate" || actionType === "ban"
                            ? "bg-red-600 hover:bg-red-700"
                            : actionType === "unsuspend" ||
                                actionType === "unban"
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : actionType === "suspend"
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-pink-600 hover:bg-pink-700"
                        }`}
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />{" "}
                            Processing...
                          </>
                        ) : (
                          <>
                            {actionType === "warn" && <ShieldAlert size={16} />}
                            {actionType === "suspend" && <Ban size={16} />}
                            {actionType === "unsuspend" && (
                              <ShieldCheck size={16} />
                            )}
                            {actionType === "ban" && <Ban size={16} />}
                            {actionType === "unban" && (
                              <ShieldCheck size={16} />
                            )}
                            {actionType === "deactivate" && <UserX size={16} />}
                            {
                              actionOptions.find(
                                (item) => item.value === actionType,
                              )?.label
                            }
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-zinc-600 text-center leading-4">
                        Actions require confirmation and are recorded in the
                        admin audit log.
                      </p>
                    </section>
                  ) : (
                    <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-6">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <UserX size={20} className="text-red-400" />
                      </div>
                      <h3 className="text-white font-semibold mt-4">
                        Account deleted
                      </h3>
                      <p className="text-sm text-zinc-400 mt-2 leading-6">
                        This account is marked as deleted. Account moderation
                        actions are unavailable.
                      </p>
                    </section>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-white/[0.07]">
                <p className="text-[11px] text-zinc-600 break-all">
                  Account ID: {selected.id}
                </p>
                <button
                  onClick={() => setSelected(null)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-sm text-white font-medium transition disabled:opacity-40"
                >
                  Close profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
