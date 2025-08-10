import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  Rocket,
  HeartHandshake,
} from "lucide-react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.55, delay } },
  viewport: { once: true, margin: "-80px" },
});

const About = () => {
  const teamMembers = [
    { name: "Niaz Rahman", role: "Frontend Developer", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Tahsin Islam", role: "Backend Developer", img: "https://randomuser.me/api/portraits/men/41.jpg" },
    { name: "Antara Arifa", role: "UI/UX Designer", img: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "Takia Farhin", role: "UI/UX Designer", img: "https://randomuser.me/api/portraits/women/69.jpg" },
    { name: "Labibah Hoque", role: "UI/UX Designer", img: "https://randomuser.me/api/portraits/women/70.jpg" },
  ];

  const stats = [
    { label: "Learners", value: "10k+", icon: Users },
    { label: "Mentors", value: "800+", icon: BookOpen },
    { label: "Skills", value: "1,200+", icon: Sparkles },
    { label: "Avg. Match Time", value: "⩽ 24h", icon: Clock },
  ];

  const values = [
    { title: "Learner-first", desc: "Clear goals, outcomes, and feedback loops.", icon: Target },
    { title: "Quality & Trust", desc: "Verified mentors and safe interactions.", icon: ShieldCheck },
    { title: "Crafted Experience", desc: "A seamless product that gets out of the way.", icon: Sparkles },
    { title: "Community", desc: "Grow together through collaboration.", icon: HeartHandshake },
  ];

  // split 3 + 2
  const firstRow = teamMembers.slice(0, 3);
  const secondRow = teamMembers.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 text-slate-900">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 lg:px-16 pt-16 md:pt-24">
        <motion.div {...fade(0)} className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            About <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-500 bg-clip-text text-transparent">SwapIT</span>
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            SwapIT is a modern platform for peer-to-peer learning. We connect motivated learners with experienced mentors,
            focusing on clarity, outcomes, and a frictionless experience.
          </p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          {...fade(0.05)}
          className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4"
          aria-label="Key platform statistics"
        >
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-indigo-100 bg-white/70 backdrop-blur p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xl font-bold">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 lg:px-16 mt-14">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            {...fade(0.05)}
            className="rounded-2xl bg-white/80 backdrop-blur border border-indigo-100 p-8 shadow-md"
          >
            <div className="inline-flex items-center gap-2 text-indigo-700 font-semibold text-sm">
              <Rocket className="h-4 w-4" />
              Mission
            </div>
            <h3 className="mt-2 text-2xl font-bold">Accessible, personalized learning for everyone</h3>
            <p className="mt-3 text-slate-700 leading-relaxed">
              We help people learn faster by matching them with mentors who fit their goals and style—then
              we make the whole journey effortless from booking to outcomes.
            </p>
          </motion.div>

          <motion.div
            {...fade(0.1)}
            className="rounded-2xl bg-white/80 backdrop-blur border border-indigo-100 p-8 shadow-md"
          >
            <div className="inline-flex items-center gap-2 text-sky-700 font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              Vision
            </div>
            <h3 className="mt-2 text-2xl font-bold">The most trusted place for skill growth</h3>
            <p className="mt-3 text-slate-700 leading-relaxed">
              A global community where mentorship is simple, measurable, and inspiring—so learning becomes
              a habit that compounds.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 lg:px-16 mt-14">
        <motion.h2 {...fade(0)} className="text-2xl md:text-3xl font-bold">
          What we stand for
        </motion.h2>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ title, desc, icon: Icon }, i) => (
            <motion.div
              key={title}
              {...fade(0.05 + i * 0.03)}
              className="group rounded-2xl border border-indigo-100 bg-white/70 backdrop-blur p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="mb-3 inline-flex rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-3">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{desc}</p>
              <span className="mt-4 block h-[2px] w-10 bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 rounded-full opacity-60 transition-all group-hover:w-16" />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 md:px-10 lg:px-16 mt-16 mb-16">
        <motion.h2
          {...fade(0)}
          className="text-3xl md:text-4xl font-bold text-slate-900 text-center md:text-left"
        >
          Meet the team
        </motion.h2>
        <motion.p {...fade(0.03)} className="mt-2 text-slate-600 text-center md:text-left">
          Designers and engineers who care deeply about learning.
        </motion.p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
          {firstRow.map((m, i) => (
            <motion.div
              key={m.name}
              {...fade(0.05 + i * 0.03)}
              className="w-full max-w-[260px] rounded-3xl bg-white/85 backdrop-blur border border-indigo-100 p-7 md:p-8 text-center shadow-md hover:shadow-lg transition"
            >
              <img
                src={m.img}
                alt={m.name}
                className="mx-auto h-28 w-28 md:h-32 md:w-32 rounded-full object-cover ring-2 ring-white shadow-sm"
                loading="lazy"
              />
              <div className="mt-5">
                <div className="text-lg md:text-xl font-semibold">{m.name}</div>
                <div className="text-sm md:text-base text-slate-500">{m.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center md:w-[720px] mx-auto">
          {secondRow.map((m, i) => (
            <motion.div
              key={m.name}
              {...fade(0.07 + i * 0.03)}
              className="w-full max-w-[260px] rounded-3xl bg-white/85 backdrop-blur border border-indigo-100 p-7 md:p-8 text-center shadow-md hover:shadow-lg transition"
            >
              <img
                src={m.img}
                alt={m.name}
                className="mx-auto h-28 w-28 md:h-32 md:w-32 rounded-full object-cover ring-2 ring-white shadow-sm"
                loading="lazy"
              />
              <div className="mt-5">
                <div className="text-lg md:text-xl font-semibold">{m.name}</div>
                <div className="text-sm md:text-base text-slate-500">{m.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
