import "./modules/nav"
import "./modules/footer"
import "./modules/cookie"
import "./modules/modal"
import "./modules/motion"
import { Carousel } from "./modules/carousel"
import { Accordion } from "./modules/accordion"

new Carousel(".carousel", {
	loop: true,
	align: "start"
})

new Accordion(".accordion", {
	allowMultiple: true
})
