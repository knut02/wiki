import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import style from "./styles/directoryList.scss"

interface DirectoryInfo {
  name: string
  slug: FullSlug
}

export default (() => {
  const DirectoryList: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
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
          slug: `${topDir}/index` as FullSlug,
        })
      }
    })

    const sortedDirs = Array.from(directories.values()).sort((a, b) => a.name.localeCompare(b.name))

    return (
      <div class="directory-list">
        {sortedDirs.map((dir) => {
          const folderIndex = allFiles.find((file) => file.slug === dir.slug)
          const sectionId = `section-${dir.name}`

          const headingText = folderIndex?.frontmatter?.title ?? dir.name
          const firstChar = headingText.charAt(0)
          const restOfHeading = headingText.slice(1)
          const description = folderIndex?.frontmatter?.description

          return (
            <section key={dir.name} id={sectionId} class="directory-section">
              <h2 class="directory-heading">
                <a class="directory-heading-link internal" href={resolveRelative(fileData.slug!, dir.slug)}>
                  <span class="directory-heading-initial">{firstChar}</span>
                  {restOfHeading}
                </a>
              </h2>
              {description ? <p class="directory-description">{String(description).replace(/\n+/g, " ").trim()}</p> : null}
            </section>
          )
        })}
      </div>
    )
  }

  DirectoryList.css = style

  return DirectoryList
}) satisfies QuartzComponentConstructor
