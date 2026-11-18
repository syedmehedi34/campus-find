import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  GraduationCap,
  IdCard,
  Users,
  Building2,
  PenLine,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Zap,
  School,
  ArrowRight,
} from "lucide-react";

const display = "font-['Bricolage_Grotesque',sans-serif]";

const FacebookIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const steps = [
  {
    icon: PenLine,
    title: "Post it",
    text: "Lost or found something? Add a title, photo, place and time in under a minute.",
    color: "from-orange-400 to-rose-400",
  },
  {
    icon: Eye,
    title: "Campus sees it",
    text: "Only students registered at your campus can see the post, so it reaches the right people.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: HeartHandshake,
    title: "Get it back",
    text: "The owner and the finder connect, and the item goes home.",
    color: "from-emerald-400 to-teal-500",
  },
];

const values = [
  {
    icon: Building2,
    title: "Campus-based",
    text: "Every campus has its own space. You only see posts from your own campus.",
  },
  {
    icon: ShieldCheck,
    title: "Student community",
    text: "Registered students only, so people can trust each other.",
  },
  {
    icon: Zap,
    title: "Fast and simple",
    text: "Clean forms and clear posts. No clutter, no confusion.",
  },
  {
    icon: Users,
    title: "Built on kindness",
    text: "A small act of returning something makes campus life better for everyone.",
  },
];

const team = [
  {
    name: "Mst Tasnim Sultana Oishi",
    initials: "TO",
    gradient: "from-fuchsia-500 to-rose-500",
    email: "sultanatasnim205@gmail.com",
    fb: "https://www.facebook.com/share/19yduumucA/?mibextid=wwXIfr",
    details: [
      { icon: IdCard, label: "ID", value: "242311199" },
      { icon: GraduationCap, label: "Dept", value: "CSE" },
      { icon: MapPin, label: "Address", value: "Talaimari, Rajshahi" },
    ],
  },
  {
    name: "Sumaiya Siddika Tania",
    initials: "ST",
    gradient: "from-indigo-500 to-violet-500",
    email: "ssttania2020@gmail.com",
    fb: "https://www.facebook.com/share/1KGz5R59Ne/?mibextid=wwXIfr",
    details: [
      { icon: IdCard, label: "ID", value: "242311162" },
      { icon: GraduationCap, label: "Dept", value: "CSE" },
      { icon: Users, label: "Section", value: "E" },
    ],
  },
];

const stats = [
  { value: "5+", label: "Campuses" },
  { value: "2", label: "Student makers" },
  { value: "100%", label: "Free for students" },
];

const About = () => {
  return (
    <main className="overflow-hidden bg-white text-slate-800">
      {/* ---------- INTRO ---------- */}
      <section className="relative isolate bg-gradient-to-br from-white via-indigo-50/60 to-violet-50 px-5 pb-24 pt-24 sm:px-8">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(#c7d2fe 1.2px, transparent 1.2px)",
            backgroundSize: "26px 26px",
            maskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          }}
        />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 top-16 -z-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-fuchsia-300/30 blur-3xl"
        />

        <div className="mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm"
          >
            <School size={16} /> About CampusFind
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`${display} mt-7 text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl`}
          >
            We help lost things{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              find their way home.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600"
          >
            CampusFind is a lost and found platform made for students. Register
            with your campus, post what you lost or found, and let your own
            campus community help.
          </motion.p>
        </div>

        {/* stats */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-slate-100 bg-white/90 p-5 text-center shadow-xl shadow-indigo-100/60"
            >
              <p
                className={`${display} text-3xl font-extrabold text-indigo-600 sm:text-4xl`}
              >
                {s.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2
            className={`${display} text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl`}
          >
            How CampusFind works
          </h2>
          <p className="mt-4 text-slate-600">
            Three simple steps between losing something and getting it back.
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-10 hidden border-t-2 border-dashed border-indigo-200 md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="relative rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/60"
            >
              <div
                className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${s.color} text-white shadow-lg`}
              >
                <s.icon size={32} />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-600">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- VALUES ---------- */}
      <section className="bg-slate-50 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.2fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2
              className={`${display} text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl`}
            >
              Why we built it
            </h2>
            <p className="mt-5 max-w-md leading-8 text-slate-600">
              Losing an ID card or a calculator is stressful, and most of the
              time someone nearby has already found it. We built CampusFind so
              both people can meet in one place.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/50"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <v.icon size={24} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {v.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TEAM ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2
            className={`${display} text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl`}
          >
            Meet the team
          </h2>
          <p className="mt-4 text-slate-600">
            Two students from Varendra University, building something useful for
            every campus.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {team.map((m, i) => (
            <motion.article
              key={m.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/70"
            >
              <div
                className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${m.gradient} opacity-90`}
              />
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20" />

              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.05 }}
                  className={`${display} mt-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br ${m.gradient} text-4xl font-extrabold text-white shadow-xl`}
                >
                  {m.initials}
                </motion.div>

                <h3
                  className={`${display} mt-5 text-2xl font-extrabold text-slate-900`}
                >
                  {m.name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-indigo-600">
                  <GraduationCap size={16} /> Varendra University
                </p>

                <div className="mt-6 w-full space-y-3 text-left">
                  {m.details.map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                    >
                      <d.icon size={18} className="shrink-0 text-indigo-500" />
                      <span className="text-sm text-slate-500">{d.label}</span>
                      <span className="ml-auto text-sm font-semibold text-slate-800">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                  <a
                    href={`mailto:${m.email}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Mail size={17} /> Email
                  </a>
                  <a
                    href={m.fb}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    <FacebookIcon /> Facebook
                  </a>
                </div>
                <p className="mt-3 break-all text-xs text-slate-400">
                  {m.email}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="px-5 pb-24 sm:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-16 text-center text-white shadow-2xl shadow-indigo-300/50"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-2 border-dashed border-white/30"
          />
          <h2
            className={`${display} relative text-3xl font-extrabold sm:text-5xl`}
          >
            Lost or found something today?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-indigo-100">
            Post it now. Someone on your campus may be looking for it.
          </p>
          <motion.a
            href="/create-post"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="group relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-indigo-700 shadow-xl"
          >
            Report an item
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </motion.a>
        </motion.div>
      </section>
    </main>
  );
};

export default About;
