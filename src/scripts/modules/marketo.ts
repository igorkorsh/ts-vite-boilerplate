import { getScript } from "./utils"

declare global {
  interface Window {
    onloadCallback: () => void
  }
}

/**
 * Удаляет ненужные элементы формы
 */
function removeElements(formEl: HTMLFormElement) {
  const elements = formEl.querySelectorAll<HTMLElement>(".mktoClear, .mktoGutter, .mktoOffset, style")
  elements.forEach((el) => el.remove())
}

/**
 * Удаляет атрибуты style у элементов формы
 */
function removeStyleAttributes(formEl: HTMLFormElement) {
  const elements = [...formEl.querySelectorAll<HTMLElement>("[style]"), formEl]

  elements.forEach((el) => {
    if (!el.closest(".googleRecaptcha")) {
      el.removeAttribute("style")
    }
  })
}

/**
 * Отключает стили, которые загружаются вместе с формой
 */
function disableThemeStyles() {
  const styleSheets = [...document.styleSheets]

  styleSheets.forEach((style) => {
    if ((style.ownerNode as HTMLLinkElement).id.startsWith("mktoForms2")) {
      style.disabled = true
    }
  })
}

/**
 * Добавляет плейсхолдеры в текстовые поля
 */
function addPlaceholders(formEl: HTMLFormElement) {
  const elements = formEl.querySelectorAll<HTMLInputElement>(".mktoField.mktoHasWidth")

  elements.forEach((el) => {
    const label = el.previousSibling as HTMLLabelElement

    if (!el.placeholder && label.textContent) {
      el.placeholder = label.textContent.replace(/[*:]/g, "")
    }
  })
}

/**
 * Добавляем дата-атрибут data-om-cta на кнопку формы
 */
function setButtonAttr(formEl: HTMLFormElement) {
  const button = formEl.querySelector<HTMLButtonElement>(".mktoButton")

  if (button) {
    button.dataset.omCta = `${button.textContent}`
  }
}

/**
 * Добавляет кнопки увеличения и уменьшения значения поля
 */
function inputNumber(formEl: HTMLFormElement) {
  const elements = formEl.querySelectorAll<HTMLInputElement>("input[type='number']")

  elements.forEach((el) => {
    const parentEl = el.parentElement
    const button = parentEl ? parentEl.querySelector<HTMLButtonElement>("[data-step]") : null

    if (parentEl && !parentEl.contains(button)) {
      parentEl.classList.add("mktoCustomNumberField")
      parentEl.append(addButton(1), addButton(-1))
    }
  })
}

/**
 * Создает кнопку
 */
function addButton(step: number): HTMLButtonElement {
  const button = document.createElement("button")
  button.type = "button"
  button.dataset.step = `${step}`
  button.addEventListener("click", handleButtonClick)

  return button
}

/**
 * Обработчик событий для кнопок
 */
function handleButtonClick(event: MouseEvent) {
  event.preventDefault()

  const target = event.target as HTMLButtonElement
  const containerEl = target.closest<HTMLElement>(".mktoCustomNumberField")
  const inputEl = containerEl ? containerEl.querySelector<HTMLInputElement>("[type='number']") : null

  if (inputEl && target.dataset.step) {
    setInputValue(inputEl, +target.dataset.step)
  }
}

/**
 * Присваивает новое значение полю
 */
function setInputValue(element: HTMLInputElement, step: number) {
  const oldValue = parseFloat(element.value) || 0
  const minValue = parseFloat(element.min) || 0
  const maxValue = parseFloat(element.max) || Number.MAX_SAFE_INTEGER
  let newValue = oldValue + step

  if (newValue > maxValue) {
    newValue = maxValue
  } else if (newValue < minValue) {
    newValue = minValue
  }

  element.value = String(newValue)
}

function addCaptcha(form: MktoForms2.IForm) {
  const formEl = form.getFormElem()[0]

  if (formEl) {
    const buttonRow = formEl.querySelector<HTMLDivElement>(".mktoButtonRow")
    const button = buttonRow && buttonRow.querySelector<HTMLButtonElement>(".mktoButton")

    const divEl = document.createElement("div")
    divEl.id = `g-recaptcha-${form.getId()}`
    divEl.classList.add("googleRecaptcha")

    grecaptcha.render(divEl, {
      sitekey: "6Lf2eUQUAAAAAC-GQSZ6R2pjePmmD6oA6F_3AV7j",
    })

    const handleSubmit = () => {
      const response = grecaptcha.getResponse()

      if (form.validate()) {
        divEl.dataset.error = !response ? "true" : "false"
        form.addHiddenFields({
          reCAPTCHAFormResponse: response,
        })
        form.submit()
      }
    }

    if (button) {
      button.addEventListener("click", handleSubmit)
    }

    if (buttonRow) {
      formEl.insertBefore(divEl, buttonRow)
    }
  }
}

if ("MktoForms2" in window) {
  MktoForms2.whenReady((form) => {
    getScript("https://www.google.com/recaptcha/api.js?onload=onloadCallback")
    window.onloadCallback = () => addCaptcha(form)

    // form.onSuccess(() => {})
  })

  MktoForms2.whenRendered((form) => {
    const formEl = form.getFormElem()[0]

    if (formEl) {
      removeElements(formEl)
      removeStyleAttributes(formEl)
      disableThemeStyles()
      addPlaceholders(formEl)
      setButtonAttr(formEl)
      inputNumber(formEl)
    }
  })
}
