"use client";

export default function SkeletonLoader() {
  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="text-center pt-2 pb-1 space-y-3">
        <div className="skeleton h-20 w-24 rounded-xl mx-auto" />
        <div className="skeleton h-2.5 w-20 rounded-full mx-auto" />
        <div className="skeleton h-4 w-60 rounded-full mx-auto" />
        <div className="skeleton h-4 w-44 rounded-full mx-auto" />
      </div>

      <hr className="border-gray-100" />

      <div className="space-y-3">
        <div className="skeleton h-2.5 w-28 rounded-full" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 space-y-2">
            <div className="skeleton h-4 w-24 rounded-full" />
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-4/5 rounded-full" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-2">
        <div className="skeleton h-2.5 w-40 rounded-full mb-3" />
        <div className="skeleton h-3.5 w-full rounded-full" />
        <div className="skeleton h-3.5 w-full rounded-full" />
        <div className="skeleton h-3.5 w-3/4 rounded-full" />
      </div>
    </div>
  );
}
