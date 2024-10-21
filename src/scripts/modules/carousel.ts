import EmblaCarousel, { EmblaCarouselType, EmblaOptionsType } from "embla-carousel"

type CarouselModulesType = {
	navigation: CarouselNavigationType
	pagination: CarouselPaginationType
	viewport: CarouselViewportType
}

type CarouselViewportType = {
	el: string
}

type CarouselNavigationType = {
	prevEl: string
	nextEl: string
}

type CarouselPaginationType = {
	el: string
}

type CarouselOptionsType = EmblaOptionsType & Partial<CarouselModulesType>

export class Carousel {
	private carousel: EmblaCarouselType | null = null
	private element: HTMLElement
	private options: CarouselOptionsType

	constructor(selector: string, options: CarouselOptionsType) {
		const DEFAULT_OPTIONS: CarouselOptionsType = {}
		this.element = document.querySelector<HTMLElement>(selector)!
		this.options = { ...DEFAULT_OPTIONS, ...options }

		if (this.element) {
			const viewport = this.element.querySelector<HTMLElement>(this.options.viewport!.el)

			if (viewport) {
				this.carousel = EmblaCarousel(viewport, options)
				this.Navigation()
				this.Pagination()
			}
		}
	}

	private Navigation() {
		if (!this.options.navigation || !this.carousel) return

		const prevButton = this.element.querySelector<HTMLElement>(this.options.navigation.prevEl)
		const nextButton = this.element.querySelector<HTMLElement>(this.options.navigation.nextEl)
		const { scrollPrev, scrollNext } = this.carousel

		prevButton?.addEventListener("click", () => scrollPrev())
		nextButton?.addEventListener("click", () => scrollNext())
	}

	private Pagination() {
		if (!this.options.pagination || !this.carousel) return

		const element = this.element.querySelector<HTMLElement>(this.options.pagination.el)

		if (!element) return

		this.carousel.scrollSnapList().forEach(() => {
			const dot = document.createElement("button")
			dot.type = "button"
			dot.classList.add("carousel__pagination-bullet")
			element.appendChild(dot)
		})

		const dots = [...element.querySelectorAll<HTMLElement>(".carousel__pagination-bullet")]

		dots.forEach((dot, index) => {
			dot.addEventListener("click", () => this.carousel?.scrollTo(index))
		})

		this.carousel.on("init", () => this.toggle(dots))
		this.carousel.on("select", () => this.toggle(dots))
	}

	private toggle(dots: HTMLElement[]) {
		if (!this.carousel) return

		const prev = this.carousel.previousScrollSnap()
		const selected = this.carousel.selectedScrollSnap()

		dots[prev].classList.remove("active")
		dots[selected].classList.add("active")
	}
}

const options: CarouselOptionsType = {
	loop: true,
	align: "start",
	direction: document.dir as EmblaOptionsType["direction"],
	viewport: {
		el: ".carousel__viewport"
	},
	navigation: {
		prevEl: ".carousel__button--prev",
		nextEl: ".carousel__button--next"
	},
	pagination: {
		el: ".carousel__pagination"
	}
}

new Carousel(".carousel", options)
