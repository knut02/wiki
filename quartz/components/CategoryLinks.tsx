import { QuartzComponent, QuartzComponentConstructor } from "./types"

const CategoryLinks: QuartzComponent = () => {
  return (
    <nav class="category-links" aria-label="Kategorilenker">
      <h3>Utforsk</h3>
      <ul>
        <li>
          <a href="categories/" class="internal">
            Alle kategorier
          </a>
        </li>
        <li>
          <a href="tags/" class="internal">
            Alle tags
          </a>
        </li>
      </ul>
    </nav>
  )
}

CategoryLinks.css = `
.category-links {
  margin: 0 0 1rem;
}

.category-links h3 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.category-links ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-links li {
  margin: 0 0 0.5rem;
}

.category-links a.internal {
  color: inherit;
  text-decoration: none;
}

.category-links a.internal:hover {
  text-decoration: underline;
}
`

export default (() => CategoryLinks) satisfies QuartzComponentConstructor
