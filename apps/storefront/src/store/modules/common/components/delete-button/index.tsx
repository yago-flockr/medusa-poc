import { deleteLineItem } from "@/store/lib/data/cart"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { RiDeleteBinLine } from "@remixicon/react"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((_err) => {
      setIsDeleting(false)
    })
  }

  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <button
        className="flex cursor-pointer gap-x-1 text-muted-foreground hover:text-foreground"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? <Spinner /> : <RiDeleteBinLine size={16} />}
        <span>{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
