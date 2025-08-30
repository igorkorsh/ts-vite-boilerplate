const element = document.getElementById("year")

if (element) {
	element.innerHTML = `${new Date().getFullYear()}`
}
