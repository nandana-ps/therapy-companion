
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Checkin = {
  id: string;
  patient_id: string;
  checkin_date: string;
  mood_score: number;
  stress_score: number;
  energy_score: number;
  patient_note: string | null;
  ai_followup_question: string | null;
  ai_followup_answer: string | null;
  ai_structured_summary: string | null;
  questionnaire_answers: Record<string, string> | null;
  created_at: string;
};

export default function TherapistDashboard() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [preparedCheckinId, setPreparedCheckinId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCheckins() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setMessage("Please sign in to continue.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role !== "therapist") {
        setMessage("Please sign in with a therapist account.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) setMessage(error.message);
      else setCheckins(data ?? []);

      setLoading(false);
    }

    loadCheckins();
  }, []);

  const average = (key: "mood_score" | "stress_score" | "energy_score") =>
    checkins.length
      ? (
          checkins.reduce((sum, item) => sum + item[key], 0) /
          checkins.length
        ).toFixed(1)
      : "—";

  const filtered = checkins.filter((item) =>
    item.patient_id.toLowerCase().includes(search.toLowerCase())
  );

  function buildSessionBrief(item: Checkin) {
    const answers = item.questionnaire_answers ?? {};
    const topics = [
      answers["9"] || "The patient has not selected a preferred topic.",
    ];
    const discussionPoints: string[] = [];

    if (item.mood_score <= 2) {
      discussionPoints.push("Explore the patient's recent mood and what has felt particularly difficult.");
    }
    if (item.stress_score >= 4) {
      discussionPoints.push("Ask about current stressors and coping strategies that have or have not helped.");
    }
    if (item.energy_score <= 2) {
      discussionPoints.push("Discuss recent energy levels, sleep, and their effect on daily activities.");
    }
    if (answers["3"] === "Very poorly" || answers["3"] === "Poorly") {
      discussionPoints.push("Explore sleep quality and any changes in routine.");
    }
    if (answers["5"] === "Not at all" || answers["5"] === "A little") {
      discussionPoints.push("Gently explore social connection and the support the patient would find helpful.");
    }
    if (answers["7"] === "Often" || answers["7"] === "Almost always") {
      discussionPoints.push("Ask about situations where the patient has felt overwhelmed and what support may help.");
    }
    if (discussionPoints.length === 0) {
      discussionPoints.push("Begin with the patient's own priorities and ask what has changed since this check-in.");
    }

    return { topics, discussionPoints };
  }

  const stats = [
    {
      label: "Total check-ins",
      value: String(checkins.length),
      detail: "Recent submissions",
      icon: "◷",
      color: "bg-violet-100 text-violet-700",
    },
    {
      label: "Average mood",
      value: average("mood_score"),
      detail: "Out of 10",
      icon: "☀",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Average stress",
      value: average("stress_score"),
      detail: "Out of 10",
      icon: "〰",
      color: "bg-rose-100 text-rose-700",
    },
    {
      label: "Average energy",
      value: average("energy_score"),
      detail: "Out of 10",
      icon: "✳",
      color: "bg-sky-100 text-sky-700",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f6fc] text-slate-800">
      <div className="mx-auto max-w-[1450px] p-4 sm:p-7 lg:p-10">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-2xl text-white shadow-lg shadow-violet-200">
              ✳
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-violet-700">
                THERAPY CONTINUITY
              </p>
              <p className="text-xs text-slate-500">COMPANION</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-lg">
              ♡
            </div>
            <div>
              <p className="text-sm font-semibold">Therapist workspace</p>
              <p className="text-xs text-slate-500">Private care overview</p>
            </div>
            <span className="ml-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </header>

        {/* Welcome banner */}
        <section className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#4f3b83] via-[#7561b6] to-[#9b8bd5] p-7 text-white shadow-xl shadow-violet-100 sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-44 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              YOUR CARE OVERVIEW
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Every check-in tells a story.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
              Review how your patients are feeling between sessions and use
              their reflections to prepare for more meaningful conversations.
            </p>
          </div>
          <div className="relative mt-6 flex flex-wrap items-center gap-3 text-sm sm:absolute sm:bottom-8 sm:right-9 sm:mt-0">
            <span className="rounded-xl bg-white px-4 py-2.5 font-semibold text-violet-800">
              {checkins.length} recent check-ins
            </span>
          </div>
        </section>

        {message && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
            <p className="text-sm text-slate-500">
              Preparing your care overview...
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-3xl border border-white bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/70 sm:p-6"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${stat.color}`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </span>
                    {stat.label !== "Total check-ins" && (
                      <span className="text-sm text-slate-400">/ 10</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{stat.detail}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        stat.label === "Average stress"
                          ? "bg-rose-400"
                          : stat.label === "Average energy"
                            ? "bg-sky-400"
                            : stat.label === "Average mood"
                              ? "bg-emerald-400"
                              : "bg-violet-400"
                      }`}
                      style={{
                        width:
                          stat.label === "Total check-ins"
                            ? `${Math.min(checkins.length * 10, 100)}%`
                            : `${Number(stat.value) > 0 ? (Number(stat.value) / 10) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* Section heading */}
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  PATIENT ACTIVITY
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Recent check-ins
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Self-reported reflections from your assigned patients.
                </p>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
                {filtered.length} records
              </span>
            </div>

            {/* Search */}
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-100">
              <span className="text-lg text-slate-400">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient ID..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-violet-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-3xl">
                  ♡
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {search ? "No matching check-ins" : "Your care overview starts here"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search
                    ? "Try a different patient ID."
                    : "When assigned patients submit their check-ins, their reflections will appear here."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item, index) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm transition duration-200 hover:shadow-lg hover:shadow-violet-100/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${
                            index % 3 === 0
                              ? "bg-violet-100 text-violet-700"
                              : index % 3 === 1
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-sky-100 text-sky-700"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">
                            Patient · {item.patient_id.slice(0, 8)}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(item.created_at).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Check-in received
                      </span>
                    </div>

                    <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.2fr_1fr]">
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                          WELLBEING SNAPSHOT
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            {
                              label: "Mood",
                              value: item.mood_score,
                              icon: "☀",
                              color: "bg-emerald-50 text-emerald-700",
                              bar: "bg-emerald-400",
                            },
                            {
                              label: "Stress",
                              value: item.stress_score,
                              icon: "〰",
                              color: "bg-rose-50 text-rose-700",
                              bar: "bg-rose-400",
                            },
                            {
                              label: "Energy",
                              value: item.energy_score,
                              icon: "✳",
                              color: "bg-sky-50 text-sky-700",
                              bar: "bg-sky-400",
                            },
                          ].map((metric) => (
                            <div
                              key={metric.label}
                              className="rounded-2xl border border-slate-100 p-3 sm:p-4"
                            >
                              <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                                <span>{metric.icon}</span>
                                {metric.label}
                              </div>
                              <p className="mt-3 text-2xl font-bold text-slate-900">
                                {metric.value}
                                <span className="text-xs font-medium text-slate-400">
                                  {" "}/10
                                </span>
                              </p>
                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${metric.bar}`}
                                  style={{
                                    width: `${(metric.value / 10) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 text-xs leading-5 text-slate-400">
                          Scores reflect patient-reported ratings, not a
                          clinical diagnosis.
                        </p>
                      </div>

                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                          PATIENT REFLECTION
                        </p>
                        <div className="h-full min-h-28 rounded-2xl bg-[#f8f6ff] p-5">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-lg text-violet-500">❝</span>
                            <p className="text-sm font-semibold text-violet-900">
                              Personal note
                            </p>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {item.patient_note || "No additional note shared for this check-in."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 px-5 py-5 sm:px-7">
                      <div className="grid gap-4 md:grid-cols-2">
                        <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-violet-700">FOLLOW-UP</p>
                          <p className="mt-3 text-sm font-semibold text-slate-800">
                            {item.ai_followup_question || "No follow-up question was saved."}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {item.ai_followup_answer || "No follow-up response provided."}
                          </p>
                        </section>

                        <section className="rounded-2xl border border-slate-100 bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SESSION PREPARATION</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Create a short brief from this check-in's recorded answers. Use it as conversation support, not as a diagnosis.
                          </p>
                          <button
                            type="button"
                            onClick={() => setPreparedCheckinId(preparedCheckinId === item.id ? null : item.id)}
                            className="mt-4 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800"
                          >
                            {preparedCheckinId === item.id ? "Hide session brief" : "Prepare for session"}
                          </button>
                        </section>
                      </div>

                      {preparedCheckinId === item.id && (() => {
                        const brief = buildSessionBrief(item);
                        return (
                          <section className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-bold text-slate-900">Session preparation brief</h4>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">Based on this check-in</span>
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs text-slate-500">Mood score</p>
                                <p className="mt-1 text-xl font-bold text-slate-900">{item.mood_score}/5</p>
                              </div>
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs text-slate-500">Stress score</p>
                                <p className="mt-1 text-xl font-bold text-slate-900">{item.stress_score}/5</p>
                              </div>
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs text-slate-500">Energy score</p>
                                <p className="mt-1 text-xl font-bold text-slate-900">{item.energy_score}/5</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-slate-800">Patient's preferred topic</p>
                              <p className="mt-1 text-sm text-slate-600">{brief.topics.join(", ")}</p>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-slate-800">Suggested discussion points</p>
                              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                                {brief.discussionPoints.map((point) => <li key={point}>{point}</li>)}
                              </ul>
                            </div>
                            {item.ai_followup_answer && (
                              <div className="mt-4">
                                <p className="text-sm font-semibold text-slate-800">Follow-up response to consider</p>
                                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.ai_followup_answer}</p>
                              </div>
                            )}
                            {item.patient_note && (
                              <div className="mt-4">
                                <p className="text-sm font-semibold text-slate-800">Patient's note</p>
                                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.patient_note}</p>
                              </div>
                            )}
                            <p className="mt-5 border-t border-emerald-100 pt-3 text-xs leading-5 text-slate-500">
                              This brief is a simple summary of self-reported information, not an AI-generated clinical assessment or diagnosis.
                            </p>
                          </section>
                        );
                      })()}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 py-6 text-xs text-slate-400">
          <p>Therapy Continuity Companion · A little more context, between sessions.</p>
          <p>Private care workspace · Patient-reported information</p>
        </footer>
      </div>
    </main>
  );
}