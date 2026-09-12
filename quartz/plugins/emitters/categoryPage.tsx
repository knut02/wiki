import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { ProcessedContent, defaultProcessedContent } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { FullSlug, pathToRoot } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { DirectoryList } from "../../components"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { StaticResources } from "../../util/resources"

const categorySlug = "categories/index" as FullSlug

export const CategoryPage: QuartzEmitterPlugin = () => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: DirectoryList({ showSubcategories: true }),
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "CategoryPage",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx: BuildCtx, content: ProcessedContent[], resources: StaticResources) {
      const categoryContent = defaultProcessedContent({
        slug: categorySlug,
        frontmatter: {
          title: "Alle kategorier",
          description: "Alle hovedkategorier på nettstedet.",
          tags: [],
        },
      })
      const [_tree, file] = categoryContent
      const externalResources = pageResources(pathToRoot(categorySlug), resources)
      const componentData: QuartzComponentProps = {
        ctx,
        fileData: file.data,
        externalResources,
        cfg: ctx.cfg.configuration,
        children: [],
        tree: categoryContent[0],
        allFiles: content.map((item) => item[1].data),
      }
      const page = renderPage(
        ctx.cfg.configuration,
        categorySlug,
        componentData,
        opts,
        externalResources,
      )
      yield write({ ctx, content: page, slug: categorySlug, ext: ".html" })
    },
  }
}
