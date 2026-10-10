"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

const questions = [
  { q: "How has your mood been today?", subtitle: "Take a moment to check in with yourself.", options: ["Very low", "Low", "Okay", "Good", "Very good"], icons: ["🌧️", "🌥️", "☁️", "🌤️", "☀️"] },
  { q: "How stressed have you felt?", subtitle: "Think about the pressure you've experienced.", options: ["Not at all", "A little", "Moderately", "Very", "Extremely"], icons: ["🌿", "🙂", "😐", "😣", "🌪️"] },
  { q: "How would you rate your energy?", subtitle: "Notice the energy you have today.", options: ["Very low", "Low", "Moderate", "High", "Very high"], icons: ["🪫", "🔋", "🌱", "✨", "⚡"] },
  { q: "How well did you sleep recently?", subtitle: "Rest is an important part of wellbeing.", options: ["Very poorly", "Poorly", "Okay", "Well", "Very well"], icons: ["🌑", "🌙", "☁️", "🌜", "🌟"] },
  { q: "How manageable were daily tasks?", subtitle: "There's no right or wrong answer.", options: ["Not manageable", "Difficult", "Somewhat", "Manageable", "Very manageable"], icons: ["🪨", "🌧️", "🌱", "🌼", "🏆"] },
  { q: "How connected did you feel to others?", subtitle: "Consider your interactions and relationships.", options: ["Not at all", "A little", "Somewhat", "Connected", "Very connected"], icons: ["🌙", "🫧", "🌱", "🤝", "💜"] },
  { q: "How well could you focus?", subtitle: "Think about your attention and concentration.", options: ["Not at all", "A little", "Somewhat", "Well", "Very well"], icons: ["🌫️", "💭", "🌿", "🎯", "✨"] },
  { q: "How often did you feel overwhelmed?", subtitle: "Notice how often things felt like too much.", options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"], icons: ["🌼", "🌤️", "☁️", "🌧️", "⛈️"] },
  { q: "How supported have you felt?", subtitle: "Think about the support available to you.", options: ["Not at all", "A little", "Somewhat", "Supported", "Very supported"], icons: ["🫧", "🌱", "🤍", "🫶", "💜"] },
  { q: "What would you most like to discuss?", subtitle: "Help shape the conversation at your next session.", options: ["Mood and emotions", "Stress and coping", "Sleep and energy", "Relationships", "Daily challenges"], icons: ["💜", "🌿", "🌙", "🤝", "🌱"] },
];

export default function PatientCheckinPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [followupStep, setFollowupStep] = useState(false);
  const [followupAnswer, setFollowupAnswer] = useState("");

  const followupQuestion = (() => {
    if (
      answers[9] === "Stress and coping" ||
      answers[1] === "Very" ||
      answers[1] === "Extremely"
    ) {
      return "What has been contributing most to your stress lately, and what has helped even a little?";
    }

    if (
      answers[9] === "Sleep and energy" ||
      answers[2] === "Very low" ||
      answers[2] === "Low"
    ) {
      return "What has your sleep or energy been like, and how has it affected your day?";
    }

    if (
      answers[9] === "Relationships" ||
      answers[5] === "Not at all" ||
      answers[5] === "A little"
    ) {
      return "Is there a relationship or connection you would like to talk about, or support you wish you had?";
    }

    if (
      answers[9] === "Daily challenges" ||
      answers[4] === "Not manageable" ||
      answers[4] === "Difficult"
    ) {
      return "Which part of your day has felt hardest to manage recently?";
    }

    return "What feels most important for your therapist to understand about how you have been feeling?";
  })();

  const answered = Object.keys(answers).length;
  const progress = (answered / questions.length) * 100;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (questions.some((_, i) => !answers[i])) {
      setMessage("A little more to go — please answer all 10 questions.");
      return;
    }

    if (!followupStep) {
      setFollowupStep(true);
      setMessage("");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error: authError } = await supabase.auth.getUser();

    if (authError || !data.user) {
      setMessage("Please sign in before submitting your check-in.");
      setLoading(false);
      return;
    }

    const moodScore = questions[0].options.indexOf(answers[0]) + 1;
    const stressScore = questions[1].options.indexOf(answers[1]) + 1;
    const energyScore = questions[2].options.indexOf(answers[2]) + 1;

    const { error } = await supabase.from("checkins").insert({
      patient_id: data.user.id,
      mood_score: moodScore,
      stress_score: stressScore,
      energy_score: energyScore,
      patient_note: note.trim() || null,
      questionnaire_answers: answers,
      ai_followup_question: followupQuestion,
      ai_followup_answer: followupAnswer.trim() || null,
      ai_structured_summary:
        `Mood: ${answers[0]}. Stress: ${answers[1]}. Energy: ${answers[2]}. ` +
        `Sleep: ${answers[3]}. Daily tasks: ${answers[4]}. ` +
        `Social connection: ${answers[5]}. Focus: ${answers[6]}. ` +
        `Feeling overwhelmed: ${answers[7]}. Support: ${answers[8]}. ` +
        `Next session topic: ${answers[9]}. ` +
        `Follow-up question: ${followupQuestion} ` +
        `Follow-up answer: ${followupAnswer.trim() || "No additional answer provided."}`,
    });

    if (error) {
      setMessage("Couldn't save your check-in: " + error.message);
    } else {
      setSubmitted(true);
      setAnswers({});
      setNote("");
      setFollowupAnswer("");
      setFollowupStep(false);
      setMessage("");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f7fc] text-slate-800">
      <div className="pointer-events-none fixed -left-40 top-20 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none fixed -right-40 bottom-0 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-7 sm:py-10">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-700 to-purple-400 text-2xl text-white shadow-lg shadow-violet-200">
              ✳
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-violet-900">
                THERAPY CONTINUITY
              </p>
              <p className="text-xs tracking-[0.2em] text-slate-500">
                COMPANION
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2.5 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Your personal space
          </div>
        </header>

        {submitted ? (
          <section className="overflow-hidden rounded-[32px] border border-white bg-white text-center shadow-xl shadow-violet-100/70">
            <div className="bg-gradient-to-br from-[#59438d] to-[#9a87cf] px-6 py-14 text-white sm:py-20">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/15 text-4xl">
                ✓
              </div>
              <p className="mt-6 text-xs font-semibold tracking-[0.25em] text-violet-100">
                CHECK-IN COMPLETE
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                You showed up for yourself.
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-violet-100">
                Thank you for taking a moment to reflect. Your check-in has
                been saved for your therapist to review.
              </p>
            </div>

            <div className="p-7 sm:p-10">
              <div className="mx-auto mb-6 max-w-sm rounded-2xl bg-[#f7f5ff] p-5">
                <p className="text-2xl">🌱 💜 ☀️</p>
                <p className="mt-3 font-semibold text-slate-800">
                  Small steps still count.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Be gentle with yourself today.
                </p>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setFollowupStep(false);
                  setFollowupAnswer("");
                }}
                className="rounded-2xl bg-violet-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
              >
                Back to check-in
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="relative mb-8 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#493575] via-[#6f58a7] to-[#9582ca] p-7 text-white shadow-xl shadow-violet-200/50 sm:p-10">
              <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[30px] border-white/10" />
              <div className="pointer-events-none absolute bottom-0 right-36 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
                  <span>✦</span> A MOMENT FOR YOU
                </span>

                <h1 className="mt-5 max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
                  Check in with yourself.
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-7 text-violet-100 sm:text-base">
                  No pressure. No perfect answers. Just a little space to
                  reflect on how things have been feeling.
                </p>

                <div className="mt-8 max-w-lg rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="font-semibold">YOUR PROGRESS</span>
                    <span>
                      {answered} OF 10 ANSWERED
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-emerald-300 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-3 text-xs text-violet-100">
                    {answered === 10
                      ? followupStep
                        ? "One optional reflection before saving."
                        : "All done — you're ready to continue."
                      : `${10 - answered} ${
                          10 - answered === 1 ? "question" : "questions"
                        } left. Take your time.`}
                  </p>
                </div>
              </div>
            </section>

            <form onSubmit={handleSubmit}>
              {!followupStep ? (
                <>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                        YOUR REFLECTION
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        How are you doing?
                      </h2>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
                      About 2 minutes
                    </span>
                  </div>

                  <div className="space-y-5">
                    {questions.map((item, i) => (
                      <section
                        key={item.q}
                        className="rounded-[26px] border border-white bg-white/90 p-5 shadow-sm transition duration-200 hover:shadow-md hover:shadow-violet-100/70 sm:p-7"
                      >
                        <div className="mb-5 flex items-start gap-4">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                              answers[i]
                                ? "bg-violet-600 text-white"
                                : "bg-violet-50 text-violet-700"
                            }`}
                          >
                            {answers[i] ? "✓" : String(i + 1).padStart(2, "0")}
                          </div>

                          <div className="pt-0.5">
                            <h3 className="font-bold leading-6 text-slate-900">
                              {item.q}
                            </h3>
                            <p className="mt-1 text-sm leading-5 text-slate-500">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {item.options.map((option, j) => {
                            const selected = answers[i] === option;

                            return (
                              <label
                                key={option}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-sm transition duration-150 ${
                                  selected
                                    ? "border-violet-400 bg-violet-50 text-violet-900 ring-2 ring-violet-100"
                                    : "border-slate-100 bg-white text-slate-600 hover:border-violet-200 hover:bg-[#faf9ff]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${i}`}
                                  value={option}
                                  checked={selected}
                                  onChange={() => {
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [i]: option,
                                    }));
                                    setMessage("");
                                  }}
                                  className="sr-only"
                                />

                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                                  {item.icons[j]}
                                </span>

                                <span className="flex-1 font-medium">
                                  {option}
                                </span>

                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                    selected
                                      ? "border-violet-600 bg-violet-600 text-white"
                                      : "border-slate-200 text-transparent"
                                  }`}
                                >
                                  ✓
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>

                  <section className="mt-5 rounded-[26px] border border-white bg-white p-5 shadow-sm sm:p-7">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                        💌
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          Anything else on your mind?
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          Share something you'd like your therapist to know.
                          This is optional.
                        </p>
                      </div>
                    </div>

                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-[#fbfaff] p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      placeholder="Write whatever feels important to you..."
                    />

                    <p className="mt-2 text-right text-xs text-slate-400">
                      {note.length}/2000
                    </p>
                  </section>
                </>
              ) : (
                <section className="rounded-[26px] border border-white bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
                      💬
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                        ONE LAST REFLECTION
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        Let's explore that a little.
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        This question is based on your responses. Answer only
                        what you're comfortable sharing.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-violet-50 p-5">
                    <p className="font-semibold leading-7 text-violet-950">
                      {followupQuestion}
                    </p>
                  </div>

                  <textarea
                    value={followupAnswer}
                    onChange={(e) => setFollowupAnswer(e.target.value)}
                    rows={5}
                    maxLength={2000}
                    className="mt-4 w-full resize-y rounded-2xl border border-slate-200 bg-[#fbfaff] p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    placeholder="Write your response here... (optional)"
                  />

                  <p className="mt-2 text-right text-xs text-slate-400">
                    {followupAnswer.length}/2000
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setFollowupStep(false);
                      setMessage("");
                    }}
                    className="mt-4 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                  >
                    ← Back to answers
                  </button>
                </section>
              )}

              {message && (
                <p
                  role="status"
                  className="mt-5 break-words rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                >
                  {message}
                </p>
              )}

              <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                <p className="text-sm leading-6 text-violet-900">
                  <span className="mr-2">🔒</span>
                  Your answers help provide context for your therapy sessions.
                  Share only what you're comfortable sharing.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-700 to-purple-600 p-4 font-semibold text-white shadow-lg shadow-violet-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-200 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Saving your reflection..."
                  : followupStep
                    ? "Save my check-in"
                    : "Continue to follow-up"}
                {!loading && <span>→</span>}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                This reflection is not a validated clinical assessment or
                diagnosis, and does not replace professional care.
              </p>
            </form>
          </>
        )}

        <footer className="mt-10 border-t border-violet-100 py-6 text-center text-xs text-slate-400">
          Therapy Continuity Companion · Take it one day at a time. 💜
        </footer>
      </div>
    </main>
  );
}