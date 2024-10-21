import { getScript } from "./utils"

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
  }
}

interface IVideoState {
  currentUrl: string
  previousUrl?: string
}

enum Platform {
  YouTube,
  Unknown,
}

export class VideoPlayer {
  private video: IVideoState
  private element: HTMLElement
  private player: YT.Player | HTMLVideoElement | null = null
  private platform: Platform = Platform.Unknown
  private time: number = 0

  private constructor(url: string) {
    this.video = { currentUrl: url }
    this.element = document.getElementById("player") as HTMLElement
    this.platform = this.getPlatform(url)
  }

  /**
   * Асинхронно создает новый экземпляр класса.
   */
  static async create(url: string): Promise<VideoPlayer> {
    await this.loadApi()
    return new VideoPlayer(url)
  }

  private static async loadApi() {
    if (!window.YT) {
      await getScript("https://www.youtube.com/iframe_api")
    }

    return new Promise<void>((resolve) => {
      window.onYouTubeIframeAPIReady = () => resolve()
    })
  }

  /**
   * Воспроизводит видео
   */
  public play(url: string) {
    const _platform = this.getPlatform(url)

    if (this.platform !== _platform) {
      this.disposePlayer()
      this.video = { currentUrl: url }
      this.platform = _platform
    }

    switch (this.platform) {
      case Platform.YouTube:
        const videoId = this.getVideoId(url)

        if (!this.player) {
          this.initYTPlayer(videoId)
        } else if (this.player instanceof YT.Player) {
          if (url !== this.video.previousUrl) {
            this.time = 0
            this.video.previousUrl = url
          }

          if (videoId) {
            this.player.loadVideoById(videoId, this.time)
          }
        }

        break
      case Platform.Unknown:
        if (!this.player) {
          this.initVideoPlayer(this.video.currentUrl)
        } else if (this.player instanceof HTMLVideoElement) {
          this.player.currentTime = this.time
          this.player.play()
        }

        break
    }
  }

  /**
   * Приостанавливает видео и сохраняет текущее время воспроизведения
   */
  public pause() {
    if (!this.player) return

    switch (this.platform) {
      case Platform.YouTube:
        if (this.player instanceof YT.Player) {
          this.player.pauseVideo()
          this.time = this.player.getCurrentTime()
        }

        break
      case Platform.Unknown:
        if (this.player instanceof HTMLVideoElement) {
          this.player.pause()
          this.time = this.player.currentTime
          this.video.previousUrl = this.video.currentUrl
        }

        break
    }
  }

  /**
   * Определяет видеоплатформу по URL.
   */
  private getPlatform(url: string) {
    const { hostname } = new URL(url)

    if (hostname.match(/(www\.)?youtube.com|youtu.be/)) {
      return Platform.YouTube
    }

    return Platform.Unknown
  }

  /**
   * Извлекает идентификатор видео из URL
   */
  private getVideoId(url: string): string | undefined {
    try {
      const { pathname, searchParams } = new URL(url)

      // youtube.com/embed/{VIDEO_ID}
      if (pathname.startsWith("/embed/")) {
        return pathname.split("/embed/")[1]
      }

      // youtube.com/watch?v={VIDEO_ID}
      if (pathname.startsWith("/watch")) {
        return searchParams.get("v") || undefined
      }

      // youtu.be/{VIDEO_ID}
      if (pathname.startsWith("/")) {
        return pathname.split("/")[1]
      }
    } catch (error) {
      throw new Error(`Не удалось извлечь идентификатор видео из URL: ${url}. Возможно URL имеет некорректный формат`)
    }
  }

  /**
   * Инициализирует плеер YouTube
   */
  private initYTPlayer(videoId: string | undefined) {
    this.player = new YT.Player(this.element, {
      width: 800,
      height: 450,
      videoId,
      playerVars: {
        playsinline: 1,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          return event.target.playVideo()
        },
      },
    })
  }

  /**
   * Инициализует стандартный HTML5-плеер
   */
  private initVideoPlayer(url: string) {
    this.player = document.createElement("video")
    this.player.src = url
    this.player.width = 800
    this.player.height = 450
    this.player.controls = true
    this.player.playsInline = true
    this.element.replaceWith(this.player)
    this.player.play()
  }

  /**
   * Удаляет плеер
   */
  private disposePlayer() {
    if (!this.player) return

    if (this.player instanceof YT.Player) {
      this.player.destroy()
    }

    if (this.player instanceof HTMLVideoElement) {
      this.player.replaceWith(this.element)
    }

    this.player = null
  }
}
