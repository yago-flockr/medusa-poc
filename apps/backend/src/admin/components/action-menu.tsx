import { EllipsisHorizontal } from "@medusajs/icons"
import { DropdownMenu, IconButton, clx } from "@medusajs/ui"
import { Link } from "react-router-dom"

export type ActionBase = {
  icon: React.ReactNode
  label: string
  disabled?: boolean
}

type ActionLink = {
  to: string
  onClick?: never
} & ActionBase

type ActionButton = {
  onClick: () => void
  to?: never
} & ActionBase

export type Action = ActionLink | ActionButton

export type ActionGroup = {
  actions: Action[]
}

export type ActionMenuProps = {
  groups: ActionGroup[]
}

const ActionMenuItem = ({ icon, label, disabled, onClick, to }: Action) => {
  if (onClick) {
    return (
      <DropdownMenu.Item
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className={clx("[&_svg]:text-ui-fg-subtle flex items-center gap-x-2", {
    "[&_svg]:text-ui-fg-disabled": disabled,
  })}
      >
        {icon}
        <span>{label}</span>
      </DropdownMenu.Item>
    )
  }

  return (
    <DropdownMenu.Item
      asChild
      disabled={disabled}
      className={clx("[&_svg]:text-ui-fg-subtle flex items-center gap-x-2", {
        "[&_svg]:text-ui-fg-disabled": disabled,
      })}
    >
      <Link to={to} onClick={(e) => e.stopPropagation()}>
        {icon}
        <span>{label}</span>
      </Link>
    </DropdownMenu.Item>
  )
}

type ActionMenuGroupProps = ActionGroup & {
  showSeparator: boolean
}

const ActionMenuGroup = ({ actions, showSeparator }: ActionMenuGroupProps) => {
  if (!actions.length) {
    return null
  }

  return (
    <DropdownMenu.Group>
      {actions.map((action, index) => (
        <ActionMenuItem key={index} {...action} />
      ))}
      {showSeparator && <DropdownMenu.Separator />}
    </DropdownMenu.Group>
  )
}

export const ActionMenu = ({ groups }: ActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton size="small" variant="transparent">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {groups.map((group, index) => (
          <ActionMenuGroup
            key={index}
            actions={group.actions}
            showSeparator={index < groups.length - 1}
          />
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
