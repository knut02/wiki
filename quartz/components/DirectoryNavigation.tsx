import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import { FullSlug } from "../util/path"

interface DirectoryInfo {
  name: string
  slug: FullSlug
  title: string
}

export default (() => {
  const DirectoryNavigation: QuartzComponent = ({ cfg, allFiles, displayClass }: QuartzComponentProps) => {
    const directories = new Map<string, DirectoryInfo>()

    allFiles.forEach((file) => {
      if (!file.slug) return

      const slugParts = file.slug.split("/").filter((part) => part.length > 0)
      if (slugParts.length === 0) return

      const topDir = slugParts[0]
      if (topDir === "sources" || topDir === "index") return

      if (!directories.has(topDir)) {
        directories.set(topDir, {
          name: topDir,
          slug: (topDir + "/index") as FullSlug,
          title: topDir.charAt(0).toUpperCase() + topDir.slice(1),
        })
      }
    })

    const sortedDirs = Array.from(directories.values()).sort((a, b) => a.name.localeCompare(b.name))

    if (sortedDirs.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "directory-navigation")}>
        <h3>{i18n(cfg.locale).components.tableOfContents.title}</h3>
        <ul>
          {sortedDirs.map((dir) => (
            <li key={dir.name}>
              <a href={`#section-${dir.name}`} class="internal">
                {dir.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  DirectoryNavigation.css = `
.directory-navigation {
  margin: 0 0 1rem;
}

.directory-navigation h3 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.directory-navigation ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.directory-navigation li {
  margin: 0 0 0.5rem;
}

.directory-navigation a.internal {
  color: inherit;
  text-decoration: none;
}

.directory-navigation a.internal:hover {
  text-decoration: underline;
}
  `

  return DirectoryNavigation
}) satisfies QuartzComponentConstructor
