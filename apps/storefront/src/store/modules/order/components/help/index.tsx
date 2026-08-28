import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"

const Help = () => {
  return (
    <div className="mt-6">
      <h3 className="font-semibold">Need help?</h3>
      <div className="my-2 text-sm">
        <ul className="flex flex-col gap-y-2">
          <li>
            <LocalizedClientLink href="/contact">Contact</LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact">
              Returns & Exchanges
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
