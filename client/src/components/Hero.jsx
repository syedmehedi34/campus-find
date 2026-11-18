import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  Bell,
} from "lucide-react";

const display = "font-['Bricolage_Grotesque',sans-serif]";

const lostItems = [
  { word: "ID card", emoji: "🪪" },
  { word: "calculator", emoji: "🧮" },
  { word: "umbrella", emoji: "☂️" },
  { word: "water bottle", emoji: "🧴" },
  { word: "earphones", emoji: "🎧" },
  { word: "notebook", emoji: "📓" },
];

const ticker = [
  "🪪 ID card found at Library",
  "🧮 Calculator matched with owner",
  "☂️ Umbrella found at Cafeteria",
  "🎧 Earphones lost near CSE Building",
  "📓 Notebook returned to owner",
  "🔑 Keys found at Main Gate",
];

/* ---------- rotating word ---------- */
const RotatingWord = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % lostItems.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-flex h-[1.15em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={lostItems[i].word}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text pr-1 text-transparent"
        >
          {lostItems[i].word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

/* ---------- lost + found cards that snap together ---------- */
const MatchScene = () => {
  const [matched, setMatched] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setMatched((m) => !m), 3200);
    return () => clearInterval(t);
  }, []);

  const spring = { type: "spring", stiffness: 70, damping: 14 };

  return (
    <div className="relative mx-auto flex h-[440px] w-full max-w-[520px] items-center justify-center sm:h-[520px]">
      {/* rotating rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute h-[330px] w-[330px] rounded-full border-2 border-dashed border-indigo-200 sm:h-[430px] sm:w-[430px]"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute h-[250px] w-[250px] rounded-full border border-violet-200 sm:h-[320px] sm:w-[320px]"
      >
        <span className="absolute -top-2 left-1/2 h-4 w-4 rounded-full bg-fuchsia-400 shadow-lg shadow-fuchsia-300" />
        <span className="absolute -bottom-2 left-1/3 h-3 w-3 rounded-full bg-indigo-400 shadow-lg shadow-indigo-300" />
      </motion.div>

      {/* glow */}
      <motion.div
        animate={{ scale: matched ? 1.25 : 0.8, opacity: matched ? 0.9 : 0.3 }}
        transition={{ duration: 0.8 }}
        className="absolute h-56 w-56 rounded-full bg-gradient-to-br from-indigo-300 to-fuchsia-300 blur-3xl"
      />

      {/* LOST card */}
      <motion.div
        animate={{
          x: matched ? 38 : -62,
          y: matched ? -14 : -70,
          rotate: matched ? -4 : -9,
        }}
        transition={spring}
        className="absolute z-10 w-52 rounded-3xl border border-orange-200 bg-white p-4 shadow-2xl shadow-orange-200/60 sm:w-60"
      >
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
            🪪
          </span>
          <span className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold text-white">
            Lost
          </span>
        </div>
        <h4 className="mt-3 text-lg font-extrabold text-slate-900">
          Student ID Card
        </h4>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={13} /> University Library
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <Clock size={13} /> 2 hours ago
        </p>
      </motion.div>

      {/* FOUND card */}
      <motion.div
        animate={{
          x: matched ? -38 : 62,
          y: matched ? 26 : 90,
          rotate: matched ? 3 : 8,
        }}
        transition={spring}
        className="absolute z-20 w-52 rounded-3xl border border-emerald-200 bg-white p-4 shadow-2xl shadow-emerald-200/60 sm:w-60"
      >
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
            🪪
          </span>
          <span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white">
            Found
          </span>
        </div>
        <h4 className="mt-3 text-lg font-extrabold text-slate-900">
          Student ID Card
        </h4>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={13} /> University Library
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <Clock size={13} /> Just now
        </p>
      </motion.div>

      {/* match badge */}
      <AnimatePresence>
        {matched && (
          <motion.div
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 14,
              delay: 0.5,
            }}
            className="absolute z-30 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-2xl"
          >
            <CheckCircle2 size={18} className="text-emerald-400" />
            Match found!
          </motion.div>
        )}
      </AnimatePresence>

      {/* notification chip */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-2 top-6 z-30 flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-3 py-2 shadow-xl shadow-indigo-100 sm:right-0"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Bell size={16} />
        </span>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-800">New post nearby</p>
          <p className="text-[10px] text-slate-400">CSE Building</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-2 bottom-8 z-30 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-2 shadow-xl shadow-emerald-100 sm:left-0"
      >
        <span className="text-xl">🎉</span>
        <p className="text-xs font-bold text-slate-800">Returned to owner</p>
      </motion.div>
    </div>
  );
};

/* ---------- Hero ---------- */
const Hero = () => {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-indigo-50/60 to-violet-50">
      {/* dotted grid + blobs */}
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage: "radial-gradient(#c7d2fe 1.2px, transparent 1.2px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 top-10 -z-10 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-fuchsia-300/30 blur-3xl"
      />

      <div className="mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:px-10">
        {/* LEFT */}
        <div className="relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Live across multiple campuses
            <Sparkles size={15} className="text-indigo-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`${display} text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-[76px]`}
          >
            Lost your
            <br />
            <RotatingWord />
            <span className="text-indigo-600">?</span>
            <br />
            <span className="text-slate-900">Your campus</span>
            <br />
            <span className="text-slate-900">has it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mx-auto mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0"
          >
            Post what you lost or found. Students at your own campus see it
            instantly, and your belongings find their way home.
          </motion.p>

          {/* search pill */}
          <motion.a
            href="/posts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileHover={{ y: -3 }}
            className="mx-auto mt-9 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 pl-5 text-left shadow-xl shadow-indigo-100/70 transition lg:mx-0"
          >
            <Search size={20} className="shrink-0 text-slate-400" />
            <span className="flex-1 truncate text-sm text-slate-400 sm:text-base">
              Search “black umbrella”, “ID card”…
            </span>
            <span className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">
              Search
            </span>
          </motion.a>

          {/* buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
          >
            <motion.a
              href="/posts"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-4 font-semibold text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-700"
            >
              Browse lost items
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </motion.a>
            <motion.a
              href="/create-post"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-7 py-4 font-semibold text-slate-800 transition hover:border-indigo-400 hover:text-indigo-600"
            >
              <PlusCircle size={19} />
              Report an item
            </motion.a>
          </motion.div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 lg:justify-start">
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" /> Verified
              students only
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" /> Free to
              use
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <MatchScene />
        </motion.div>
      </div>

      {/* live ticker */}
      <div className="overflow-hidden border-y border-slate-200/70 bg-white/70 py-4 backdrop-blur-md">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex w-max gap-4"
        >
          {[...ticker, ...ticker].map((t, i) => (
            <span
              key={i}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 shadow-sm"
            >
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
