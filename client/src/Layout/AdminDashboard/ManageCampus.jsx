import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  FaUniversity,
  FaPlus,
  FaSearch,
  FaTrash,
  FaTimes,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBuilding,
  FaGraduationCap,
  FaHashtag,
  FaArrowRight,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const ManageCampus = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campusName, setCampusName] = useState("");
  const [campusCode, setCampusCode] = useState("");

  // Fetch campuses
  const {
    data: campusData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["campuses"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/campuses`);
      return res.data.campuses;
    },
  });

  const campuses = campusData || [];

  // Search campuses
  const filteredCampuses = useMemo(() => {
    return campuses.filter((campus) => {
      const keyword = search.toLowerCase();

      return (
        campus.campusName.toLowerCase().includes(keyword) ||
        campus.campusCode.toLowerCase().includes(keyword)
      );
    });
  }, [campuses, search]);

  // Add campus mutation
  const addCampusMutation = useMutation({
    mutationFn: async (newCampus) => {
      const res = await axios.post(`${API_URL}/campuses`, newCampus);

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campuses"],
      });

      toast.success("Campus added successfully!");

      setCampusName("");
      setCampusCode("");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add campus");
    },
  });

  // Delete campus mutation
  const deleteCampusMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`${API_URL}/campuses/${id}`);

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campuses"],
      });

      toast.success("Campus deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete campus");
    },
  });

  // Submit new campus
  const handleAddCampus = (e) => {
    e.preventDefault();

    if (!campusName.trim() || !campusCode.trim()) {
      toast.warning("Please fill in all fields");
      return;
    }

    addCampusMutation.mutate({
      campusName: campusName.trim(),
      campusCode: campusCode.trim().toUpperCase(),
    });
  };

  // Delete confirmation
  const handleDeleteCampus = async (campus) => {
    const result = await Swal.fire({
      title: "Delete Campus?",
      text: `Are you sure you want to delete ${campus.campusName}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#ffffff",
      color: "#1e293b",
    });

    if (result.isConfirmed) {
      deleteCampusMutation.mutate(campus._id);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <FaMapMarkerAlt />
              <span>ADMINISTRATION / CAMPUS</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Manage Campuses
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage all registered universities and campuses from one place.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-indigo-300"
          >
            <FaPlus />
            Add New Campus
          </button>
        </div>

        {/* Stats */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-indigo-50" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Campuses
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {campuses.length}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Registered institutions
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl text-indigo-600">
                <FaUniversity />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-emerald-50" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Recently Added
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {campuses.length
                    ? campuses.filter((campus) => {
                        const created = new Date(campus.createdAt);
                        const now = new Date();

                        return (
                          created.getMonth() === now.getMonth() &&
                          created.getFullYear() === now.getFullYear()
                        );
                      }).length
                    : 0}
                </h2>

                <p className="mt-1 text-xs text-slate-400">Added this month</p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-600">
                <FaGraduationCap />
              </div>
            </div>
          </div>
        </div>

        {/* Campus List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* List Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">All Campuses</h2>

              <p className="mt-1 text-sm text-slate-400">
                {filteredCampuses.length} campus
                {filteredCampuses.length !== 1 ? "es" : ""} found
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campus..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="p-12 text-center">
              <p className="font-semibold text-rose-500">
                Failed to load campuses.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Please refresh the page and try again.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredCampuses.length === 0 && (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-3xl text-indigo-400">
                <FaUniversity />
              </div>

              <h3 className="text-lg font-bold text-slate-700">
                {search ? "No campus found" : "No campuses yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-400">
                {search
                  ? "Try searching with another name or campus code."
                  : "Start by adding your first campus to Campus Find."}
              </p>

              {!search && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <FaPlus />
                  Add Campus
                </button>
              )}
            </div>
          )}

          {/* Desktop Table */}
          {!isLoading && !isError && filteredCampuses.length > 0 && (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Campus</th>
                      <th className="px-6 py-4">Campus Code</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredCampuses.map((campus) => (
                      <tr
                        key={campus._id}
                        className="transition hover:bg-indigo-50/40"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
                              <FaUniversity />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {campus.campusName}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Registered campus
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold tracking-wider text-indigo-700">
                            <FaHashtag className="text-[10px]" />
                            {campus.campusCode}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <FaCalendarAlt className="text-slate-400" />
                            {formatDate(campus.createdAt)}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => handleDeleteCampus(campus)}
                            disabled={deleteCampusMutation.isPending}
                            title="Delete campus"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition hover:border-rose-200 hover:bg-rose-500 hover:text-white disabled:opacity-50"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredCampuses.map((campus) => (
                  <div
                    key={campus._id}
                    className="rounded-xl border border-slate-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <FaUniversity />
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {campus.campusName}
                          </h3>
                          <span className="mt-1 inline-block rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600">
                            {campus.campusCode}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCampus(campus)}
                        disabled={deleteCampusMutation.isPending}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
                      <FaCalendarAlt />
                      Created {formatDate(campus.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <p>Campus Find Administration</p>
          <p>Campus Management</p>
        </div>
      </div>

      {/* ================================= */}
      {/*          ADD CAMPUS MODAL         */}
      {/* ================================= */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Modal Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-6 py-8 sm:px-9 sm:py-10">
              <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
              <div className="absolute -bottom-24 right-36 h-52 w-52 rounded-full bg-white/5" />

              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <FaTimes />
              </button>

              <div className="relative">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl text-white shadow-lg">
                  <FaUniversity />
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">
                  Campus Management
                </p>

                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Add a New Campus
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-indigo-100">
                  Register a university or campus to make it available across
                  the Campus Find platform.
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddCampus} className="p-6 sm:p-9">
              <div className="mb-7">
                <h3 className="text-lg font-bold text-slate-800">
                  Campus Information
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Provide the basic details of the institution.
                </p>
              </div>

              {/* Campus Name */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Campus / University Name
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={campusName}
                    onChange={(e) => setCampusName(e.target.value)}
                    placeholder="e.g. Rajshahi University of Engineering & Technology"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>

              {/* Campus Code */}
              <div className="mb-7">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Campus Code
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <div className="relative">
                  <FaHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={campusCode}
                    onChange={(e) =>
                      setCampusCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. RUET"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold uppercase tracking-wider text-slate-700 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use a unique short code. Example: RUET, DU, BUET.
                </p>
              </div>

              {/* Info Box */}
              <div className="mb-7 flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                <div className="mt-0.5 text-indigo-600">
                  <FaGraduationCap className="text-lg" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-indigo-800">
                    Important information
                  </p>

                  <p className="mt-1 text-xs leading-5 text-indigo-700/80">
                    Campus code will be used to connect users and lost/found
                    posts with this institution. Make sure the code is correct.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addCampusMutation.isPending}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addCampusMutation.isPending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Adding Campus...
                    </>
                  ) : (
                    <>
                      Add Campus
                      <FaArrowRight />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCampus;
