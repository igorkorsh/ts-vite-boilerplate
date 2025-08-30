import { loadEnv, type Plugin } from "vite"

export default function wpPlugin(): Plugin {
	return {
		name: "vite-plugin-wp",
		apply: "build",
		enforce: "post",
		generateBundle(_, bundle) {
			const env = loadEnv("production", process.cwd())

			// Создаем style.css
			this.emitFile({
				type: "asset",
				fileName: "style.css",
				source: `/**\n * Theme Name: ${env.VITE_THEME_NAME}\n */\n\n@charset "UTF-8";`
			})

			// Переименовываем index.html в index.php
			if (bundle["index.html"]) {
				bundle["index.html"].fileName = "index.php"
			}
		},
		transformIndexHtml(html) {
			return html.replace(
				/(?<==")\.\//g,
				"<?php echo network_home_url(); ?>wp-content/themes/<?php echo get_template(); ?>/"
			)
		}
	}
}
