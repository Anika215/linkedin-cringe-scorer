"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreResult {
  score: number;
  verdict: string;
  flags: { type: string; quote: string; explanation: string }[];
  rewrite: string;
}

interface Props {
  result: ScoreResult;
  activeFlag: string | null;
  onHoverFlag: (type: string | null) => void;
}

const FLAG_PALETTE: Record<string, { card: string; badge: string; ring: string }> = {
  humblebrag:            { card: "bg-purple-50 border-purple-200",   badge: "bg-purple-100 text-purple-700",   ring: "ring-purple-300" },
  fake_vulnerability:    { card: "bg-pink-50 border-pink-200",       badge: "bg-pink-100 text-pink-700",       ring: "ring-pink-300" },
  emoji_abuse:           { card: "bg-amber-50 border-amber-200",     badge: "bg-amber-100 text-amber-700",     ring: "ring-amber-300" },
  humble_flex:           { card: "bg-blue-50 border-blue-200",       badge: "bg-blue-100 text-blue-700",       ring: "ring-blue-300" },
  corporate_inspiration: { card: "bg-teal-50 border-teal-200",       badge: "bg-teal-100 text-teal-700",       ring: "ring-teal-300" },
  unnecessary_story:     { card: "bg-orange-50 border-orange-200",   badge: "bg-orange-100 text-orange-700",   ring: "ring-orange-300" },
  fake_modesty:          { card: "bg-violet-50 border-violet-200",   badge: "bg-violet-100 text-violet-700",   ring: "ring-violet-300" },
  engagement_bait:       { card: "bg-rose-50 border-rose-200",       badge: "bg-rose-100 text-rose-700",       ring: "ring-rose-300" },
  buzzword_soup:         { card: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-300" },
  overuse_of_we:         { card: "bg-indigo-50 border-indigo-200",   badge: "bg-indigo-100 text-indigo-700",   ring: "ring-indigo-300" },
};
const DEFAULT_PALETTE = { card: "bg-gray-50 border-gray-200", badge: "bg-gray-100 text-gray-600", ring: "ring-gray-300" };

function getScoreColor(score: number): string {
  if (score <= 20) return "text-green-500";
  if (score <= 40) return "text-yellow-500";
  if (score <= 60) return "text-orange-500";
  if (score <= 80) return "text-red-500";
  return "text-red-700";
}

function formatFlagType(type: string): string {
  return type.replace(/_/g, " ");
}

function AnimatedScore({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const duration = 1000;
    startRef.current = performance.now();
    function tick(now: number) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return <>{displayed}</>;
}

export default function ScoreDisplay({ result, activeFlag, onHoverFlag }: Props) {
  return (
    <div className="animate-fadeIn p-6 space-y-6">
      <div className="text-center pt-2 pb-1">
        <div className={`text-8xl font-black tabular-nums leading-none tracking-tighter ${getScoreColor(result.score)}`}>
          <AnimatedScore target={result.score} />
        </div>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-2">
          Cringe Score
        </div>
        <p className="mt-4 text-gray-700 text-[15px] font-medium leading-snug max-w-xs mx-auto">
          {result.verdict}
        </p>
      </div>

      <hr className="border-gray-100" />

      {result.flags.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-3">
            Flags detected
          </h3>
          <div className="space-y-2">
            {result.flags.map((flag, i) => {
              const p = FLAG_PALETTE[flag.type] ?? DEFAULT_PALETTE;
              const isActive = activeFlag === flag.type;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 transition-all duration-150 cursor-default ${p.card} ${isActive ? `ring-2 ${p.ring}` : ""}`}
                  onMouseEnter={() => onHoverFlag(flag.type)}
                  onMouseLeave={() => onHoverFlag(null)}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.badge}`}>
                    {formatFlagType(flag.type)}
                  </span>
                  {flag.quote && (
                    <p className="text-xs italic text-gray-400 mt-2 mb-1.5">
                      &ldquo;{flag.quote}&rdquo;
                    </p>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed">{flag.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-3">
          The Normal Person Version
        </h3>
        <p className="text-sm text-gray-600 leading-7 whitespace-pre-wrap">{result.rewrite}</p>
      </div>
    </div>
  );
}
