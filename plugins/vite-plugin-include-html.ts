import type { Plugin } from "vite"
import { resolve } from "node:path"
import fs from "node:fs"

export default function includeHtmlPlugin(): Plugin {
	return {
		name: "vite-plugin-include-html",
		enforce: "pre",
		transformIndexHtml(html) {
			const pattern = /<!-- include: ([^\s]+) -->/g
			return html.replace(pattern, (_, includeSrc) => {
				const filePath = resolve(process.cwd(), `src/${includeSrc}`)

				if (!fs.existsSync(filePath)) {
					console.warn(`❌ Фрагмент не найден: ${filePath}`)
					return ""
				}

				return fs.readFileSync(filePath, "utf-8")
			})
		}
	}
}
