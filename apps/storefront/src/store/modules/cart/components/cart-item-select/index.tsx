"use client"

import { cn } from "@/lib/utils"
import { RiArrowDownSLine } from "@remixicon/react"
import {
  SelectHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

type NativeSelectProps = {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">

const CartItemSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ placeholder = "Select...", className, children, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [isPlaceholder, setIsPlaceholder] = useState(false)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current,
    )

    useEffect(() => {
      if (innerRef.current && innerRef.current.value === "") {
        setIsPlaceholder(true)
      } else {
        setIsPlaceholder(false)
      }
    }, [innerRef.current?.value])

    return (
      <div
        onFocus={() => innerRef.current?.focus()}
        onBlur={() => innerRef.current?.blur()}
        className={cn(
          "group relative flex items-center rounded-md border bg-background text-sm text-foreground",
          className,
          {
            "text-muted-foreground": isPlaceholder,
          },
        )}
      >
        <select
          ref={innerRef}
          {...props}
          className="h-16 w-16 items-center justify-center appearance-none border-none bg-transparent px-4 outline-none transition-colors duration-150"
        >
          <option disabled value="">
            {placeholder}
          </option>
          {children}
        </select>
        <span className="pointer-events-none absolute flex w-8 justify-end group-hover:animate-pulse">
          <RiArrowDownSLine size={16} />
        </span>
      </div>
    )
  },
)

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
