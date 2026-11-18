import { motion } from "framer-motion";
import {
  Search,
  PackagePlus,
  HandHeart,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";

const actions = [
  {
    id: 1,
    title: "Lost Something?",
    description:
      "Misplaced your belongings on campus? Create a lost report and let the community help you find them.",
    button: "Report Lost Item",
    path: "/create-post",
    type: "Lost",
    icon: Search,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    gradient: "from-orange-500 to-amber-500",
    accent: "bg-orange-50",
    border: "hover:border-orange-200",
    number: "01",
  },
  {
    id: 2,
    title: "Found Something?",
    description:
      "Found something that belongs to someone else? Report it and help reunite an item with its owner.",
    button: "Report Found Item",
    path: "/create-post",
    type: "Found",
    icon: HandHeart,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
    accent: "bg-emerald-50",
    border: "hover:border-emerald-200",
    number: "02",
  },
  {
    id: 3,
    title: "Explore Campus",
    description:
      "Looking for something? Browse recently reported lost and found items around your campus.",
    button: "Browse All Items",
    path: "/posts",
    type: "Explore",
    icon: PackagePlus,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    gradient: "from-indigo-500 to-blue-500",
    accent: "bg-indigo-50",
    border: "hover:border-indigo-200",
    number: "03",
  },
];

const QuickAction = () => {
  return (
    <section className="relative overflow-hidden bg-white px-5 py-20 sm:px-8 lg:px-10">
      {/* Background Decorations */}
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            <Sparkles size={15} className="text-indigo-500" />
            Quick & Easy Actions
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            What Would You Like
            <span className="block bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              To Do Today?
            </span>
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-500 sm:text-lg">
            Whether you've lost something, found something, or just want to
            explore, we've got you covered.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => {
            const Icon = action.icon;

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
                whileHover={{ y: -9 }}
                className={`group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_8px_35px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(79,70,229,0.10)] sm:p-8 ${action.border}`}
              >
                {/* Decorative Background */}
                <div
                  className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${action.accent} opacity-70 transition-transform duration-500 group-hover:scale-150`}
                />

                <div className="relative">
                  {/* Top Row */}
                  <div className="mb-9 flex items-center justify-between">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl ${action.iconBg} transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110`}
                    >
                      <Icon size={30} className={action.iconColor} />
                    </div>

                    <span className="text-4xl font-black tracking-tighter text-slate-100 transition-colors group-hover:text-slate-200">
                      {action.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {action.title}
                  </h3>

                  <p className="mt-4 min-h-[84px] text-sm leading-7 text-slate-500 sm:text-base">
                    {action.description}
                  </p>

                  {/* Action Button */}
                  <Link
                    to={action.path}
                    state={
                      action.type === "Lost"
                        ? { postType: "Lost" }
                        : action.type === "Found"
                          ? { postType: "Found" }
                          : undefined
                    }
                    className={`mt-7 flex w-full items-center justify-between rounded-xl bg-gradient-to-r ${action.gradient} px-5 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl`}
                  >
                    <span>{action.button}</span>
                    <ArrowUpRight
                      size={20}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </Link>

                  {/* Bottom Label */}
                  <div className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-400">
                    <ShieldCheck size={15} className="text-emerald-500" />
                    Made for your campus community
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col items-center justify-center gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 px-6 py-6 text-center sm:flex-row sm:gap-4 sm:text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <HandHeart size={25} />
          </div>

          <div>
            <h4 className="font-bold text-slate-800">
              Small Actions, Big Impact!
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Your one report could make someone's day. Let's build a helpful
              campus community together.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuickAction;
