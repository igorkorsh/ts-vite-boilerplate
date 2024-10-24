import EmblaCarousel, { EmblaCarouselType, EmblaOptionsType } from "embla-carousel"
import AutoHeight from "embla-carousel-auto-height"

type CarouselOptionsType = {
	embla: EmblaOptionsType
	navigation: CarouselNavigationType
	pagination: string
	viewport: string
	plugins: CarouselPluginsType
}

type CarouselNavigationType = {
	prevEl: string
	nextEl: string
}

type CarouselPluginsType = {
	autoHeight?: boolean
}

const DEFAULT_OPTIONS: CarouselOptionsType = {
	embla: {
		align: "start",
		direction: document.dir as EmblaOptionsType["direction"]
	},
	viewport: ".carousel__viewport",
	navigation: {
		prevEl: ".carousel__button--prev",
		nextEl: ".carousel__button--next"
	},
	pagination: ".carousel__pagination",
	plugins: { autoHeight: false }
}

export class Carousel {
	private carousel: EmblaCarouselType | null = null
	private element: HTMLElement
	private options: CarouselOptionsType
	private plugins: any[]

	constructor(selector: string, options?: Partial<CarouselOptionsType>) {
		this.element = document.querySelector<HTMLElement>(selector)!
		this.options = { ...DEFAULT_OPTIONS, ...options }
		this.plugins = []

		if (!this.element || !this.options.viewport) return

		if (this.options.plugins.autoHeight) {
			this.plugins.push(AutoHeight())
		}

		const viewport = this.element.querySelector<HTMLElement>(this.options.viewport)

		if (viewport) {
			this.carousel = EmblaCarousel(viewport, this.options.embla, this.plugins)
			this.Navigation(this.carousel)
			this.Pagination(this.carousel)
		}
	}

	private Navigation(carousel: EmblaCarouselType) {
		if (!this.options.navigation) return

		const { prevEl, nextEl } = this.options.navigation
		const { scrollPrev, scrollNext } = carousel
		const prevButton = this.element.querySelector<HTMLElement>(prevEl)
		const nextButton = this.element.querySelector<HTMLElement>(nextEl)

		prevButton?.addEventListener("click", () => scrollPrev())
		nextButton?.addEventListener("click", () => scrollNext())
	}

	private Pagination(carousel: EmblaCarouselType) {
		if (!this.options.pagination) return

		const element = this.element.querySelector<HTMLElement>(this.options.pagination)

		if (element) {
			let dots: HTMLElement[] = []

			const createDots = () => {
				element.innerHTML = carousel
					.scrollSnapList()
					.map(() => `<button type="button" class="carousel__dot"></button>`)
					.join("")

				dots = [...element.querySelectorAll<HTMLElement>(".carousel__dot")]
				dots.forEach((dot, index) => {
					dot.addEventListener("click", () => carousel.scrollTo(index), false)
				})
			}

			const toggle = () => {
				const previous = carousel.previousScrollSnap()
				const selected = carousel.selectedScrollSnap()

				dots[previous].classList.remove("active")
				dots[selected].classList.add("active")
			}

			carousel.on("init", createDots).on("reInit", createDots)
			carousel.on("init", toggle).on("reInit", toggle).on("select", toggle)
		}
	}
}
