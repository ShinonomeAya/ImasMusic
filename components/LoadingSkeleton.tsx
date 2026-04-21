export default function LoadingSkeleton() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="container-claude py-8">
        <div className="h-10 w-48 bg-warm-sand rounded-xl mb-6 animate-pulse" />
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-20 bg-warm-sand rounded-lg animate-pulse" />
          <div className="h-10 w-24 bg-warm-sand rounded-lg animate-pulse" />
          <div className="h-10 w-10 bg-warm-sand rounded-lg animate-pulse ml-auto" />
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-ivory rounded-very border border-border-cream animate-pulse">
              <div className="w-10 h-10 bg-warm-sand rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-warm-sand rounded" />
                <div className="h-3 w-32 bg-warm-sand rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
