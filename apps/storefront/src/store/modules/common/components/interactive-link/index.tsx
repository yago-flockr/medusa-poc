import { RiArrowRightUpLine } from "@remixicon/react"
import LocalizedClientLink from "../localized-client-link"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className="group flex items-center gap-x-1"
      href={href}
      onClick={onClick}
      {...props}
    >
      <span className="text-primary">{children}</span>
      <RiArrowRightUpLine
        size={16}
        className="text-primary duration-150 ease-in-out group-hover:rotate-45"
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
