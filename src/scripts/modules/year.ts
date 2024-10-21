const element = document.getElementById("year")

if (element) {
  element.innerText = `${new Date().getFullYear()}`
}
