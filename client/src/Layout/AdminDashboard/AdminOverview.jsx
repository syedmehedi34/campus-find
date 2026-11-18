import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  FaArrowRight,
  FaBoxOpen,
  FaBuilding,
  FaCheck,
  FaClock,
  FaSyncAlt,
  FaTimes,
  FaUsers,
} from "react-icons/fa";

import useAxiosPublic from "../../hooks/useAxiosPublic";
import useUserData from "../../hooks/useUserData";
import usePostData from "../../hooks/usePostData";
import useCampuses from "../../hooks/useCampuses";

// ⚠️ Nijer route gula onujayi ei path gulo thik kore nao
const ROUTES = {
  posts: "/admin-dashboard/manage-posts",
  campuses: "/admin-dashboard/manage-campuses",
  users: "/admin-dashboard/manage-users",
};

// =====================================
//              CONSTANTS
// =====================================

const CATEGORY_META = {
  electronics: { label: "Electronics", emoji: "💻" },
  gadgets: { label: "Gadgets", emoji: "🎧" },
  accessories: { label: "Accessories", emoji: "👜" },
  stationery: { label: "Stationery", emoji: "✏️" },
  books: { label: "Books", emoji: "📚" },
  clothing: { label: "Clothing", emoji: "👕" },
  footwear: { label: "Footwear", emoji: "👟" },
  "id-cards": { label: "ID cards", emoji: "🪪" },
  "wallets-purses": { label: "Wallets & purses", emoji: "👛" },
  keys: { label: "Keys", emoji: "🔑" },
  other: { label: "Other", emoji: "📦" },
};

const MODERATION_STYLE = {
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

const POST_STATUS_STYLE = {
  active: "bg-sky-50 text-sky-700 ring-sky-600/15",
  inactive: "bg-slate-100 text-slate-600 ring-slate-500/15",
  resolved: "bg-violet-50 text-violet-700 ring-violet-600/15",
};

// =====================================
//              HELPERS
// =====================================

const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

const getImage = (post) => {
  const first = post?.images?.[0];
  if (!first) return null;
  return typeof first === "string" ? first : first.url || null;
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const smoothPath = (pts) =>
  pts.reduce((d, p, i, a) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = a[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${d} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

// Number count-up animation
const useCountUp = (target = 0, duration = 1100) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    let start;

    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
};

// =====================================
//              SMALL PIECES
// =====================================

const Panel = ({ title, hint, action, children, className = "" }) => (
  <section
    className={`rounded-[22px] border border-[#e3ebe8] bg-white p-6 ${className}`}
  >
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h3 className="cf-display text-[17px] font-semibold text-[#10312c]">
          {title}
        </h3>
        {hint && <p className="mt-0.5 text-[13px] text-[#7a8f8a]">{hint}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Avatar = ({ user, size = 36 }) => {
  const letter = (user?.name || "?").trim().charAt(0).toUpperCase();
  return user?.photoUrl ? (
    <img
      src={user.photoUrl}
      alt={user.name}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#e3f4ec] text-sm font-bold text-[#0d7a55]"
    >
      {letter}
    </div>
  );
};

const Badge = ({ className, children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${className}`}
  >
    {children}
  </span>
);

const Thumb = ({ post, size = 44 }) => {
  const img = getImage(post);
  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eef4f2] text-xl"
    >
      {img ? (
        <img src={img} alt="" className="h-full w-full object-cover" />
      ) : (
        CATEGORY_META[post.category]?.emoji || "📦"
      )}
    </div>
  );
};

const Skeleton = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="cf-shimmer h-12 rounded-xl" />
    ))}
  </div>
);

const Empty = ({ children }) => (
  <p className="rounded-xl border border-dashed border-[#d5e2de] px-4 py-8 text-center text-sm text-[#7a8f8a]">
    {children}
  </p>
);

const Stat = ({ icon: Icon, label, value, suffix = "", note }) => {
  const n = useCountUp(value);
  return (
    <div className="flex-1 px-6 py-5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#6d837d]">
        <Icon className="text-[#0d9467]" />
        {label}
      </div>
      <p className="cf-display mt-2 text-[34px] font-bold leading-none text-[#10312c]">
        {n}
        {suffix}
      </p>
      <p className="mt-2 text-xs text-[#8ea19c]">{note}</p>
    </div>
  );
};

// =====================================
//              MAIN PAGE
// =====================================

const AdminOverview = () => {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  // ---------- Real data ----------
  const { loggedInUser, allUsers, allUsersLoading } = useUserData({
    fetchAll: true,
  });
  const { campuses } = useCampuses();

  const {
    posts: latest,
    stats,
    isLoading: postsLoading,
    isFetching,
    dataUpdatedAt,
  } = usePostData({ limit: 50 });

  const { posts: pendingPosts, isLoading: pendingLoading } = usePostData({
    moderationStatus: "pending",
    limit: 5,
  });

  // Count queries (limit=1, shudhu totalItems nibo)
  const countDefs = useMemo(
    () => [
      { key: "lost", params: { type: "lost" } },
      { key: "found", params: { type: "found" } },
      { key: "active", params: { postStatus: "active" } },
      { key: "inactive", params: { postStatus: "inactive" } },
      { key: "resolved", params: { postStatus: "resolved" } },
      ...Object.keys(CATEGORY_META).map((c) => ({
        key: `cat-${c}`,
        params: { category: c },
      })),
      ...campuses.map((c) => ({
        key: `campus-${c.campusCode}`,
        params: { campusCode: c.campusCode },
      })),
    ],
    [campuses],
  );

  const countResults = useQueries({
    queries: countDefs.map((d) => ({
      queryKey: ["admin-overview", "count", d.key],
      queryFn: async () => {
        const { data } = await axiosPublic.get("/admin/items", {
          params: { limit: 1, ...d.params },
        });
        return data.totalItems;
      },
      staleTime: 1000 * 30,
      refetchInterval: 1000 * 60,
    })),
  });

  const counts = Object.fromEntries(
    countDefs.map((d, i) => [d.key, countResults[i]?.data ?? 0]),
  );

  // ---------- Moderation action ----------
  const moderate = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await axiosPublic.patch(
        `/admin/items/${id}/moderation`,
        { moderationStatus: status },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["campuses"] });
  };

  // ---------- Derived numbers ----------
  const total = stats.total;
  const pending = stats.pending;
  const approved = stats.approved;
  const rejected = stats.rejected;

  const resolutionRate = total
    ? Math.round((counts.resolved / total) * 100)
    : 0;
  const typeTotal = counts.lost + counts.found;
  const lostPct = typeTotal ? Math.round((counts.lost / typeTotal) * 100) : 0;

  // eslint-disable-next-line react-hooks/purity
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newUsers7d = allUsers.filter(
    (u) => u.createdAt && new Date(u.createdAt).getTime() >= weekAgo,
  ).length;

  const recentUsers = [...allUsers]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const campusRows = campuses
    .map((c) => ({
      ...c,
      posts: counts[`campus-${c.campusCode}`] || 0,
      members: allUsers.filter(
        (u) => u.collegeId?.toLowerCase() === c.campusCode.toLowerCase(),
      ).length,
    }))
    .sort((a, b) => b.posts - a.posts)
    .slice(0, 6);
  const maxCampusPosts = Math.max(1, ...campusRows.map((c) => c.posts));

  const categoryRows = Object.entries(CATEGORY_META)
    .map(([key, meta]) => ({ key, ...meta, value: counts[`cat-${key}`] || 0 }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const maxCategory = Math.max(1, ...categoryRows.map((c) => c.value));

  // ---------- 7 day chart (latest 50 posts theke) ----------
  const days = useMemo(() => {
    const list = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return {
        key: d.toDateString(),
        label: d.toLocaleDateString("en-GB", { weekday: "short" }),
        lost: 0,
        found: 0,
      };
    });
    latest.forEach((p) => {
      const k = new Date(p.createdAt).toDateString();
      const day = list.find((d) => d.key === k);
      if (day && (p.type === "lost" || p.type === "found")) day[p.type] += 1;
    });
    return list;
  }, [latest]);

  const W = 640;
  const H = 230;
  const pad = { l: 30, r: 14, t: 14, b: 30 };
  const maxY = Math.max(4, ...days.flatMap((d) => [d.lost, d.found]));
  const yMax = maxY % 2 === 0 ? maxY : maxY + 1;
  const xAt = (i) => pad.l + (i * (W - pad.l - pad.r)) / 6;
  const yAt = (v) => pad.t + (1 - v / yMax) * (H - pad.t - pad.b);
  const linePts = (key) => days.map((d, i) => ({ x: xAt(i), y: yAt(d[key]) }));
  const areaPath = (key) => {
    const pts = linePts(key);
    return `${smoothPath(pts)} L${pts[6].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;
  };

  // ---------- Donut ----------
  const R = 62;
  const C = 2 * Math.PI * R;
  const segments = [
    { label: "Approved", value: approved, color: "#3ddc97" },
    { label: "Pending", value: pending, color: "#f5a524" },
    { label: "Rejected", value: rejected, color: "#ff6b6b" },
  ];
  let cum = 0;

  const pendingCount = useCountUp(pending);
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <div className="cf-root min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');
        .cf-root { font-family: 'Instrument Sans', system-ui, sans-serif; }
        .cf-display { font-family: 'Bricolage Grotesque', 'Instrument Sans', sans-serif; letter-spacing: -0.02em; }
        @keyframes cf-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes cf-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes cf-pulse { 0% { box-shadow: 0 0 0 0 rgba(61,220,151,.55); } 100% { box-shadow: 0 0 0 10px rgba(61,220,151,0); } }
        @keyframes cf-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(24px,-18px); } }
        @keyframes cf-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        @keyframes cf-spin { to { transform: rotate(360deg); } }
        .cf-rise { opacity: 0; animation: cf-rise .7s cubic-bezier(.2,.8,.2,1) forwards; }
        .cf-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: cf-draw 1.6s .5s ease-out forwards; }
        .cf-live { animation: cf-pulse 1.8s infinite; }
        .cf-drift { animation: cf-drift 14s ease-in-out infinite; }
        .cf-spin { animation: cf-spin .9s linear infinite; }
        .cf-shimmer { background: linear-gradient(90deg,#eef4f2 25%,#f8fbfa 50%,#eef4f2 75%); background-size: 200% 100%; animation: cf-shimmer 1.4s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cf-rise, .cf-draw, .cf-live, .cf-drift, .cf-shimmer, .cf-spin { animation: none !important; opacity: 1; stroke-dashoffset: 0; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {/* ================= Top bar ================= */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="cf-display text-3xl font-bold text-[#10312c] md:text-[40px] md:leading-[1.1]">
              {greeting()}, {loggedInUser?.name?.split(" ")[0] || "Admin"}
            </h1>
            <p className="mt-2 text-[15px] text-[#6d837d]">
              Here is how CampusFind is doing across all campuses today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#dbe7e3] bg-white px-4 py-2 text-[13px] text-[#6d837d]">
              <span className="cf-live h-2 w-2 rounded-full bg-[#2fc785]" />
              Live, updated {lastUpdated}
            </div>
            <button
              onClick={refreshAll}
              aria-label="Refresh data"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7e3] bg-white text-[#0d9467] transition hover:bg-[#e8f6ef]"
            >
              <FaSyncAlt className={isFetching ? "cf-spin" : ""} size={14} />
            </button>
          </div>
        </header>

        {/* ================= Hero: review queue ================= */}
        <section
          className="cf-rise relative mb-6 overflow-hidden rounded-[28px] bg-[#0b2a26] p-6 text-white md:p-9"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="cf-drift pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-[#1c8f6b]/30 blur-3xl" />
          <div
            className="cf-drift pointer-events-none absolute -bottom-40 left-1/4 h-[320px] w-[320px] rounded-full bg-[#f5a524]/10 blur-3xl"
            style={{ animationDelay: "-6s" }}
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.15fr]">
            {/* Left: number + donut */}
            <div>
              <p className="text-sm text-[#9fc9bd]">Waiting for your review</p>

              <div className="mt-2 flex items-end gap-3">
                <span className="cf-display text-[84px] font-extrabold leading-none text-white md:text-[104px]">
                  {pendingCount}
                </span>
                <span className="mb-3 text-lg text-[#9fc9bd]">
                  {pending === 1 ? "post" : "posts"}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-8">
                <div className="relative h-[150px] w-[150px] shrink-0">
                  <svg
                    viewBox="0 0 160 160"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r={R}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="16"
                    />
                    {segments.map((s) => {
                      const len = total ? (s.value / total) * C : 0;
                      const offset = -cum;
                      cum += len;
                      return (
                        <circle
                          key={s.label}
                          cx="80"
                          cy="80"
                          r={R}
                          fill="none"
                          stroke={s.color}
                          strokeWidth="16"
                          strokeDasharray={`${mounted ? Math.max(len - 3, 0) : 0} ${C}`}
                          strokeDashoffset={offset}
                          style={{
                            transition:
                              "stroke-dasharray 1.4s cubic-bezier(.2,.8,.2,1) .3s",
                          }}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="cf-display text-3xl font-bold">
                      {total}
                    </span>
                    <span className="text-xs text-[#9fc9bd]">total posts</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {segments.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="w-20 text-[#c4e0d8]">{s.label}</span>
                      <span className="cf-display text-lg font-semibold">
                        {s.value}
                      </span>
                      <span className="text-xs text-[#7fa89c]">
                        {total ? Math.round((s.value / total) * 100) : 0}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: queue */}
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm md:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="cf-display text-lg font-semibold">
                  Review queue
                </h2>
                <Link
                  to={"/admin-dashboard/all-posts"}
                  className="flex items-center gap-2 text-[13px] font-medium text-[#3ddc97] transition hover:gap-3"
                >
                  Open all posts <FaArrowRight size={11} />
                </Link>
              </div>

              {pendingLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-17 animate-pulse rounded-xl bg-white/10"
                    />
                  ))}
                </div>
              ) : pendingPosts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-[#9fc9bd]">
                  Queue is empty. Every post has been reviewed.
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {pendingPosts.map((p) => {
                    const busy =
                      moderate.isPending && moderate.variables?.id === p._id;
                    return (
                      <li
                        key={p._id}
                        className={`flex items-center gap-3 rounded-xl bg-white/[0.07] p-3 transition ${busy ? "opacity-50" : "hover:bg-white/[0.11]"}`}
                      >
                        <Thumb post={p} size={46} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {p.itemName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#9fc9bd]">
                            {p.type === "lost" ? "Lost" : "Found"} at{" "}
                            {p.location?.area} · {p.campusCode?.toUpperCase()} ·{" "}
                            {timeAgo(p.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            disabled={busy}
                            onClick={() =>
                              moderate.mutate({ id: p._id, status: "rejected" })
                            }
                            aria-label={`Reject ${p.itemName}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/15 text-rose-300 transition hover:bg-rose-500 hover:text-white"
                          >
                            <FaTimes size={13} />
                          </button>
                          <button
                            disabled={busy}
                            onClick={() =>
                              moderate.mutate({ id: p._id, status: "approved" })
                            }
                            aria-label={`Approve ${p.itemName}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 transition hover:bg-emerald-400 hover:text-[#0b2a26]"
                          >
                            <FaCheck size={13} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {moderate.isError && (
                <p className="mt-3 text-xs text-rose-300">
                  Could not update the post. Check your connection and try
                  again.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ================= Key numbers strip ================= */}
        <section
          className="cf-rise mb-6 flex flex-col divide-y divide-[#e3ebe8] overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white sm:flex-row sm:divide-x sm:divide-y-0"
          style={{ animationDelay: "0.2s" }}
        >
          <Stat
            icon={FaBoxOpen}
            label="Total posts"
            value={total}
            note={`${counts.active} active right now`}
          />
          <Stat
            icon={FaUsers}
            label="Members"
            value={allUsers.length}
            note={`${newUsers7d} joined in the last 7 days`}
          />
          <Stat
            icon={FaBuilding}
            label="Campuses"
            value={campuses.length}
            note="Registered on CampusFind"
          />
          <Stat
            icon={FaClock}
            label="Resolved"
            value={resolutionRate}
            suffix="%"
            note={`${counts.resolved} of ${total} posts closed`}
          />
        </section>

        {/* ================= Chart + split ================= */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Posting activity"
            hint="Lost and found posts per day, from the latest 50 posts"
            action={
              <div className="flex items-center gap-4 text-xs text-[#6d837d]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#f0566a]" /> Lost
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#1f9d72]" /> Found
                </span>
              </div>
            }
          >
            {postsLoading ? (
              <div className="cf-shimmer h-[230px] rounded-xl" />
            ) : (
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                <defs>
                  <linearGradient id="gLost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f0566a" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#f0566a" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gFound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1f9d72" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1f9d72" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3, 4].map((i) => {
                  const v = (yMax / 4) * i;
                  return (
                    <g key={i}>
                      <line
                        x1={pad.l}
                        x2={W - pad.r}
                        y1={yAt(v)}
                        y2={yAt(v)}
                        stroke="#e7eeec"
                        strokeDasharray="3 5"
                      />
                      <text
                        x={pad.l - 8}
                        y={yAt(v) + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="#93a7a2"
                      >
                        {Number.isInteger(v) ? v : v.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                <path
                  d={areaPath("lost")}
                  fill="url(#gLost)"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transition: "opacity 1s .9s",
                  }}
                />
                <path
                  d={areaPath("found")}
                  fill="url(#gFound)"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transition: "opacity 1s 1s",
                  }}
                />

                <path
                  d={smoothPath(linePts("lost"))}
                  pathLength="1"
                  className="cf-draw"
                  fill="none"
                  stroke="#f0566a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d={smoothPath(linePts("found"))}
                  pathLength="1"
                  className="cf-draw"
                  fill="none"
                  stroke="#1f9d72"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ animationDelay: "0.7s" }}
                />

                {days.map((d, i) => (
                  <g key={d.key}>
                    <circle
                      cx={xAt(i)}
                      cy={yAt(d.lost)}
                      r="4"
                      fill="#fff"
                      stroke="#f0566a"
                      strokeWidth="2"
                    >
                      <title>{`${d.label}: ${d.lost} lost`}</title>
                    </circle>
                    <circle
                      cx={xAt(i)}
                      cy={yAt(d.found)}
                      r="4"
                      fill="#fff"
                      stroke="#1f9d72"
                      strokeWidth="2"
                    >
                      <title>{`${d.label}: ${d.found} found`}</title>
                    </circle>
                    <text
                      x={xAt(i)}
                      y={H - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#93a7a2"
                    >
                      {d.label}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </Panel>

          <Panel
            title="Lost vs found"
            hint="How posts split by type and status"
          >
            <div className="mb-2 flex justify-between text-sm font-semibold text-[#10312c]">
              <span>
                Lost <span className="cf-display ml-1">{counts.lost}</span>
              </span>
              <span>
                <span className="cf-display mr-1">{counts.found}</span> Found
              </span>
            </div>
            <div className="flex h-3.5 overflow-hidden rounded-full bg-[#e8efed]">
              <div
                className="h-full bg-[#f0566a]"
                style={{
                  width: mounted ? `${lostPct}%` : "0%",
                  transition: "width 1.2s cubic-bezier(.2,.8,.2,1) .4s",
                }}
              />
              <div className="h-full flex-1 bg-[#1f9d72]" />
            </div>
            <p className="mt-2 text-xs text-[#8ea19c]">
              {typeTotal
                ? `${lostPct}% of posts report a lost item`
                : "No posts yet"}
            </p>

            <div className="mt-7 space-y-4">
              {[
                { key: "active", label: "Active", color: "#3b82f6" },
                { key: "resolved", label: "Resolved", color: "#8b5cf6" },
                { key: "inactive", label: "Inactive", color: "#94a3b8" },
              ].map((s) => {
                const pct = total ? (counts[s.key] / total) * 100 : 0;
                return (
                  <div key={s.key}>
                    <div className="mb-1.5 flex justify-between text-[13px]">
                      <span className="font-medium text-[#3c5a53]">
                        {s.label}
                      </span>
                      <span className="text-[#6d837d]">
                        {counts[s.key]} · {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#eaf0ee]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: s.color,
                          width: mounted ? `${pct}%` : "0%",
                          transition: "width 1.2s cubic-bezier(.2,.8,.2,1) .5s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* ================= Campuses + categories ================= */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Panel
            title="Busiest campuses"
            hint="Posts and members per campus"
            action={
              <Link
                to={ROUTES.campuses}
                className="flex items-center gap-2 text-[13px] font-medium text-[#0d9467] transition hover:gap-3"
              >
                Manage campuses <FaArrowRight size={11} />
              </Link>
            }
          >
            {campusRows.length === 0 ? (
              <Empty>
                No campuses yet. Add your first campus to see activity here.
              </Empty>
            ) : (
              <ul className="space-y-5">
                {campusRows.map((c) => (
                  <li key={c._id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#10312c]">
                          {c.campusName}
                        </p>
                        <p className="text-xs text-[#8ea19c]">
                          {c.campusCode} · {c.members} members
                        </p>
                      </div>
                      <span className="cf-display text-xl font-bold text-[#10312c]">
                        {c.posts}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#eaf0ee]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0d9467] to-[#3ddc97]"
                        style={{
                          width: mounted
                            ? `${(c.posts / maxCampusPosts) * 100}%`
                            : "0%",
                          transition: "width 1.2s cubic-bezier(.2,.8,.2,1) .5s",
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="What people lose most"
            hint="Top categories across all campuses"
          >
            {categoryRows.length === 0 ? (
              <Empty>Category data will appear once posts come in.</Empty>
            ) : (
              <ul className="space-y-4">
                {categoryRows.map((c) => (
                  <li key={c.key} className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4f2] text-lg">
                      {c.emoji}
                    </span>
                    <div className="flex-1">
                      <div className="mb-1.5 flex justify-between text-[13px]">
                        <span className="font-medium text-[#3c5a53]">
                          {c.label}
                        </span>
                        <span className="font-semibold text-[#10312c]">
                          {c.value}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#eaf0ee]">
                        <div
                          className="h-full rounded-full bg-[#10312c]"
                          style={{
                            width: mounted
                              ? `${(c.value / maxCategory) * 100}%`
                              : "0%",
                            transition:
                              "width 1.2s cubic-bezier(.2,.8,.2,1) .6s",
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* ================= Recent posts + new members ================= */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Latest posts"
            hint="Newest reports from every campus"
            action={
              <Link
                to={ROUTES.posts}
                className="flex items-center gap-2 text-[13px] font-medium text-[#0d9467] transition hover:gap-3"
              >
                View all <FaArrowRight size={11} />
              </Link>
            }
          >
            {postsLoading ? (
              <Skeleton rows={5} />
            ) : latest.length === 0 ? (
              <Empty>
                No posts yet. New lost and found reports will show up here.
              </Empty>
            ) : (
              <ul className="-mx-2 divide-y divide-[#edf2f0]">
                {latest.slice(0, 6).map((p) => (
                  <li
                    key={p._id}
                    className="flex flex-col gap-3 rounded-xl px-2 py-3.5 transition hover:bg-[#f6faf8] sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <Thumb post={p} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#10312c]">
                          {p.itemName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#8ea19c]">
                          {p.location?.area} · {p.campusCode?.toUpperCase()} ·{" "}
                          {timeAgo(p.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Badge
                        className={
                          p.type === "lost"
                            ? "bg-rose-50 text-rose-700 ring-rose-600/15"
                            : "bg-teal-50 text-teal-700 ring-teal-600/15"
                        }
                      >
                        {p.type}
                      </Badge>
                      <Badge className={MODERATION_STYLE[p.moderationStatus]}>
                        {p.moderationStatus}
                      </Badge>
                      <Badge className={POST_STATUS_STYLE[p.postStatus]}>
                        {p.postStatus}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="New members"
            hint="Most recent sign-ups"
            action={
              <Link
                to={ROUTES.users}
                className="flex items-center gap-2 text-[13px] font-medium text-[#0d9467] transition hover:gap-3"
              >
                All users <FaArrowRight size={11} />
              </Link>
            }
          >
            {allUsersLoading ? (
              <Skeleton rows={5} />
            ) : recentUsers.length === 0 ? (
              <Empty>No members have signed up yet.</Empty>
            ) : (
              <ul className="space-y-4">
                {recentUsers.map((u) => (
                  <li
                    key={u._id || u.userId}
                    className="flex items-center gap-3"
                  >
                    <Avatar user={u} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#10312c]">
                        {u.name}
                      </p>
                      <p className="truncate text-xs text-[#8ea19c]">
                        {u.email}
                      </p>
                    </div>
                    <div className="text-right">
                      {u.collegeId ? (
                        <span className="rounded-md bg-[#eef4f2] px-2 py-1 text-[11px] font-semibold uppercase text-[#3c5a53]">
                          {u.collegeId}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#a4b4b0]">
                          No campus
                        </span>
                      )}
                      <p className="mt-1 text-[11px] text-[#a4b4b0]">
                        {timeAgo(u.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <p className="mt-8 text-center text-xs text-[#9ab0aa]">
          CampusFind admin, updates every 30 seconds
        </p>
      </div>
    </div>
  );
};

export default AdminOverview;
