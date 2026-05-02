"use client";

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
        <div className="text-center mb-8">
          <div className="skeleton h-24 w-32 rounded-xl mx-auto mb-3" />
          <div className="skeleton h-4 w-24 rounded-full mx-auto mb-6" />
          <div className="skeleton h-5 w-3/4 rounded-full mx-auto mb-2" />
          <div className="skeleton h-5 w-1/2 rounded-full mx-auto" />
        </div>
        <div className="skeleton h-3 w-24 rounded-full mb-4" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-800 p-4">
              <div className="skeleton h-4 w-28 rounded-full mb-3" />
              <div className="skeleton h-3 w-full rounded-full mb-2" />
              <div className="skeleton h-3 w-4/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6">
        <div className="skeleton h-3 w-40 rounded-full mb-4" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-3/4 rounded-full" />
        </div>
      </div>
    </div>
  );
}
