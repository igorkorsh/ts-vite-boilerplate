class Navbar {
	private readonly menu: HTMLElement
	private readonly button: HTMLElement
	private isOpen: boolean = false

	constructor() {
		this.menu = document.querySelector(".nav__menu") as HTMLElement
		this.button = document.querySelector(".nav__button") as HTMLElement

		if (!this.menu || !this.button) {
			console.error(`[nav.ts] Не удалось найти элементы .nav__menu или .nav__button`)
			return
		}

		this.init()
	}

	private init() {
		this.attachEvents()
		this.handleScroll()
	}

	private attachEvents() {
		this.smoothScroll()

		this.button.addEventListener("click", () => this.toggleMenu())
		window.addEventListener("DOMContentLoaded", () => this.handleScroll())
	}

	private toggleMenu() {
		this.isOpen = !this.isOpen
		this.menu.classList.toggle("open", this.isOpen)
		this.button.classList.toggle("open", this.isOpen)

		document.body.style.overflow = this.isOpen ? "hidden" : ""
	}

	private getScrollOffset(): number {
		return window.matchMedia("(min-width: 1024px)").matches ? 64 : 54
	}

	private smoothScroll() {
		const links = this.menu.querySelectorAll<HTMLAnchorElement>("a[href^='#']")

		links.forEach((link) => {
			link.addEventListener("click", (event) => this.handleAnchorClick(event))
		})
	}

	private handleAnchorClick(event: Event) {
		event.preventDefault()

		const link = event.currentTarget as HTMLAnchorElement
		if (!link.hash) return

		const section = document.querySelector<HTMLElement>(link.hash)
		if (!section) return

		const offsetTop = section.getBoundingClientRect().top + window.scrollY - this.getScrollOffset()

		window.scrollTo({
			top: offsetTop,
			behavior: "smooth"
		})

		if (this.isOpen) {
			this.toggleMenu()
		}
	}

	private handleScroll() {
		const links = this.menu.querySelectorAll<HTMLAnchorElement>(".nav__menu-link")

		for (const link of links) {
			const href = link.getAttribute("href")
			const id = href?.substring(1) || ""
			const section = document.getElementById(id)

			if (!section) return

			const top = section.getBoundingClientRect().top
			const height = section.offsetHeight
			const screenCenter = window.innerHeight / 2
			const isActive = top <= screenCenter && top + height > screenCenter

			link.classList.toggle("active", isActive)
		}
	}
}

if (document.querySelector(".nav__menu")) {
	new Navbar()
}
