// Static app shell: renders the reader's real layout instantly so the app
// feels fast while settings load, instead of a bare spinner.
const AppShellSkeleton = () => (
  <div className="min-h-dvh bg-background flex flex-col" aria-busy="true" aria-label="جاري التحميل">
    {/* top bar skeleton */}
    <div className="h-14 shrink-0 border-b border-border/40 flex items-center justify-between px-4">
      <div className="w-9 h-9 rounded-xl bg-muted/60 animate-pulse" />
      <div className="w-32 h-4 rounded-full bg-muted/60 animate-pulse" />
      <div className="w-9 h-9 rounded-xl bg-muted/60 animate-pulse" />
    </div>
    {/* progress bar skeleton */}
    <div className="h-1 bg-muted/40">
      <div className="h-full w-1/4 bg-primary/20 animate-pulse" />
    </div>
    {/* page area */}
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl aspect-[3/4] max-h-[70vh] rounded-2xl bg-muted/30 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary/15 border-t-primary/60 rounded-full animate-spin" />
        </div>
      </div>
    </div>
    {/* bottom toolbar skeleton */}
    <div className="h-16 shrink-0 border-t border-border/40 flex items-center justify-center gap-6 px-4">
      {[0,1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-xl bg-muted/60 animate-pulse" />)}
    </div>
  </div>
);

export default AppShellSkeleton;
