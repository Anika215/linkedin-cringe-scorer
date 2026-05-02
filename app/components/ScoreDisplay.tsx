"use client";

import { useEffect, useRef, useState } from "react";

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

function getScoreColor(score: number): string {
  if (score <= 20) return "text-emerald-400";
  if (score <= 40) return "text-yellow-400";
  if (score <= 60) return "text-orange-400";
  if (score <= 80) return "text-red-500";
  return "text-red-700";
}

function getScoreGlow(score: number): string {
  if (score <= 20) return "shadow-emerald-500/30";
  if (score <= 40) return "shadow-yellow-500/30";
  if (score <= 60) return "shadow-orange-500/30";
  if (score <= 80) return "shadow-red-500/30";
  return "shadow-red-800/40";
}

function getScoreBg(score: number): string {
  if (score <= 20) return "from-emerald-950/50 to-zinc-900";
  if (score <= 40) return "from-yellow-950/50 to-zinc-900";
  if (score <= 60) return "from-orange-950/50 to-zinc-900";
  if (score <= 80) return "from-red-950/50 to-zinc-900";
  return "from-red-950/70 to-zinc-900";
}

function getFlagColor(type: string): string {
  const colors: Record<string, string> = {
    humblebrag: "bg-purple-900/50 text-purple-300 border-purple-700/50",
    fake_vulnerability: "bg-pink-900/50 text-pink-300 border-pink-700/50",
    emoji_abuse: "bg-yellow-900/50 text-yellow-300 border-yellow-700/50",
    humble_flex: "bg-blue-900/50 text-blue-300 border-blue-700/50",
    corporate_inspiration: "bg-cyan-900/50 text-cyan-300 border-cyan-700/50",
    unnecessary_story: "bg-amber-900/50 text-amber-300 border-amber-700/50",
    fake_modesty: "bg-violet-900/50 text-violet-300 border-violet-700/50",
    engagement_bait: "bg-rose-900/50 text-rose-300 border-rose-700/50",
    buzzword_soup: "bg-teal-900/50 text-teal-300 border-teal-700/50",
    overuse_of_we: "bg-indigo-900/50 text-indigo-300 border-indigo-700/50",
  };
  return colors[type] ?? "bg-zinc-800/50 text-zinc-300 border-zinc-600/50";
}

function formatFlagType(type: string): string {
  return type.replace(/_/g, " ");
}

function AnimatedScore({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const duration = 1200;
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return <>{displayed}</>;
}

interface Props {
  result: ScoreResult;
  onReset: () => void;
}

export default function ScoreDisplay({ result, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = `I scored ${result.score}/100 on the LinkedIn Cringe Scorer 😬\n"${result.verdict}"\nCheck yours at linkedin-cringe-scorer.vercel.app`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-fadeIn w-full max-w-2xl mx-auto space-y-6">
      {/* Score card */}
      <div
        className={`rounded-2xl border border-zinc-800 bg-gradient-to-b ${getScoreBg(result.score)} p-8 shadow-2xl ${getScoreGlow(result.score)}`}
      >
        <div className="text-center mb-6">
          <div
            className={`text-8xl font-black tabular-nums leading-none ${getScoreColor(result.score)}`}
          >
            <AnimatedScore target={result.score} />
          </div>
          <div className="text-zinc-400 text-sm mt-1 font-medium tracking-widest uppercase">
            Cringe Score
          </div>
          <p className="mt-4 text-zinc-100 text-lg font-medium leading-snug">
            {result.verdict}
          </p>
        </div>

        {/* Flags */}
        {result.flags.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Flags detected
            </h3>
            <div className="space-y-3">
              {result.flags.map((flag, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${getFlagColor(flag.type)}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20">
                      {formatFlagType(flag.type)}
                    </span>
                  </div>
                  {flag.quote && (
                    <p className="text-sm italic opacity-75 mb-1.5">
                      &ldquo;{flag.quote}&rdquo;
                    </p>
                  )}
                  <p className="text-sm opacity-90">{flag.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rewrite */}
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          The Normal Person Rewrite
        </h3>
        <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
          {result.rewrite}
        </p>
      </div>

      {/* Share */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">
          Share your score
        </p>
        <p className="text-zinc-400 text-sm font-mono leading-relaxed mb-3 select-all">
          {shareText}
        </p>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          {copied ? "Copied!" : "Copy text"}
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-3.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all font-medium"
      >
        Score Another Post
      </button>
    </div>
  );
}
