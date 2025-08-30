import type { Plugin } from "vite"
import { resolve, basename } from "node:path"
import { promises as fs } from "node:fs"

export function convertToSymbol(content: string = "", name: string = ""): string {
	return content
		.replace(/\s*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, "")
		.replace(/<svg([^>]*)>/, `<symbol id="${name}"$1>`)
		.replace("</svg>", "</symbol>")
}

export default function spritePlugin(): Plugin {
	const createSprite = async (ids: string[]): Promise<string> => {
		let sprite = ""
		const directory = resolve(process.cwd(), "src/sprite")
		const files = await fs.readdir(directory)

		for (const file of files) {
			const fileName = basename(file, ".svg")

			if (!file.endsWith(".svg")) continue
			if (!ids.includes(fileName)) continue

			let content = await fs.readFile(resolve(directory, file), "utf-8")
			content = convertToSymbol(content, fileName)
			sprite += content
		}

		// Если нет символов, то не возвращаем svg
		if (!sprite) return ""

		return `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="display: none" aria-hidden="true">${sprite}</svg>`
	}

	return {
		name: "svg-sprite",
		async transformIndexHtml(html) {
			const ids = Array.from(html.matchAll(/<use href=\"#(.+)\"/g), (match) => match[1])
			const sprite = await createSprite(ids)
			return html.replace("<!-- svg-sprite -->", sprite)
		}
	}
}
