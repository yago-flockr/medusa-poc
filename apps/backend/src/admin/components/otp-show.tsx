import { clx, Command, Text } from "@medusajs/ui"
import { ComponentProps, forwardRef } from "react"
import { TitleSubtitle } from "./title-subtitle"

export type OtpShowProps = {
  otp: string
} & ComponentProps<"div">

export const OtpShow = forwardRef<HTMLDivElement, OtpShowProps>(
  function FormTitle({ className, otp, ...props }, ref) {
    return (
      <div
        className={clx(
          "text-center flex flex-col items-center justify-center gap-4",
          className,
        )}
        ref={ref}
        {...props}
      >
        <TitleSubtitle
          title="Vendor user created!"
          description="One-time password"
        />
        <Command className="gap-4 w-full max-w-96">
          <Text>{otp}</Text>
          <Command.Copy content={otp} />
        </Command>
        <Text size="small" className="text-ui-fg-subtle max-w-64 text-center">
          Copy it now, it won't be shown again. You can generate a new one
          anytime.
        </Text>
      </div>
    )
  },
)
