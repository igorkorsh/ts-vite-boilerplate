import { nanoid } from "nanoid"

interface AccordionOptions {
	elementClass: string
	triggerClass: string
	panelClass: string
	activeClass: string
	allowMultiple: boolean
}

export class Accordion {
	private root: HTMLElement | null = null
	private elements: NodeListOf<HTMLElement> | null = null
	private options: AccordionOptions = {
		elementClass: ".accordion__item",
		triggerClass: ".accordion__header",
		panelClass: ".accordion__panel",
		activeClass: "open",
		allowMultiple: false
	}

	constructor(selector: string, options?: Partial<AccordionOptions>) {
		const element = document.querySelector<HTMLElement>(selector)

		if (!element) {
			console.error(`[accordion.ts] Элемент ${selector} не найден`)
			return
		}

		this.root = element
		this.options = { ...this.options, ...options }
		this.init()
	}

	private init() {
		if (!this.root) return

		this.elements = this.root.querySelectorAll<HTMLElement>(this.options.elementClass)

		this.elements.forEach((item) => {
			this.setARIA(item)
		})

		this.attachEvents()
	}

	private setARIA(item: HTMLElement) {
		const trigger = item.querySelector<HTMLElement>(this.options.triggerClass)
		const panel = item.querySelector<HTMLElement>(this.options.panelClass)

		if (!trigger || !panel) return

		trigger.setAttribute("id", nanoid(8))
		panel.setAttribute("id", nanoid(8))

		trigger.setAttribute("aria-controls", panel.id)
		panel.setAttribute("aria-labelledby", trigger.id)

		const isActive = item.classList.contains(this.options.activeClass)
		trigger.setAttribute("aria-expanded", `${isActive}`)
	}

	private show(element: HTMLElement) {
		const trigger = element.querySelector<HTMLElement>(this.options.triggerClass)
		element.classList.add(this.options.activeClass)
		trigger?.setAttribute("aria-expanded", "true")
	}

	private close(element: HTMLElement) {
		const trigger = element.querySelector<HTMLElement>(this.options.triggerClass)
		element.classList.remove(this.options.activeClass)
		trigger?.setAttribute("aria-expanded", "false")
	}

	private toggle(element: HTMLElement) {
		if (!this.elements) return

		const isActive = element.classList.contains(this.options.activeClass)

		if (!this.options.allowMultiple && !isActive) {
			this.elements.forEach((item) => {
				if (item !== element) {
					this.close(item)
				}
			})
		}

		return isActive ? this.close(element) : this.show(element)
	}

	private attachEvents() {
		this.elements?.forEach((item) => {
			const trigger = item.querySelector<HTMLElement>(this.options.triggerClass)

			trigger?.addEventListener("click", (event) => {
				event.preventDefault()
				this.toggle(item)
			})

			trigger?.addEventListener("keydown", (event: KeyboardEvent) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault()
					this.toggle(item)
				}
			})
		})
	}
}
