import { VideoPlayer } from "./video"

class Modal {
	private modal: HTMLElement | null = null
	private player: VideoPlayer | null = null

	constructor() {
		document.addEventListener("click", this.handleClick)
	}

	public open(modalEl: HTMLElement | null) {
		if (!modalEl) return

		const bodyEl = document.querySelector(".body")

		if (bodyEl) {
			bodyEl.classList.add("no-scroll")
			modalEl.classList.add("active")
			modalEl.setAttribute("aria-hidden", "false")
			document.addEventListener("click", this.closeOnClick)
			window.addEventListener("keydown", this.handleKeyDown)
			this.modal = modalEl
		}
	}

	public close() {
		if (!this.modal) return

		const bodyEl = document.querySelector(".body")

		if (bodyEl) {
			bodyEl.classList.remove("no-scroll")
			this.modal.classList.remove("active")
			this.modal.setAttribute("aria-hidden", "true")
			document.removeEventListener("click", this.closeOnClick)
			window.removeEventListener("keydown", this.handleKeyDown)
			this.modal = null
		}

		if (this.player) {
			this.player.pause()
		}
	}

	private handleClick = async (event: MouseEvent) => {
		const target = event.target as HTMLElement

		if (target.closest("[data-modal]")) {
			const modalSelector = target.getAttribute("data-modal")
			const videoUrl = target.getAttribute("data-video")
			this.modal = modalSelector ? document.querySelector<HTMLElement>(modalSelector) : null

			if (this.modal) {
				if (videoUrl) {
					if (!this.player) {
						this.player = await VideoPlayer.create(videoUrl)
					}

					this.player.play(videoUrl)
				}

				this.open(this.modal)
			}
		}
	}

	private closeOnClick = (event: MouseEvent) => {
		if (!this.modal) return

		const targetNode = event.target as Node
		const dialogEl = this.modal.querySelector<HTMLElement>(".modal__dialog")
		const buttonEl = this.modal.querySelector<HTMLButtonElement>(".modal__close")

		if (!dialogEl?.contains(targetNode) || buttonEl?.contains(targetNode)) {
			this.close()
		}
	}

	private handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			this.close()
		}
	}
}

new Modal()
