
"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("Unable to sign in. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setMessage("Could not load your account role. Please check your profile.");
      setLoading(false);
      return;
    }

    window.location.href =
      profile.role === "therapist"
        ? "/therapist/dashboard"
        : "/patient/checkin";
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f5ff] px-4 py-10 text-slate-800 sm:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-1/4 h-40 w-40 rounded-full bg-pink-100/60 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/80 bg-white/80 shadow-2xl shadow-violet-200/40 backdrop-blur-xl lg:min-h-[620px] lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#35265f] via-[#6046a0] to-[#8c78c9] p-10 text-white lg:flex xl:p-12">
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full border border-white/15" />
          <div className="absolute -right-8 top-32 h-48 w-48 rounded-full border border-white/15" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl">
              ✳
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">THERAPY CONTINUITY</p>
              <p className="text-xs tracking-[0.25em] text-violet-200">COMPANION</p>
            </div>
          </div>

          <div className="relative my-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-4xl">
              ♡
            </div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-violet-200">
              A LITTLE MORE CONTEXT
            </p>
            <h1 className="max-w-sm text-4xl font-semibold leading-tight xl:text-5xl">
              Care that continues between sessions.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-violet-100">
              A thoughtful space to reflect on your wellbeing and help make
              every therapy conversation more informed.
            </p>

            <div className="mt-9 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/20 text-xl">
                ✦
              </div>
              <div>
                <p className="text-sm font-semibold">Your wellbeing matters.</p>
                <p className="mt-1 text-xs text-violet-200">
                  One check-in at a time.
                </p>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-violet-200">
            A supportive companion for the journey.
          </p>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-10 xl:px-14">
          <form onSubmit={handleLogin} className="w-full max-w-sm">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-400 text-2xl text-white shadow-lg shadow-violet-200">
                ✳
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-violet-800">
                  THERAPY CONTINUITY
                </p>
                <p className="text-xs tracking-widest text-slate-500">COMPANION</p>
              </div>
            </div>

            <div className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                YOUR SPACE, YOUR PACE
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back<span className="text-violet-600">.</span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Pick up where you left off. We're glad you're here.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 hover:border-violet-200 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 pr-16 text-sm outline-none transition placeholder:text-slate-400 hover:border-violet-200 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-violet-700 hover:text-violet-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {message && (
                <div
                  role="alert"
                  className="break-words rounded-2xl border border-rose-100 bg-rose-50 p-3.5 text-sm text-rose-700"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-purple-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-200 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing you in..." : "Sign in to your space"}
                {!loading && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            </div>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400">NEW HERE?</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-bold text-violet-700 underline decoration-violet-200 underline-offset-4 transition hover:text-violet-900"
              >
                Create one
              </a>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Your wellbeing is personal. Sign in to access your account.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}