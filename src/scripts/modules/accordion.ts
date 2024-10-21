import { nanoid } from "nanoid"

interface IAccordionOptions {
	elementClass: string
	triggerClass: string
	panelClass: string
	activeClass: string
	collapsible: boolean
}

export class Accordion {
	root: HTMLElement | null = null
	elements: NodeListOf<HTMLElement> | null = null
	options: IAccordionOptions

	constructor(selector: string, options?: Partial<IAccordionOptions>) {
		const DEFAULT_OPTIONS: IAccordionOptions = {
			elementClass: ".accordion__item",
			triggerClass: ".accordion__header",
			panelClass: ".accordion__panel",
			activeClass: "open",
			collapsible: true
		}

		this.root = document.querySelector(selector)
		this.options = { ...DEFAULT_OPTIONS, ...options }

		if (!this.root) return

		this.init()
	}

	private init() {
		const { elementClass } = this.options

		this.elements = this.root!.querySelectorAll<HTMLElement>(elementClass)

		this.elements.forEach(element => {
			this.setARIA(element)
		})

		this.attachEvents()
	}

	private setARIA(element: HTMLElement) {
		const { triggerClass, panelClass } = this.options

		const trigger = element.querySelector<HTMLElement>(triggerClass)
		const panel = element.querySelector<HTMLElement>(panelClass)

		if (trigger && panel) {
			trigger.setAttribute("id", nanoid(8))
			panel.setAttribute("id", nanoid(8))

			trigger.setAttribute("aria-controls", panel.id)
			trigger.setAttribute("aria-expanded", "false")

			panel.setAttribute("role", "region")
			panel.setAttribute("aria-labelledby", trigger.id)
		}
	}

	private show(element: HTMLElement) {
		const { triggerClass, activeClass } = this.options
		const trigger = element.querySelector<HTMLElement>(triggerClass)

		element.classList.add(activeClass)
		trigger?.setAttribute("aria-expanded", "true")
	}

	private hide(element: HTMLElement) {
		const { triggerClass, activeClass } = this.options
		const trigger = element.querySelector<HTMLElement>(triggerClass)

		element.classList.remove(activeClass)
		trigger?.setAttribute("aria-expanded", "false")
	}

	private toggle(element: HTMLElement) {
		const { activeClass, collapsible } = this.options
		const isActive = element.classList.contains(activeClass)

		if (collapsible) {
			this.closeAll()
		}

		return isActive ? this.hide(element) : this.show(element)
	}

	private closeAll() {
		const { activeClass } = this.options

		this.elements?.forEach(element => {
			const isActive = element.classList.contains(activeClass)

			if (isActive) {
				this.hide(element)
			}
		})
	}

	private handleClick(event: MouseEvent) {
		const { panelClass } = this.options
		const targetEl = event.currentTarget as HTMLElement
		const target = event.target as HTMLElement

		this.elements?.forEach(element => {
			if (target.closest(panelClass)) return

			if (element.contains(targetEl)) {
				this.toggle(targetEl)
			}
		})
	}

	private attachEvents() {
		this.elements?.forEach(element => {
			element.addEventListener("click", this.handleClick.bind(this))
		})
	}
}
