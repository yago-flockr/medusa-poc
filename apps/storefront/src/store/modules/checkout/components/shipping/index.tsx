"use client"
import { setShippingMethod } from "@/store/lib/data/cart"
import { calculatePriceForShippingOption } from "@/store/lib/data/fulfillment"
import type { VendorShippingOption } from "@/store/lib/data/fulfillment"
import { convertToLocale } from "@/store/lib/util/money"
import ErrorMessage from "@/store/modules/checkout/components/error-message"
import Divider from "@/store/modules/common/components/divider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup } from "@/components/ui/radio-group"
import { RiCheckboxCircleFill, RiLoader4Line } from "@remixicon/react"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

// Options with no vendor (e.g. a store-level pickup option) are grouped
// under this key so every group — vendor-owned or not — goes through the
// same "one radio group, one selection" logic.
const UNGROUPED_KEY = "__UNGROUPED"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingOptions: VendorShippingOption[] | null
}

type FulfillmentSetInfo = {
  service_zone?: {
    fulfillment_set?: {
      type?: string
      location?: { address: HttpTypes.StoreCartAddress }
    }
  }
}

function formatAddress(address: HttpTypes.StoreCartAddress) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

function groupKeyFor(option: VendorShippingOption) {
  return option.vendor?.id ?? UNGROUPED_KEY
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingOptions,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)

  const initialSelectionByGroup = () => {
    const selection: Record<string, string> = {}
    for (const method of cart.shipping_methods ?? []) {
      const option = availableShippingOptions?.find(
        (o) => o.id === method.shipping_option_id,
      )
      if (option) {
        selection[groupKeyFor(option)] = option.id
      }
    }
    return selection
  }

  const [selectedByGroup, setSelectedByGroup] = useState<
    Record<string, string>
  >(initialSelectionByGroup)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const _pickupMethods = availableShippingOptions?.filter(
    (sm) =>
      (sm as unknown as FulfillmentSetInfo).service_zone?.fulfillment_set
        ?.type === "pickup",
  )

  const _shippingMethods = availableShippingOptions?.filter(
    (sm) =>
      (sm as unknown as FulfillmentSetInfo).service_zone?.fulfillment_set
        ?.type !== "pickup",
  )

  const hasPickupOptions = !!_pickupMethods?.length

  const vendorGroups = new Map<string, VendorShippingOption[]>()
  const ungroupedMethods: VendorShippingOption[] = []

  for (const option of _shippingMethods ?? []) {
    if (option.vendor) {
      const group = vendorGroups.get(option.vendor.id) ?? []
      group.push(option)
      vendorGroups.set(option.vendor.id, group)
    } else {
      ungroupedMethods.push(option)
    }
  }

  const requiredGroupKeys = [
    ...vendorGroups.keys(),
    ...(ungroupedMethods.length ? [UNGROUPED_KEY] : []),
  ]
  const everyGroupHasASelection = requiredGroupKeys.every(
    (key) => !!selectedByGroup[key],
  )

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => {
              if (p.value?.id) {
                pricesMap[p.value.id] = p.value.amount ?? 0
              }
            })

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      } else {
        setIsLoadingPrices(false)
      }
    } else {
      setIsLoadingPrices(false)
    }

    if (
      _pickupMethods?.some(
        (m) => selectedByGroup[UNGROUPED_KEY] === m.id,
      )
    ) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingOptions])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    groupKey: string,
    id: string,
    variant: "shipping" | "pickup",
  ) => {
    setError(null)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    const previousId = selectedByGroup[groupKey]
    setIsLoading(true)
    setSelectedByGroup((prev) => ({ ...prev, [groupKey]: id }))

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setSelectedByGroup((prev) => ({ ...prev, [groupKey]: previousId }))
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const renderOption = (
    option: VendorShippingOption,
    groupKey: string,
    selectedId: string | undefined,
  ) => {
    const isDisabled =
      option.price_type === "calculated" &&
      !isLoadingPrices &&
      typeof calculatedPricesMap[option.id] !== "number"

    return (
      <RadioPrimitive.Root
        key={option.id}
        value={option.id}
        data-testid="delivery-option-radio"
        disabled={isDisabled}
        className={cn(
          "mb-2 flex cursor-pointer items-center justify-between rounded-md border px-8 py-4 text-sm hover:shadow-sm",
          option.id === selectedId && "border-primary",
          isDisabled && "cursor-not-allowed hover:shadow-none",
        )}
      >
        <div className="flex items-center gap-x-4">
          <span className="flex size-4 items-center justify-center rounded-full border border-input">
            <RadioPrimitive.Indicator className="size-2 rounded-full bg-primary" />
          </span>
          <span>{option.name}</span>
        </div>
        <span className="justify-self-end text-foreground">
          {option.price_type === "flat" ? (
            convertToLocale({
              amount: option.amount!,
              currency_code: cart?.currency_code,
            })
          ) : calculatedPricesMap[option.id] ? (
            convertToLocale({
              amount: calculatedPricesMap[option.id],
              currency_code: cart?.currency_code,
            })
          ) : isLoadingPrices ? (
            <RiLoader4Line className="animate-spin" />
          ) : (
            "-"
          )}
        </span>
      </RadioPrimitive.Root>
    )
  }

  return (
    <div className="bg-background">
      <div className="mb-6 flex flex-row items-center justify-between">
        <h2
          className={cn(
            "flex flex-row items-baseline gap-x-2 text-2xl font-medium",
            !isOpen &&
              cart.shipping_methods?.length === 0 &&
              "pointer-events-none opacity-50 select-none",
          )}
        >
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <RiCheckboxCircleFill className="text-success" />
          )}
        </h2>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <button
              onClick={handleEdit}
              className="text-primary hover:text-primary/80"
              data-testid="edit-delivery-button"
            >
              Edit
            </button>
          )}
      </div>
      {isOpen ? (
        <>
          {[...vendorGroups.entries()].map(([vendorId, options]) => (
            <div className="grid" key={vendorId}>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  Shipping from {options[0].vendor?.name}
                </span>
                <span className="mb-4 text-muted-foreground">
                  How would you like this part of your order delivered
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <div className="pt-2 pb-8 md:pt-0">
                  <RadioGroup
                    value={selectedByGroup[vendorId] ?? null}
                    onValueChange={(v) => {
                      if (v) {
                        return handleSetShippingMethod(
                          vendorId,
                          v as string,
                          "shipping",
                        )
                      }
                    }}
                  >
                    {options.map((option) =>
                      renderOption(option, vendorId, selectedByGroup[vendorId]),
                    )}
                  </RadioGroup>
                </div>
              </div>
            </div>
          ))}

          {!!ungroupedMethods.length && (
            <div className="grid">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  Shipping method
                </span>
                <span className="mb-4 text-muted-foreground">
                  How would you like you order delivered
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <div className="pt-2 pb-8 md:pt-0">
                  {hasPickupOptions && (
                    <RadioGroup
                      value={showPickupOptions}
                      onValueChange={(_value) => {
                        const id = _pickupMethods.find(
                          (option) => !option.insufficient_inventory,
                        )?.id

                        if (id) {
                          handleSetShippingMethod(UNGROUPED_KEY, id, "pickup")
                        }
                      }}
                    >
                      <RadioPrimitive.Root
                        value={PICKUP_OPTION_ON}
                        data-testid="delivery-option-radio"
                        className={cn(
                          "mb-2 flex cursor-pointer items-center justify-between rounded-md border px-8 py-4 text-sm hover:shadow-sm",
                          showPickupOptions === PICKUP_OPTION_ON &&
                            "border-primary",
                        )}
                      >
                        <div className="flex items-center gap-x-4">
                          <span className="flex size-4 items-center justify-center rounded-full border border-input">
                            <RadioPrimitive.Indicator className="size-2 rounded-full bg-primary" />
                          </span>
                          <span>Pick up your order</span>
                        </div>
                        <span className="justify-self-end text-foreground">
                          -
                        </span>
                      </RadioPrimitive.Root>
                    </RadioGroup>
                  )}
                  <RadioGroup
                    value={selectedByGroup[UNGROUPED_KEY] ?? null}
                    onValueChange={(v) => {
                      if (v) {
                        return handleSetShippingMethod(
                          UNGROUPED_KEY,
                          v as string,
                          "shipping",
                        )
                      }
                    }}
                  >
                    {ungroupedMethods.map((option) =>
                      renderOption(
                        option,
                        UNGROUPED_KEY,
                        selectedByGroup[UNGROUPED_KEY],
                      ),
                    )}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {showPickupOptions === PICKUP_OPTION_ON && (
            <div className="grid">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Store</span>
                <span className="mb-4 text-muted-foreground">
                  Choose a store near you
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <div className="pt-2 pb-8 md:pt-0">
                  <RadioGroup
                    value={selectedByGroup[UNGROUPED_KEY] ?? null}
                    onValueChange={(v) => {
                      if (v) {
                        return handleSetShippingMethod(
                          UNGROUPED_KEY,
                          v as string,
                          "pickup",
                        )
                      }
                    }}
                  >
                    {_pickupMethods?.map((option) => {
                      return (
                        <RadioPrimitive.Root
                          key={option.id}
                          value={option.id}
                          disabled={option.insufficient_inventory}
                          data-testid="delivery-option-radio"
                          className={cn(
                            "mb-2 flex cursor-pointer items-center justify-between rounded-md border px-8 py-4 text-sm hover:shadow-sm",
                            option.id === selectedByGroup[UNGROUPED_KEY] &&
                              "border-primary",
                            option.insufficient_inventory &&
                              "cursor-not-allowed hover:shadow-none",
                          )}
                        >
                          <div className="flex items-start gap-x-4">
                            <span className="flex size-4 items-center justify-center rounded-full border border-input">
                              <RadioPrimitive.Indicator className="size-2 rounded-full bg-primary" />
                            </span>
                            <div className="flex flex-col">
                              <span>{option.name}</span>
                              <span className="text-muted-foreground">
                                {formatAddress(
                                  (option as unknown as FulfillmentSetInfo)
                                    .service_zone?.fulfillment_set?.location
                                    ?.address as HttpTypes.StoreCartAddress,
                                )}
                              </span>
                            </div>
                          </div>
                          <span className="justify-self-end text-foreground">
                            {convertToLocale({
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })}
                          </span>
                        </RadioPrimitive.Root>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isLoading || !everyGroupHasASelection}
              data-testid="submit-delivery-option-button"
            >
              {isLoading ? "Loading..." : "Continue to payment"}
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="text-sm">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-y-2">
                {cart.shipping_methods!.map((method) => (
                  <div key={method.id} className="flex w-1/3 flex-col">
                    <span className="mb-1 font-medium text-foreground">
                      {availableShippingOptions?.find(
                        (o) => o.id === method.shipping_option_id,
                      )?.vendor?.name ?? "Method"}
                    </span>
                    <span className="text-muted-foreground">
                      {method.name}{" "}
                      {convertToLocale({
                        amount: method.amount!,
                        currency_code: cart?.currency_code,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
