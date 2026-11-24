export function PageSkeleton() {
  return (
    <div aria-hidden="true" className="container-page animate-pulse pt-8 pb-20 md:pt-12">
      <div className="h-4 w-48 rounded bg-paper-deep" />
      <div className="mt-10 grid gap-10 md:grid-cols-12">
        <div className="space-y-5 md:col-span-7">
          <div className="h-4 w-32 rounded bg-paper-deep" />
          <div className="h-16 w-3/4 rounded bg-paper-deep" />
          <div className="h-5 w-full max-w-xl rounded bg-paper-deep" />
          <div className="h-5 w-2/3 rounded bg-paper-deep" />
        </div>
        <div className="aspect-[4/3] rounded-[var(--radius-card)] bg-paper-deep md:col-span-5 md:aspect-[5/6]" />
      </div>
    </div>
  )
}
