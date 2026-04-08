export default function FeedLoading() {
  return (
    <main className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="mb-10 flex flex-col gap-3">
          <div className="h-3 w-24 bg-bg-elevated rounded animate-pulse" />
          <div className="h-8 w-48 bg-bg-elevated rounded animate-pulse" />
          <div className="h-4 w-72 bg-bg-elevated rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-bg-elevated border border-border rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="w-full aspect-video bg-bg-surface" />
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 bg-bg-surface rounded" />
                  <div className="h-4 w-24 bg-bg-surface rounded" />
                </div>
                <div className="h-5 w-3/4 bg-bg-surface rounded" />
                <div className="h-4 w-full bg-bg-surface rounded" />
                <div className="h-4 w-2/3 bg-bg-surface rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
