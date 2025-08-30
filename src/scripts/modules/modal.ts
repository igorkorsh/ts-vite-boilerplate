import { VideoPlayer } from "./video"

let player: VideoPlayer | null = null
let previousUrl: string | null = null

document.addEventListener("click", (event: MouseEvent) => {
	const element = event.target as HTMLElement
	const { target, url } = element.dataset
	const modal = document.querySelector<HTMLDialogElement>(target!)

	if (modal) {
		const button = modal.querySelector<HTMLButtonElement>("[data-close]")
		button?.addEventListener("click", () => modal.close())
		modal.showModal()

		if (url) {
			if (!player) {
				player = new VideoPlayer(url)
			} else {
				if (previousUrl !== url) {
					player.destroy()
					player = new VideoPlayer(url)
				} else {
					player.play()
				}
			}

			previousUrl = url

			modal.addEventListener("close", () => {
				button?.removeEventListener("click", () => modal.close())
				player?.pause()
			})
		}
	}
})
