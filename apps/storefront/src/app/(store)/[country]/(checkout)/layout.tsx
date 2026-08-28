import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { RiArrowLeftLine } from "@remixicon/react"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative w-full bg-background sm:min-h-screen">
      <div className="h-16 border-b bg-background">
        <nav className="container flex h-full items-center justify-between">
          <LocalizedClientLink
            href="/cart"
            className="flex flex-1 basis-0 items-center gap-x-2 text-sm font-medium text-muted-foreground uppercase hover:text-foreground"
            data-testid="back-to-cart-link"
          >
            <RiArrowLeftLine size={16} />
            <span className="mt-px hidden sm:block">
              Back to shopping cart
            </span>
            <span className="mt-px block sm:hidden">Back</span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="text-lg font-semibold uppercase text-muted-foreground hover:text-foreground"
            data-testid="store-link"
          >
            Store
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
