"use client"

import { Thumbnail } from "@/components/ui/thumbnail"
import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeId, setActiveId] = useState(images[0]?.id)

  if (!images.length) {
    return <Thumbnail />
  }

  const activeImage = images.find((image) => image.id === activeId) ?? images[0]

  return (
    <div className="flex flex-col gap-4">
      <Thumbnail src={activeImage.url} alt="" />
      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-4">
          {images.map((image) => (
            <li key={image.id}>
              <button
                type="button"
                aria-label="Show image"
                aria-current={image.id === activeId}
                onClick={() => setActiveId(image.id)}
                className={cn(
                  "block w-full cursor-pointer ring-1 ring-transparent transition-all",
                  image.id === activeImage.id && "ring-foreground",
                )}
              >
                <Thumbnail src={image.url} alt="" ratio="square" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ImageGallery
