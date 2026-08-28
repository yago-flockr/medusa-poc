const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-9/16 w-full bg-muted" />
      <div className="mt-2 flex justify-between text-sm">
        <div className="h-6 w-2/5 bg-muted" />
        <div className="h-6 w-1/5 bg-muted" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
