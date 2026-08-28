import InteractiveLink from "@/store/modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="flex flex-col items-start justify-center px-2 py-48"
      data-testid="empty-cart-message"
    >
      <h1 className="flex flex-row items-baseline gap-x-2 text-3xl font-normal">
        Cart
      </h1>
      <p className="mt-4 mb-6 max-w-[32rem] text-base text-muted-foreground">
        You don&apos;t have anything in your cart. Let&apos;s change that, use
        the link below to start browsing our products.
      </p>
      <div>
        <InteractiveLink href="/store">Explore products</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
