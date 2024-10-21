export class Navbar {
	private menu: HTMLElement | null = null
	private button: HTMLElement | null = null
	private isOpen: boolean = false

	constructor() {
		this.menu = document.querySelector<HTMLElement>(".nav__menu")
		this.button = document.querySelector<HTMLElement>(".nav__toggler")

		this.attachEvents()
	}

	private attachEvents() {
		this.smoothScroll()
		this.button?.addEventListener("click", this.toggleMenu.bind(this))
		window.addEventListener("DOMContentLoaded", this.handleScroll)
		window.addEventListener("scroll", this.handleScroll)
	}

	private toggleMenu() {
		if (!this.menu || !this.button) return

		this.isOpen = !this.isOpen
		this.menu.classList.toggle("open", this.isOpen)
		this.button.classList.toggle("open", this.isOpen)
	}

	private getScrollOffset(): number {
		return window.matchMedia("(min-width: 1024px)").matches ? 64 : 54
	}

	private smoothScroll() {
		const elements = document.querySelectorAll<HTMLAnchorElement>("a[href^='#']")

		elements.forEach(link => {
			link.addEventListener("click", event => {
				event.preventDefault()

				if (!link.hash) return

				const section = document.querySelector<HTMLElement>(link.hash)

				if (section) {
					const offsetTop = section.getBoundingClientRect().top + window.scrollY - this.getScrollOffset()

					window.scrollTo({
						top: offsetTop,
						behavior: "smooth"
					})
				}
			})
		})
	}

	private handleScroll() {
		const elements = document.querySelectorAll<HTMLAnchorElement>(".nav__menu-link")
		const screenCenter = window.innerHeight / 2

		elements.forEach(link => {
			const id = link.getAttribute("href")?.substring(1) || ""
			const section = document.getElementById(id)

			if (section) {
				const top = section.getBoundingClientRect().top
				const height = section.offsetHeight

				if (top <= screenCenter && top + height > screenCenter) {
					link.classList.add("active")
				} else {
					link.classList.remove("active")
				}
			}
		})
	}
}

new Navbar()
