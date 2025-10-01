export class Scrollbar {
	private element: HTMLElement
	private scrollTrack: HTMLElement
	private scrollThumb: HTMLElement
	private resizeObserver: ResizeObserver | null = null
	private isDragging = false

	constructor(root: HTMLElement) {
		this.element = root.firstElementChild as HTMLElement
		this.scrollTrack = root.querySelector<HTMLElement>(".scrollbar__track")!
		this.scrollThumb = root.querySelector<HTMLElement>(".scrollbar__thumb")!

		if (!this.scrollTrack || !this.scrollThumb) {
			console.error("[scrollbar.ts] Элементы .scrollbar__track и .scrollbar__thumb не найдены")
			return
		}

		this.init()
	}

	private init() {
		this.element.addEventListener("scroll", () => this.moveScrollThumb())
		window.addEventListener("DOMContentLoaded", () => this.updateThumbSize())
		window.addEventListener("resize", () => this.updateThumbSize())

		this.resizeObserver = new ResizeObserver(() => this.updateThumbSize())
		this.resizeObserver.observe(this.element)

		this.dnd()
	}

	private updateThumbSize() {
		const { offsetWidth, scrollWidth } = this.element
		const ratio = offsetWidth / scrollWidth
		const trackWidth = this.scrollTrack.offsetWidth
		const thumbWidth = Math.max(ratio * trackWidth, 44)
		const scrollElement = this.scrollTrack.closest<HTMLElement>(".scrollbar")!

		if (scrollWidth <= offsetWidth) {
			scrollElement.style.display = "none"
			return
		}

		scrollElement.style.display = "block"
		this.scrollThumb.style.width = `${thumbWidth}px`
	}

	private moveScrollThumb() {
		const { scrollLeft, scrollWidth, offsetWidth } = this.element
		const trackWidth = this.scrollTrack.offsetWidth
		const thumbWidth = this.scrollThumb.offsetWidth
		const ratio = scrollLeft / (scrollWidth - offsetWidth)

		this.scrollThumb.style.left = `${ratio * (trackWidth - thumbWidth)}px`
	}

	private dnd() {
		let startX = 0
		let startLeft = 0

		const onMouseMove = (event: MouseEvent) => {
			if (!this.isDragging) return

			const trackWidth = this.scrollTrack.offsetWidth
			const thumbWidth = this.scrollThumb.offsetWidth

			let newLeft = Math.max(0, Math.min(startLeft + event.clientX - startX, trackWidth - thumbWidth))
			this.scrollThumb.style.left = `${newLeft}px`

			const { scrollWidth, offsetWidth } = this.element
			const ratio = newLeft / (trackWidth - thumbWidth)
			this.element.style.scrollSnapType = "none"
			this.element.scrollLeft = ratio * (scrollWidth - offsetWidth)
		}

		const onMouseUp = () => {
			this.isDragging = false
			this.scrollThumb.classList.remove("scrollbar__thumb--grabbing")
			this.element.removeAttribute("style")
			document.removeEventListener("mousemove", onMouseMove)
			document.removeEventListener("mouseup", onMouseUp)
		}

		this.scrollThumb.addEventListener("mousedown", (event: MouseEvent) => {
			event.preventDefault()

			this.isDragging = true
			startX = event.clientX
			startLeft = this.scrollThumb.offsetLeft
			this.scrollThumb.classList.add("scrollbar__thumb--grabbing")

			document.addEventListener("mousemove", onMouseMove)
			document.addEventListener("mouseup", onMouseUp)
		})
	}
}
