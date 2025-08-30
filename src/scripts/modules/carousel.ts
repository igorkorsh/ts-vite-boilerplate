import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType, type EmblaPluginType } from "embla-carousel"

interface NavigationOptions {
	nextEl: string
	prevEl: string
}

interface PaginationOptions {
	root: string
	dotClass: string
	dotActiveClass: string
}

interface CarouselOptions extends EmblaOptionsType {
	navigation?: NavigationOptions
	pagination?: PaginationOptions
}

const DEFAULT_NAVIGATION_OPTIONS: NavigationOptions = {
	nextEl: "[data-next]",
	prevEl: "[data-prev]"
}

const DEFAULT_PAGINATION_OPTIONS: PaginationOptions = {
	root: ".carousel__pagination",
	dotClass: "carousel__dot",
	dotActiveClass: "carousel__dot--active"
}

export class Carousel {
	private emblaNode: HTMLElement | null = null
	private emblaApi: EmblaCarouselType | null = null
	private options: CarouselOptions = {}

	constructor(selector: string, options: CarouselOptions, plugins: EmblaPluginType[] = []) {
		this.emblaNode = document.querySelector<HTMLElement>(selector)

		if (!this.emblaNode) {
			console.error(`[carousel.ts] Элемент ${selector} не найден`)
			return
		}

		const container = this.emblaNode.querySelector<HTMLElement>(".carousel__container")

		if (!container) {
			console.error(`[carousel.ts] Элемент .carousel__container не найден`)
			return
		}

		this.emblaApi = EmblaCarousel(container, options, plugins)
		this.options = options
		this.init()
	}

	private init() {
		if (!this.emblaNode || !this.emblaApi) return

		const { navigation, pagination } = this.options

		new Navigation(this.emblaNode, this.emblaApi, navigation || DEFAULT_NAVIGATION_OPTIONS)
		new Pagination(this.emblaApi, pagination || DEFAULT_PAGINATION_OPTIONS)
	}
}

class Navigation {
	private root: HTMLElement
	private emblaApi: EmblaCarouselType
	private options: NavigationOptions

	constructor(root: HTMLElement, emblaApi: EmblaCarouselType, options: NavigationOptions) {
		this.root = root
		this.emblaApi = emblaApi
		this.options = options
		this.init()
	}

	private init() {
		const { prevEl, nextEl } = this.options
		const { scrollPrev, scrollNext } = this.emblaApi
		const prevButton = this.root.querySelector<HTMLElement>(prevEl)
		const nextButton = this.root.querySelector<HTMLElement>(nextEl)

		prevButton?.addEventListener("click", () => scrollPrev(), false)
		nextButton?.addEventListener("click", () => scrollNext(), false)
	}
}

class Pagination {
	private root: HTMLElement
	private dots: NodeListOf<HTMLElement> | null = null
	private emblaApi: EmblaCarouselType
	private options: PaginationOptions

	constructor(emblaApi: EmblaCarouselType, options: PaginationOptions) {
		this.root = document.querySelector(options.root) as HTMLElement
		this.emblaApi = emblaApi
		this.options = options
		this.init()
	}

	private init() {
		this.emblaApi
			.on("init", () => this.create())
			.on("reInit", () => this.create())
			.on("init", () => this.update())
			.on("reInit", () => this.update())
			.on("select", () => this.update())
	}

	private create() {
		const { dotClass } = this.options

		this.root.innerHTML = this.emblaApi
			.scrollSnapList()
			.map(() => `<button type="button" class="button ${dotClass}"></button>`)
			.join("")

		const scrollTo = (index: number) => {
			this.emblaApi.scrollTo(index)
		}

		this.dots = this.root.querySelectorAll<HTMLElement>(`.${dotClass}`)

		this.dots.forEach((dot, index) => {
			dot.addEventListener("click", () => scrollTo(index), false)
		})
	}

	private update() {
		const { dotActiveClass } = this.options
		const selected = this.emblaApi.selectedScrollSnap()
		this.dots?.forEach((dot, index) => {
			dot.classList.toggle(dotActiveClass, index === selected)
		})
	}
}
