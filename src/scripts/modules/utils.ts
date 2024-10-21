export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(callback: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return function (...args: Parameters<T>) {
    clearTimeout(timer)

    timer = setTimeout(function () {
      callback(...args)
    }, delay)
  }
}

export function getScript(url: string) {
  const script = document.createElement("script")
  const prior = document.getElementsByTagName("script")[0]
  script.src = url
  script.async = true
  prior.parentNode?.insertBefore(script, prior)
}
