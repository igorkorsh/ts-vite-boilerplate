import "./modules/nav"
import "./modules/title"
import "./modules/year"
import "./modules/modal"
import "./modules/marketo"
import { Carousel } from "./modules/carousel"
import { Accordion } from "./modules/accordion"

new Carousel("#carousel", { embla: { loop: true } })
new Accordion(".accordion", { collapsible: false })
