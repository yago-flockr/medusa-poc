import SkeletonOrderConfirmedHeader from "@/store/modules/skeletons/components/skeleton-order-confirmed-header"
import SkeletonOrderInformation from "@/store/modules/skeletons/components/skeleton-order-information"
import SkeletonOrderItems from "@/store/modules/skeletons/components/skeleton-order-items"

const SkeletonOrderConfirmed = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] animate-pulse bg-muted/30 py-6">
      <div className="container flex justify-center">
        <div className="h-full w-full max-w-4xl bg-background p-10">
          <SkeletonOrderConfirmedHeader />

          <SkeletonOrderItems />

          <SkeletonOrderInformation />
        </div>
      </div>
    </div>
  )
}

export default SkeletonOrderConfirmed
