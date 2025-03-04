const title = document.querySelector("h1") as HTMLElement

if (!document.title && title && title.textContent) {
	document.title = title.textContent
}
