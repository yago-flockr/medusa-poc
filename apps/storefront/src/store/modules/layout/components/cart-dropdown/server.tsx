import { retrieveCart } from "@/store/lib/data/cart"
import CartDropdown from "./"

export default async function CartDropdownServer() {
  const cart = await retrieveCart().catch(() => null)

  return <CartDropdown cart={cart} />
}
