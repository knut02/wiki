function setupSubcategoryFilter() {
  const filter = document.querySelector<HTMLElement>("[data-subcategory-filter]")
  if (!filter) return

  const sections = [...document.querySelectorAll<HTMLElement>("[data-subcategory-section]")]
  const checkboxes = [...filter.querySelectorAll<HTMLInputElement>("input[type=checkbox]")]
  const resetButton = filter.querySelector<HTMLButtonElement>("[data-subcategory-reset]")
  const summary = filter.querySelector<HTMLElement>("[data-subcategory-summary]")
  const count = document.querySelector<HTMLElement>("[data-filtered-article-count]")

  const reset = () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false
    })
    update()
  }

  const update = () => {
    const selected = new Set(
      checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value),
    )
    const showAll = selected.size === 0
    let visibleArticles = 0

    sections.forEach((section) => {
      const visible = showAll || selected.has(section.dataset.subcategory ?? "")
      section.hidden = !visible
      if (visible) {
        visibleArticles += section.querySelectorAll(".section-li").length
      }
    })

    if (count) {
      count.textContent = `${visibleArticles} ${visibleArticles === 1 ? "artikkel" : "artikler"}`
    }

    if (resetButton) {
      resetButton.disabled = showAll
    }

    if (summary) {
      summary.textContent = showAll
        ? "Alle underkategorier"
        : `${selected.size} valgt underkategori${selected.size === 1 ? "" : "er"}`
    }
  }

  checkboxes.forEach((checkbox) => checkbox.addEventListener("change", update))
  resetButton?.addEventListener("click", reset)

  window.addCleanup(() => {
    checkboxes.forEach((checkbox) => checkbox.removeEventListener("change", update))
    resetButton?.removeEventListener("click", reset)
  })

  update()
}

document.addEventListener("nav", setupSubcategoryFilter)
