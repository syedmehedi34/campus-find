import { motion } from "framer-motion";
import {
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Sparkles,
} from "lucide-react";

const floatingCards = [
  {
    title: "Student ID Card",
    category: "Lost Item",
    location: "University Library",
    time: "2 hours ago",
    icon: "🪪",
    color: "border-orange-200 bg-orange-50",
    badge: "bg-orange-100 text-orange-700",
    position: "top-5 -left-8",
    delay: 0,
  },
  {
    title: "Scientific Calculator",
    category: "Found Item",
    location: "CSE Building",
    time: "Just now",
    icon: "🧮",
    color: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    position: "top-40 -right-8",
    delay: 0.2,
  },
  {
    title: "Black Umbrella",
    category: "Found Item",
    location: "Campus Cafeteria",
    time: "Yesterday",
    icon: "☂️",
    color: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    position: "bottom-4 -left-5",
    delay: 0.4,
  },
];

const Hero = () => {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Background Decorations */}
      <div className="absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-10 lg:px-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm"
          >
            <Sparkles size={16} className="text-indigo-500" />
            Your Campus, Connected & Careful
          </motion.div>

          <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-[60px]">
            Lost Something?
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Find It Here.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
            Campus life is better when we look out for each other. Lost your ID
            card, calculator, or something important? Found something on campus?
            Let's help it find its way home.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <motion.a
              href="/lost-items"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              <Search size={19} />
              Find Lost Items
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </motion.a>

            <motion.a
              href="/post-item"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 font-semibold text-slate-800 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
            >
              <PlusCircle size={19} />
              Report an Item
            </motion.a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500 lg:justify-start">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              Student Community
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              Easy & Free
            </div>
            <div className="flex items-center gap-2">
              <Package size={18} className="text-emerald-500" />
              Lost & Found
            </div>
          </div>
        </motion.div>

        {/* Right Animated Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative mx-auto flex h-[450px] w-full max-w-[540px] items-center justify-center sm:h-[520px]"
        >
          {/* Main Circle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="absolute h-[340px] w-[340px] rounded-full border border-dashed border-indigo-300/70 sm:h-[420px] sm:w-[420px]"
          />

          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-2xl shadow-indigo-300/50 sm:h-80 sm:w-80"
          >
            <div className="absolute inset-4 rounded-full border border-white/20" />

            <div className="text-center text-white">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-5xl shadow-inner backdrop-blur-sm sm:h-28 sm:w-28"
              >
                🔎
              </motion.div>
              <h3 className="text-2xl font-bold sm:text-3xl">Campus Find</h3>
              <p className="mt-2 text-sm text-indigo-100">
                Every lost item deserves a way home.
              </p>
            </div>
          </motion.div>

          {/* Floating Cards */}
          {floatingCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: [0, -12, 0],
              }}
              transition={{
                opacity: { delay: card.delay + 0.5, duration: 0.6 },
                y: {
                  delay: card.delay + 0.5,
                  duration: 4 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className={`absolute ${card.position} z-10 w-52 rounded-2xl border ${card.color} p-4 shadow-xl shadow-slate-200/60 sm:w-60`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{card.icon}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${card.badge}`}
                >
                  {card.category}
                </span>
              </div>

              <h4 className="mt-3 font-bold text-slate-800">{card.title}</h4>

              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={13} />
                {card.location}
              </div>

              <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <Clock size={13} />
                {card.time}
              </div>
            </motion.div>
          ))}

          {/* Decorative Sparkles */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.3, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute right-12 top-4 text-3xl text-indigo-400"
          >
            ✦
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-16 right-10 text-2xl text-blue-400"
          >
            ✧
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Strip */}
      <div className="border-t border-slate-200/70 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-sm font-medium text-slate-500 sm:px-8">
          <span>🎓 Made for Students</span>
          <span>📍 Within Your Campus</span>
          <span>🤝 Together We Find</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
