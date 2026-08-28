"use client"

import { resetOnboardingState } from "@/store/lib/data/onboarding"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <Card className="h-full w-full max-w-4xl bg-muted">
      <div className="center flex flex-col gap-y-4 p-4 md:items-center">
        <span className="text-xl">
          Your test order was successfully created! 🎉
        </span>
        <span className="text-sm text-muted-foreground">
          You can now complete setting up your store in the admin.
        </span>
        <Button
          className="w-fit"
          size="lg"
          onClick={() => resetOnboardingState(orderId)}
        >
          Complete setup in admin
        </Button>
      </div>
    </Card>
  )
}

export default OnboardingCta
