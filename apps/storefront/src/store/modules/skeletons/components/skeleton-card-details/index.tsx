const SkeletonCardDetails = () => {
  return (
    <div className="flex flex-col gap-1 my-4 transition-all duration-150 ease-in-out">
      <div className="mb-1 h-4 w-1/4 animate-pulse rounded-md bg-muted"></div>
      <div className="mt-0 block h-11 w-full animate-pulse appearance-none rounded-md border border-input bg-muted px-4 pt-3 pb-1" />
    </div>
  )
}

export default SkeletonCardDetails
