import ManifestoHeader from "@/store/modules/about/components/manifesto-header"
import ManifestoPillars from "@/store/modules/about/components/manifesto-pillars"
import ManifestoQuote from "@/store/modules/about/components/manifesto-quote"

export default function AboutTemplate() {
  return (
    <div className="container flex flex-col gap-20">
      <ManifestoHeader />
      <ManifestoPillars />
      <ManifestoQuote />
    </div>
  )
}
