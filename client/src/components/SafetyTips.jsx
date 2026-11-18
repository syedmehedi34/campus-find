import { motion } from "framer-motion";
import {
  ShieldCheck,
  LockKeyhole,
  UserCheck,
  MapPin,
  Phone,
  Eye,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Fingerprint,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";

const safetyTips = [
  {
    number: "01",
    title: "Verify Ownership First",
    description:
      "Before handing over a found item, ask the claimant to describe its unique features, contents or identifying details.",
    icon: Fingerprint,
    color: "bg-indigo-100 text-indigo-600",
    tag: "Ownership Verification",
  },
  {
    number: "02",
    title: "Meet in Public Places",
    description:
      "Always arrange item exchanges in familiar, well-lit campus locations such as libraries, reception areas or department offices.",
    icon: MapPin,
    color: "bg-blue-100 text-blue-600",
    tag: "Safe Handover",
  },
  {
    number: "03",
    title: "Protect Personal Information",
    description:
      "Never share passwords, OTPs, banking information or sensitive personal documents with anyone.",
    icon: LockKeyhole,
    color: "bg-emerald-100 text-emerald-600",
    tag: "Privacy Protection",
  },
  {
    number: "04",
    title: "Use Contact Details Responsibly",
    description:
      "Contact other students only for legitimate lost and found purposes. Avoid spam, harassment and unnecessary calls.",
    icon: Phone,
    color: "bg-cyan-100 text-cyan-600",
    tag: "Responsible Contact",
  },
  {
    number: "05",
    title: "Be Careful with Public Posts",
    description:
      "Avoid publishing complete ID numbers, private documents or every identifying detail of a found item.",
    icon: Eye,
    color: "bg-violet-100 text-violet-600",
    tag: "Smart Reporting",
  },
  {
    number: "06",
    title: "Report Suspicious Activity",
    description:
      "If you encounter fake claims, suspicious behavior or misuse of contact information, stop communicating and report it.",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-600",
    tag: "Stay Alert",
  },
];

const SafetyTips = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-5 py-20 sm:px-8 lg:px-10">
      {/* Background Decorations */}
      <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
            <ShieldCheck size={16} />
            Your Safety Matters
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Stay Smart.
            <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 bg-clip-text text-transparent">
              Stay Safe.
            </span>
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-500 sm:text-lg">
            A little caution goes a long way. Follow these simple safety tips to
            make every lost and found interaction safer and more reliable.
          </p>
        </motion.div>

        {/* Main Safety Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-10 overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 p-7 sm:p-10"
        >
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-emerald-100/50 blur-2xl" />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-200/60">
              <ShieldCheck size={40} />
            </div>

            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                <Sparkles size={15} />
                Safety First, Always
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Help Others, But Protect Yourself.
              </h3>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Campus Find connects students, but your personal safety comes
                first. Verify ownership, protect your private information and
                always choose a safe location for handovers.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Safety Tips Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {safetyTips.map((tip, index) => {
            const Icon = tip.icon;

            return (
              <motion.div
                key={tip.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: (index % 3) * 0.12,
                }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all duration-300 hover:border-emerald-200 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tip.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]`}
                  >
                    <Icon size={27} />
                  </div>

                  <span className="text-3xl font-black tracking-tighter text-slate-100 transition-colors group-hover:text-emerald-100">
                    {tip.number}
                  </span>
                </div>

                <h3 className="mt-7 text-lg font-bold text-slate-800">
                  {tip.title}
                </h3>

                <p className="mt-3 min-h-[105px] text-sm leading-7 text-slate-500">
                  {tip.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={15} />
                  {tip.tag}
                </div>

                <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-emerald-50 opacity-0 transition-all duration-500 group-hover:scale-150 group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </div>

        {/* Important Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border border-orange-200/70 bg-orange-50/80 p-6 sm:p-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h4 className="font-bold text-slate-800">
                Important: Never Share Sensitive Information
              </h4>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                Campus Find will never require your passwords, OTPs, banking
                PINs or payment credentials to return a lost item. If someone
                requests these details, do not share them.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Note */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <UserCheck size={18} className="text-emerald-600" />A responsible
            community is a safer community.
          </div>

          <Link
            to="/posts"
            className="group inline-flex items-center gap-2 font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            Explore Community Posts
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SafetyTips;
