import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaPlus,
  FaUniversity,
  FaTrash,
  FaTimes,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaChartBar,
  FaSyncAlt,
} from "react-icons/fa";

import useAxiosPublic from "../../hooks/useAxiosPublic";

// =====================================
//              HELPERS
// =====================================

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

const Stat = ({ icon: Icon, label, value, note, suffix = "" }) => {
  const n = useCountUp(value);
  return (
    <div className="flex-1 px-6 py-5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#6d837d]">
        <Icon className="text-[#0d9467]" size={13} />
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

const CampusIcon = ({ size = 44 }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center rounded-xl bg-[#e3f4ec] text-[#0d7a55]"
  >
    <FaUniversity size={size * 0.38} />
  </div>
);

// =====================================
//              MAIN PAGE
// =====================================

const ManageCampus = () => {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [campusName, setCampusName] = useState("");
  const [campusCode, setCampusCode] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  // ---------- Fetch campuses ----------
  const {
    data: campuses = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["campuses"],
    queryFn: async () => {
      const res = await axiosPublic.get("/campuses");

      if (!res.data?.success || !Array.isArray(res.data.campuses)) {
        throw new Error("Invalid campuses API response");
      }

      return res.data.campuses;
    },
  });

  // ---------- Fetch users (only to count members per campus) ----------
  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/users");
      return data;
    },
  });

  // ---------- Mutations ----------
  const addCampusMutation = useMutation({
    mutationFn: async (newCampus) => {
      const res = await axiosPublic.post("/campuses", newCampus);
      return res.data;
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message || "Failed to add campus");
        return;
      }

      toast.success(data.message || "Campus added successfully");
      queryClient.invalidateQueries({ queryKey: ["campuses"] });

      setCampusName("");
      setCampusCode("");
      setShowModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add campus");
    },
  });

  const deleteCampusMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosPublic.delete(`/campuses/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message || "Failed to delete campus");
        return;
      }

      toast.success(data.message || "Campus deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete campus");
    },
  });

  // ---------- Derived data ----------
  const rows = useMemo(
    () =>
      campuses.map((c) => ({
        ...c,
        members: allUsers.filter(
          (u) => u.collegeId?.toLowerCase() === c.campusCode?.toLowerCase(),
        ).length,
      })),
    [campuses, allUsers],
  );

  const filteredCampuses = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return rows.filter(
      (campus) =>
        !search ||
        campus.campusName?.toLowerCase().includes(search) ||
        campus.campusCode?.toLowerCase().includes(search),
    );
  }, [rows, searchTerm]);

  const topCampuses = useMemo(
    () => [...rows].sort((a, b) => b.members - a.members).slice(0, 5),
    [rows],
  );
  const maxMembers = Math.max(1, ...topCampuses.map((c) => c.members));

  const totalCampuses = campuses.length;
  const totalMembers = allUsers.length;
  const avgMembers = totalCampuses
    ? Math.round(totalMembers / totalCampuses)
    : 0;
  const emptyCampuses = rows.filter((c) => c.members === 0).length;

  const totalCount = useCountUp(totalCampuses);

  // ---------- Handlers ----------
  const closeModal = () => {
    setShowModal(false);
    setCampusName("");
    setCampusCode("");
  };

  const handleAddCampus = (e) => {
    e.preventDefault();

    if (!campusName.trim() || !campusCode.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    addCampusMutation.mutate({
      campusName: campusName.trim(),
      campusCode: campusCode.trim().toUpperCase(),
    });
  };

  const handleDeleteCampus = async (campus) => {
    const result = await Swal.fire({
      title: "Delete campus?",
      text: `Are you sure you want to delete ${campus.campusName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) deleteCampusMutation.mutate(campus._id);
  };

  return (
    <div className="cf-root min-h-screen bg-[#f3f7f5] px-4 py-7 md:px-6">
      <style>{styles}</style>

      <div className="mx-auto max-w-7xl">
        {/* ================= Top bar ================= */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="cf-display text-3xl font-bold text-[#10312c] md:text-[40px] md:leading-[1.1]">
              Manage campuses
            </h1>
            <p className="mt-2 text-[15px] text-[#6d837d]">
              Add, review and remove the campuses on CampusFind.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh campuses"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7e3] bg-white text-[#0d9467] transition hover:bg-[#e8f6ef] disabled:opacity-60"
            >
              <FaSyncAlt size={14} className={isFetching ? "cf-spin" : ""} />
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex h-10 items-center gap-2 rounded-full bg-[#0d9467] px-5 text-[13px] font-semibold text-white transition hover:bg-[#0b7f58]"
            >
              <FaPlus size={11} />
              Add campus
            </button>
          </div>
        </header>

        {/* ================= Hero ================= */}
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
            {/* Left */}
            <div>
              <p className="text-sm text-[#9fc9bd]">Registered on CampusFind</p>

              <div className="mt-2 flex items-end gap-3">
                <span className="cf-display text-[84px] font-extrabold leading-none md:text-[104px]">
                  {isLoading ? 0 : totalCount}
                </span>
                <span className="mb-3 text-lg text-[#9fc9bd]">
                  {totalCampuses === 1 ? "campus" : "campuses"}
                </span>
              </div>

              <p className="mt-6 max-w-sm text-sm leading-6 text-[#c4e0d8]">
                {totalMembers} members are spread across these campuses
                {emptyCampuses > 0
                  ? `, and ${emptyCampuses} ${emptyCampuses === 1 ? "campus has" : "campuses have"} no members yet.`
                  : "."}
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#3ddc97] px-6 text-sm font-semibold text-[#0b2a26] transition hover:bg-[#5ae6a9]"
              >
                <FaPlus size={11} />
                Add a campus
              </button>
            </div>

            {/* Right: top campuses */}
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="cf-display text-lg font-semibold">
                  Largest campuses
                </h2>
                <span className="text-xs text-[#9fc9bd]">By members</span>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-xl bg-white/10"
                    />
                  ))}
                </div>
              ) : topCampuses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-[#9fc9bd]">
                  No campuses yet. Add the first one to get started.
                </div>
              ) : (
                <ul className="space-y-4">
                  {topCampuses.map((c) => (
                    <li key={c._id}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {c.campusName}
                          </p>
                          <p className="text-xs text-[#7fa89c]">
                            {c.campusCode}
                          </p>
                        </div>
                        <span className="cf-display text-xl font-bold">
                          {c.members}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#0d9467] to-[#3ddc97]"
                          style={{
                            width: mounted
                              ? `${(c.members / maxMembers) * 100}%`
                              : "0%",
                            transition:
                              "width 1.2s cubic-bezier(.2,.8,.2,1) .5s",
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
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
            icon={FaUniversity}
            label="Campuses"
            value={totalCampuses}
            note="Registered on CampusFind"
          />
          <Stat
            icon={FaUsers}
            label="Members"
            value={totalMembers}
            note="Across all campuses"
          />
          <Stat
            icon={FaChartBar}
            label="Average size"
            value={avgMembers}
            note="Members per campus"
          />
          <Stat
            icon={FaClock}
            label="Search results"
            value={filteredCampuses.length}
            note={searchTerm ? "Matching your search" : "Showing all campuses"}
          />
        </section>

        {/* ================= Campus table ================= */}
        <section className="overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white">
          <div className="flex flex-col justify-between gap-4 px-6 pb-4 pt-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="cf-display text-[17px] font-semibold text-[#10312c]">
                All campuses
              </h3>
              <p className="mt-0.5 text-[13px] text-[#7a8f8a]">
                View and manage registered campuses
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <FaSearch
                size={13}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]"
              />
              <input
                type="text"
                placeholder="Search name or code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-full border border-[#dbe7e3] bg-white pl-10 pr-4 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:ring-4 focus:ring-[#0d9467]/10"
              />
            </div>
          </div>

          {isLoading && (
            <div className="space-y-3 px-6 pb-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="cf-shimmer h-14 rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <div className="px-6 pb-10 pt-4 text-center">
              <p className="font-semibold text-rose-600">
                Couldn&apos;t load campuses
              </p>
              <p className="mt-1 text-sm text-[#7a8f8a]">{error?.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-[#0d9467] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b7f58]"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {filteredCampuses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="border-y border-[#edf2f0] bg-[#f8fbfa] text-xs text-[#8ea19c]">
                        <th className="px-6 py-3.5 font-medium">Campus</th>
                        <th className="px-5 py-3.5 font-medium">Code</th>
                        <th className="px-5 py-3.5 font-medium">Members</th>
                        <th className="px-5 py-3.5 font-medium">Created</th>
                        <th className="px-6 py-3.5 text-right font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#edf2f0]">
                      {filteredCampuses.map((campus) => (
                        <tr
                          key={campus._id}
                          className="transition-colors hover:bg-[#f6faf8]"
                        >
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <CampusIcon />
                              <p className="max-w-[280px] truncate text-sm font-semibold text-[#10312c]">
                                {campus.campusName}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="rounded-md bg-[#eef4f2] px-2.5 py-1 text-[11px] font-semibold uppercase text-[#3c5a53]">
                              {campus.campusCode}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="cf-display text-base font-semibold text-[#10312c]">
                              {campus.members}
                            </span>
                            <span className="ml-1.5 text-xs text-[#8ea19c]">
                              {campus.members === 1 ? "member" : "members"}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-sm text-[#3c5a53]">
                            {formatDate(campus.createdAt)}
                          </td>

                          <td className="px-6 py-3.5">
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleDeleteCampus(campus)}
                                disabled={deleteCampusMutation.isPending}
                                aria-label={`Delete ${campus.campusName}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <FaTrash size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 pb-8">
                  <div className="rounded-xl border border-dashed border-[#d5e2de] px-4 py-14 text-center">
                    <p className="text-sm font-semibold text-[#10312c]">
                      No campuses found
                    </p>
                    <p className="mt-1 text-sm text-[#7a8f8a]">
                      {searchTerm
                        ? "Try a different name or code."
                        : "Add your first campus to get started."}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 rounded-full bg-[#e8f6ef] px-5 py-2 text-sm font-semibold text-[#0d7a55] transition hover:bg-[#d5efe3]"
                      >
                        Add campus
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-[#9ab0aa]">
          CampusFind admin, deleting a campus cannot be undone
        </p>
      </div>

      {/* ================= Add campus modal ================= */}
      {showModal && (
        <div
          className="cf-fade fixed inset-0 z-50 flex items-center justify-center bg-[#0b2a26]/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="cf-modal w-full max-w-md overflow-hidden rounded-[22px] border border-[#e3ebe8] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf2f0] px-6 py-5">
              <div>
                <h2 className="cf-display text-xl font-semibold text-[#10312c]">
                  Add campus
                </h2>
                <p className="mt-0.5 text-[13px] text-[#7a8f8a]">
                  Enter the campus name and a short code.
                </p>
              </div>

              <button
                onClick={closeModal}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#8ea19c] transition hover:bg-rose-50 hover:text-rose-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddCampus} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="campusName"
                  className="mb-2 block text-[13px] font-medium text-[#3c5a53]"
                >
                  Campus name
                </label>
                <div className="relative">
                  <FaUniversity className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]" />
                  <input
                    id="campusName"
                    type="text"
                    value={campusName}
                    onChange={(e) => setCampusName(e.target.value)}
                    placeholder="e.g. Varendra University"
                    required
                    className="h-11 w-full rounded-xl border border-[#dbe7e3] bg-[#f8fbfa] pl-11 pr-4 text-sm text-[#10312c] outline-none transition placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:bg-white focus:ring-4 focus:ring-[#0d9467]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="campusCode"
                  className="mb-2 block text-[13px] font-medium text-[#3c5a53]"
                >
                  Campus code
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a7a2]" />
                  <input
                    id="campusCode"
                    type="text"
                    value={campusCode}
                    onChange={(e) => setCampusCode(e.target.value)}
                    placeholder="e.g. VU"
                    required
                    className="h-11 w-full rounded-xl border border-[#dbe7e3] bg-[#f8fbfa] pl-11 pr-4 text-sm uppercase text-[#10312c] outline-none transition placeholder:normal-case placeholder:text-[#a4b4b0] focus:border-[#0d9467] focus:bg-white focus:ring-4 focus:ring-[#0d9467]/10"
                  />
                </div>
                <p className="mt-1.5 text-xs text-[#8ea19c]">
                  Members are matched to a campus by this code.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#edf2f0] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 rounded-full border border-[#dbe7e3] px-6 text-sm font-semibold text-[#3c5a53] transition hover:bg-[#f3f7f5]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addCampusMutation.isPending}
                  className="h-11 rounded-full bg-[#0d9467] px-7 text-sm font-semibold text-white transition hover:bg-[#0b7f58] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addCampusMutation.isPending ? "Adding..." : "Add campus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================
//              STYLES
// =====================================

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');
  .cf-root { font-family: 'Instrument Sans', system-ui, sans-serif; }
  .cf-display { font-family: 'Bricolage Grotesque', 'Instrument Sans', sans-serif; letter-spacing: -0.02em; }
  @keyframes cf-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  @keyframes cf-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(24px,-18px); } }
  @keyframes cf-shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes cf-spin { to { transform: rotate(360deg); } }
  @keyframes cf-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes cf-modal { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; } }
  .cf-rise { opacity: 0; animation: cf-rise .7s cubic-bezier(.2,.8,.2,1) forwards; }
  .cf-drift { animation: cf-drift 14s ease-in-out infinite; }
  .cf-spin { animation: cf-spin .9s linear infinite; }
  .cf-fade { animation: cf-fade .2s ease-out; }
  .cf-modal { animation: cf-modal .25s ease-out; }
  .cf-shimmer { background: linear-gradient(90deg,#eef4f2 25%,#f8fbfa 50%,#eef4f2 75%); background-size: 200% 100%; animation: cf-shimmer 1.4s infinite; }
  @media (prefers-reduced-motion: reduce) {
    .cf-rise, .cf-drift, .cf-shimmer, .cf-spin, .cf-fade, .cf-modal { animation: none !important; opacity: 1; }
  }
`;

export default ManageCampus;
