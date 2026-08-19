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
          "text-center flex flex-col items-center justify-center gap-4 max-w-80",
          className,
        )}
        ref={ref}
        {...props}
      >
        <TitleSubtitle
          title="Generated one-time password"
          description="Copy it now, it won't be shown again. You can generate a new one anytime."
        />
        <Command className="gap-4 w-full">
          <Text>{otp}</Text>
          <Command.Copy content={otp} />
        </Command>
      </div>
    )
  },
)
