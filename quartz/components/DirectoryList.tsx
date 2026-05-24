import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"
import { resolveRelative, FullSlug, isFolderPath } from "../util/path"
import style from "./styles/directoryList.scss"

interface DirectoryInfo {
  name: string
  slug: FullSlug
  title: string
  count: number
}

export default (() => {
  const DirectoryList: QuartzComponent = ({ cfg, fileData, allFiles }: QuartzComponentProps) => {
    // Get unique directories from all files
    const directories = new Map<string, DirectoryInfo>()

    // Filter out index files and get unique directories
    allFiles.forEach((file) => {
      if (!file.slug) return

      const slugParts = file.slug.split("/").filter((part) => part.length > 0)

      // Skip if it's just the root index
      if (slugParts.length === 0) return

      // Get the top-level directory
      const topDir = slugParts[0]

      // never include the sources folder or the index entry
      if (topDir === "sources" || topDir === "index") return

      if (!directories.has(topDir)) {
        directories.set(topDir, {
          name: topDir,
          slug: (topDir + "/index") as FullSlug,
          title: topDir.charAt(0).toUpperCase() + topDir.slice(1),
          count: 0,
        })
      }

      // Increment count for files in this directory
      if (slugParts.length > 0) {
        const dir = directories.get(topDir)!
        if (!isFolderPath(file.slug)) {
          dir.count++
        }
      }
    })

    // Sort directories alphabetically
    const sortedDirs = Array.from(directories.values()).sort((a, b) => a.name.localeCompare(b.name))

    return (
      <div class="directory-list">
        {sortedDirs.map((dir) => {
          // collect articles for this directory
          const articles = allFiles
            .filter((f) =>
              f.slug &&
              f.slug.startsWith(dir.name + "/") &&
              !isFolderPath(f.slug) &&
              !f.slug.startsWith("tags/") &&
              // exclude any index files inside subfolders (e.g. "concepts/index")
              !f.slug.endsWith("/index")
            )
            .sort((a, b) => {
              const aTitle = (a.frontmatter?.title ?? a.slug ?? "").toLowerCase()
              const bTitle = (b.frontmatter?.title ?? b.slug ?? "").toLowerCase()
              return aTitle.localeCompare(bTitle)
            })

          return (
            <section key={dir.name} class="directory-section">
              <h2 class="directory-heading">{dir.title}</h2>
              <ul class="article-list">
                {articles.map((art) => {
                  const rawTitle = art.frontmatter?.title ?? art.slug ?? ""
                  const lastSegment = rawTitle.includes("/") ? rawTitle.split("/").pop()! : rawTitle
                  const displayTitle = lastSegment.length ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : lastSegment

                  return (
                    <li class="article-item">
                      <a class="article-link internal" href={resolveRelative(fileData.slug!, art.slug!)}>
                        {displayTitle}
                      </a>
                      {art.frontmatter?.description && (() => {
                        const desc = String(art.frontmatter.description).replace(/\n+/g, " ").trim()
                        return <span class="article-desc-inline">{` : ${desc}`}</span>
                      })()}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    )
  }

  DirectoryList.css = style

  return DirectoryList
}) satisfies QuartzComponentConstructor
