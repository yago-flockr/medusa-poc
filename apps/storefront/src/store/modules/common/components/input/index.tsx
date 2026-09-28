"use client"

import { Input as InputPrimitive } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
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
      <Field>
        <FieldLabel htmlFor={name}>
          {topLabel ?? label}
          {required && <span className="text-destructive">*</span>}
        </FieldLabel>
        <div className="relative flex w-full items-center">
          <InputPrimitive
            id={name}
            type={inputType}
            name={name}
            required={required}
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
      </Field>
    )
  },
)

Input.displayName = "Input"

export default Input
