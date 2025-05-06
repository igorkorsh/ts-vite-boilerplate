import Cookies from "js-cookie"

document.addEventListener("DOMContentLoaded", () => {
	const banner = document.querySelector<HTMLElement>(".cookie")
	const button = document.querySelector<HTMLButtonElement>(".cookie__button")

	if (!banner || !button) return

	if (Cookies.get("kl.c.p") === "true") {
		banner.style.display = "none"
		return
	} else {
		button.addEventListener("click", () => {
			banner.style.display = "none"
			Cookies.set("kl.c.p", "true", { expires: 7 })
		})
	}
})
