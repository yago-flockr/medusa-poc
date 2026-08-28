const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-9/16 w-full rounded-lg border bg-muted" />
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="h-4 w-3/5 rounded-sm bg-muted" />
        <div className="h-4 w-1/5 rounded-sm bg-muted" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
