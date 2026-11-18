import { useEffect, useMemo, useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router";
import {
  FaArrowRight,
  FaBoxOpen,
  FaCheck,
  FaClock,
  FaHourglassHalf,
  FaPlus,
  FaRedo,
  FaSyncAlt,
  FaSearch,
} from "react-icons/fa";

import useAxiosPublic from "../../hooks/useAxiosPublic";
import useUserData from "../../hooks/useUserData";
import useCampuses from "../../hooks/useCampuses";

// ⚠️ Nijer route gula onujayi ei path gulo thik kore nao
const ROUTES = {
  create: "/user-dashboard/create-new-post",
  myPosts: "/user-dashboard/my-posts",
  browse: "/user-dashboard/browse",
  profile: "/user-dashboard/profile",
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

const Stat = ({ icon: Icon, label, value, note }) => {
  const n = useCountUp(value);
  return (
    <div className="flex-1 px-6 py-5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#6d837d]">
        <Icon className="text-[#0d9467]" />
        {label}
      </div>
      <p className="cf-display mt-2 text-[34px] font-bold leading-none text-[#10312c]">
        {n}
      </p>
      <p className="mt-2 text-xs text-[#8ea19c]">{note}</p>
    </div>
  );
};

// Progress ring
const Ring = ({ pct, color, mounted, size = 96, children }) => {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e8efed"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${mounted ? (pct / 100) * c : 0} ${c}`}
          style={{
            transition: "stroke-dasharray 1.4s cubic-bezier(.2,.8,.2,1) .5s",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// =====================================
//              MAIN PAGE
// =====================================

const UserOverview = () => {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  // ---------- Real data ----------
  const { loggedInUser, loggedInUserLoading } = useUserData();
  const { campuses } = useCampuses();

  const userId = loggedInUser?.userId;
  const hasCampus = !!loggedInUser?.collegeId;
  const ready = !!userId && hasCampus;

  const campus = campuses.find(
    (c) =>
      c.campusCode.toLowerCase() === loggedInUser?.collegeId?.toLowerCase(),
  );

  // My posts (latest 50)
  const mineQuery = useQuery({
    queryKey: ["user-overview", "mine", userId],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/items/my-posts", {
        params: { userId, limit: 50 },
      });
      return data;
    },
    enabled: ready,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  // Campus feed (latest 5 approved + active posts)
  const feedQuery = useQuery({
    queryKey: ["user-overview", "feed", userId],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/items", {
        params: { userId, limit: 5 },
      });
      return data;
    },
    enabled: ready,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  // Totals: my lost / my found / campus lost / campus found
  const countDefs = [
    { key: "myLost", url: "/items/my-posts", type: "lost" },
    { key: "myFound", url: "/items/my-posts", type: "found" },
    { key: "campusLost", url: "/items", type: "lost" },
    { key: "campusFound", url: "/items", type: "found" },
  ];

  const countResults = useQueries({
    queries: countDefs.map((d) => ({
      queryKey: ["user-overview", "count", userId, d.key],
      queryFn: async () => {
        const { data } = await axiosPublic.get(d.url, {
          params: { userId, type: d.type, limit: 1 },
        });
        return data.totalItems;
      },
      enabled: ready,
      staleTime: 1000 * 30,
    })),
  });

  const counts = Object.fromEntries(
    countDefs.map((d, i) => [d.key, countResults[i]?.data ?? 0]),
  );

  // ---------- Quick action: change post status ----------
  const changeStatus = useMutation({
    mutationFn: async ({ id, postStatus }) => {
      const { data } = await axiosPublic.patch(`/items/${id}/status`, {
        userId,
        postStatus,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-overview"] });
    },
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["user-overview"] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  // ---------- Derived numbers ----------
  const mine = mineQuery.data?.items || [];
  const totalMine = mineQuery.data?.totalItems || 0;
  const sampleOnly = totalMine > mine.length;

  const active = mine.filter((p) => p.postStatus === "active");
  const resolved = mine.filter((p) => p.postStatus === "resolved");
  const awaiting = mine.filter((p) => p.moderationStatus === "pending");
  const rejected = mine.filter((p) => p.moderationStatus === "rejected");

  const resolutionRate = mine.length
    ? Math.round((resolved.length / mine.length) * 100)
    : 0;

  const rate = (type) => {
    const list = mine.filter((p) => p.type === type);
    const done = list.filter((p) => p.postStatus === "resolved").length;
    return {
      total: list.length,
      done,
      pct: list.length ? Math.round((done / list.length) * 100) : 0,
    };
  };
  const lostRate = rate("lost");
  const foundRate = rate("found");

  const categoryChips = Object.entries(
    mine.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // 6 weeks chart
  const weeks = useMemo(() => {
    const DAY = 24 * 60 * 60 * 1000;
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const list = Array.from({ length: 6 }).map((_, i) => {
      const from = now - (6 - i) * 7 * DAY;
      return {
        from,
        to: from + 7 * DAY,
        label: new Date(from).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
        lost: 0,
        found: 0,
      };
    });
    mine.forEach((p) => {
      const t = new Date(p.createdAt).getTime();
      const w = list.find((x) => t >= x.from && t < x.to);
      if (w && (p.type === "lost" || p.type === "found")) w[p.type] += 1;
    });
    return list;
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [mine]);

  const W = 560;
  const H = 220;
  const pad = { l: 28, r: 10, t: 14, b: 30 };
  const maxW = Math.max(4, ...weeks.map((w) => w.lost + w.found));
  const yMax = maxW % 2 === 0 ? maxW : maxW + 1;
  const innerH = H - pad.t - pad.b;
  const slot = (W - pad.l - pad.r) / 6;
  const barW = Math.min(34, slot * 0.5);
  const hOf = (v) => (v / yMax) * innerH;

  const resolvedCount = useCountUp(resolved.length);
  const lastUpdated = mineQuery.dataUpdatedAt
    ? new Date(mineQuery.dataUpdatedAt).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const memberSince = loggedInUser?.createdAt
    ? new Date(loggedInUser.createdAt).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : null;

  const feed = feedQuery.data?.items || [];
  const campusOpen = counts.campusLost + counts.campusFound;

  return (
    <div className="cf-root min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');
        .cf-root { font-family: 'Instrument Sans', system-ui, sans-serif; }
        .cf-display { font-family: 'Bricolage Grotesque', 'Instrument Sans', sans-serif; letter-spacing: -0.02em; }
        @keyframes cf-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes cf-pulse { 0% { box-shadow: 0 0 0 0 rgba(61,220,151,.55); } 100% { box-shadow: 0 0 0 10px rgba(61,220,151,0); } }
        @keyframes cf-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(24px,-18px); } }
        @keyframes cf-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        @keyframes cf-spin { to { transform: rotate(360deg); } }
        .cf-rise { opacity: 0; animation: cf-rise .7s cubic-bezier(.2,.8,.2,1) forwards; }
        .cf-live { animation: cf-pulse 1.8s infinite; }
        .cf-drift { animation: cf-drift 14s ease-in-out infinite; }
        .cf-spin { animation: cf-spin .9s linear infinite; }
        .cf-shimmer { background: linear-gradient(90deg,#eef4f2 25%,#f8fbfa 50%,#eef4f2 75%); background-size: 200% 100%; animation: cf-shimmer 1.4s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cf-rise, .cf-live, .cf-drift, .cf-shimmer, .cf-spin { animation: none !important; opacity: 1; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {/* ================= Top bar ================= */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="cf-display text-3xl font-bold text-[#10312c] md:text-[40px] md:leading-[1.1]">
              {greeting()}, {loggedInUser?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="mt-2 text-[15px] text-[#6d837d]">
              {campus
                ? `Your activity at ${campus.campusName}.`
                : "Your lost and found activity at a glance."}
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
              <FaSyncAlt
                className={mineQuery.isFetching ? "cf-spin" : ""}
                size={14}
              />
            </button>
          </div>
        </header>

        {/* ================= No campus selected ================= */}
        {!loggedInUserLoading && loggedInUser && !hasCampus && (
          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-[22px] border border-amber-200 bg-amber-50 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="cf-display text-lg font-semibold text-amber-900">
                Choose your campus to get started
              </h2>
              <p className="mt-1 text-sm text-amber-800/80">
                Posts and the campus feed are shown per campus, so we need to
                know where you study.
              </p>
            </div>
            <Link
              to={ROUTES.profile}
              className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Select campus <FaArrowRight size={11} />
            </Link>
          </div>
        )}

        {/* ================= Hero ================= */}
        <section
          className="cf-rise relative mb-6 overflow-hidden rounded-[28px] bg-[#0b2a26] p-6 text-white md:p-9"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="cf-drift pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-[#1c8f6b]/30 blur-3xl" />
          <div
            className="cf-drift pointer-events-none absolute -bottom-40 left-1/4 h-[320px] w-[320px] rounded-full bg-[#7c5cff]/15 blur-3xl"
            style={{ animationDelay: "-6s" }}
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.15fr]">
            {/* Left */}
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#9fc9bd]">
                {campus && (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
                    {campus.campusName}
                  </span>
                )}
                {memberSince && (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
                    Member since {memberSince}
                  </span>
                )}
              </div>

              <p className="mt-6 text-sm text-[#9fc9bd]">
                Items you helped resolve
              </p>

              <div className="mt-2 flex items-end gap-3">
                <span className="cf-display text-[84px] font-extrabold leading-none md:text-[104px]">
                  {resolvedCount}
                </span>
                <span className="mb-3 text-lg text-[#9fc9bd]">
                  of {totalMine} {totalMine === 1 ? "post" : "posts"}
                </span>
              </div>

              <div className="mt-6 h-2.5 max-w-sm overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3ddc97] to-[#8be9c0]"
                  style={{
                    width: mounted ? `${resolutionRate}%` : "0%",
                    transition: "width 1.4s cubic-bezier(.2,.8,.2,1) .4s",
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-[#9fc9bd]">
                {mine.length
                  ? `${resolutionRate}% of your posts are resolved`
                  : "Your resolution progress shows up after your first post"}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={ROUTES.create}
                  className="flex items-center gap-2 rounded-full bg-[#3ddc97] px-6 py-3 text-sm font-semibold text-[#0b2a26] transition hover:-translate-y-0.5 hover:bg-[#6ee8b4]"
                >
                  <FaPlus size={12} /> Create a post
                </Link>
                <Link
                  to={ROUTES.myPosts}
                  className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/10"
                >
                  My posts
                </Link>
              </div>
            </div>

            {/* Right: active posts */}
            <div className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur-sm md:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="cf-display text-lg font-semibold">Still open</h2>
                <span className="text-[13px] text-[#9fc9bd]">
                  {active.length} active{" "}
                  {active.length === 1 ? "post" : "posts"}
                </span>
              </div>

              {mineQuery.isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-[68px] animate-pulse rounded-xl bg-white/10"
                    />
                  ))}
                </div>
              ) : active.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-[#9fc9bd]">
                  Nothing open right now. Lost or found something? Create a post
                  and your campus can help.
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {active.slice(0, 4).map((p) => {
                    const busy =
                      changeStatus.isPending &&
                      changeStatus.variables?.id === p._id;
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
                            {p.location?.area} · {timeAgo(p.createdAt)}
                          </p>
                        </div>
                        <button
                          disabled={busy}
                          onClick={() =>
                            changeStatus.mutate({
                              id: p._id,
                              postStatus: "resolved",
                            })
                          }
                          className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/15 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400 hover:text-[#0b2a26]"
                        >
                          <FaCheck size={11} /> Mark resolved
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {changeStatus.isError && (
                <p className="mt-3 text-xs text-rose-300">
                  Could not update the post. Check your connection and try
                  again.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ================= Review notices ================= */}
        {(awaiting.length > 0 || rejected.length > 0) && (
          <div className="mb-6 grid gap-3 md:grid-cols-2">
            {awaiting.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <FaHourglassHalf className="mt-0.5 text-amber-600" />
                <p className="text-sm text-amber-900">
                  <strong>{awaiting.length}</strong> of your{" "}
                  {awaiting.length === 1 ? "post is" : "posts are"} waiting for
                  admin approval. They appear on the campus feed once approved.
                </p>
              </div>
            )}
            {rejected.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
                <FaBoxOpen className="mt-0.5 text-rose-600" />
                <p className="text-sm text-rose-900">
                  <strong>{rejected.length}</strong>{" "}
                  {rejected.length === 1 ? "post was" : "posts were"} not
                  approved. Edit the details and post again if you still need
                  help.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= Key numbers ================= */}
        <section
          className="cf-rise mb-6 flex flex-col divide-y divide-[#e3ebe8] overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white sm:flex-row sm:divide-x sm:divide-y-0"
          style={{ animationDelay: "0.2s" }}
        >
          <Stat
            icon={FaBoxOpen}
            label="Your posts"
            value={totalMine}
            note={`${counts.myLost} lost, ${counts.myFound} found`}
          />
          <Stat
            icon={FaClock}
            label="Active"
            value={active.length}
            note="Waiting to be resolved"
          />
          <Stat
            icon={FaCheck}
            label="Resolved"
            value={resolved.length}
            note={`${resolutionRate}% resolution rate`}
          />
          <Stat
            icon={FaHourglassHalf}
            label="Awaiting approval"
            value={awaiting.length}
            note="Reviewed by campus admins"
          />
        </section>

        {sampleOnly && (
          <p className="-mt-3 mb-6 px-1 text-xs text-[#8ea19c]">
            Status numbers and charts are based on your latest {mine.length}{" "}
            posts.
          </p>
        )}

        {/* ================= Chart + performance ================= */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Your posting rhythm"
            hint="Posts per week over the last six weeks"
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
            {mineQuery.isLoading ? (
              <div className="cf-shimmer h-[220px] rounded-xl" />
            ) : (
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                {[0, 1, 2, 3, 4].map((i) => {
                  const v = (yMax / 4) * i;
                  const y = pad.t + innerH - (v / yMax) * innerH;
                  return (
                    <g key={i}>
                      <line
                        x1={pad.l}
                        x2={W - pad.r}
                        y1={y}
                        y2={y}
                        stroke="#e7eeec"
                        strokeDasharray="3 5"
                      />
                      <text
                        x={pad.l - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="#93a7a2"
                      >
                        {Number.isInteger(v) ? v : v.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {weeks.map((w, i) => {
                  const cx = pad.l + slot * i + slot / 2;
                  const foundH = hOf(w.found);
                  const lostH = hOf(w.lost);
                  const base = pad.t + innerH;
                  const anim = (delay) => ({
                    transformBox: "fill-box",
                    transformOrigin: "bottom",
                    transform: mounted ? "scaleY(1)" : "scaleY(0)",
                    transition: `transform 1s cubic-bezier(.2,.8,.2,1) ${delay}s`,
                  });
                  return (
                    <g key={w.from}>
                      {w.found > 0 && (
                        <rect
                          x={cx - barW / 2}
                          y={base - foundH}
                          width={barW}
                          height={foundH}
                          rx="6"
                          fill="#1f9d72"
                          style={anim(0.3 + i * 0.08)}
                        >
                          <title>{`${w.label}: ${w.found} found`}</title>
                        </rect>
                      )}
                      {w.lost > 0 && (
                        <rect
                          x={cx - barW / 2}
                          y={base - foundH - lostH - (w.found > 0 ? 2 : 0)}
                          width={barW}
                          height={lostH}
                          rx="6"
                          fill="#f0566a"
                          style={anim(0.4 + i * 0.08)}
                        >
                          <title>{`${w.label}: ${w.lost} lost`}</title>
                        </rect>
                      )}
                      <text
                        x={cx}
                        y={H - 8}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#93a7a2"
                      >
                        {w.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </Panel>

          <Panel
            title="How your posts end"
            hint="Share of each type that got resolved"
          >
            <div className="space-y-6">
              {[
                { label: "Lost items", data: lostRate, color: "#f0566a" },
                { label: "Found items", data: foundRate, color: "#1f9d72" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-4">
                  <Ring
                    pct={r.data.pct}
                    color={r.color}
                    mounted={mounted}
                    size={88}
                  >
                    <span className="cf-display text-lg font-bold text-[#10312c]">
                      {r.data.pct}%
                    </span>
                  </Ring>
                  <div>
                    <p className="text-sm font-semibold text-[#10312c]">
                      {r.label}
                    </p>
                    <p className="mt-1 text-xs text-[#8ea19c]">
                      {r.data.done} of {r.data.total} resolved
                    </p>
                    <p className="text-xs text-[#8ea19c]">
                      {r.data.total - r.data.done} still open
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {categoryChips.length > 0 && (
              <div className="mt-7 border-t border-[#edf2f0] pt-5">
                <p className="mb-3 text-[13px] font-medium text-[#6d837d]">
                  What you post about
                </p>
                <div className="flex flex-wrap gap-2">
                  {categoryChips.map(([key, n]) => (
                    <span
                      key={key}
                      className="flex items-center gap-1.5 rounded-full bg-[#eef4f2] px-3 py-1.5 text-xs font-medium text-[#3c5a53]"
                    >
                      {CATEGORY_META[key]?.emoji}{" "}
                      {CATEGORY_META[key]?.label || key}
                      <span className="font-bold text-[#10312c]">{n}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* ================= My posts + campus pulse ================= */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Your recent posts"
            hint="Newest first, with their current status"
            action={
              <Link
                to={ROUTES.myPosts}
                className="flex items-center gap-2 text-[13px] font-medium text-[#0d9467] transition hover:gap-3"
              >
                View all <FaArrowRight size={11} />
              </Link>
            }
          >
            {mineQuery.isLoading ? (
              <Skeleton rows={5} />
            ) : mine.length === 0 ? (
              <Empty>
                You have not posted yet. Your lost and found posts will appear
                here.
              </Empty>
            ) : (
              <ul className="-mx-2 divide-y divide-[#edf2f0]">
                {mine.slice(0, 6).map((p) => {
                  const busy =
                    changeStatus.isPending &&
                    changeStatus.variables?.id === p._id;
                  const isResolved = p.postStatus === "resolved";
                  return (
                    <li
                      key={p._id}
                      className={`flex flex-col gap-3 rounded-xl px-2 py-3.5 transition hover:bg-[#f6faf8] sm:flex-row sm:items-center ${busy ? "opacity-50" : ""}`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3.5">
                        <Thumb post={p} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#10312c]">
                            {p.itemName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#8ea19c]">
                            {p.location?.area} · {timeAgo(p.createdAt)}
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
                        <button
                          disabled={busy}
                          onClick={() =>
                            changeStatus.mutate({
                              id: p._id,
                              postStatus: isResolved ? "active" : "resolved",
                            })
                          }
                          aria-label={
                            isResolved ? "Reopen post" : "Mark post resolved"
                          }
                          title={isResolved ? "Reopen" : "Mark resolved"}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4f2] text-[#0d9467] transition hover:bg-[#0d9467] hover:text-white"
                        >
                          {isResolved ? (
                            <FaRedo size={11} />
                          ) : (
                            <FaCheck size={11} />
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Around your campus"
            hint="Open items others have posted"
            action={
              <Link
                to={ROUTES.browse}
                className="flex items-center gap-2 text-[13px] font-medium text-[#0d9467] transition hover:gap-3"
              >
                Browse <FaArrowRight size={11} />
              </Link>
            }
          >
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-rose-50 px-4 py-3">
                <p className="cf-display text-2xl font-bold text-rose-600">
                  {counts.campusLost}
                </p>
                <p className="text-xs text-rose-700/70">Lost items</p>
              </div>
              <div className="rounded-2xl bg-teal-50 px-4 py-3">
                <p className="cf-display text-2xl font-bold text-teal-600">
                  {counts.campusFound}
                </p>
                <p className="text-xs text-teal-700/70">Found items</p>
              </div>
            </div>

            {feedQuery.isLoading ? (
              <Skeleton rows={4} />
            ) : feed.length === 0 ? (
              <Empty>
                {campusOpen === 0
                  ? "No open posts on your campus yet."
                  : "Nothing new to show right now."}
              </Empty>
            ) : (
              <ul className="space-y-3.5">
                {feed.map((p) => (
                  <li key={p._id} className="flex items-center gap-3">
                    <Thumb post={p} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#10312c]">
                        {p.itemName}
                      </p>
                      <p className="truncate text-xs text-[#8ea19c]">
                        {p.location?.area} · {timeAgo(p.createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={
                        p.type === "lost"
                          ? "bg-rose-50 text-rose-700 ring-rose-600/15"
                          : "bg-teal-50 text-teal-700 ring-teal-600/15"
                      }
                    >
                      {p.type}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}

            <Link
              to={ROUTES.browse}
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#eef4f2] py-3 text-sm font-semibold text-[#0d7a55] transition hover:bg-[#e0efe9]"
            >
              <FaSearch size={12} /> Search for your item
            </Link>
          </Panel>
        </div>

        <p className="mt-8 text-center text-xs text-[#9ab0aa]">
          CampusFind, your campus, connected
        </p>
      </div>
    </div>
  );
};

export default UserOverview;
