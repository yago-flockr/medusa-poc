"use client"

import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ComponentProps, MouseEvent } from "react"

function getPageNumbers(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages]
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index),
    ]
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages]
}

type PaginationProps = ComponentProps<typeof PaginationRoot> & {
  page: number
  totalPages: number
}

export function Pagination({
  page,
  totalPages,
  className,
  ...props
}: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hrefForPage = (targetPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", targetPage.toString())
    return `${pathname}?${params.toString()}`
  }

  const goToPage = (targetPage: number) => (event: MouseEvent) => {
    event.preventDefault()
    router.push(hrefForPage(targetPage))
  }

  const previousPage = Math.max(page - 1, 1)
  const nextPage = Math.min(page + 1, totalPages)

  return (
    <PaginationRoot className={cn("mt-12", className)} {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hrefForPage(previousPage)}
            onClick={goToPage(previousPage)}
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {getPageNumbers(page, totalPages).map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href={hrefForPage(pageNumber)}
                onClick={goToPage(pageNumber)}
                isActive={pageNumber === page}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={hrefForPage(nextPage)}
            onClick={goToPage(nextPage)}
            aria-disabled={page === totalPages}
            className={
              page === totalPages ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  )
}
