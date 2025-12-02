import { type Plugin } from "vite"

export default function wpPlugin(): Plugin {
	return {
		name: "vite-plugin-wp",
		apply: "build",
		enforce: "post",
		generateBundle(_, bundle) {
			if (bundle["index.html"]) {
				if (bundle["index.html"].type === "asset") {
					bundle["index.html"].source = (bundle["index.html"].source as any).replace(
						/(src|srcset|href)="\.\//g,
						'$1="<?php echo network_home_url(); ?>wp-content/themes/<?php echo get_template(); ?>/'
					)
				}

				// Переименовываем index.html в index.php
				bundle["index.html"].fileName = "index.php"
			}
		}
	}
}
