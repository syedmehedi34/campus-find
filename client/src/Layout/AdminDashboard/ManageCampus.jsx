import { useMemo, useState } from "react";
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
  FaGraduationCap,
  FaBuilding,
} from "react-icons/fa";

import useAxiosPublic from "../../hooks/useAxiosPublic";

const ManageCampus = () => {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [campusName, setCampusName] = useState("");
  const [campusCode, setCampusCode] = useState("");

  // Fetch all campuses
  const {
    data: campuses = [],
    isLoading,
    isError,
    error,
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

  // Add campus
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

      queryClient.invalidateQueries({
        queryKey: ["campuses"],
      });

      setCampusName("");
      setCampusCode("");
      setShowModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add campus");
    },
  });

  // Delete campus
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

      queryClient.invalidateQueries({
        queryKey: ["campuses"],
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete campus");
    },
  });

  // Search campuses
  const filteredCampuses = useMemo(() => {
    return campuses.filter((campus) => {
      const search = searchTerm.toLowerCase();

      return (
        campus.campusName?.toLowerCase().includes(search) ||
        campus.campusCode?.toLowerCase().includes(search)
      );
    });
  }, [campuses, searchTerm]);

  // Statistics
  const totalCampuses = campuses.length;

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
      title: "Delete Campus?",
      text: `Are you sure you want to delete ${campus.campusName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      deleteCampusMutation.mutate(campus._id);
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
            Manage Campuses
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and organize all registered campuses.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
        >
          <FaPlus />
          Add New Campus
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Campuses
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {isLoading ? "..." : totalCampuses}
              </h2>
            </div>

            <div className="rounded-xl bg-indigo-50 p-4 text-xl text-indigo-600">
              <FaUniversity />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Search Results
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {isLoading ? "..." : filteredCampuses.length}
              </h2>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4 text-xl text-emerald-600">
              <FaGraduationCap />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Campus Management
              </p>
              <h2 className="mt-2 text-lg font-bold text-slate-800">Active</h2>
              <p className="mt-1 text-xs text-slate-400">
                Campus records management
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4 text-xl text-amber-600">
              <FaBuilding />
            </div>
          </div>
        </div>
      </div>

      {/* Campus Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">All Campuses</h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage registered campuses.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search campus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="px-5 py-16 text-center">
            <p className="font-semibold text-red-500">
              Failed to load campuses
            </p>
            <p className="mt-2 text-sm text-slate-500">{error?.message}</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <>
            {filteredCampuses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">#</th>
                      <th className="px-6 py-4 font-semibold">Campus Name</th>
                      <th className="px-6 py-4 font-semibold">Campus Code</th>
                      <th className="px-6 py-4 font-semibold">Created At</th>
                      <th className="px-6 py-4 text-center font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredCampuses.map((campus, index) => (
                      <tr
                        key={campus._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                              <FaUniversity />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {campus.campusName}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Registered Campus
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold tracking-wider text-indigo-600">
                            {campus.campusCode}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {campus.createdAt
                            ? new Date(campus.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteCampus(campus)}
                            disabled={deleteCampusMutation.isPending}
                            className="rounded-lg bg-red-50 p-3 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete Campus"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                  <FaUniversity />
                </div>

                <h3 className="font-semibold text-slate-700">
                  No campuses found
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {searchTerm
                    ? "Try searching with a different keyword."
                    : "Add your first campus to get started."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Campus Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Add New Campus
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the campus information.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddCampus} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Campus Name
                </label>

                <div className="relative">
                  <FaUniversity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={campusName}
                    onChange={(e) => setCampusName(e.target.value)}
                    placeholder="Enter campus name"
                    required
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Campus Code
                </label>

                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={campusCode}
                    onChange={(e) => setCampusCode(e.target.value)}
                    placeholder="e.g. VU"
                    required
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm uppercase outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addCampusMutation.isPending}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addCampusMutation.isPending ? "Adding..." : "Add Campus"}
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
