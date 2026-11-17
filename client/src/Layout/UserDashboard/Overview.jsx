import {
  FaBoxOpen,
  FaSearch,
  FaHandHoldingHeart,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaPlus,
  FaChartLine,
  FaBullseye,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRegClock,
  FaUsers,
  FaAward,
} from "react-icons/fa";

import { Link } from "react-router";

const Overview = () => {
  // Dummy Statistics
  const stats = {
    totalLost: 12,
    totalFound: 8,
    activePosts: 7,
    resolvedPosts: 13,
    totalPosts: 20,
    contribution: 18,
    lostResolved: 8,
    foundResolved: 5,
  };

  // Dummy Recent Posts
  const recentPosts = [
    {
      id: 1,
      title: "Black Leather Wallet",
      category: "Lost",
      status: "Resolved",
      location: "RUET Main Campus",
      date: "Nov 17, 2026",
      icon: "👛",
    },
    {
      id: 2,
      title: "Scientific Calculator",
      category: "Found",
      status: "Active",
      location: "ECE Building",
      date: "Nov 16, 2026",
      icon: "🧮",
    },
    {
      id: 3,
      title: "Samsung Galaxy Earbuds",
      category: "Lost",
      status: "Active",
      location: "Central Library",
      date: "Nov 15, 2026",
      icon: "🎧",
    },
    {
      id: 4,
      title: "Student ID Card",
      category: "Found",
      status: "Resolved",
      location: "Cafeteria",
      date: "Nov 13, 2026",
      icon: "🪪",
    },
    {
      id: 5,
      title: "Blue Water Bottle",
      category: "Lost",
      status: "Active",
      location: "Academic Building",
      date: "Nov 12, 2026",
      icon: "🧴",
    },
  ];

  // Dummy Recent Activities
  const activities = [
    {
      id: 1,
      title: "Your lost wallet was resolved",
      description: "Your item has been successfully returned.",
      time: "2 hours ago",
      icon: FaCheckCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      id: 2,
      title: "New found post published",
      description: "Scientific Calculator was reported found.",
      time: "1 day ago",
      icon: FaBoxOpen,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: 3,
      title: "Your contribution increased",
      description: "You helped the campus community.",
      time: "3 days ago",
      icon: FaHandHoldingHeart,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  const resolutionRate = Math.round(
    (stats.resolvedPosts / stats.totalPosts) * 100,
  );

  const lostResolutionRate = Math.round(
    (stats.lostResolved / stats.totalLost) * 100,
  );

  const foundResolutionRate = Math.round(
    (stats.foundResolved / stats.totalFound) * 100,
  );

  const statCards = [
    {
      title: "Total Lost Posts",
      value: stats.totalLost,
      description: "Items reported lost",
      icon: FaSearch,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      accent: "border-rose-100",
    },
    {
      title: "Total Found Posts",
      value: stats.totalFound,
      description: "Items reported found",
      icon: FaBoxOpen,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accent: "border-blue-100",
    },
    {
      title: "Active Posts",
      value: stats.activePosts,
      description: "Currently waiting for action",
      icon: FaClock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accent: "border-amber-100",
    },
    {
      title: "Resolved Posts",
      value: stats.resolvedPosts,
      description: "Successfully resolved",
      icon: FaCheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent: "border-emerald-100",
    },
  ];

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "Active") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  const getCategoryStyle = (category) => {
    return category === "Lost"
      ? "bg-rose-50 text-rose-600"
      : "bg-blue-50 text-blue-600";
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7]  py-7 px-4 ">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              User Dashboard
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 md:text-4xl">
              Overview
            </h1>

            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Here's what's happening with your CampusFind activity.
            </p>
          </div>

          <Link
            to="/user-dashboard/create-new-post"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            <FaPlus />
            Create New Post
          </Link>
        </div>

        {/* Welcome Banner */}

        <div className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-[#103d35] via-[#12634f] to-[#078568] p-7 shadow-xl shadow-emerald-900/10 md:p-9">
          <div className="absolute -right-12 -top-28 h-72 w-72 rounded-full border-[35px] border-white/5" />
          <div className="absolute -bottom-32 right-52 h-64 w-64 rounded-full border-[25px] border-white/5" />

          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                <FaChartLine />
                Your Campus Activity
              </span>

              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-white md:text-3xl">
                Making your campus a better place!
              </h2>

              <p className="mt-3 text-sm leading-7 text-emerald-50/75">
                Every lost item you report and every found item you return helps
                build a more connected campus community.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl text-emerald-100">
                <FaAward />
              </div>

              <div>
                <p className="text-xs font-medium text-emerald-100/70">
                  Your Contribution
                </p>

                <h3 className="mt-1 text-3xl font-extrabold text-white">
                  {stats.contribution}
                </h3>

                <p className="mt-1 text-xs text-emerald-100/70">
                  Community contributions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}

        <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`rounded-2xl border ${item.accent} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
                  >
                    <Icon size={20} />
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    All Time
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-extrabold text-slate-800">
                  {item.value}
                </h3>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {item.title}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Resolution Overview */}

        <div className="mb-7 grid gap-6 lg:grid-cols-3">
          {/* Overall Resolution */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2 md:p-8">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  Resolution Overview
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Your overall post resolution performance
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FaBullseye size={20} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 sm:flex-row">
              {/* Circular Progress */}

              <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="13"
                  />

                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeDasharray={`${(resolutionRate / 100) * 408.4} 408.4`}
                  />
                </svg>

                <div className="absolute text-center">
                  <h2 className="text-4xl font-extrabold text-slate-800">
                    {resolutionRate}%
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Resolution Rate
                  </p>
                </div>
              </div>

              {/* Statistics */}

              <div className="w-full flex-1 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />

                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Resolved Posts
                      </p>

                      <p className="text-xs text-slate-400">
                        Successfully completed
                      </p>
                    </div>
                  </div>

                  <span className="text-xl font-extrabold text-emerald-600">
                    {stats.resolvedPosts}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-amber-400" />

                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Active Posts
                      </p>

                      <p className="text-xs text-slate-400">
                        Still waiting for resolution
                      </p>
                    </div>
                  </div>

                  <span className="text-xl font-extrabold text-amber-500">
                    {stats.activePosts}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-slate-300" />

                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Total Posts
                      </p>

                      <p className="text-xs text-slate-400">
                        All your published posts
                      </p>
                    </div>
                  </div>

                  <span className="text-xl font-extrabold text-slate-700">
                    {stats.totalPosts}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contribution Card */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  Contribution
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Your community impact
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FaHandHoldingHeart size={20} />
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-5xl font-extrabold text-slate-800">
                {stats.contribution}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Total contributions made
              </p>
            </div>

            <div className="mt-7 rounded-2xl bg-purple-50 p-4">
              <div className="flex items-center gap-3">
                <FaUsers className="text-xl text-purple-600" />

                <div>
                  <p className="text-sm font-bold text-purple-800">
                    Community Helper
                  </p>

                  <p className="mt-1 text-xs leading-5 text-purple-600/80">
                    Keep contributing and help more people find their
                    belongings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lost vs Found Resolution */}

        <div className="mb-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <h3 className="text-lg font-extrabold text-slate-800">
              Lost & Found Performance
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Breakdown of your lost and found posts
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Lost Progress */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <FaSearch />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Lost Items
                    </p>

                    <p className="text-xs text-slate-400">
                      {stats.lostResolved} of {stats.totalLost} resolved
                    </p>
                  </div>
                </div>

                <span className="text-lg font-extrabold text-rose-600">
                  {lostResolutionRate}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-rose-100">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all"
                  style={{ width: `${lostResolutionRate}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {stats.totalLost - stats.lostResolved} lost posts still
                unresolved
              </p>
            </div>

            {/* Found Progress */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FaBoxOpen />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Found Items
                    </p>

                    <p className="text-xs text-slate-400">
                      {stats.foundResolved} of {stats.totalFound} resolved
                    </p>
                  </div>
                </div>

                <span className="text-lg font-extrabold text-blue-600">
                  {foundResolutionRate}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${foundResolutionRate}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {stats.totalFound - stats.foundResolved} found posts still
                unresolved
              </p>
            </div>
          </div>
        </div>

        {/* Recent Posts & Activity */}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recently Posted */}

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 md:px-8">
              <div>
                <h3 className="font-extrabold text-slate-800">
                  Recently Posted
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Your latest lost and found posts
                </p>
              </div>

              <Link
                to="/my-posts"
                className="flex items-center gap-2 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
              >
                View All
                <FaArrowRight />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between md:px-8"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl">
                      {post.icon}
                    </div>

                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-slate-800">
                        {post.title}
                      </h4>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          {post.location}
                        </span>

                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {post.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${getCategoryStyle(
                        post.category,
                      )}`}
                    >
                      {post.category}
                    </span>

                    <span
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${getStatusStyle(
                        post.status,
                      )}`}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-7">
            <div className="mb-7">
              <h3 className="font-extrabold text-slate-800">Recent Activity</h3>

              <p className="mt-1 text-xs text-slate-400">
                Your latest account activities
              </p>
            </div>

            <div className="relative space-y-7">
              <div className="absolute bottom-5 left-5 top-5 w-px bg-slate-100" />

              {activities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.id} className="relative flex gap-4">
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.color}`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <h4 className="text-sm font-bold leading-5 text-slate-800">
                        {activity.title}
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {activity.description}
                      </p>

                      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <FaRegClock />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-lg text-emerald-600" />

                <p className="text-xs font-semibold leading-5 text-emerald-700">
                  You're helping make your campus community better!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

        <p className="mt-8 text-center text-xs text-slate-400">
          CampusFind · Your campus, connected.
        </p>
      </div>
    </div>
  );
};

export default Overview;
