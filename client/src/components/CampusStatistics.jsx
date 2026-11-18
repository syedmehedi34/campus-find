// import { motion } from "framer-motion";
// import {
//   GraduationCap,
//   Users,
//   FileText,
//   HeartHandshake,
//   TrendingUp,
//   MapPin,
//   ArrowUpRight,
//   Sparkles,
//   Trophy,
//   CheckCircle2,
//   Globe2,
// } from "lucide-react";

// const stats = [
//   {
//     title: "Partner Campuses",
//     value: "08",
//     description: "Universities connected",
//     icon: GraduationCap,
//     color: "bg-indigo-100 text-indigo-600",
//     gradient: "from-indigo-500 to-blue-500",
//     shadow: "shadow-indigo-100",
//   },
//   {
//     title: "Student Community",
//     value: "12.4K+",
//     description: "Students in our network",
//     icon: Users,
//     color: "bg-blue-100 text-blue-600",
//     gradient: "from-blue-500 to-cyan-500",
//     shadow: "shadow-blue-100",
//   },
//   {
//     title: "Total Reports",
//     value: "3,100+",
//     description: "Lost & found reports",
//     icon: FileText,
//     color: "bg-violet-100 text-violet-600",
//     gradient: "from-violet-500 to-purple-500",
//     shadow: "shadow-violet-100",
//   },
//   {
//     title: "Items Reunited",
//     value: "2,180+",
//     description: "Successful reunions",
//     icon: HeartHandshake,
//     color: "bg-emerald-100 text-emerald-600",
//     gradient: "from-emerald-500 to-teal-500",
//     shadow: "shadow-emerald-100",
//   },
// ];

// const campuses = [
//   {
//     name: "Rajshahi University of Engineering & Technology",
//     short: "RUET",
//     city: "Rajshahi",
//     students: "2,450",
//     reports: 420,
//     resolved: 310,
//     color: "bg-indigo-500",
//   },
//   {
//     name: "University of Rajshahi",
//     short: "RU",
//     city: "Rajshahi",
//     students: "2,200",
//     reports: 380,
//     resolved: 280,
//     color: "bg-blue-500",
//   },
//   {
//     name: "Bangladesh University of Engineering & Technology",
//     short: "BUET",
//     city: "Dhaka",
//     students: "1,950",
//     reports: 350,
//     resolved: 260,
//     color: "bg-cyan-500",
//   },
//   {
//     name: "Dhaka University",
//     short: "DU",
//     city: "Dhaka",
//     students: "1,800",
//     reports: 330,
//     resolved: 240,
//     color: "bg-violet-500",
//   },
//   {
//     name: "Chittagong University of Engineering & Technology",
//     short: "CUET",
//     city: "Chattogram",
//     students: "1,400",
//     reports: 280,
//     resolved: 200,
//     color: "bg-emerald-500",
//   },
//   {
//     name: "Khulna University of Engineering & Technology",
//     short: "KUET",
//     city: "Khulna",
//     students: "1,050",
//     reports: 240,
//     resolved: 170,
//     color: "bg-orange-500",
//   },
//   {
//     name: "Shahjalal University of Science & Technology",
//     short: "SUST",
//     city: "Sylhet",
//     students: "900",
//     reports: 220,
//     resolved: 150,
//     color: "bg-pink-500",
//   },
//   {
//     name: "Chittagong University",
//     short: "CU",
//     city: "Chattogram",
//     students: "700",
//     reports: 180,
//     resolved: 120,
//     color: "bg-teal-500",
//   },
// ];

// const CampusStatistics = () => {
//   return (
//     <section className="relative overflow-hidden bg-white px-5 py-20 sm:px-8 lg:px-10">
//       {/* Background Decorations */}
//       <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
//       <div className="absolute -left-32 bottom-20 h-80 w-80 rounded-full bg-cyan-100/40 blur-3xl" />

//       <div className="relative mx-auto max-w-7xl">
//         {/* Heading */}
//         <motion.div
//           initial={{ opacity: 0, y: 25 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="mx-auto mb-14 max-w-2xl text-center"
//         >
//           <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
//             <Globe2 size={16} />
//             Growing Together Across Campuses
//           </div>

//           <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
//             One Community,
//             <span className="block bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
//               Many Campuses.
//             </span>
//           </h2>

//           <p className="mt-5 text-base leading-8 text-slate-500 sm:text-lg">
//             Connecting students across universities to make lost and found
//             experiences easier, faster and more meaningful.
//           </p>
//         </motion.div>

//         {/* Main Statistics */}
//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//           {stats.map((stat, index) => {
//             const Icon = stat.icon;

//             return (
//               <motion.div
//                 key={stat.title}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.5, delay: index * 0.12 }}
//                 whileHover={{ y: -7 }}
//                 className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:shadow-xl"
//               >
//                 <div className="flex items-center justify-between">
//                   <div
//                     className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]`}
//                   >
//                     <Icon size={27} />
//                   </div>

//                   <TrendingUp
//                     size={21}
//                     className="text-slate-300 transition-colors group-hover:text-emerald-500"
//                   />
//                 </div>

//                 <p className="mt-7 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
//                   {stat.value}
//                 </p>

//                 <h3 className="mt-2 font-bold text-slate-700">{stat.title}</h3>

//                 <p className="mt-1 text-sm text-slate-400">
//                   {stat.description}
//                 </p>

//                 <div
//                   className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.06] transition-transform duration-500 group-hover:scale-150`}
//                 />
//               </motion.div>
//             );
//           })}
//         </div>

//         {/* Main Highlight Banner */}
//         <motion.div
//           initial={{ opacity: 0, y: 25 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-8 text-white shadow-xl shadow-indigo-200/50 sm:p-10"
//         >
//           <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
//           <div className="absolute -right-4 -top-16 h-56 w-56 rounded-full border border-white/10" />

//           <div className="relative grid items-center gap-10 md:grid-cols-2">
//             <div>
//               <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50">
//                 <Sparkles size={15} />
//                 Community Impact
//               </div>

//               <h3 className="text-3xl font-extrabold leading-tight sm:text-4xl">
//                 Together, We're Making
//                 <span className="block text-cyan-200">a Real Difference.</span>
//               </h3>

//               <p className="mt-5 max-w-lg text-sm leading-7 text-blue-100 sm:text-base">
//                 Every report, every connection and every returned item
//                 represents a student helping another student. That's the power
//                 of a connected campus community.
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
//                 <Trophy size={25} className="text-yellow-300" />
//                 <p className="mt-5 text-3xl font-extrabold">70%</p>
//                 <p className="mt-1 text-sm text-blue-100">Reports Resolved</p>
//               </div>

//               <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
//                 <HeartHandshake size={25} className="text-emerald-200" />
//                 <p className="mt-5 text-3xl font-extrabold">8+</p>
//                 <p className="mt-1 text-sm text-blue-100">Campus Connections</p>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Campus Directory */}
//         <div className="mt-24">
//           <motion.div
//             initial={{ opacity: 0, y: 25 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
//           >
//             <div>
//               <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
//                 <MapPin size={15} />
//                 Campus Network
//               </div>

//               <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
//                 Our Connected Campuses
//               </h3>

//               <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
//                 A growing network of university communities working together to
//                 make campus life better.
//               </p>
//             </div>

//             <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
//               <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
//               08 Sample Campuses
//             </div>
//           </motion.div>

//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//             {campuses.map((campus, index) => (
//               <motion.div
//                 key={campus.short}
//                 initial={{ opacity: 0, y: 25 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{
//                   duration: 0.45,
//                   delay: (index % 4) * 0.1,
//                 }}
//                 whileHover={{ y: -5 }}
//                 className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg"
//               >
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${campus.color} text-sm font-extrabold text-white shadow-md`}
//                   >
//                     {campus.short}
//                   </div>

//                   <div className="min-w-0">
//                     <h4 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-800">
//                       {campus.name}
//                     </h4>
//                     <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
//                       <MapPin size={12} />
//                       {campus.city}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="my-5 h-px bg-slate-100" />

//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <p className="text-lg font-extrabold text-slate-800">
//                       {campus.students}
//                     </p>
//                     <p className="text-xs text-slate-400">Students</p>
//                   </div>

//                   <div>
//                     <p className="text-lg font-extrabold text-slate-800">
//                       {campus.reports}
//                     </p>
//                     <p className="text-xs text-slate-400">Reports</p>
//                   </div>
//                 </div>

//                 <div className="mt-5">
//                   <div className="mb-2 flex items-center justify-between text-xs">
//                     <span className="font-medium text-slate-500">
//                       Resolved Reports
//                     </span>
//                     <span className="font-bold text-emerald-600">
//                       {Math.round((campus.resolved / campus.reports) * 100)}%
//                     </span>
//                   </div>

//                   <div className="h-2 overflow-hidden rounded-full bg-slate-100">
//                     <motion.div
//                       initial={{ width: 0 }}
//                       whileInView={{
//                         width: `${(campus.resolved / campus.reports) * 100}%`,
//                       }}
//                       viewport={{ once: true }}
//                       transition={{
//                         duration: 1,
//                         delay: 0.3 + index * 0.08,
//                       }}
//                       className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
//                     />
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>

//         {/* Final Community Message */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="mt-14 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 px-6 py-9 text-center sm:px-10"
//         >
//           <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
//             <GraduationCap size={30} />
//           </div>

//           <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
//             Your Campus Can Be Part of This!
//           </h3>

//           <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
//             A stronger campus community begins with students helping students.
//             Together, let's make lost and found easier everywhere.
//           </p>

//           <div className="mt-6 inline-flex items-center gap-2 font-bold text-indigo-600">
//             <CheckCircle2 size={18} />
//             Connecting Campuses, Reuniting Belongings
//           </div>
//         </motion.div>

//         {/* Dummy Data Notice */}
//         <p className="mt-6 text-center text-xs text-slate-400">
//           * All statistics and campus participation figures shown above are
//           illustrative sample data, not verified platform statistics.
//         </p>
//       </div>
//     </section>
//   );
// };

// export default CampusStatistics;

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  FileText,
  HeartHandshake,
  TrendingUp,
  MapPin,
  Sparkles,
  Trophy,
  CheckCircle2,
  Globe2,
} from "lucide-react";

import useCampuses from "../hooks/useCampuses";
import usePostData from "../hooks/usePostData";
import useUserData from "../hooks/useUserData";

const formatNumber = (number) =>
  new Intl.NumberFormat("en-US").format(number || 0);

const CampusStatistics = () => {
  // Fetch all campuses
  const {
    campuses = [],
    isLoading: campusesLoading,
    isError: campusesError,
  } = useCampuses();

  // Fetch all users
  const {
    allUsers = [],
    allUsersLoading,
    allUsersError,
  } = useUserData({
    fetchAll: true,
  });

  // Fetch posts
  // Large limit to calculate campus-wise statistics
  const {
    posts = [],
    totalItems = 0,
    isLoading: postsLoading,
    isError: postsError,
  } = usePostData({
    limit: 1000,
  });

  const isLoading = campusesLoading || allUsersLoading || postsLoading;

  const isError = campusesError || allUsersError || postsError;

  // Filter valid users and posts
  const validUsers = useMemo(() => {
    return allUsers.filter((user) => user.role === "user");
  }, [allUsers]);

  const validPosts = useMemo(() => {
    return posts.filter((post) => post.isDeleted !== true);
  }, [posts]);

  // Global Statistics
  const stats = useMemo(() => {
    const resolvedPosts = validPosts.filter(
      (post) => post.postStatus?.toLowerCase() === "resolved",
    );

    const totalReports = totalItems || validPosts.length;

    return [
      {
        title: "Partner Campuses",
        value: formatNumber(campuses.length),
        description: "Universities connected",
        icon: GraduationCap,
        color: "bg-indigo-100 text-indigo-600",
        gradient: "from-indigo-500 to-blue-500",
        shadow: "shadow-indigo-100",
      },
      {
        title: "Student Community",
        value: formatNumber(validUsers.length),
        description: "Students in our network",
        icon: Users,
        color: "bg-blue-100 text-blue-600",
        gradient: "from-blue-500 to-cyan-500",
        shadow: "shadow-blue-100",
      },
      {
        title: "Total Reports",
        value: formatNumber(totalReports),
        description: "Lost & found reports",
        icon: FileText,
        color: "bg-violet-100 text-violet-600",
        gradient: "from-violet-500 to-purple-500",
        shadow: "shadow-violet-100",
      },
      {
        title: "Items Reunited",
        value: formatNumber(resolvedPosts.length),
        description: "Successfully resolved reports",
        icon: HeartHandshake,
        color: "bg-emerald-100 text-emerald-600",
        gradient: "from-emerald-500 to-teal-500",
        shadow: "shadow-emerald-100",
      },
    ];
  }, [campuses, validUsers, validPosts, totalItems]);

  // Campus-wise Statistics
  const campusStatistics = useMemo(() => {
    return campuses.map((campus) => {
      const campusCode = campus.campusCode?.toLowerCase();

      // Find students of this campus
      const campusStudents = validUsers.filter(
        (user) => user.collegeId?.toLowerCase() === campusCode,
      );

      // Find posts of this campus
      const campusPosts = validPosts.filter(
        (post) => post.universityCode?.toLowerCase() === campusCode,
      );

      // Find resolved posts
      const resolvedPosts = campusPosts.filter(
        (post) => post.postStatus?.toLowerCase() === "resolved",
      );

      const reports = campusPosts.length;
      const resolved = resolvedPosts.length;

      const resolvedPercentage =
        reports > 0 ? Math.round((resolved / reports) * 100) : 0;

      return {
        name: campus.campusName,
        short: campus.campusCode?.toUpperCase(),
        city: campus.city || "Campus Community",
        students: campusStudents.length,
        reports,
        resolved,
        resolvedPercentage,
      };
    });
  }, [campuses, validUsers, validPosts]);

  // Overall resolved percentage
  const totalReports = validPosts.length;

  const totalResolved = validPosts.filter(
    (post) => post.postStatus?.toLowerCase() === "resolved",
  ).length;

  const overallResolvedPercentage =
    totalReports > 0 ? Math.round((totalResolved / totalReports) * 100) : 0;

  // Loading display
  const displayValue = (value) => (isLoading ? "..." : value);

  // Campus colors (same design)
  const campusColors = [
    "bg-indigo-500",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  return (
    <section className="relative overflow-hidden bg-white px-5 py-20 sm:px-8 lg:px-10">
      {/* Background Decorations */}
      <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
      <div className="absolute -left-32 bottom-20 h-80 w-80 rounded-full bg-cyan-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            <Globe2 size={16} />
            Growing Together Across Campuses
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            One Community,
            <span className="block bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Many Campuses.
            </span>
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-500 sm:text-lg">
            Connecting students across universities to make lost and found
            experiences easier, faster and more meaningful.
          </p>
        </motion.div>

        {/* Main Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                }}
                whileHover={{ y: -7 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]`}
                  >
                    <Icon size={27} />
                  </div>

                  <TrendingUp
                    size={21}
                    className="text-slate-300 transition-colors group-hover:text-emerald-500"
                  />
                </div>

                <p className="mt-7 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {displayValue(stat.value)}
                </p>

                <h3 className="mt-2 font-bold text-slate-700">{stat.title}</h3>

                <p className="mt-1 text-sm text-slate-400">
                  {stat.description}
                </p>

                <div
                  className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.06] transition-transform duration-500 group-hover:scale-150`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Main Highlight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-8 text-white shadow-xl shadow-indigo-200/50 sm:p-10"
        >
          <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-4 -top-16 h-56 w-56 rounded-full border border-white/10" />

          <div className="relative grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50">
                <Sparkles size={15} />
                Community Impact
              </div>

              <h3 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                Together, We're Making
                <span className="block text-cyan-200">a Real Difference.</span>
              </h3>

              <p className="mt-5 max-w-lg text-sm leading-7 text-blue-100 sm:text-base">
                Every report, every connection and every returned item
                represents a student helping another student. That's the power
                of a connected campus community.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <Trophy size={25} className="text-yellow-300" />

                <p className="mt-5 text-3xl font-extrabold">
                  {displayValue(`${overallResolvedPercentage}%`)}
                </p>

                <p className="mt-1 text-sm text-blue-100">Reports Resolved</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <HeartHandshake size={25} className="text-emerald-200" />

                <p className="mt-5 text-3xl font-extrabold">
                  {displayValue(`${campuses.length}+`)}
                </p>

                <p className="mt-1 text-sm text-blue-100">Campus Connections</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Campus Directory */}
        <div className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <MapPin size={15} />
                Campus Network
              </div>

              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Our Connected Campuses
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                A growing network of university communities working together to
                make campus life better.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              {isLoading
                ? "Loading Campuses..."
                : `${formatNumber(campuses.length)} Connected Campuses`}
            </div>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {campusStatistics.map((campus, index) => (
              <motion.div
                key={campus.short}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: (index % 4) * 0.1,
                }}
                whileHover={{ y: -5 }}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${campusColors[index % campusColors.length]} text-xs font-extrabold text-white shadow-md`}
                  >
                    {campus.short}
                  </div>

                  <div className="min-w-0">
                    <h4 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-800">
                      {campus.name}
                    </h4>

                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} />
                      {campus.city}
                    </p>
                  </div>
                </div>

                <div className="my-5 h-px bg-slate-100" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-slate-800">
                      {displayValue(formatNumber(campus.students))}
                    </p>

                    <p className="text-xs text-slate-400">Students</p>
                  </div>

                  <div>
                    <p className="text-lg font-extrabold text-slate-800">
                      {displayValue(formatNumber(campus.reports))}
                    </p>

                    <p className="text-xs text-slate-400">Reports</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      Resolved Reports
                    </span>

                    <span className="font-bold text-emerald-600">
                      {displayValue(`${campus.resolvedPercentage}%`)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${campus.resolvedPercentage}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1,
                        delay: 0.3 + index * 0.08,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final Community Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 px-6 py-9 text-center sm:px-10"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <GraduationCap size={30} />
          </div>

          <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Your Campus Can Be Part of This!
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            A stronger campus community begins with students helping students.
            Together, let's make lost and found easier everywhere.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 font-bold text-indigo-600">
            <CheckCircle2 size={18} />
            Connecting Campuses, Reuniting Belongings
          </div>
        </motion.div>

        {/* Error Notice */}
        {isError && (
          <p className="mt-6 text-center text-sm text-red-500">
            Some statistics could not be loaded. Please try again later.
          </p>
        )}
      </div>
    </section>
  );
};

export default CampusStatistics;
