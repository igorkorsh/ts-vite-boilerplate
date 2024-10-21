import { promises as fs } from "fs"
import { Plugin } from "vite"
import path from "path"

export const SpritePlugin = (dir: string): Plugin => {
	async function createSprite(): Promise<string> {
		const files = await fs.readdir(dir)
		let symbols = ""

		for (const file of files) {
			if (!file.endsWith(".svg")) continue

			let content = await fs.readFile(path.join(dir, file), "utf8")
			const id = file.replace(".svg", "")
			content = content
				.replace('xmlns="http://www.w3.org/2000/svg" ', "")
				.replace("<svg", `<symbol id="${id}"`)
				.replace("</svg>", "</symbol>")
			symbols += content
		}

		return `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="display: none" aria-hidden="true">${symbols}</svg>`
	}

	return {
		name: "svg-sprite",
		async transformIndexHtml(html): Promise<string> {
			const sprite = await createSprite()
			return html.replace("<!-- svg-sprite -->", sprite)
		},
		handleHotUpdate({ server }) {
			server.hot.send({
				type: "full-reload"
			})
		}
	}
}
