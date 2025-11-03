class Scrollbar {
	private root: HTMLElement
	private viewport: HTMLElement
	private track: HTMLElement
	private thumb: HTMLElement
	private isDragging: boolean = false
	private timeout: NodeJS.Timeout | null = null
	private startX: number = 0
	private startY: number = 0
	private scrollTop: number = 0
	private scrollLeft: number = 0
	private delay: number = 500
	private direction: "vertical" | "horizontal"

	constructor(root: HTMLElement) {
		this.root = root
		this.direction = this.root.classList.contains("horizontal") ? "horizontal" : "vertical"

		this.viewport = this.root.querySelector<HTMLElement>(".scrollbar__viewport")!
		this.track = this.root.querySelector<HTMLElement>(".scrollbar__track")!
		this.thumb = this.root.querySelector<HTMLElement>(".scrollbar__thumb")!

		if (!this.viewport || !this.track || !this.thumb) {
			console.error(`[scrollbar.ts] Элементы .scrollbar__viewport, .scrollbar__track, .scrollbar__thumb не найдены`)
			return
		}

		this.viewport.addEventListener("scroll", () => this.update())
		this.viewport.addEventListener("mouseenter", () => this.show())
		this.viewport.addEventListener("mouseleave", () => this.hideAfterDelay())
		this.thumb.addEventListener("mousedown", (event) => this.startDrag(event))
		document.addEventListener("mouseup", () => this.endDrag())
		document.addEventListener("mousemove", (event) => this.onDrag(event))
		new ResizeObserver(() => this.update()).observe(this.viewport)

		this.update()
	}

	private update() {
		if (this.direction === "vertical") {
			const { scrollHeight, clientHeight, scrollTop } = this.viewport
			const ratio = clientHeight / scrollHeight
			const thumbHeight = Math.max(clientHeight * ratio, 0)
			const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight)
			this.thumb.style.height = `${thumbHeight}px`
			this.thumb.style.transform = `translateY(${thumbTop}px)`
		} else {
			const { scrollWidth, clientWidth, scrollLeft } = this.viewport
			const ratio = clientWidth / scrollWidth
			const thumbWidth = Math.max(clientWidth * ratio, 0)
			const thumbLeft = (scrollLeft / (scrollWidth - clientWidth)) * (clientWidth - thumbWidth)
			this.thumb.style.width = `${thumbWidth}px`
			this.thumb.style.transform = `translateX(${thumbLeft}px)`
		}
		this.show()
		this.hideAfterDelay()
	}

	private show() {
		clearTimeout(this.timeout!)
		this.track.dataset.visible = "true"
	}

	private hideAfterDelay() {
		clearTimeout(this.timeout!)
		this.timeout = setTimeout(() => {
			if (!this.isDragging) {
				this.track.dataset.visible = "false"
			}
		}, this.delay)
	}

	private startDrag(event: MouseEvent) {
		this.isDragging = true

		if (this.direction === "vertical") {
			this.startY = event.clientY
			this.scrollTop = this.viewport.scrollTop
		} else {
			this.startX = event.clientX
			this.scrollLeft = this.viewport.scrollLeft
		}

		document.body.classList.add("select-none")
	}

	private endDrag() {
		this.isDragging = false
		document.body.classList.remove("select-none")
		this.hideAfterDelay()
	}

	private onDrag(event: MouseEvent) {
		if (!this.isDragging) return

		if (this.direction === "vertical") {
			const deltaY = event.clientY - this.startY
			const ratioY = this.viewport.scrollHeight / this.viewport.clientHeight
			this.viewport.scrollTop = this.scrollTop + deltaY * ratioY
		} else {
			const deltaX = event.clientX - this.startX
			const ratioX = this.viewport.scrollWidth / this.viewport.clientWidth
			this.viewport.scrollLeft = this.scrollLeft + deltaX * ratioX
		}
	}
}

document.querySelectorAll<HTMLElement>("[data-scrollbar]").forEach((element) => {
	new Scrollbar(element)
})
