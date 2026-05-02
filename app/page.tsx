"use client";

import { useState } from "react";
import ScoreDisplay from "./components/ScoreDisplay";
import SkeletonLoader from "./components/SkeletonLoader";

const EXAMPLE_POST = `Humbled and grateful. 🙏

3 years ago I was sleeping on a friend's couch, wondering if I'd ever make it.

Today, I'm thrilled to announce I've been promoted to VP of Strategic Growth Ecosystems at [Company].

I almost didn't share this. But if my story can inspire just ONE person hustling in silence, it's worth it.

The truth? I didn't do this alone. WE did this. My team is everything.

Here's what I learned on this journey:
→ Disruption starts with YOU
→ Leverage your authentic self
→ Synergy isn't a buzzword — it's a lifestyle

Hard work beats talent when talent doesn't work hard. 💪

What's one lesson your biggest failure taught you? Drop it below. ⬇️

#Grateful #Leadership #Growth #Hustle #Blessed`;

interface ScoreResult {
  score: number;
  verdict: string;
  flags: { type: string; quote: string; explanation: string }[];
  rewrite: string;
}

type AppState = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [post, setPost] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleScore() {
    if (!post.trim()) return;
    setState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      const parsed: ScoreResult = JSON.parse(accumulated.trim());
      setResult(parsed);
      setState("done");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setResult(null);
    setPost("");
    setErrorMsg("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 md:py-20 flex flex-col items-center">
      {/* Header — always visible */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-100">
          LinkedIn Cringe Scorer
        </h1>
        <p className="mt-2 text-zinc-400 text-lg">
          Paste a post. Face the truth.
        </p>
      </div>

      {state === "idle" && (
        <div className="w-full max-w-2xl animate-fadeIn">
          <textarea
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder="Paste a LinkedIn post here..."
            rows={10}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-600 p-5 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all"
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleScore}
              disabled={!post.trim()}
              className="flex-1 py-3.5 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-sm hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Score My Post →
            </button>
            <button
              onClick={() => setPost(EXAMPLE_POST)}
              className="px-5 py-3.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-sm font-medium transition-colors"
            >
              Try an example
            </button>
          </div>
        </div>
      )}

      {state === "loading" && <SkeletonLoader />}

      {state === "done" && result && (
        <ScoreDisplay result={result} onReset={handleReset} />
      )}

      {state === "error" && (
        <div className="w-full max-w-2xl animate-fadeIn">
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6 text-center">
            <p className="text-red-400 font-medium mb-1">Something went wrong</p>
            <p className="text-red-500/70 text-sm">{errorMsg}</p>
          </div>
          <button
            onClick={handleReset}
            className="w-full mt-4 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      <footer className="mt-16 text-zinc-700 text-xs text-center">
        Powered by Claude · Not affiliated with LinkedIn
      </footer>
    </main>
  );
}
