"use client"

import {
  NativeSelect as NativeSelectPrimitive,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { cn } from "@/lib/utils"
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
      <NativeSelectPrimitive
        ref={innerRef}
        className={cn(
          "h-16 w-16",
          isPlaceholder && "text-muted-foreground",
          className,
        )}
        {...props}
      >
        <NativeSelectOption disabled value="">
          {placeholder}
        </NativeSelectOption>
        {children}
      </NativeSelectPrimitive>
    )
  },
)

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
