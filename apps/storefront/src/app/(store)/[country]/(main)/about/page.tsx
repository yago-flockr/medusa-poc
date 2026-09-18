import { Metadata } from "next"

import AboutTemplate from "@/store/modules/about/templates"

export const metadata: Metadata = {
  title: "About",
  description:
    "Why every house in the catalog is reviewed before it is listed.",
}

export default function AboutPage() {
  return <AboutTemplate />
}
