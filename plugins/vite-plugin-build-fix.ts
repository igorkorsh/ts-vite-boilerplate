import type { Plugin } from "vite"

export default function buildPlugin(): Plugin {
	return {
		name: "vite-plugin-build-fix",
		apply: "build",
		transformIndexHtml(html) {
			return html.replace(/type=\"module\" crossorigin/g, "defer").replace(/(rel=\"stylesheet\") crossorigin/g, "$1")
		}
	}
}
