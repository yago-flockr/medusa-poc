import { Input as InputPrimitive } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useState } from "react"

import { RiEyeLine, RiEyeOffLine } from "@remixicon/react"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { type, name, label, touched: _touched, required, topLabel, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputType = type === "password" && showPassword ? "text" : type

    return (
      <div className="flex w-full flex-col gap-1.5">
        <Label htmlFor={name}>
          {topLabel ?? label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative flex w-full items-center">
          <InputPrimitive
            id={name}
            type={inputType}
            name={name}
            required={required}
            className="h-11 rounded-md"
            {...props}
            ref={ref}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <RiEyeLine size={18} />
              ) : (
                <RiEyeOffLine size={18} />
              )}
            </button>
          )}
        </div>
      </div>
    )
  },
)

Input.displayName = "Input"

export default Input
