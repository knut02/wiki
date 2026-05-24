import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

interface Options {
  title?: string
}

const defaultOptions = (cfg: GlobalConfiguration): Options => {
  const translation = i18n(cfg.locale) as unknown as { components: Record<string, { title?: string }> }
  return {
    title: translation.components.allTags?.title ?? "All tags",
  }
}

export default ((userOpts?: Partial<Options>) => {
  const AllTags: QuartzComponent = ({ allFiles, fileData, cfg, displayClass }: QuartzComponentProps) => {
    const opts = { ...defaultOptions(cfg), ...userOpts }
    const tagSet = new Set<string>()

    allFiles.forEach((page) => {
      const tags = page.frontmatter?.tags ?? []
      tags.forEach((tag) => tagSet.add(tag))
    })

    const tags = [...tagSet].sort((a, b) => a.localeCompare(b, cfg.locale))
    if (tags.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "all-tags")}> 
        <h3>{opts.title}</h3>
        <ul class="all-tags-list">
          {tags.map((tag) => {
            return (
              <li>
                <a href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)} class="internal tag-link">
                  {tag}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  AllTags.css = `
.all-tags {
  margin: 0 0 1rem;
}

.all-tags h3 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.all-tags-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.all-tags-list li {
  margin: 0;
}

.all-tags-list a.internal.tag-link {
  border-radius: 8px;
  padding: 0.35rem 0.65rem;
  display: inline-block;
  background-color: var(--highlight);
  color: inherit;
}
  `

  return AllTags
}) satisfies QuartzComponentConstructor
