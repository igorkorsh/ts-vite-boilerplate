import "./modules/nav"
import "./modules/year"
import "./modules/modal"
import "./modules/marketo"
import { Carousel } from "./modules/carousel"
import { Accordion } from "./modules/accordion"

new Carousel("#carousel")
new Accordion(".accordion", { collapsible: false })
