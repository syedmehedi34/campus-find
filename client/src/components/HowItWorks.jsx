import { motion } from "framer-motion";
import {
  FilePlus2,
  Search,
  MessageCircle,
  Handshake,
  ShieldCheck,
  Eye,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  LockKeyhole,
} from "lucide-react";
import { Link } from "react-router";

const steps = [
  {
    number: "01",
    title: "Report an Item",
    description:
      "Lost something or found an item on campus? Create a detailed post with its photo, description, location and relevant information.",
    icon: FilePlus2,
    color: "bg-indigo-100 text-indigo-600",
    line: "from-indigo-500 to-blue-500",
    tag: "Post a Report",
  },
  {
    number: "02",
    title: "Explore & Discover",
    description:
      "Browse lost and found posts from your campus. Use search and filters to quickly discover items that match what you're looking for.",
    icon: Search,
    color: "bg-blue-100 text-blue-600",
    line: "from-blue-500 to-cyan-500",
    tag: "Find a Match",
  },
  {
    number: "03",
    title: "Connect with Owner",
    description:
      "Found your item or identified its owner? Check the available contact information and reach out through phone or messaging.",
    icon: MessageCircle,
    color: "bg-cyan-100 text-cyan-600",
    line: "from-cyan-500 to-teal-500",
    tag: "Start a Conversation",
  },
  {
    number: "04",
    title: "Return & Resolve",
    description:
      "Verify the item's ownership, arrange a safe handover within campus and help reunite the item with its rightful owner.",
    icon: Handshake,
    color: "bg-emerald-100 text-emerald-600",
    line: "from-emerald-500 to-green-500",
    tag: "Make Someone Smile",
  },
];

const guidelines = [
  {
    icon: CheckCircle2,
    title: "Provide Accurate Information",
    description:
      "Always share honest descriptions, correct locations and relevant details when creating a lost or found post.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: ShieldCheck,
    title: "Verify Before Handover",
    description:
      "Before returning an item, ask the claimant to describe identifying details that are not publicly visible in the post.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: Eye,
    title: "Respect Personal Privacy",
    description:
      "Never publish sensitive personal information, passwords, private documents or unnecessary personal details.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: MapPin,
    title: "Choose a Safe Meeting Place",
    description:
      "Arrange handovers in familiar public campus locations, such as a library, department office or campus reception.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: MessageCircle,
    title: "Communicate Respectfully",
    description:
      "Use the available contact options responsibly. Be polite, cooperative and avoid unnecessary or misleading messages.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: AlertTriangle,
    title: "No Fake or Misleading Posts",
    description:
      "Fake reports, false ownership claims, harassment and misuse of contact information are not acceptable.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-5 py-20 sm:px-8 lg:px-10">
      {/* Background Decorations */}
      <div className="absolute -left-32 top-40 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-cyan-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
            <Sparkles size={15} className="text-indigo-500" />
            Simple Process, Meaningful Impact
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            How Campus Find
            <span className="block bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Works for Everyone
            </span>
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-500 sm:text-lg">
            From reporting a lost item to reuniting it with its owner, we make
            the entire process simple, connected and community-driven.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.12 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all duration-300 hover:shadow-xl"
              >
                {/* Step Number */}
                <div className="mb-8 flex items-center justify-between">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]`}
                  >
                    <Icon size={29} />
                  </div>

                  <span className="text-4xl font-black tracking-tighter text-slate-100 group-hover:text-slate-200">
                    {step.number}
                  </span>
                </div>

                <div
                  className={`mb-4 h-1 w-12 rounded-full bg-gradient-to-r ${step.line}`}
                />

                <h3 className="text-xl font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-3 min-h-[120px] text-sm leading-7 text-slate-500">
                  {step.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  {step.tag}
                </div>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 h-20 w-20 rounded-tl-full bg-gradient-to-tl from-indigo-50/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </div>

        {/* Connection Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-8 text-white shadow-xl shadow-indigo-200/50 sm:p-10"
        >
          <div className="flex flex-col items-center justify-between gap-7 md:flex-row">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                <HeartHandshake size={34} />
              </div>

              <div>
                <h3 className="text-xl font-bold sm:text-2xl">
                  Every Connection Makes a Difference
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-7 text-indigo-100">
                  One simple report can help another student recover something
                  important. Be the reason someone finds their lost belongings.
                </p>
              </div>
            </div>

            <Link
              to="/posts"
              className="group flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-indigo-700 shadow-lg transition hover:-translate-y-1 hover:bg-indigo-50"
            >
              Explore Posts
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.div>

        {/* Community Guidelines */}
        <div className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck size={16} />
              Community Guidelines
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              A Safer Community
              <span className="block text-emerald-600">Starts With You.</span>
            </h2>

            <p className="mt-4 leading-8 text-slate-500">
              A few simple guidelines help everyone use Campus Find responsibly
              and build a trustworthy campus community.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guidelines.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                  className="group flex gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color} transition-transform group-hover:scale-110`}
                  >
                    <Icon size={23} />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Safety Notice */}
          <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-amber-200/70 bg-amber-50/80 p-6 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
              <LockKeyhole size={23} />
            </div>

            <div>
              <h4 className="font-bold text-slate-800">
                Your Safety Comes First
              </h4>
              <p className="mt-1 text-sm leading-7 text-slate-600">
                Campus Find helps students connect, but users should verify
                ownership and use their own judgment before sharing information
                or arranging a handover. Never share passwords, OTPs or payment
                details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
