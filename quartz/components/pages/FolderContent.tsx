import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { QuartzPluginData } from "../../plugins/vfile"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import { trieFromAllFiles } from "../../util/ctx"
// @ts-ignore
import subcategoryFilterScript from "../scripts/subcategory-filter.inline"

interface FolderContentOptions {
  /**
   * Whether to display number of folders
   */
  showFolderCount: boolean
  showSubfolders: boolean
  sort?: SortFn
}

const defaultOptions: FolderContentOptions = {
  showFolderCount: true,
  showSubfolders: true,
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props

    const trie = (props.ctx.trie ??= trieFromAllFiles(allFiles))
    const folder = trie.findNode(fileData.slug!.split("/"))
    if (!folder) {
      return null
    }

    const allPagesInFolder: QuartzPluginData[] =
      folder.children
        .map((node) => {
          // regular file, proceed
          if (node.data) {
            return node.data
          }

          if (node.isFolder && options.showSubfolders) {
            // folders that dont have data need synthetic files
            const getMostRecentDates = (): QuartzPluginData["dates"] => {
              let maybeDates: QuartzPluginData["dates"] | undefined = undefined
              for (const child of node.children) {
                if (child.data?.dates) {
                  // compare all dates and assign to maybeDates if its more recent or its not set
                  if (!maybeDates) {
                    maybeDates = { ...child.data.dates }
                  } else {
                    if (child.data.dates.created > maybeDates.created) {
                      maybeDates.created = child.data.dates.created
                    }

                    if (child.data.dates.modified > maybeDates.modified) {
                      maybeDates.modified = child.data.dates.modified
                    }

                    if (child.data.dates.published > maybeDates.published) {
                      maybeDates.published = child.data.dates.published
                    }
                  }
                }
              }
              return (
                maybeDates ?? {
                  created: new Date(),
                  modified: new Date(),
                  published: new Date(),
                }
              )
            }

            return {
              slug: node.slug,
              dates: getMostRecentDates(),
              frontmatter: {
                title: node.displayName,
                tags: [],
              },
            }
          }
        })
        .filter((page) => page !== undefined) ?? []
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")
    const listProps = {
      ...props,
      sort: options.sort,
    }

    const pagesBySubcategory = new Map<string, QuartzPluginData[]>()
    for (const page of allPagesInFolder) {
      const subcategory = String(page.frontmatter?.["sub-kategori"] ?? "Uten underkategori")
      const pages = pagesBySubcategory.get(subcategory) ?? []
      pages.push(page)
      pagesBySubcategory.set(subcategory, pages)
    }

    const content = (
      (tree as Root).children.length === 0 ? null : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren

    return (
      <div class="popover-hint">
        <article class={classes}>{content}</article>
        <div class="page-listing">
          {options.showFolderCount && (
            <p data-filtered-article-count>
              {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
                count: allPagesInFolder.length,
              })}
            </p>
          )}
          <fieldset class="subcategory-filter" data-subcategory-filter>
            <legend>Filtrer på underkategori</legend>
            <div class="subcategory-filter-controls">
              <details class="subcategory-filter-menu">
                <summary data-subcategory-summary>Alle underkategorier</summary>
                <div class="subcategory-filter-panel">
                  <div class="subcategory-filter-options">
                    {[...pagesBySubcategory.keys()].map((subcategory) => (
                      <label key={subcategory}>
                        <input type="checkbox" value={subcategory} />
                        <span>{subcategory}</span>
                      </label>
                    ))}
                  </div>
                  <button type="button" data-subcategory-reset disabled>
                    Nullstill
                  </button>
                </div>
              </details>
            </div>
          </fieldset>
          <div class="folder-subcategory-list">
            {[...pagesBySubcategory.entries()].map(([subcategory, pages]) => (
              <section
                class="folder-subcategory"
                data-subcategory-section
                data-subcategory={subcategory}
                key={subcategory}
              >
                <h2>{subcategory}</h2>
                <PageList {...listProps} allFiles={pages} />
              </section>
            ))}
          </div>
        </div>
      </div>
    )
  }

  FolderContent.css = concatenateResources(
    style,
    PageList.css,
    `
.folder-subcategory {
  margin-top: 2rem;
}

.folder-subcategory h2 {
  margin-bottom: 0.75rem;
}

.subcategory-filter {
  margin: 1.5rem 0 1rem;
  padding: 0;
  border: 0;
}

.subcategory-filter legend {
  padding: 0;
  margin-bottom: 0.45rem;
  font-family: var(--headerFont);
  color: var(--dark);
  font-weight: 600;
}

.subcategory-filter-controls {
  display: flex;
  align-items: flex-start;
}

.subcategory-filter-menu {
  position: relative;
  flex: 0 1 15rem;
  min-width: 12rem;
}

.subcategory-filter-menu summary {
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--gray);
  border-radius: 6px;
  background: var(--light);
  color: var(--dark);
  cursor: pointer;
  list-style-position: inside;
}

.subcategory-filter-menu summary::marker {
  color: var(--secondary);
}

.subcategory-filter-panel {
  position: absolute;
  z-index: 10;
  top: calc(100% + 0.35rem);
  left: 0;
  right: 0;
  box-sizing: border-box;
  padding: 0.8rem;
  border: 1px solid var(--lightgray);
  border-radius: 6px;
  background: var(--light);
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.12);
}

.subcategory-filter-options {
  display: grid;
  gap: 0.45rem;
  max-height: 16rem;
  overflow-y: auto;
}

.subcategory-filter label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

.subcategory-filter-options label {
  gap: 0.55rem;
  padding: 0.45rem 0.55rem;
  border-radius: 5px;
}

.subcategory-filter-options label:has(input:checked) {
  background: var(--highlight);
  color: var(--dark);
}

.subcategory-filter-options input[type="checkbox"] {
  margin: 0;
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
  accent-color: var(--secondary);
}

.subcategory-filter-panel > button {
  margin-top: 0.75rem;
  padding: 0.35rem 0.7rem;
}

.subcategory-filter-panel > button:disabled {
  cursor: default;
  opacity: 0.55;
}

@media all and (max-width: 800px) {
  .subcategory-filter-controls {
    display: grid;
    grid-template-columns: 1fr;
  }

  .subcategory-filter-menu {
    width: 100%;
    min-width: 0;
  }
}
`,
  )
  FolderContent.afterDOMLoaded = subcategoryFilterScript
  return FolderContent
}) satisfies QuartzComponentConstructor
