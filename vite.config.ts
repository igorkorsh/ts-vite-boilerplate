import { defineConfig } from "vite"
import { resolve } from "path"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"
import includeHtmlPlugin from "./plugins/vite-plugin-include-html"
import spritePlugin from "./plugins/vite-plugin-svg-sprite"
import buildPlugin from "./plugins/vite-plugin-build-fix"
import gtmPlugin from "./plugins/vite-plugin-gtm"
import wpPlugin from "./plugins/vite-plugin-wp"
import rtlcss from "postcss-rtlcss"

const isProd = process.env.NODE_ENV === "production"
const isWordpress = process.argv.includes("--wp")

export default defineConfig({
	root: "src",
	base: "",
	publicDir: resolve(__dirname, "public"),
	plugins: [
		includeHtmlPlugin(),
		spritePlugin(),
		buildPlugin(),
		gtmPlugin("GTM-WZ7LJ3"),
		isProd &&
			ViteImageOptimizer({
				includePublic: false,
				cache: true
			}),
		isWordpress && wpPlugin()
	],
	css: {
		postcss: {
			plugins: [rtlcss()]
		}
	},
	server: {
		port: 3000,
		host: true
	},
	build: {
		modulePreload: false,
		outDir: resolve(__dirname, isWordpress ? "_wp" : "build"),
		assetsInlineLimit: 0,
		rollupOptions: {
			output: {
				entryFileNames: "scripts/[name].js",
				assetFileNames({ names }) {
					if (/\.css$/.test(names[0])) {
						return "styles/[name].css"
					}

					if (/\.(png|jpe?g|webp|svg)$/.test(names[0])) {
						return "images/[name].[ext]"
					}

					return "assets/[name].[ext]"
				}
			}
		},
		emptyOutDir: true
	}
})
