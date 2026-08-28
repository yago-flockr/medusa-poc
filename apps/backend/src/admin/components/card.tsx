import { clx, Container, Heading, Text } from "@medusajs/ui"
import { ComponentProps } from "react"
import { optionalField } from "../lib/optional-field"

type CardRootProps = ComponentProps<typeof Container>

const CardRoot = ({ className, ...props }: CardRootProps) => {
  return <Container className={clx("divide-y p-0", className)} {...props} />
}

type CardHeaderProps = ComponentProps<"div">

const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return (
    <div
      className={clx(
        "px-6 py-4 flex items-center justify-between gap-2 flex-wrap",
        className,
      )}
      {...props}
    />
  )
}

type CardTitleProps = ComponentProps<"div"> & {
  title: string
  description?: string
  level?: "h1" | "h2" | "h3"
}

const CardTitle = ({ title, description, level, ...props }: CardTitleProps) => {
  return (
    <div {...props}>
      <Heading level={level}>{title}</Heading>
      {description && (
        <Text size="small" className="text-ui-fg-subtle">
          {description}
        </Text>
      )}
    </div>
  )
}

type CardContentProps = ComponentProps<"div">

const CardContent = ({ className, ...props }: CardContentProps) => {
  return (
    <div
      className={clx("px-6 py-4 grid items-center gap-2", className)}
      {...props}
    />
  )
}

type CardFooterProps = ComponentProps<"div">

const CardFooter = ({ className, ...props }: CardFooterProps) => {
  return (
    <div
      className={clx(
        "px-6 py-4 flex items-center justify-between gap-2 flex-wrap",
        className,
      )}
      {...props}
    />
  )
}

type CardInfoRowProps = ComponentProps<"div">

const CardInfoRow = ({ className, ...props }: CardInfoRowProps) => (
  <CardContent className={clx("text-ui-fg-subtle grid-cols-2", className)} {...props} />
)

type CardInfoLabelProps = ComponentProps<typeof Text>

const CardInfoLabel = (props: CardInfoLabelProps) => (
  <Text size="small" weight="plus" leading="compact" {...props} />
)

type CardInfoTextProps = Omit<ComponentProps<typeof Text>, "children"> & {
  children?: string | null
}

const CardInfoText = ({ className, children, ...props }: CardInfoTextProps) => (
  <Text
    size="small"
    leading="compact"
    className={clx("whitespace-pre-line text-pretty", className)}
    {...props}
  >
    {optionalField(children)}
  </Text>
)

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
  InfoRow: CardInfoRow,
  InfoLabel: CardInfoLabel,
  InfoText: CardInfoText,
}
