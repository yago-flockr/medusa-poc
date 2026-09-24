export type PricedItem = {
  unit_price?: number | null
  quantity?: number | null
}

export const roundMoney = (amount: number) => Math.round(amount * 100) / 100

export const sumItemsSubtotal = (items: PricedItem[]) =>
  roundMoney(
    items.reduce(
      (total, item) => total + (item.unit_price ?? 0) * (item.quantity ?? 0),
      0,
    ),
  )
