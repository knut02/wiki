import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/description.scss"

const Description = (() => {
  const Desc: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const desc = fileData.frontmatter?.description
    if (!desc) return null
    return <p class="front-description">{desc}</p>
  }

  Desc.css = style
  return Desc
}) satisfies QuartzComponentConstructor

export default Description
