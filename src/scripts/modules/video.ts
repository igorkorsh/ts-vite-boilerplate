enum Platform {
	YOUTUBE,
	RUTUBE,
	VK,
	UNKNOWN
}

export class VideoPlayer {
	private url: string
	private platform: Platform
	private root: HTMLElement
	private player: YT.Player | HTMLIFrameElement | HTMLVideoElement | null = null

	constructor(url: string) {
		this.url = url
		this.root = document.getElementById("player")!
		this.platform = this.getPlatform()
		this.init()
	}

	private getPlatform(): Platform {
		const { hostname } = new URL(this.url)

		if (hostname.match(/youtu\.?be(\.com)?/)) return Platform.YOUTUBE
		if (hostname.match(/rutube\.ru/)) return Platform.RUTUBE
		if (hostname.match(/vk(video)?\.(com|ru)/)) return Platform.VK

		return Platform.UNKNOWN
	}

	private getVideoId(): string {
		const { pathname, searchParams } = new URL(this.url)

		if (pathname.includes("/watch")) {
			return searchParams.get("v") || ""
		}

		return pathname.split("/").pop() || ""
	}

	private async init() {
		const videoId = this.getVideoId()

		switch (this.platform) {
			case Platform.YOUTUBE:
				this.createYouTubePlayer(videoId)
				break
			case Platform.RUTUBE:
				this.createRutubePlayer(videoId)
				break
			case Platform.VK:
				await this.createVKPlayer()
				break
			default:
				this.createHTML5Player()
				break
		}
	}

	private async getScript(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script")
			script.src = url
			script.onload = () => resolve()
			script.onerror = () => reject(new Error(`Ошибка при загрузке скрипта ${url}`))
			document.head.appendChild(script)
		})
	}

	// YOUTUBE
	private createYouTubePlayer(videoId: string) {
		function playerInstance(videoId: string) {
			return new YT.Player("player", {
				width: 800,
				height: 450,
				videoId
			})
		}

		if (!window.YT) {
			this.getScript("https://www.youtube.com/iframe_api")

			// @ts-ignore
			window.onYouTubeIframeAPIReady = () => {
				this.player = playerInstance(videoId)
			}
		} else {
			this.player = playerInstance(videoId)
		}
	}

	private getIframe(): HTMLIFrameElement {
		const iframe = document.createElement("iframe")
		iframe.width = "800"
		iframe.height = "450"
		iframe.frameBorder = "0"
		iframe.allowFullscreen
		return iframe
	}

	// RUTUBE
	private createRutubePlayer(videoId: string) {
		const iframe = this.getIframe()
		iframe.src = `https://rutube.ru/play/embed/${videoId}`
		iframe.allow = "clipboard-write; autoplay"
		this.root.innerHTML = ""
		this.root.appendChild(iframe)
		this.player = iframe
	}

	// VK
	private async createVKPlayer() {
		// @ts-ignore
		if (!window.VK) {
			await this.getScript("https://vk.com/js/api/videoplayer.js")
		}

		const iframe = this.getIframe()
		const [_, video] = this.url.split("-")
		const [oid, id] = video.split("_")
		iframe.src = `https://vkvideo.ru/video_ext.php?oid=-${oid}&id=${id}&hd=2&js_api=1`
		iframe.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"

		this.root.innerHTML = ""
		this.root.appendChild(iframe)
		// @ts-ignore
		this.player = VK.VideoPlayer(iframe)
	}

	// HTML5
	private createHTML5Player() {
		const video = document.createElement("video")
		video.src = this.url
		video.width = 800
		video.height = 450
		video.controls = true
		this.root.innerHTML = ""
		this.root.appendChild(video)
		this.player = video
	}

	public play() {
		if (window.YT && this.player instanceof YT.Player) {
			this.player.playVideo()
		} else if (this.player instanceof HTMLIFrameElement) {
			this.player.contentWindow?.postMessage(
				JSON.stringify({
					type: "player:play",
					data: {}
				})
			)
		} else {
			// @ts-ignore
			this.player?.play()
		}
	}

	public pause() {
		if (window.YT && this.player instanceof YT.Player) {
			this.player.pauseVideo()
		} else if (this.player instanceof HTMLIFrameElement) {
			this.player.contentWindow?.postMessage(
				JSON.stringify({
					type: "player:pause",
					data: {}
				})
			)
		} else {
			// @ts-ignore
			this.player?.pause()
		}
	}

	public destroy() {
		if (window.YT && this.player instanceof YT.Player) {
			this.player.destroy()
		} else if (this.player instanceof HTMLIFrameElement) {
			this.player.contentWindow?.postMessage(
				JSON.stringify({
					type: "player:remove",
					data: {}
				})
			)

			this.player.remove()
		}

		this.player = null
	}
}
