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

interface Flag {
  type: string;
  quote: string;
  explanation: string;
}

interface ScoreResult {
  score: number;
  verdict: string;
  flags: Flag[];
  rewrite: string;
}

type AppState = "idle" | "loading" | "done" | "error";

const FLAG_HIGHLIGHTS: Record<string, { base: string; active: string }> = {
  humblebrag:            { base: "bg-purple-100",  active: "bg-purple-200" },
  fake_vulnerability:    { base: "bg-pink-100",    active: "bg-pink-200" },
  emoji_abuse:           { base: "bg-amber-100",   active: "bg-amber-200" },
  humble_flex:           { base: "bg-blue-100",    active: "bg-blue-200" },
  corporate_inspiration: { base: "bg-teal-100",    active: "bg-teal-200" },
  unnecessary_story:     { base: "bg-orange-100",  active: "bg-orange-200" },
  fake_modesty:          { base: "bg-violet-100",  active: "bg-violet-200" },
  engagement_bait:       { base: "bg-rose-100",    active: "bg-rose-200" },
  buzzword_soup:         { base: "bg-emerald-100", active: "bg-emerald-200" },
  overuse_of_we:         { base: "bg-indigo-100",  active: "bg-indigo-200" },
};

function buildSegments(text: string, flags: Flag[]) {
  const ranges: { start: number; end: number; type: string }[] = [];
  for (const flag of flags) {
    if (!flag.quote) continue;
    const idx = text.indexOf(flag.quote);
    if (idx !== -1) ranges.push({ start: idx, end: idx + flag.quote.length, type: flag.type });
  }
  ranges.sort((a, b) => a.start - b.start);

  const segments: { text: string; type: string | null }[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) segments.push({ text: text.slice(cursor, range.start), type: null });
    segments.push({ text: text.slice(range.start, range.end), type: range.type });
    cursor = range.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), type: null });
  return segments;
}

export default function Home() {
  const [post, setPost] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeFlag, setActiveFlag] = useState<string | null>(null);

  async function handleScore() {
    if (!post.trim()) return;
    setState("loading");
    setResult(null);
    setErrorMsg("");
    setActiveFlag(null);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

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
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setResult(null);
    setPost("");
    setErrorMsg("");
    setActiveFlag(null);
  }

  const segments = result ? buildSegments(post, result.flags) : null;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <header className="flex-none flex items-center justify-between px-6 h-14 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-bold tracking-tight text-gray-900">LinkedIn Cringe Scorer</h1>
          <span className="text-gray-200">|</span>
          <p className="text-sm text-gray-400">Paste a post. Face the truth.</p>
        </div>
        <span className="text-xs text-gray-300">Powered by Claude</span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className="w-1/2 flex flex-col border-r border-gray-100">
          <div className="flex-none flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Your Post</span>
            {state === "done" && (
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium"
              >
                ← Start over
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {state === "idle" || state === "error" ? (
              <textarea
                value={post}
                onChange={(e) => setPost(e.target.value)}
                placeholder="Paste a LinkedIn post here..."
                className="w-full h-full min-h-[200px] resize-none text-sm leading-7 text-gray-800 placeholder-gray-300 focus:outline-none"
              />
            ) : state === "loading" ? (
              <div className="text-sm leading-7 text-gray-300 whitespace-pre-wrap">{post}</div>
            ) : (
              <div className="text-sm leading-7 text-gray-800 whitespace-pre-wrap select-text">
                {segments?.map((seg, i) =>
                  seg.type ? (
                    <span
                      key={i}
                      className={`rounded px-0.5 transition-colors duration-150 cursor-default ${
                        activeFlag === seg.type
                          ? (FLAG_HIGHLIGHTS[seg.type]?.active ?? "bg-gray-200")
                          : (FLAG_HIGHLIGHTS[seg.type]?.base ?? "bg-gray-100")
                      }`}
                      onMouseEnter={() => setActiveFlag(seg.type)}
                      onMouseLeave={() => setActiveFlag(null)}
                    >
                      {seg.text}
                    </span>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </div>
            )}
          </div>

          {(state === "idle" || state === "error") && (
            <div className="flex-none flex gap-2 px-5 py-4 border-t border-gray-100">
              <button
                onClick={handleScore}
                disabled={!post.trim()}
                className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Score this post →
              </button>
              <button
                onClick={() => setPost(EXAMPLE_POST)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 text-sm font-medium transition-colors"
              >
                Try example
              </button>
            </div>
          )}

          {state === "loading" && (
            <div className="flex-none px-5 py-4 border-t border-gray-100 flex items-center gap-2">
              <span className="text-sm text-gray-400 animate-pulse">Analysing your post...</span>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-1/2 overflow-y-auto bg-gray-50/50">
          {state === "idle" && (
            <div className="h-full flex flex-col items-center justify-center text-center px-10">
              <div className="text-5xl mb-5 opacity-30">🧐</div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Results will appear here.<br />Paste a post on the left to get started.
              </p>
            </div>
          )}

          {state === "loading" && <SkeletonLoader />}

          {state === "done" && result && (
            <ScoreDisplay result={result} activeFlag={activeFlag} onHoverFlag={setActiveFlag} />
          )}

          {state === "error" && (
            <div className="p-6">
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                <p className="text-red-600 font-medium text-sm mb-1">Something went wrong</p>
                <p className="text-red-400 text-xs">{errorMsg}</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full mt-3 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
